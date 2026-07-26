import { z } from 'zod'

import { methodIdSchema, scenarioSchema } from '@/data/domain'
import { methodRegistry } from '@/data/methods'

import { LlmError, generateStructured } from './llm'
import type { TokenUsage } from './llm'

export { LlmError as ApiError }
export type { TokenUsage }

export interface Scenario {
  id: string
  title: string
  description: string
  context: string
  difficulty: string
  taskType: string
  applicableMethods: string[]
  explanations: Record<string, string>
  commonMistakes: Array<{ methodId: string; why: string }>
}

export interface PracticeFeedback {
  correct: boolean
  score: number
  feedback: string
  methodExplanations: Array<{
    methodId: string
    fit: 'good' | 'partial' | 'poor'
    explanation: string
  }>
  improvementTip: string
}

const feedbackResponseSchema = z.object({
  correct: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string().min(1),
  methodExplanations: z.array(
    z.object({
      methodId: methodIdSchema,
      fit: z.enum(['good', 'partial', 'poor']),
      explanation: z.string().min(1),
    }),
  ),
  improvementTip: z.string().min(1),
})

function isEnglish(): boolean {
  return document.documentElement.lang === 'en'
}

function buildMethodCatalog(en: boolean): string {
  return methodRegistry
    .map((spec) => {
      const name = en ? spec.name.en : spec.name.zh
      const purpose = en ? spec.purpose.en : spec.purpose.zh
      return `- ${spec.id}（${name}）：${purpose}；适用场景：${spec.taskTypes.join('/')}`
    })
    .join('\n')
}

export async function generateScenario(params: {
  taskType?: string
  methodId?: string
  difficulty?: string
}): Promise<{ result: Scenario; usage: TokenUsage }> {
  const en = isEnglish()
  const difficulty = params.difficulty ?? 'beginner'
  const methodCatalog = buildMethodCatalog(en)

  const difficultyHint =
    difficulty === 'beginner'
      ? en
        ? 'Simple scenario with one clearly best method.'
        : '简单场景，有一个明显最优的方法。'
      : difficulty === 'intermediate'
        ? en
          ? 'Moderate scenario where 2-3 methods could apply, requiring comparison.'
          : '中等场景，2-3 个方法都有道理，需要比较取舍。'
        : en
          ? 'Complex scenario with ambiguity, conflicting signals, and multiple valid approaches.'
          : '复杂场景，信息模糊、信号冲突，多种方法都有其合理性。'

  const constraints = [
    params.taskType ? `${en ? 'Task type' : '场景类型'}：${params.taskType}` : '',
    params.methodId ? `${en ? 'Must include method' : '必须涵盖方法'}：${params.methodId}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  const result = await generateStructured({
    schema: scenarioSchema,
    system: en
      ? [
          'You are a teacher of analytical thinking methods. Generate a realistic training scenario.',
          'The scenario must describe a concrete, believable real-life situation where someone needs to make a decision or solve a problem.',
          `Difficulty: ${difficultyHint}`,
          'The scenario must test whether the learner can identify which analytical method(s) to use and why.',
          'Include 1-2 common mistakes (methods that seem relevant but are not the best fit) with clear explanations.',
          'The id must be a short unique slug like "startup-pricing-q1".',
          'All explanations should teach WHY a method fits or does not fit this specific scenario.',
          'Respond entirely in English.',
        ].join('\n')
      : [
          '你是分析思维方法的教师。请生成一个真实的训练场景。',
          '场景必须描述一个具体、可信的现实情境，某人需要做决策或解决问题。',
          `难度：${difficultyHint}`,
          '场景必须检验学习者能否识别应该用哪种分析方法、为什么。',
          '包含 1-2 个常见误选（看起来相关但并非最佳的方法），并给出清晰解释。',
          'id 用简短的英文短横线命名，如 "startup-pricing-q1"。',
          '所有解释都要说明为什么某方法适合或不适合这个具体场景。',
          '所有内容必须使用中文回答，id 字段除外。',
        ].join('\n'),
    prompt: [
      en ? 'Generate a training scenario with these requirements:' : '请按以下要求生成训练场景：',
      constraints || (en ? '(no special constraints)' : '（无特殊限制）'),
      `${en ? 'Method catalog' : '方法目录'}：\n${methodCatalog}`,
    ].join('\n\n'),
  })

  return { result: result.object as Scenario, usage: result.usage }
}

export async function submitPractice(params: {
  scenarioTitle: string
  scenarioDescription: string
  scenarioContext: string
  applicableMethods: string[]
  selectedMethods: string[]
  reasoning: string
}): Promise<{ result: PracticeFeedback; usage: TokenUsage }> {
  const en = isEnglish()

  const result = await generateStructured({
    schema: feedbackResponseSchema,
    system: en
      ? [
          'You are a supportive but rigorous analytical thinking coach.',
          "Evaluate the learner's method selection and reasoning for the given scenario.",
          'Be specific about WHY their choice works or does not work for THIS scenario.',
          'Give constructive feedback that helps them build transferable judgment.',
          'The improvement tip should be one actionable insight they can apply next time.',
          'Respond entirely in English.',
        ].join('\n')
      : [
          '你是严谨但鼓励型的分析思维教练。',
          '评估学习者针对给定场景的方法选择和推理。',
          '具体说明为什么他们的选择在这个场景下有效或无效。',
          '给出有建设性的反馈，帮助他们建立可迁移的判断力。',
          '改进建议应该是一条下次可以直接用的可操作洞察。',
          '所有内容必须使用中文回答。',
        ].join('\n'),
    prompt: [
      `${en ? 'Scenario' : '场景'}：${params.scenarioTitle}`,
      `${en ? 'Description' : '描述'}：${params.scenarioDescription}`,
      `${en ? 'Context' : '背景'}：${params.scenarioContext}`,
      `${en ? 'Best methods' : '最佳方法'}：${params.applicableMethods.join(', ')}`,
      `${en ? 'Learner chose' : '学习者选择'}：${params.selectedMethods.join(', ')}`,
      `${en ? 'Learner reasoning' : '学习者思路'}：${params.reasoning || (en ? '(none provided)' : '（未提供）')}`,
    ].join('\n'),
  })

  return { result: result.object as PracticeFeedback, usage: result.usage }
}
