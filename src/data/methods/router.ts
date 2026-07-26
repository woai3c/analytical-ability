// 方法路由 —— 确定性规则，对应 product.md 15.1/15.3。
// LLM 不参与路由决策，只负责解释"为什么推荐这个方法"；用户可以换方法。
import type { MethodId, TaskType } from '../domain'

export interface MethodRoute {
  primary: MethodId[]
  optional: MethodId[]
}

const taskRoutes: Record<TaskType, MethodRoute> = {
  diagnosis: { primary: ['fishbone', 'five-why'], optional: ['causal-graph', 'fmea'] },
  improvement: { primary: ['dmaic', 'pdsa'], optional: ['abc', 'value-analysis'] },
  selection: { primary: ['mcda'], optional: ['value-analysis', 'fmea'] },
  planning: { primary: ['pert'], optional: ['fmea', 'pdsa'] },
  prediction: { primary: ['forecast'], optional: ['causal-graph'] },
  exploration: { primary: ['kj'], optional: ['abc'] },
  learning: { primary: ['pdsa'], optional: ['pert'] },
}

export function routeMethods(taskType: TaskType): MethodRoute {
  return taskRoutes[taskType]
}
