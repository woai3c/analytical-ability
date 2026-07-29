import type { GuidedSession } from '@/data/domain'
import type { PracticeRecord } from '@/data/practice-record'
import { RECORDS_KEY } from '@/lib/settings'

export function loadPracticeRecords(): PracticeRecord[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECORDS_KEY) ?? '[]')
    return Array.isArray(parsed) ? (parsed as PracticeRecord[]) : []
  } catch {
    return []
  }
}

export function replacePracticeRecords(records: PracticeRecord[]) {
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export function clearPracticeRecords() {
  localStorage.removeItem(RECORDS_KEY)
}

export function countPracticedMethods(records = loadPracticeRecords()): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const record of records) {
    for (const methodId of record.selectedMethods ?? []) {
      counts[methodId] = (counts[methodId] ?? 0) + 1
    }
  }
  return counts
}

function createGuidedPracticeRecord(session: GuidedSession): PracticeRecord {
  return {
    scenarioId: session.scenario.id,
    scenarioTitle: session.scenario.title,
    scenarioDescription: session.scenario.description,
    scenarioContext: session.scenario.context,
    applicableMethods: session.scenario.applicableMethods,
    taskType: session.scenario.taskType,
    selectedMethods: session.steps.methodSelection?.selectedMethods ?? [],
    correct: session.steps.reflection ? session.steps.reflection.score >= 60 : false,
    score: session.steps.reflection?.score ?? 0,
    feedback: session.steps.reflection?.aiFeedback ?? '',
    improvementTip: session.steps.reflection?.tips[0] ?? '',
    methodExplanations: [],
    completedAt: session.completedAt ?? new Date().toISOString(),
    guided: true,
    problemDefinition: session.steps.problemDefinition?.userAnswer,
    methodApplication: session.steps.methodApplication?.userWork,
    conclusion: session.steps.conclusion?.userAnswer,
    dimensions: session.steps.reflection?.dimensions,
    steps: session.steps,
  }
}

export function saveGuidedPracticeRecord(session: GuidedSession) {
  try {
    const records = loadPracticeRecords()
    records.push(createGuidedPracticeRecord(session))
    replacePracticeRecords(records)
  } catch {
    /* Storage quota errors should not interrupt session completion. */
  }
}
