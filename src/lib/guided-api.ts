import type { Difficulty, GuidedSession, GuidedStepNumber, Reflection, Scenario } from '@/data/domain'
import { reflectionSchema, scenarioSchema, stepResponseSchema } from '@/data/domain'
import { findMethodSpec, methodRegistry } from '@/data/methods'

import type { TokenUsage } from './llm'
import { generateStructured } from './llm'

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
  const isFocused = !!session.focusMethodId

  if (steps.methodSelection) {
    if (isFocused) {
      parts.push(
        `${en ? '[Method] Pre-selected (focused training)' : '【方法】专项训练自动指定'}：${steps.methodSelection.selectedMethods.join(', ')}`,
      )
    } else {
      parts.push(
        `${en ? '[Step 1 - Method Selection] User chose' : '【步骤1-方法选择】用户选择'}：${steps.methodSelection.selectedMethods.join(', ')}；${en ? 'reasoning' : '理由'}：${steps.methodSelection.reasoning}`,
      )
    }
  }
  if (steps.analysis) {
    const stepLabel = isFocused
      ? en
        ? '[Step 1 - Analysis & Conclusion]'
        : '【步骤1-分析与结论】'
      : en
        ? '[Step 2 - Analysis & Conclusion]'
        : '【步骤2-分析与结论】'
    parts.push(`${stepLabel} ${en ? 'User work' : '用户分析'}：${steps.analysis.userWork}`)
  }

  return parts.length > 0 ? `\n${en ? 'Summary of prior steps' : '前序步骤摘要'}：\n${parts.join('\n')}` : ''
}

function buildFullTranscript(session: GuidedSession, en: boolean): string {
  const parts: string[] = []
  const { steps } = session
  const u = en ? 'Learner' : '学习者'
  const c = en ? 'Coach feedback' : '教练反馈'
  const isFocused = !!session.focusMethodId

  if (steps.methodSelection) {
    if (isFocused) {
      parts.push(
        `${en ? '--- Method (pre-selected) ---' : '--- 方法（自动指定） ---'}`,
        `${u}：${steps.methodSelection.selectedMethods.join(', ')}`,
      )
    } else {
      parts.push(
        `${en ? '--- Step 1: Method Selection ---' : '--- 步骤1：方法选择 ---'}`,
        `${u}：${en ? 'Chose' : '选择了'} ${steps.methodSelection.selectedMethods.join(', ')}；${en ? 'reasoning' : '理由'}：${steps.methodSelection.reasoning}`,
        `${c}：${steps.methodSelection.aiResponse}`,
      )
    }
  }
  if (steps.analysis) {
    const stepLabel = isFocused
      ? en
        ? '--- Step 1: Analysis & Conclusion ---'
        : '--- 步骤1：分析与结论 ---'
      : en
        ? '--- Step 2: Analysis & Conclusion ---'
        : '--- 步骤2：分析与结论 ---'
    parts.push(stepLabel, `${u}：${steps.analysis.userWork}`, `${c}：${steps.analysis.aiResponse}`)
  }

  return parts.length > 0
    ? `\n${en ? 'Full training transcript (learner answers + coach feedback)' : '完整训练记录（学习者回答 + 教练反馈）'}：\n${parts.join('\n')}`
    : ''
}

function getMethodApplicationGuide(methodIds: string[], en: boolean): string {
  const guides = methodIds.map((id) => {
    const spec = findMethodSpec(id)
    if (!spec) return ''
    const name = en ? spec.name.en : spec.name.zh
    const steps = spec.steps.map((s, i) => `  ${i + 1}. ${en ? s.en : s.zh}`).join('\n')
    return `${name}：\n${steps}`
  })
  return guides.filter(Boolean).join('\n\n')
}

const langDirective = (en: boolean) => (en ? 'Respond entirely in English.' : '所有内容必须使用中文回答。')

const SKIP_MARKER_ZH = '（跳过）'
const SKIP_MARKER_EN = '(skipped)'

function isSkipped(text: string): boolean {
  return text === SKIP_MARKER_ZH || text === SKIP_MARKER_EN
}

const skipDirective = (en: boolean) =>
  en
    ? 'The learner skipped this step. Instead of giving feedback, directly provide a model answer — a clear, complete example of what an ideal response would look like for this step.'
    : '学习者跳过了此步骤。不要给反馈，而是直接给出一个参考答案——展示这个步骤理想的、完整的回答应该是什么样的。'

/** 步骤 1（随机训练）：选择方法 + 理由 */
function buildStep1Prompt(session: GuidedSession, en: boolean) {
  const scenario = buildScenarioContext(session.scenario, en)
  const catalog = buildMethodCatalog(en)
  const sel = session.steps.methodSelection
  const skipped = isSkipped(sel?.reasoning ?? '')

  return {
    system: (skipped
      ? [
          en
            ? 'You are an analytical thinking coach. The learner skipped the method selection step.'
            : '你是分析思维教练。学习者跳过了方法选择步骤。',
          en
            ? 'Recommend the best 1-2 method(s) for this scenario. For each, give a brief reason (2-3 sentences) explaining why it fits THIS specific problem.'
            : '推荐 1-2 个最适合此场景的方法。对每个方法用 2-3 句话简要解释为什么它适合这个具体问题。',
          en ? 'Keep response concise (under 150 words).' : '回答要简洁（150 字以内）。',
        ]
      : en
        ? [
            'You are a Socratic analytical thinking coach. The learner has read the scenario and is selecting an analysis method.',
            'Evaluate their method selection and reasoning:',
            '- Is their chosen method a good fit for THIS specific problem?',
            '- Did they give solid reasons for their choice?',
            '- Are there methods they dismissed that deserved more consideration?',
            'Challenge their thinking constructively. If their choice is good, reinforce WHY it fits.',
            'Keep response concise (4-6 sentences).',
          ]
        : [
            '你是苏格拉底式分析思维教练。学习者已阅读场景，正在选择分析方法。',
            '评估他们的方法选择和理由：',
            '- 所选方法是否真正适合这个具体问题？',
            '- 选择理由是否充分？',
            '- 是否有值得考虑但被忽略的方法？',
            '建设性地挑战他们的思考。如果选得好，强化为什么适合。',
            '回答简洁（4-6 句）。',
          ]
    )
      .concat(langDirective(en))
      .join('\n'),
    prompt: [
      scenario,
      `\n${en ? 'Available methods' : '可用方法'}：\n${catalog}`,
      `\n${en ? 'Learner chose' : '学习者选择'}：${sel?.selectedMethods.join(', ') ?? ''}`,
      `${en ? 'Reasoning' : '理由'}：${sel?.reasoning ?? ''}`,
    ].join('\n'),
  }
}

/** 步骤 2（随机）/ 步骤 1（专项）：分析与结论（合并了原来的运用方法 + 得出结论） */
function buildStep2Prompt(session: GuidedSession, en: boolean) {
  const scenario = buildScenarioContext(session.scenario, en)
  const prior = buildPriorSummary(session, en)
  const methods = session.steps.methodSelection?.selectedMethods ?? []
  const guide = getMethodApplicationGuide(methods, en)
  const userWork = session.steps.analysis?.userWork ?? ''
  const skipped = isSkipped(userWork)

  return {
    system: (skipped
      ? [
          en
            ? 'You are an analytical thinking coach. The learner skipped this step.'
            : '你是分析思维教练。学习者跳过了此步骤。',
          skipDirective(en),
          en
            ? 'Demonstrate how to apply the chosen method step by step to this scenario, perform the analysis, and draw a conclusion with actionable recommendations.'
            : '演示如何将所选方法逐步应用于此场景，进行分析，并得出带有可执行建议的结论。',
        ]
      : en
        ? [
            'You are a Socratic analytical thinking coach. The learner is applying their chosen method and drawing conclusions in a PRACTICE SCENARIO.',
            'CRITICAL CONTEXT: This is a training exercise with a fictional scenario. The learner has NO access to real data, real people, or the actual situation. They can ONLY work with the information provided in the scenario description and their own reasoning. Educated guesses and hypothetical reasoning are not just acceptable — they are EXPECTED.',
            'Evaluate their work on TWO aspects:',
            '',
            'A) Method Application:',
            '- Did they follow the method steps in order?',
            "- Did they apply the method's framework correctly (right categories, right questions)?",
            '- Is their reasoning logical within each step?',
            '',
            'B) Conclusion Quality:',
            '- Does their conclusion flow logically from the analysis?',
            '- Did they propose specific next steps or recommendations?',
            '- Did they prioritize their findings?',
            '',
            'Do NOT demand real data verification — they cannot do that. Help them strengthen reasoning within the method framework.',
            'If their analysis lacks structure, show how to reorganize using a brief example from their own points.',
            'Acknowledge strengths before suggesting improvements. Keep response concise (5-8 sentences).',
          ]
        : [
            '你是苏格拉底式分析思维教练。学习者正在运用所选方法进行分析并得出结论，这是一个训练场景。',
            '关键背景：这是一个用虚构场景进行的训练练习。学习者没有真实数据、没有真人可以询问、没有现场可以查看。他们只能根据场景描述中提供的信息和自己的推理来分析。合理推测和假设性推理不仅是可以接受的——而且是训练中预期的行为。',
            '从两个方面评估他们的作答：',
            '',
            'A) 方法运用：',
            '- 是否按顺序遵循了方法步骤？',
            '- 是否正确应用了方法的框架（分类维度、提问方式）？',
            '- 每一步的推理是否合乎逻辑？',
            '',
            'B) 结论质量：',
            '- 结论是否从分析中逻辑推导而来？',
            '- 是否提出了具体的下一步行动建议？',
            '- 是否对发现进行了优先排序？',
            '',
            '不要要求真实数据验证——他们做不到。帮助他们在方法框架内加强推理。',
            '如果分析缺乏结构，用他们自己的观点展示如何重新组织。',
            '先肯定做得好的地方，再建议改进。回答简洁（5-8 句）。',
          ]
    )
      .concat(langDirective(en))
      .join('\n'),
    prompt: [
      scenario,
      prior,
      `\n${en ? 'Method steps reference' : '方法步骤参考'}：\n${guide}`,
      `\n${en ? "Learner's analysis and conclusion" : '学习者的分析与结论'}：\n${userWork}`,
    ].join('\n'),
  }
}

/** 步骤 3（随机）/ 步骤 2（专项）：综合评审 */
function buildStep3Prompt(session: GuidedSession, en: boolean) {
  const scenario = buildScenarioContext(session.scenario, en)
  const transcript = buildFullTranscript(session, en)
  const isFocused = !!session.focusMethodId

  const dimensions = isFocused
    ? en
      ? [
          '1. Analysis Execution: Did they apply the method thoroughly and logically?',
          '2. Conclusion Quality: Is their conclusion well-supported and actionable?',
        ]
      : ['1. 分析执行：方法运用是否完整、逻辑是否通顺？', '2. 结论质量：结论是否有依据、是否可执行？']
    : en
      ? [
          '1. Method Selection: Was their method choice appropriate and well-reasoned?',
          '2. Analysis Execution: Did they apply the method thoroughly and logically?',
          '3. Conclusion Quality: Is their conclusion well-supported and actionable?',
        ]
      : [
          '1. 方法选择：方法选择是否恰当、理由是否充分？',
          '2. 分析执行：方法运用是否完整、逻辑是否通顺？',
          '3. 结论质量：结论是否有依据、是否可执行？',
        ]

  return {
    system: en
      ? [
          'You are an analytical thinking coach giving a final comprehensive review.',
          "You have the FULL transcript of the training session: both the learner's answers AND the coach's feedback at each step.",
          'Your evaluation must be consistent with the coach feedback given during the process — do not contradict what was said earlier.',
          `Score the learner on the FULL analysis process (0-100) and evaluate these dimensions:`,
          ...dimensions,
          'Give each dimension a score (0-100) with a one-sentence comment.',
          "IMPORTANT: The learner may not be an expert in the scenario's industry. Evaluate their METHOD usage and logical thinking, not their domain expertise.",
          'Provide 2-3 specific, actionable tips for improvement.',
          'The overallFeedback should be a 3-5 sentence comprehensive summary that references specific strengths and weaknesses observed during the process.',
          langDirective(en),
        ].join('\n')
      : [
          '你是分析思维教练，给出最终综合评审。',
          '你拥有完整的训练过程记录：包括学习者每一步的回答和教练的反馈。',
          '你的评价必须与过程中教练给出的反馈保持一致——不要与之前的指导意见矛盾。',
          `对学习者的完整分析过程打分（0-100），并从以下维度评估：`,
          ...dimensions,
          '每个维度给出分数（0-100）和一句话评语。',
          '重要：学习者可能不是该场景所在行业的专家。请评价他们的方法运用能力和逻辑思维，而非行业专业知识。',
          '给出 2-3 条具体、可操作的改进建议。',
          'overallFeedback 应该是 3-5 句的综合总结，要引用过程中观察到的具体优点和不足。',
          langDirective(en),
        ].join('\n'),
    prompt: [scenario, transcript].join('\n'),
  }
}

export interface ProcessStepResult {
  aiResponse: string
  reflection?: Reflection
  usage: TokenUsage
}

export async function processStep(session: GuidedSession, step: GuidedStepNumber): Promise<ProcessStepResult> {
  const en = isEnglish()

  if (step === 3) {
    const { system, prompt } = buildStep3Prompt(session, en)
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

  const builders: Record<1 | 2, (s: GuidedSession, e: boolean) => { system: string; prompt: string }> = {
    1: buildStep1Prompt,
    2: buildStep2Prompt,
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
  difficulty?: Difficulty
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

  let methodConstraint = ''
  if (params.methodId) {
    const spec = findMethodSpec(params.methodId)
    if (spec) {
      const name = en ? spec.name.en : spec.name.zh
      const purpose = en ? spec.purpose.en : spec.purpose.zh
      methodConstraint = en
        ? `The scenario MUST be designed so that "${name}" (${purpose}) is the most natural and appropriate method to apply. The problem should clearly call for this method's strengths.`
        : `场景必须设计成"${name}"（${purpose}）是最自然、最合适的分析方法。问题应该明确需要发挥此方法的优势。`
    } else {
      methodConstraint = `${en ? 'Must be solvable with method' : '必须可用此方法解决'}：${params.methodId}`
    }
  }

  const constraints = [methodConstraint].filter(Boolean).join('\n')

  const domainPool = en
    ? [
        'manufacturing & supply chain',
        'healthcare & hospital operations',
        'software development & IT',
        'education & school management',
        'logistics & transportation',
        'retail & e-commerce',
        'finance & banking',
        'construction & engineering',
        'agriculture & farming',
        'energy & environment',
        'government & public policy',
        'marketing & advertising',
        'human resources & hiring',
        'real estate & property management',
        'telecommunications',
      ]
    : [
        '制造业与供应链',
        '医疗与医院运营',
        '软件开发与IT',
        '教育与学校管理',
        '物流与运输',
        '零售与电子商务',
        '金融与银行',
        '建筑与工程',
        '农业与种植',
        '能源与环境',
        '政府与公共政策',
        '市场营销与广告',
        '人力资源与招聘',
        '房地产与物业管理',
        '电信与通信',
      ]
  const picked = domainPool[Math.floor(Math.random() * domainPool.length)]

  const result = await generateStructured({
    schema: scenarioSchema,
    system: en
      ? [
          'You are a teacher of analytical thinking. Generate a realistic scenario for guided analysis training.',
          'The scenario must describe a concrete real-life situation where someone faces a problem requiring structured analysis.',
          `Difficulty: ${difficultyHint}`,
          `Domain/industry for this scenario: ${picked}. Create a scenario set in this domain.`,
          'IMPORTANT: Avoid restaurant, café, coffee shop, or food-service scenarios. Be creative and diverse.',
          'Make the scenario rich enough that a learner can practice: defining the problem, selecting a method, applying it step-by-step, and drawing conclusions.',
          'CRITICAL: The scenario title, description, and context must NEVER mention any analysis method by name (e.g. do NOT say "use fishbone diagram", "apply 5 Whys", "MCDA analysis", etc.). Only describe the situation and the problem — let the learner figure out which method to use. The applicableMethods field is metadata for the system, not shown to the learner.',
          'The id must be a short unique slug.',
          langDirective(en),
        ].join('\n')
      : [
          '你是分析思维教师。请生成一个用于引导式分析训练的真实场景。',
          '场景必须描述一个具体的现实情境，某人面临需要结构化分析的问题。',
          `难度：${difficultyHint}`,
          `本次场景的行业/领域：${picked}。请围绕此领域创建场景。`,
          '重要：不要生成餐饮、咖啡厅、奶茶店等餐饮服务类场景。场景要多样化、有创意。',
          '场景要足够丰富，让学习者可以练习：定义问题、选择方法、逐步运用、得出结论。',
          '关键要求：场景的标题、描述和背景中绝对不能提及任何分析方法的名称（例如不能说"用鱼骨图"、"通过5 Why分析"、"MCDA分析"等）。只描述情境和问题——让学习者自己判断该用什么方法。applicableMethods 字段是系统元数据，不会展示给学习者。',
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
