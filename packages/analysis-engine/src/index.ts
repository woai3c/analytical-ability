export { methodRegistry, methodRegistryMap, getMethodSpec } from './methods/registry.js'
export type { MethodSpec, LocalizedText } from './methods/registry.js'
export { routeMethods } from './methods/router.js'
export type { MethodRoute } from './methods/router.js'

export const taskTypeLabels: Record<import('@clarity/domain').TaskType, string> = {
  diagnosis: '诊断问题',
  improvement: '改进现状',
  selection: '比较选择',
  planning: '制定计划',
  prediction: '判断趋势',
  exploration: '探索方向',
  learning: '学习成长',
}

export const taskTypeLabelsEn: Record<import('@clarity/domain').TaskType, string> = {
  diagnosis: 'Diagnose a problem',
  improvement: 'Improve a situation',
  selection: 'Compare and choose',
  planning: 'Make a plan',
  prediction: 'Assess a trend',
  exploration: 'Explore directions',
  learning: 'Learn and grow',
}
