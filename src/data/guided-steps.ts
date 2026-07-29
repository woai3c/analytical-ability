import type { GuidedStepNumber } from './domain'
import type { LocalizedText } from './localized-text'

export const guidedStepLabels: Record<GuidedStepNumber, LocalizedText> = {
  1: { zh: '定义问题', en: 'Define Problem' },
  2: { zh: '选择方法', en: 'Select Method' },
  3: { zh: '运用方法', en: 'Apply Method' },
  4: { zh: '得出结论', en: 'Draw Conclusion' },
  5: { zh: '反思回顾', en: 'Reflect' },
}

export const progressStepLabels: Record<GuidedStepNumber, LocalizedText> = {
  ...guidedStepLabels,
  5: { zh: '综合评审', en: 'Final Review' },
}
