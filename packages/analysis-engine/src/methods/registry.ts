// 分析方法注册表 —— 与 product.md 11.2 节"第一版完整方法箱"对齐。
//
// 每个方法条目是结构化元数据：名称、用途、适用任务类型、前置条件、产出、
// 误用边界（product.md 15.3 的禁止项）和实现深度。路由（router.ts）从这里
// 取候选方法；界面从这里取标注文案；API 把前置条件告诉 LLM 以生成动态问题。
import type { MethodId, TaskType } from '@clarity/domain'

export interface LocalizedText {
  zh: string
  en: string
}

export interface MethodSpec {
  id: MethodId
  name: LocalizedText
  purpose: LocalizedText
  taskTypes: TaskType[]
  /** 运行该方法前必须先补齐的条件（也是动态问题的生成依据）。 */
  requiredInputs: LocalizedText[]
  outputs: LocalizedText[]
  /** 误用边界，界面上必须随方法一起展示。 */
  caution: LocalizedText
  depth: 'interactive' | 'guided'
}

export const methodRegistry: readonly MethodSpec[] = [
  {
    id: 'fishbone',
    name: { zh: '鱼骨分析', en: 'Fishbone diagram' },
    purpose: { zh: '把问题按类别展开成候选原因树', en: 'Expand a problem into a tree of candidate causes by category' },
    taskTypes: ['diagnosis'],
    requiredInputs: [
      { zh: '要解释的异常或问题是什么', en: 'The problem or anomaly to explain' },
      { zh: '问题从什么时候开始、影响了哪些范围', en: 'When the problem started and what scope it affects' },
    ],
    outputs: [{ zh: '按类别组织的候选原因树', en: 'Candidate cause tree organized by category' }],
    caution: {
      zh: '鱼骨分支只是候选原因，不能当作已证实的因果结论。',
      en: 'Branches are candidate causes only, never verified causal conclusions.',
    },
    depth: 'interactive',
  },
  {
    id: 'five-why',
    name: { zh: '5 Why 追问', en: '5 Whys' },
    purpose: {
      zh: '沿单条因果链向下追问，直到可行动的根因',
      en: 'Chase one causal chain down to an actionable root cause',
    },
    taskTypes: ['diagnosis'],
    requiredInputs: [
      { zh: '一个具体的、可观察的问题现象', en: 'One concrete, observable symptom' },
      { zh: '问题发生时的现场事实或记录', en: 'First-hand facts or records from when the problem occurred' },
    ],
    outputs: [{ zh: '若干条“现象 → 根因”的追问链', en: 'Several symptom-to-root-cause chains' }],
    caution: {
      zh: '每一层“为什么”都需要事实支撑，否则追问会退化成猜测。',
      en: 'Each “why” needs factual support, otherwise the chain degrades into guessing.',
    },
    depth: 'interactive',
  },
  {
    id: 'kj',
    name: { zh: 'KJ 法 / 亲和图', en: 'KJ method / affinity diagram' },
    purpose: {
      zh: '从零散材料（访谈、评论、笔记）中归纳出主题',
      en: 'Surface themes from scattered notes, interviews, and comments',
    },
    taskTypes: ['exploration', 'diagnosis'],
    requiredInputs: [
      { zh: '一批原始材料（每条一句话左右的笔记或摘录）', en: 'A batch of raw notes or excerpts, one idea per card' },
    ],
    outputs: [{ zh: '分组后的主题地图与未分类项', en: 'Grouped theme map with unclassified cards' }],
    caution: {
      zh: '主题数量不代表影响大小，分组结果需要人工确认。',
      en: 'Theme counts do not equal impact; grouping needs human confirmation.',
    },
    depth: 'interactive',
  },
  {
    id: 'abc',
    name: { zh: 'ABC / Pareto 分析', en: 'ABC / Pareto analysis' },
    purpose: {
      zh: '按价值口径排序，找出最值得优先处理的少数项',
      en: 'Rank items by a value metric to find the vital few',
    },
    taskTypes: ['improvement', 'exploration'],
    requiredInputs: [
      { zh: '一组可比较的项目清单', en: 'A comparable list of items' },
      {
        zh: '每个项目在同一口径下的数值（成本、频次、收益等）',
        en: 'A value per item on one consistent metric (cost, frequency, revenue...)',
      },
    ],
    outputs: [{ zh: '排序、累计占比和 A/B/C 分类', en: 'Ranking, cumulative share, and A/B/C classes' }],
    caution: {
      zh: '80/20 只是排序启发式，不能把固定阈值当作客观规律。',
      en: '80/20 is a ranking heuristic; fixed thresholds are not a law of nature.',
    },
    depth: 'guided',
  },
  {
    id: 'causal-graph',
    name: { zh: '基础因果图', en: 'Causal graph (DAG)' },
    purpose: {
      zh: '显式画出变量间假设的因果方向，暴露混杂因素',
      en: 'Make assumed causal directions explicit and expose confounders',
    },
    taskTypes: ['diagnosis', 'prediction'],
    requiredInputs: [
      {
        zh: '关键变量清单（结果变量与可能影响它的因素）',
        en: 'Key variables: the outcome and factors that may influence it',
      },
      { zh: '哪些关系有证据、哪些只是假设', en: 'Which relations are evidence-backed vs assumed' },
    ],
    outputs: [
      { zh: '变量、方向、关系类型和未验证假设', en: 'Variables, directions, relation types, and untested assumptions' },
    ],
    caution: {
      zh: '相关不等于因果；声称“改变 X 导致 Y”需要实验或明确假设。',
      en: 'Correlation is not causation; claiming “X causes Y” needs experiments or explicit assumptions.',
    },
    depth: 'guided',
  },
  {
    id: 'mcda',
    name: { zh: 'MCDA 多准则决策分析', en: 'Multi-criteria decision analysis' },
    purpose: {
      zh: '在多个冲突目标下透明地比较方案并检验结论稳健性',
      en: 'Compare options across conflicting goals transparently and test robustness',
    },
    taskTypes: ['selection'],
    requiredInputs: [
      { zh: '至少两个现实可行的候选方案（含“维持现状”）', en: 'At least two feasible options, including “do nothing”' },
      { zh: '不能突破的硬约束', en: 'Hard constraints that must not be violated' },
      { zh: '你在乎的评价准则和大致重要性', en: 'Evaluation criteria and rough importance' },
    ],
    outputs: [
      {
        zh: '加权得分、排序和敏感性（权重变化是否颠覆结论）',
        en: 'Weighted scores, ranking, and sensitivity (does the conclusion flip?)',
      },
    ],
    caution: {
      zh: '不允许只显示一个神秘总分；权重和最低可接受值必须可见。',
      en: 'No opaque single score; weights and minimum acceptable values stay visible.',
    },
    depth: 'interactive',
  },
  {
    id: 'value-analysis',
    name: { zh: '价值分析', en: 'Value analysis' },
    purpose: {
      zh: '逐项检查功能是否值得它的成本，寻找更省的替代做法',
      en: 'Check whether each function is worth its cost and find cheaper alternatives',
    },
    taskTypes: ['selection', 'improvement'],
    requiredInputs: [
      { zh: '要评估的功能或支出清单', en: 'The list of functions or expenses to evaluate' },
      { zh: '每项的大致成本', en: 'Rough cost per item' },
    ],
    outputs: [{ zh: '必要性、成本、价值判断与替代方案', en: 'Necessity, cost, worth judgment, and alternatives' }],
    caution: {
      zh: '“便宜”不等于“值得”；先确认功能对目标的贡献再砍成本。',
      en: 'Cheap is not the same as worthwhile; confirm contribution to the goal before cutting cost.',
    },
    depth: 'guided',
  },
  {
    id: 'fmea',
    name: { zh: 'FMEA 失效模式分析', en: 'FMEA' },
    purpose: {
      zh: '事前列出方案可能的失败方式，按严重度×发生度×可探测度排序',
      en: 'List failure modes upfront, ranked by severity × occurrence × detection',
    },
    taskTypes: ['planning', 'selection', 'improvement'],
    requiredInputs: [
      { zh: '要检查的方案或计划', en: 'The plan or option to stress-test' },
      { zh: '什么后果算不可接受', en: 'What consequences are unacceptable' },
    ],
    outputs: [{ zh: '失效模式、RPN 排序和缓解措施', en: 'Failure modes, RPN ranking, and mitigations' }],
    caution: {
      zh: '缺少领域经验时不能宣称风险已全覆盖；RPN 只是排序工具。',
      en: 'Without domain expertise do not claim risks are fully covered; RPN is a ranking aid only.',
    },
    depth: 'guided',
  },
  {
    id: 'dmaic',
    name: { zh: 'DMAIC 改进流程', en: 'DMAIC' },
    purpose: {
      zh: '用 Define-Measure-Analyze-Improve-Control 系统改善已有流程',
      en: 'Improve an existing process via Define-Measure-Analyze-Improve-Control',
    },
    taskTypes: ['improvement'],
    requiredInputs: [
      { zh: '一个已存在、可测量的流程', en: 'An existing, measurable process' },
      { zh: '当前基线指标', en: 'The current baseline metric' },
    ],
    outputs: [{ zh: '五阶段改进模板，每阶段有明确产出', en: 'Five-phase improvement template with defined outputs' }],
    caution: {
      zh: '原因已清楚的小问题不要套完整 DMAIC，直接用 PDSA。',
      en: 'Do not wrap small, well-understood problems in full DMAIC; use PDSA.',
    },
    depth: 'guided',
  },
  {
    id: 'pdsa',
    name: { zh: 'PDSA 小试验', en: 'PDSA cycle' },
    purpose: {
      zh: '先写预测，再小范围测试，用结果决定推广或调整',
      en: 'Predict, test small, compare, then scale or adjust',
    },
    taskTypes: ['improvement', 'learning'],
    requiredInputs: [
      { zh: '一个想要验证的改动假设', en: 'A change hypothesis to validate' },
      { zh: '可以小范围试验且可停止的范围', en: 'A small, stoppable test scope' },
    ],
    outputs: [
      { zh: '预测、范围、指标、停止规则和下一轮安排', en: 'Prediction, scope, metrics, stop rule, and the next cycle' },
    ],
    caution: {
      zh: '试点样本不代表所有场景；先比较预测与结果再扩大投入。',
      en: 'A pilot sample does not represent all scenarios; compare prediction vs result before scaling.',
    },
    depth: 'guided',
  },
  {
    id: 'forecast',
    name: { zh: '概率预测与校准', en: 'Probabilistic forecast' },
    purpose: {
      zh: '先看基准率，再给情景和概率，事后校准',
      en: 'Start from base rates, assign scenario probabilities, calibrate later',
    },
    taskTypes: ['prediction'],
    requiredInputs: [
      { zh: '一句可验证、有截止时间的预测陈述', en: 'A verifiable prediction statement with a deadline' },
      { zh: '类似情况的基准率或历史样本', en: 'Base rates or historical samples of similar cases' },
    ],
    outputs: [
      {
        zh: '基准率、情景概率和 0-100% 的预测记录',
        en: 'Base rate, scenario probabilities, and a 0-100% forecast record',
      },
    ],
    caution: {
      zh: '不允许只给“高/中/低”；概率必须可到期验证。',
      en: 'No bare “high/medium/low”; probabilities must be resolvable at a deadline.',
    },
    depth: 'guided',
  },
  {
    id: 'pert',
    name: { zh: 'PERT / CPM 排程', en: 'PERT / CPM' },
    purpose: {
      zh: '把目标拆成有依赖的任务，找出关键路径和真实周期',
      en: 'Decompose into dependent tasks, find the critical path and real duration',
    },
    taskTypes: ['planning', 'learning'],
    requiredInputs: [
      { zh: '最终要交付的成果', en: 'The final deliverable' },
      { zh: '截止时间', en: 'The deadline' },
      { zh: '主要任务和它们之间的先后依赖', en: 'Major tasks and their dependencies' },
    ],
    outputs: [{ zh: '期望工期、关键路径、浮动时间', en: 'Expected durations, critical path, and slack' }],
    caution: {
      zh: '工期必须由执行者确认，LLM 只能提出候选任务拆分。',
      en: 'Durations must be confirmed by the people doing the work; the LLM only drafts task breakdowns.',
    },
    depth: 'interactive',
  },
]

export const methodRegistryMap: ReadonlyMap<MethodId, MethodSpec> = new Map(
  methodRegistry.map((spec) => [spec.id, spec]),
)

export function getMethodSpec(id: MethodId): MethodSpec {
  const spec = methodRegistryMap.get(id)
  if (!spec) throw new Error(`Unknown method id: ${id}`)
  return spec
}
