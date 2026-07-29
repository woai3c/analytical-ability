import type { MethodId, TaskType } from '../domain-constants'
import type { LocalizedText } from '../localized-text'

export interface MethodCatalogEntry {
  id: MethodId
  name: LocalizedText
  purpose: LocalizedText
  taskTypes: TaskType[]
  depth: 'interactive' | 'guided'
}

export const methodCatalog: readonly MethodCatalogEntry[] = [
  {
    id: 'fishbone',
    name: { zh: '鱼骨分析', en: 'Fishbone diagram' },
    purpose: { zh: '把问题按类别展开成候选原因树', en: 'Expand a problem into a tree of candidate causes by category' },
    taskTypes: ['diagnosis'],
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
    depth: 'interactive',
  },
]

const methodCatalogMap: ReadonlyMap<MethodId, MethodCatalogEntry> = new Map(
  methodCatalog.map((entry) => [entry.id, entry]),
)

export function findMethodCatalogEntry(id: string): MethodCatalogEntry | undefined {
  return methodCatalogMap.get(id as MethodId)
}

export function getMethodCatalogEntry(id: MethodId): MethodCatalogEntry {
  const entry = findMethodCatalogEntry(id)
  if (!entry) throw new Error(`Unknown method id: ${id}`)
  return entry
}
