import { methodRegistry } from '@clarity/analysis-engine'
import type { GuidedSession, GuidedStepNumber, Scenario } from '@clarity/domain'
import { reflectionSchema, scenarioSchema, stepResponseSchema } from '@clarity/domain'

import type { TokenUsage } from './llm'
import { generateStructured } from './llm'

export type { GuidedSession, GuidedStepNumber }

function isEnglish(): boolean {
  return document.documentElement.lang === 'en'
}

function buildMethodCatalog(en: boolean): string {
  return methodRegistry
    .map((spec) => {
      const name = en ? spec.name.en : spec.name.zh
      const purpose = en ? spec.purpose.en : spec.purpose.zh
      return `- ${spec.id}（${name}）：${purpose}`
    })
    .join('\n')
}

function buildScenarioContext(scenario: Scenario, en: boolean): string {
  return [
    `${en ? 'Title' : '标题'}：${scenario.title}`,
    `${en ? 'Description' : '描述'}：${scenario.description}`,
    `${en ? 'Background' : '背景'}：${scenario.context}`,
  ].join('\n')
}

function buildPriorSummary(session: GuidedSession, en: boolean): string {
  const parts: string[] = []
  const { steps } = session

  if (steps.problemDefinition) {
    parts.push(
      `${en ? '[Step 1 - Problem Definition] User said' : '【步骤1-问题定义】用户回答'}：${steps.problemDefinition.userAnswer}`,
    )
  }
  if (steps.methodSelection) {
    parts.push(
      `${en ? '[Step 2 - Method Selection] User chose' : '【步骤2-方法选择】用户选择'}：${steps.methodSelection.selectedMethods.join(', ')}；${en ? 'reasoning' : '理由'}：${steps.methodSelection.reasoning}`,
    )
  }
  if (steps.methodApplication) {
    parts.push(
      `${en ? '[Step 3 - Method Application] User analysis' : '【步骤3-运用方法】用户分析'}：${steps.methodApplication.userWork}`,
    )
  }
  if (steps.conclusion) {
    parts.push(
      `${en ? '[Step 4 - Conclusion] User concluded' : '【步骤4-得出结论】用户结论'}：${steps.conclusion.userAnswer}`,
    )
  }

  return parts.length > 0 ? `\n${en ? 'Summary of prior steps' : '前序步骤摘要'}：\n${parts.join('\n')}` : ''
}

function getMethodApplicationGuide(methodIds: string[], en: boolean): string {
  const guides = methodIds.map((id) => {
    const spec = methodRegistry.find((m) => m.id === id)
    if (!spec) return ''
    const name = en ? spec.name.en : spec.name.zh
    const steps = spec.steps.map((s, i) => `  ${i + 1}. ${en ? s.en : s.zh}`).join('\n')
    return `${name}：\n${steps}`
  })
  return guides.filter(Boolean).join('\n\n')
}

const langDirective = (en: boolean) => (en ? 'Respond entirely in English.' : '所有内容必须使用中文回答。')

function buildStep1Prompt(session: GuidedSession, en: boolean) {
  const scenario = buildScenarioContext(session.scenario, en)
  return {
    system: en
      ? [
          'You are a Socratic analytical thinking coach. Guide the learner to define the core problem in a scenario.',
          'Do NOT give the answer directly. Ask guiding questions that help them identify:',
          '- Who is facing the problem?',
          '- What decision needs to be made?',
          '- What constraints exist?',
          'Provide feedback on their problem definition: is it specific enough? Does it capture the real issue?',
          'Keep response concise (3-5 sentences of feedback + 1-2 follow-up prompts if needed).',
          langDirective(en),
        ].join('\n')
      : [
          '你是苏格拉底式分析思维教练。引导学习者定义场景中的核心问题。',
          '不要直接给答案。通过提问帮助他们识别：',
          '- 谁面临这个问题？',
          '- 需要做什么决策？',
          '- 有哪些约束条件？',
          '对他们的问题定义给出反馈：是否足够具体？是否抓住了真正的问题？',
          '回答简洁（3-5 句反馈 + 如有必要 1-2 个追问）。',
          langDirective(en),
        ].join('\n'),
    prompt: [
      scenario,
      `\n${en ? "Learner's problem definition" : '学习者的问题定义'}：${session.steps.problemDefinition?.userAnswer ?? ''}`,
    ].join('\n'),
  }
}

function buildStep2Prompt(session: GuidedSession, en: boolean) {
  const scenario = buildScenarioContext(session.scenario, en)
  const prior = buildPriorSummary(session, en)
  const catalog = buildMethodCatalog(en)
  const sel = session.steps.methodSelection

  return {
    system: en
      ? [
          'You are a Socratic analytical thinking coach. The learner has defined the problem and is now selecting an analysis method.',
          'Evaluate their method selection and reasoning:',
          '- Is their chosen method a good fit for THIS specific problem?',
          '- Did they give solid reasons for their choice?',
          '- Are there methods they dismissed that deserved more consideration?',
          'Challenge their thinking constructively. If their choice is good, reinforce WHY it fits.',
          'Keep response concise (4-6 sentences).',
          langDirective(en),
        ].join('\n')
      : [
          '你是苏格拉底式分析思维教练。学习者已定义问题，正在选择分析方法。',
          '评估他们的方法选择和理由：',
          '- 所选方法是否真正适合这个具体问题？',
          '- 选择理由是否充分？',
          '- 是否有值得考虑但被忽略的方法？',
          '建设性地挑战他们的思考。如果选得好，强化为什么适合。',
          '回答简洁（4-6 句）。',
          langDirective(en),
        ].join('\n'),
    prompt: [
      scenario,
      prior,
      `\n${en ? 'Available methods' : '可用方法'}：\n${catalog}`,
      `\n${en ? 'Learner chose' : '学习者选择'}：${sel?.selectedMethods.join(', ') ?? ''}`,
      `${en ? 'Reasoning' : '理由'}：${sel?.reasoning ?? ''}`,
    ].join('\n'),
  }
}

function buildStep3Prompt(session: GuidedSession, en: boolean) {
  const scenario = buildScenarioContext(session.scenario, en)
  const prior = buildPriorSummary(session, en)
  const methods = session.steps.methodSelection?.selectedMethods ?? []
  const guide = getMethodApplicationGuide(methods, en)
  const userWork = session.steps.methodApplication?.userWork ?? ''

  return {
    system: en
      ? [
          'You are a Socratic analytical thinking coach. The learner is applying their chosen method to the scenario.',
          'Evaluate their analysis work:',
          '- Did they follow the method steps correctly?',
          '- Is their analysis thorough or are there gaps?',
          '- Are their cause/effect links logical?',
          'Point out specific strengths and gaps. Suggest what they might have missed.',
          'Keep response concise (4-6 sentences).',
          langDirective(en),
        ].join('\n')
      : [
          '你是苏格拉底式分析思维教练。学习者正在将所选方法应用于场景。',
          '评估他们的分析过程：',
          '- 是否正确遵循了方法步骤？',
          '- 分析是否完整，有没有遗漏？',
          '- 因果链条是否合乎逻辑？',
          '指出具体的优点和不足。建议他们可能遗漏了什么。',
          '回答简洁（4-6 句）。',
          langDirective(en),
        ].join('\n'),
    prompt: [
      scenario,
      prior,
      `\n${en ? 'Method steps reference' : '方法步骤参考'}：\n${guide}`,
      `\n${en ? "Learner's analysis work" : '学习者的分析过程'}：\n${userWork}`,
    ].join('\n'),
  }
}

function buildStep4Prompt(session: GuidedSession, en: boolean) {
  const scenario = buildScenarioContext(session.scenario, en)
  const prior = buildPriorSummary(session, en)
  const userConclusion = session.steps.conclusion?.userAnswer ?? ''

  return {
    system: en
      ? [
          'You are a Socratic analytical thinking coach. The learner has completed their analysis and is drawing conclusions.',
          'Evaluate their conclusion:',
          '- Is it well-supported by their analysis?',
          '- Is it actionable and specific?',
          '- Did they miss important implications?',
          'Provide brief feedback on the quality of their conclusion.',
          'Keep response concise (3-5 sentences).',
          langDirective(en),
        ].join('\n')
      : [
          '你是苏格拉底式分析思维教练。学习者完成了分析并在得出结论。',
          '评估他们的结论：',
          '- 是否有分析支撑？',
          '- 是否具体可执行？',
          '- 是否遗漏了重要启示？',
          '简要反馈结论的质量。',
          '回答简洁（3-5 句）。',
          langDirective(en),
        ].join('\n'),
    prompt: [scenario, prior, `\n${en ? "Learner's conclusion" : '学习者的结论'}：\n${userConclusion}`].join('\n'),
  }
}

function buildStep5Prompt(session: GuidedSession, en: boolean) {
  const scenario = buildScenarioContext(session.scenario, en)
  const prior = buildPriorSummary(session, en)

  return {
    system: en
      ? [
          'You are an analytical thinking coach giving a final comprehensive review.',
          'Score the learner on the FULL analysis process (0-100) and evaluate these dimensions:',
          '1. Problem Definition: Did they correctly identify the core problem?',
          '2. Method Selection: Was their method choice appropriate and well-reasoned?',
          '3. Analysis Execution: Did they apply the method thoroughly and logically?',
          '4. Conclusion Quality: Is their conclusion well-supported and actionable?',
          'Give each dimension a score (0-100) with a one-sentence comment.',
          'Provide 2-3 specific, actionable tips for improvement.',
          'The overallFeedback should be a 3-5 sentence comprehensive summary.',
          langDirective(en),
        ].join('\n')
      : [
          '你是分析思维教练，给出最终综合评审。',
          '对学习者的完整分析过程打分（0-100），并从以下维度评估：',
          '1. 问题定义：是否准确识别了核心问题？',
          '2. 方法选择：方法选择是否恰当、理由是否充分？',
          '3. 分析执行：方法运用是否完整、逻辑是否通顺？',
          '4. 结论质量：结论是否有依据、是否可执行？',
          '每个维度给出分数（0-100）和一句话评语。',
          '给出 2-3 条具体、可操作的改进建议。',
          'overallFeedback 应该是 3-5 句的综合总结。',
          langDirective(en),
        ].join('\n'),
    prompt: [scenario, prior].join('\n'),
  }
}

export interface ProcessStepResult {
  aiResponse: string
  reflection?: {
    overallFeedback: string
    score: number
    dimensions: Array<{ name: string; score: number; comment: string }>
    tips: string[]
  }
  usage: TokenUsage
}

export async function processStep(session: GuidedSession, step: GuidedStepNumber): Promise<ProcessStepResult> {
  const en = isEnglish()

  if (step === 5) {
    const { system, prompt } = buildStep5Prompt(session, en)
    const result = await generateStructured({
      schema: reflectionSchema,
      system,
      prompt,
    })
    return {
      aiResponse: result.object.overallFeedback,
      reflection: {
        overallFeedback: result.object.overallFeedback,
        score: result.object.score,
        dimensions: result.object.dimensions,
        tips: result.object.tips,
      },
      usage: result.usage,
    }
  }

  const builders: Record<1 | 2 | 3 | 4, (s: GuidedSession, e: boolean) => { system: string; prompt: string }> = {
    1: buildStep1Prompt,
    2: buildStep2Prompt,
    3: buildStep3Prompt,
    4: buildStep4Prompt,
  }

  const { system, prompt } = builders[step](session, en)
  const result = await generateStructured({
    schema: stepResponseSchema,
    system,
    prompt,
  })

  const response = result.object.hint
    ? `${result.object.feedback}\n\n${en ? 'Hint' : '提示'}：${result.object.hint}`
    : result.object.feedback

  return { aiResponse: response, usage: result.usage }
}

export async function generateGuidedScenario(params: {
  difficulty?: string
  methodId?: string
}): Promise<{ scenario: Scenario; usage: TokenUsage }> {
  const en = isEnglish()
  const difficulty = params.difficulty ?? 'beginner'
  const methodCatalog = buildMethodCatalog(en)

  const difficultyHint =
    difficulty === 'beginner'
      ? en
        ? 'Simple scenario with a clear problem requiring one primary method.'
        : '简单场景，问题清晰，主要需要一种方法。'
      : difficulty === 'intermediate'
        ? en
          ? 'Moderate scenario with some ambiguity, 2-3 methods could apply.'
          : '中等场景，有一定模糊性，2-3 种方法都可能适用。'
        : en
          ? 'Complex scenario with conflicting signals and multiple valid approaches.'
          : '复杂场景，信号冲突，多种方法都有合理性。'

  const constraints = [
    params.methodId ? `${en ? 'Must be solvable with method' : '必须可用此方法解决'}：${params.methodId}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const result = await generateStructured({
    schema: scenarioSchema,
    system: en
      ? [
          'You are a teacher of analytical thinking. Generate a realistic scenario for guided analysis training.',
          'The scenario must describe a concrete real-life situation where someone faces a problem requiring structured analysis.',
          `Difficulty: ${difficultyHint}`,
          'Make the scenario rich enough that a learner can practice: defining the problem, selecting a method, applying it step-by-step, and drawing conclusions.',
          'The id must be a short unique slug.',
          langDirective(en),
        ].join('\n')
      : [
          '你是分析思维教师。请生成一个用于引导式分析训练的真实场景。',
          '场景必须描述一个具体的现实情境，某人面临需要结构化分析的问题。',
          `难度：${difficultyHint}`,
          '场景要足够丰富，让学习者可以练习：定义问题、选择方法、逐步运用、得出结论。',
          'id 用简短英文短横线命名。',
          langDirective(en),
        ].join('\n'),
    prompt: [
      en ? 'Generate a training scenario:' : '请生成训练场景：',
      constraints || (en ? '(no constraints)' : '（无特殊限制）'),
      `${en ? 'Method catalog' : '方法目录'}：\n${methodCatalog}`,
    ].join('\n\n'),
  })

  return { scenario: result.object as Scenario, usage: result.usage }
}
