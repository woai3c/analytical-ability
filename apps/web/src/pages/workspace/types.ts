import type { ActionRoute, AnalysisPlan, Answers, IntakeResult, MethodRuns, TaskType } from '@clarity/domain'

export interface WizardState {
  step: number
  rawGoal: string
  taskTypeOverride: TaskType | null
  intake: IntakeResult | null
  answers: Answers
  plan: AnalysisPlan | null
  methodRuns: MethodRuns
  route: ActionRoute | null
  doneStepIds: string[]
  /** 当前草稿关联的已保存项目 id；未保存过为 null。 */
  projectId: string | null
}

export const emptyWizardState: WizardState = {
  step: 1,
  rawGoal: '',
  taskTypeOverride: null,
  intake: null,
  answers: {},
  plan: null,
  methodRuns: {},
  route: null,
  doneStepIds: [],
  projectId: null,
}

export const wizardSteps = [
  { id: 1, label: '描述目标' },
  { id: 2, label: '补齐条件' },
  { id: 3, label: '分析计划' },
  { id: 4, label: '分析执行' },
  { id: 5, label: '行动路线' },
] as const

const draftKey = 'analysis-wizard-draft-v2'

export function loadWizardDraft(): WizardState {
  try {
    const raw = localStorage.getItem(draftKey)
    if (!raw) return emptyWizardState
    const parsed = JSON.parse(raw) as Partial<WizardState>
    if (typeof parsed.rawGoal !== 'string') return emptyWizardState
    return {
      ...emptyWizardState,
      ...parsed,
      step: typeof parsed.step === 'number' && parsed.step >= 1 && parsed.step <= 5 ? parsed.step : 1,
    }
  } catch {
    return emptyWizardState
  }
}

export function saveWizardDraft(state: WizardState) {
  if (!state.rawGoal.trim()) {
    localStorage.removeItem(draftKey)
    return
  }
  localStorage.setItem(draftKey, JSON.stringify(state))
}

export function clearWizardDraft() {
  localStorage.removeItem(draftKey)
}
