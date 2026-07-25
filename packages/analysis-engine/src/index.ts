import type { ActionStep, AnalysisPreview, Clarification, DataNeed, GoalInput, TaskType } from '@clarity/domain'

export const taskTypeLabels: Record<TaskType, string> = {
  diagnosis: '诊断问题',
  improvement: '改进现状',
  selection: '比较选择',
  planning: '制定计划',
  prediction: '判断趋势',
  exploration: '探索方向',
  learning: '学习成长',
}

export type AnalysisLocale = 'zh-CN' | 'en'

export const taskTypeLabelsEn: Record<TaskType, string> = {
  diagnosis: 'Diagnose a problem',
  improvement: 'Improve a situation',
  selection: 'Compare options',
  planning: 'Create a plan',
  prediction: 'Assess a trend',
  exploration: 'Explore directions',
  learning: 'Learn and develop',
}

const keywordRules: Array<[TaskType, RegExp]> = [
  ['selection', /选择|比较|选哪个|买哪|要不要|是否应该|取舍/],
  ['diagnosis', /为什么|原因|下降|异常|故障|问题|失败|流失/],
  ['improvement', /提升|提高|改进|优化|增长|降低|减少|改善/],
  ['prediction', /预测|趋势|概率|会不会|预计|未来.*多少/],
  ['learning', /学习|掌握|考试|入门|转行|转型|转向.*岗位|能力|训练|课程/],
  ['exploration', /探索|方向|机会|可能性|不知道做什么|调研/],
  ['planning', /完成|实现|计划|上线|发布|建立|开始|落地/],
  ['selection', /choose|select|compare|which one|trade-?off|buy/i],
  ['diagnosis', /why|cause|decline|failure|problem|issue|churn|fault/i],
  ['improvement', /improve|increase|optimi[sz]e|grow|reduce|decrease/i],
  ['prediction', /predict|forecast|trend|probability|likely|future/i],
  ['learning', /learn|study|exam|career change|move into.*role|transition.*role|skill|train|course|master/i],
  ['exploration', /explore|direction|opportunity|research|possibilit/i],
  ['planning', /complete|achieve|plan|launch|publish|build|start|deliver/i],
]

export function inferTaskType(input: GoalInput): TaskType {
  if (input.preferredTaskType) return input.preferredTaskType
  const text = `${input.rawGoal} ${input.desiredOutcome}`
  return keywordRules.find(([, pattern]) => pattern.test(text))?.[0] ?? 'planning'
}

function calculateCompleteness(input: GoalInput): number {
  const constraintsPresent = input.constraints.length > 0
  const factsPresent = input.knownFacts.length > 0
  return [
    input.rawGoal.length >= 8 ? 20 : 10,
    input.currentState ? 15 : 0,
    input.desiredOutcome ? 20 : 0,
    input.successMetric ? 20 : 0,
    input.deadline ? 15 : 0,
    constraintsPresent ? 5 : 0,
    factsPresent ? 5 : 0,
  ].reduce((sum, value) => sum + value, 0)
}

function clarification(id: string, field: string, question: string, reason: string, required = true): Clarification {
  return { id, field, question, reason, required }
}

function buildClarifications(input: GoalInput, taskType: TaskType, locale: AnalysisLocale): Clarification[] {
  const en = locale === 'en'
  const result: Clarification[] = []
  if (!input.currentState) {
    result.push(
      clarification(
        'current-state',
        'currentState',
        en ? 'What is the current starting point?' : '现在的起点是什么？',
        en
          ? 'Without a baseline, the size of the gap cannot be assessed.'
          : '没有基线，就无法判断目标需要跨越多大差距。',
      ),
    )
  }
  if (!input.desiredOutcome) {
    result.push(
      clarification(
        'desired-outcome',
        'desiredOutcome',
        en ? 'What observable result will exist when this is complete?' : '完成后，具体会出现什么可观察结果？',
        en ? 'An observable outcome makes completion testable.' : '把愿望改写为结果，才能检查是否真正完成。',
      ),
    )
  }
  if (!input.successMetric) {
    result.push(
      clarification(
        'success-metric',
        'successMetric',
        en ? 'What metric or evidence will indicate success?' : '用什么指标或证据判断成功？',
        en
          ? 'Define success before acting so the standard cannot be changed afterward.'
          : '成功标准必须在行动前确定，避免事后改变口径。',
      ),
    )
  }
  if (!input.deadline) {
    result.push(
      clarification(
        'deadline',
        'deadline',
        en ? 'When should this be completed?' : '希望在什么时间前完成？',
        en ? 'The deadline affects intensity, resources, and feasibility.' : '期限决定方案强度、资源配置和可行性。',
      ),
    )
  }
  if (input.constraints.length === 0) {
    result.push(
      clarification(
        'constraints',
        'constraints',
        en ? 'Which constraints cannot be violated?' : '有哪些不能突破的限制？',
        en
          ? 'Budget, time, risk, and responsibility boundaries rule out unsuitable options.'
          : '预算、时间、风险和责任边界会直接排除不合适方案。',
        false,
      ),
    )
  }
  if (taskType === 'selection') {
    result.push(
      clarification(
        'alternatives',
        'alternatives',
        en ? 'What are at least two comparable options?' : '至少有哪些两个可比较的方案？',
        en ? 'A real selection analysis requires more than one option.' : '只有一个方案时无法进行真正的选择分析。',
      ),
    )
  }
  if (taskType === 'diagnosis' || taskType === 'improvement') {
    result.push(
      clarification(
        'change-point',
        'changePoint',
        en
          ? 'When did the issue begin, and what changed around that time?'
          : '问题从什么时候开始，前后发生了什么变化？',
        en
          ? 'A change point narrows candidate causes but still requires evidence.'
          : '变化点有助于缩小候选原因范围，但仍需证据验证。',
      ),
    )
  }
  return result
}

const commonDataNeeds: DataNeed[] = [
  {
    id: 'baseline',
    title: '当前基线',
    reason: '确认真实起点，并为之后的改进幅度提供比较基准。',
    fields: ['当前数值或状态', '统计口径', '记录时间', '数据来源'],
    collectionMethod: '从现有记录、系统报表或一次基线测量中取得。',
    required: true,
  },
  {
    id: 'success-evidence',
    title: '成功证据',
    reason: '将模糊的“做好”改成行动前就能确认的完成标准。',
    fields: ['目标值', '验收方式', '验收人', '最晚日期'],
    collectionMethod: '与目标责任人确认，写成可以观察或计数的标准。',
    required: true,
  },
  {
    id: 'constraints',
    title: '限制与可用资源',
    reason: '防止系统推荐实际上无法执行的方案。',
    fields: ['预算', '每周可投入时间', '可协助人员', '不可接受风险'],
    collectionMethod: '列出硬限制与软偏好，并标注哪些可以协商。',
    required: true,
  },
]

const commonDataNeedsEn: DataNeed[] = [
  {
    id: 'baseline',
    title: 'Current baseline',
    reason: 'Confirm the true starting point and create a comparison baseline.',
    fields: ['Current value or state', 'Measurement definition', 'Recorded date', 'Source'],
    collectionMethod: 'Use existing records, system reports, or one baseline measurement.',
    required: true,
  },
  {
    id: 'success-evidence',
    title: 'Evidence of success',
    reason: 'Turn a vague intention into an acceptance criterion defined before action.',
    fields: ['Target value', 'Acceptance method', 'Reviewer', 'Latest date'],
    collectionMethod: 'Confirm an observable or countable standard with the goal owner.',
    required: true,
  },
  {
    id: 'constraints',
    title: 'Constraints and available resources',
    reason: 'Prevent recommendations that cannot be executed in practice.',
    fields: ['Budget', 'Weekly time', 'Available support', 'Unacceptable risks'],
    collectionMethod: 'Separate hard constraints from negotiable preferences.',
    required: true,
  },
]

const taskDataNeeds: Record<TaskType, DataNeed[]> = {
  diagnosis: [
    {
      id: 'change-history',
      title: '变化前后记录',
      reason: '寻找与异常同时发生的变化，形成候选原因，而不是凭印象归因。',
      fields: ['异常开始时间', '变化前数据', '变化后数据', '同期事件'],
      collectionMethod: '按时间线整理日志、访谈、版本记录或业务数据。',
      required: true,
    },
    {
      id: 'counter-evidence',
      title: '反例与反对证据',
      reason: '检查候选原因是否也能解释没有发生问题的情况。',
      fields: ['正常样本', '反例', '替代解释'],
      collectionMethod: '主动寻找与当前判断不一致的案例。',
      required: true,
    },
  ],
  improvement: [
    {
      id: 'process-observation',
      title: '过程与分段数据',
      reason: '总结果只能说明发生了什么，分段和过程数据才可能暴露改进位置。',
      fields: ['流程步骤', '每步耗时', '失败点', '人群或场景分段'],
      collectionMethod: '观察流程并按阶段、用户或渠道拆分数据。',
      required: true,
    },
    {
      id: 'small-test',
      title: '小规模试验条件',
      reason: '先以低成本验证改进是否有效，再决定是否扩大。',
      fields: ['试验范围', '预期变化', '观察指标', '停止条件'],
      collectionMethod: '设计一轮可停止、可比较、可记录结果的 PDSA。',
      required: true,
    },
  ],
  selection: [
    {
      id: 'alternatives',
      title: '候选方案清单',
      reason: '确保比较的是现实可行的方案，并保留“不行动”作为基准。',
      fields: ['方案', '必要条件', '一次性成本', '持续成本'],
      collectionMethod: '至少收集两个可行方案及一个维持现状方案。',
      required: true,
    },
    {
      id: 'criteria',
      title: '选择准则与权重',
      reason: '把价值判断显式化，避免评分结果掩盖真正偏好。',
      fields: ['硬约束', '评价准则', '权重', '最低可接受值'],
      collectionMethod: '先独立确定准则，再查看各方案表现。',
      required: true,
    },
  ],
  planning: [
    {
      id: 'dependencies',
      title: '任务依赖与资源',
      reason: '识别真正决定周期的前置条件和关键路径。',
      fields: ['任务', '前置任务', '负责人', '乐观／最可能／悲观工期'],
      collectionMethod: '从最终成果反推任务，并请实际执行者估算。',
      required: true,
    },
  ],
  prediction: [
    {
      id: 'base-rate',
      title: '基准率与历史样本',
      reason: '先知道类似情况通常如何，避免只围绕当前故事预测。',
      fields: ['相似事件', '发生次数', '样本范围', '与当前情况的差异'],
      collectionMethod: '查找同类历史记录或可信的外部统计。',
      required: true,
    },
  ],
  exploration: [
    {
      id: 'landscape',
      title: '机会空间',
      reason: '先扩大候选范围，再用一致标准收敛，避免过早锁定第一想法。',
      fields: ['候选方向', '目标用户', '未满足需求', '进入门槛'],
      collectionMethod: '进行桌面研究、访谈和相邻领域类比。',
      required: true,
    },
  ],
  learning: [
    {
      id: 'skill-baseline',
      title: '能力基线与目标任务',
      reason: '学习计划应围绕最终要完成的任务，而不是只累计学习时长。',
      fields: ['当前水平证据', '目标任务', '可用时间', '测验方式'],
      collectionMethod: '完成一次真实任务或诊断测验，并记录具体错误。',
      required: true,
    },
    {
      id: 'practice-loop',
      title: '练习与反馈条件',
      reason: '只有带反馈的提取、应用和纠错才能稳定提升能力。',
      fields: ['练习频率', '反馈来源', '复习间隔', '迁移任务'],
      collectionMethod: '把知识点变成短练习，并安排真实项目应用。',
      required: true,
    },
  ],
}

const taskDataNeedsEn: Record<TaskType, DataNeed[]> = {
  diagnosis: [
    {
      id: 'change-history',
      title: 'Before-and-after records',
      reason: 'Find changes that coincided with the issue and form candidate causes without relying on impressions.',
      fields: ['Issue start time', 'Before data', 'After data', 'Concurrent events'],
      collectionMethod: 'Build a timeline from logs, interviews, releases, or operating data.',
      required: true,
    },
    {
      id: 'counter-evidence',
      title: 'Counterexamples and opposing evidence',
      reason: 'Check whether a candidate cause also explains cases where the issue did not occur.',
      fields: ['Normal cases', 'Counterexamples', 'Alternative explanations'],
      collectionMethod: 'Actively search for cases inconsistent with the current explanation.',
      required: true,
    },
  ],
  improvement: [
    {
      id: 'process-observation',
      title: 'Process and segmented data',
      reason: 'Aggregate results show what happened; process and segment data may reveal where to improve.',
      fields: ['Process steps', 'Time per step', 'Failure points', 'Audience or scenario segments'],
      collectionMethod: 'Observe the process and segment by stage, user, or channel.',
      required: true,
    },
    {
      id: 'small-test',
      title: 'Small-test conditions',
      reason: 'Validate an improvement at low cost before expanding it.',
      fields: ['Test scope', 'Expected change', 'Observed metric', 'Stop condition'],
      collectionMethod: 'Design one stoppable, comparable, and measurable PDSA cycle.',
      required: true,
    },
  ],
  selection: [
    {
      id: 'alternatives',
      title: 'Candidate options',
      reason: 'Compare realistic options and retain doing nothing as a baseline.',
      fields: ['Option', 'Prerequisites', 'One-time cost', 'Ongoing cost'],
      collectionMethod: 'Collect at least two feasible options plus the status quo.',
      required: true,
    },
    {
      id: 'criteria',
      title: 'Decision criteria and weights',
      reason: 'Make value judgments explicit so a score cannot hide real preferences.',
      fields: ['Hard constraints', 'Criteria', 'Weights', 'Minimum acceptable value'],
      collectionMethod: 'Set criteria before reviewing option performance.',
      required: true,
    },
  ],
  planning: [
    {
      id: 'dependencies',
      title: 'Task dependencies and resources',
      reason: 'Identify prerequisites and the critical path that actually determine duration.',
      fields: ['Task', 'Predecessor', 'Owner', 'Optimistic / likely / pessimistic duration'],
      collectionMethod: 'Work backward from the outcome and ask actual implementers for estimates.',
      required: true,
    },
  ],
  prediction: [
    {
      id: 'base-rate',
      title: 'Base rates and historical cases',
      reason: 'Understand what usually happens in similar situations before forecasting from the current story.',
      fields: ['Comparable events', 'Frequency', 'Sample scope', 'Differences from the current case'],
      collectionMethod: 'Use comparable internal records or credible external statistics.',
      required: true,
    },
  ],
  exploration: [
    {
      id: 'landscape',
      title: 'Opportunity landscape',
      reason: 'Expand the option space before converging with consistent criteria.',
      fields: ['Candidate direction', 'Target user', 'Unmet need', 'Barrier to entry'],
      collectionMethod: 'Combine desk research, interviews, and analogies from adjacent fields.',
      required: true,
    },
  ],
  learning: [
    {
      id: 'skill-baseline',
      title: 'Skill baseline and target task',
      reason: 'A learning plan should center on the task to perform, not accumulated study time.',
      fields: ['Evidence of current level', 'Target task', 'Available time', 'Assessment method'],
      collectionMethod: 'Complete a real task or diagnostic and record specific errors.',
      required: true,
    },
    {
      id: 'practice-loop',
      title: 'Practice and feedback conditions',
      reason: 'Stable improvement requires retrieval, application, and correction with feedback.',
      fields: ['Practice frequency', 'Feedback source', 'Review interval', 'Transfer task'],
      collectionMethod: 'Turn concepts into short exercises and apply them in real projects.',
      required: true,
    },
  ],
}

function buildActionSteps(
  input: GoalInput,
  taskType: TaskType,
  clarifications: Clarification[],
  locale: AnalysisLocale,
): ActionStep[] {
  const en = locale === 'en'
  const firstClarification = clarifications[0]
  const localizedTaskDataNeeds = en ? taskDataNeedsEn : taskDataNeeds
  const labels = en ? taskTypeLabelsEn : taskTypeLabels
  const taskSpecificDataNeeds = localizedTaskDataNeeds[taskType] ?? []
  return [
    {
      id: 'clarify',
      title: firstClarification
        ? `${en ? 'Answer first' : '先回答'}：${firstClarification.question}`
        : en
          ? 'Confirm the goal definition'
          : '确认目标定义',
      description:
        firstClarification?.reason ??
        (en
          ? 'Check that the goal, metric, deadline, and constraints are consistent.'
          : '检查目标、指标、期限和限制是否保持一致。'),
      doneWhen: firstClarification
        ? en
          ? 'A specific answer is recorded'
          : '问题得到具体回答并保存'
        : en
          ? 'All goal fields are confirmed'
          : '目标字段均已确认',
      kind: 'clarify',
    },
    {
      id: 'collect',
      title: en ? 'Collect the minimum necessary data' : '收集最小必要数据',
      description: en
        ? `Collect “Current baseline” and “${taskSpecificDataNeeds[0]?.title ?? 'Key conditions'}” first instead of gathering everything that might be useful.`
        : `先收集“当前基线”和“${taskSpecificDataNeeds[0]?.title ?? '关键条件'}”，不要一次收集所有可能有用的信息。`,
      doneWhen: en
        ? 'Every critical data item includes a source, date, and definition'
        : '每项关键数据都包含来源、时间和口径',
      kind: 'collect',
    },
    {
      id: 'analyze',
      title: en ? `Run the “${labels[taskType]}” workflow` : `运行${labels[taskType]}主流程`,
      description: en
        ? 'Separate facts, assumptions, opinions, and unknowns, and record opposing evidence.'
        : '把事实、假设、意见和未知项分开，并主动记录反对证据。',
      doneWhen: en
        ? 'At least two explanations or options are comparable and unknowns are marked'
        : '形成至少两个可比较解释或方案，并标出未知项',
      kind: 'analyze',
    },
    {
      id: 'act',
      title: en ? 'Take one verifiable next step' : '执行一个可验证的下一步',
      description: input.deadline
        ? en
          ? `Plan the smallest action around the ${input.deadline} deadline and check results before expanding investment.`
          : `围绕 ${input.deadline} 的期限安排最小行动，并在扩大投入前检查结果。`
        : en
          ? 'Choose a low-cost, stoppable action with an observable result instead of making one large bet.'
          : '选择低成本、可停止、结果可观察的行动，避免一次性押注。',
      doneWhen: en
        ? 'Owner, timing, acceptance criteria, and actual result are recorded'
        : '已记录负责人、时间、完成标准和实际结果',
      kind: 'act',
    },
    {
      id: 'review',
      title: en ? 'Update the analysis with results' : '用结果更新分析',
      description: en
        ? 'Compare predicted and actual results, update assumptions, and create an exercise from this analysis gap.'
        : '比较预测与实际结果，更新假设状态，并生成一条针对本次遗漏的训练题。',
      doneWhen: en ? 'The conclusion, evidence, and next action are updated' : '结论、证据和下一轮行动均已更新',
      kind: 'review',
    },
  ]
}

export * from './methods/registry.js'
export * from './methods/router.js'
export * from './methods/compute.js'

export function analyzeGoal(input: GoalInput, locale: AnalysisLocale = 'zh-CN'): AnalysisPreview {
  const en = locale === 'en'
  const taskType = inferTaskType(input)
  const labels = en ? taskTypeLabelsEn : taskTypeLabels
  const localizedTaskDataNeeds = en ? taskDataNeedsEn : taskDataNeeds
  const taskSpecificDataNeeds = localizedTaskDataNeeds[taskType] ?? []
  const clarifications = buildClarifications(input, taskType, locale)
  const completeness = calculateCompleteness(input)
  const summary = input.desiredOutcome
    ? en
      ? `Move from “${input.currentState || 'an unconfirmed starting point'}” to “${input.desiredOutcome}.”`
      : `从“${input.currentState || '尚未确认的起点'}”推进到“${input.desiredOutcome}”。`
    : en
      ? `First rewrite “${input.rawGoal}” as an observable and testable outcome.`
      : `先把“${input.rawGoal}”改写成可以观察和验收的结果。`
  const cautions = [
    en
      ? 'System output is analysis to be verified, not established fact.'
      : '系统生成的是待验证分析，不是已经成立的事实。',
    ...(input.knownFacts.length === 0
      ? [
          en
            ? 'No fact sources are recorded, so later conclusions cannot be marked as verified.'
            : '目前没有记录事实来源，后续结论不能标为已证实。',
        ]
      : []),
    ...(completeness < 60
      ? [
          en
            ? 'The goal remains incomplete; prioritize clarification and low-cost data collection.'
            : '目标信息仍不完整，当前行动应以澄清和低成本收集为主。',
        ]
      : []),
  ]

  return {
    taskType,
    taskTypeLabel: labels[taskType],
    completeness,
    summary,
    clarifications,
    dataNeeds: [...(en ? commonDataNeedsEn : commonDataNeeds), ...taskSpecificDataNeeds],
    actionSteps: buildActionSteps(input, taskType, clarifications, locale),
    cautions,
  }
}
