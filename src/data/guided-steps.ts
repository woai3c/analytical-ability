import type { GuidedStepNumber } from './domain'
import type { LocalizedText } from './localized-text'

export const guidedStepLabels: Record<GuidedStepNumber, LocalizedText> = {
  1: { zh: '选择方法', en: 'Select Method' },
  2: { zh: '分析与结论', en: 'Analyze & Conclude' },
  3: { zh: '综合评审', en: 'Review' },
}
