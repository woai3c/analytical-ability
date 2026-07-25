// 方法确定性计算 —— 对应 product.md 16.4："不用 LLM 做加减乘除、累计占比、
// 关键路径和敏感性分析"。所有数值结果都在这里算，LLM 只生成候选内容。
import type { AbcRun, FmeaRun, McdaRun, PertRun } from '@clarity/domain'

// ── MCDA ─────────────────────────────────────────────────────────

export interface McdaResult {
  /** 加权总分（0-10）。 */
  totals: Record<string, number>
  /** 按总分降序的 optionId。 */
  ranking: string[]
  /** 在某准则上低于最低可接受值的（方案, 准则）组合。 */
  belowMinimum: Array<{ optionId: string; criterionId: string }>
  /** 敏感性：把某准则权重提高 10 个百分点（其余等比压缩）后第一名是否易主。 */
  sensitivity: Array<{ criterionId: string; topOptionId: string | null }>
}

export function computeMcda(run: McdaRun): McdaResult {
  const weightSum = run.criteria.reduce((sum, c) => sum + c.weight, 0) || 1
  const normalized = new Map(run.criteria.map((c) => [c.id, c.weight / weightSum]))

  const totalFor = (weights: Map<string, number>, optionId: string) =>
    run.criteria.reduce((sum, c) => sum + (weights.get(c.id) ?? 0) * (run.scores[optionId]?.[c.id] ?? 0), 0)

  const totals: Record<string, number> = {}
  for (const option of run.options) totals[option.id] = round2(totalFor(normalized, option.id))

  const ranking = [...run.options].sort((a, b) => (totals[b.id] ?? 0) - (totals[a.id] ?? 0)).map((o) => o.id)

  const belowMinimum: McdaResult['belowMinimum'] = []
  for (const option of run.options) {
    for (const criterion of run.criteria) {
      const score = run.scores[option.id]?.[criterion.id] ?? 0
      if (score < criterion.minimum) belowMinimum.push({ optionId: option.id, criterionId: criterion.id })
    }
  }

  const sensitivity: McdaResult['sensitivity'] = []
  for (const criterion of run.criteria) {
    // 该准则 +10pp，其余按原比例压缩到合计 100。
    const bumped = new Map<string, number>()
    const othersSum = Math.max(weightSum - criterion.weight, 0)
    for (const c of run.criteria) {
      if (c.id === criterion.id) {
        bumped.set(c.id, c.weight + 10)
      } else {
        bumped.set(c.id, othersSum > 0 ? (c.weight / othersSum) * Math.max(weightSum - criterion.weight - 10, 0) : 0)
      }
    }
    const bumpedSum = [...bumped.values()].reduce((s, v) => s + v, 0) || 1
    for (const [k, v] of bumped) bumped.set(k, v / bumpedSum)

    let top: string | null = null
    let topScore = -Infinity
    for (const option of run.options) {
      const score = totalFor(bumped, option.id)
      if (score > topScore) {
        topScore = score
        top = option.id
      }
    }
    sensitivity.push({ criterionId: criterion.id, topOptionId: top !== ranking[0] ? top : null })
  }

  return { totals, ranking, belowMinimum, sensitivity }
}

// ── PERT / CPM ───────────────────────────────────────────────────

export interface PertTaskResult {
  id: string
  expected: number
  earliestStart: number
  earliestFinish: number
  latestStart: number
  latestFinish: number
  slack: number
  critical: boolean
}

export type PertResult =
  { ok: true; tasks: PertTaskResult[]; criticalPath: string[]; totalDuration: number } | { ok: false; reason: 'cycle' }

export function computePert(run: PertRun): PertResult {
  const expected = new Map(run.tasks.map((t) => [t.id, (t.optimistic + 4 * t.likely + t.pessimistic) / 6]))
  const ids = new Set(run.tasks.map((t) => t.id))
  const deps = new Map(run.tasks.map((t) => [t.id, t.dependencies.filter((d) => ids.has(d) && d !== t.id)]))

  // Kahn 拓扑排序；排不完说明有环。
  const indegree = new Map(run.tasks.map((t) => [t.id, 0]))
  for (const [, list] of deps) for (const d of list) indegree.set(d, indegree.get(d) ?? 0)
  for (const [id, list] of deps) indegree.set(id, list.length)
  const dependents = new Map<string, string[]>()
  for (const [id, list] of deps) {
    for (const d of list) dependents.set(d, [...(dependents.get(d) ?? []), id])
  }
  const queue = run.tasks.filter((t) => (indegree.get(t.id) ?? 0) === 0).map((t) => t.id)
  const order: string[] = []
  while (queue.length) {
    const id = queue.shift() as string
    order.push(id)
    for (const next of dependents.get(id) ?? []) {
      indegree.set(next, (indegree.get(next) ?? 0) - 1)
      if (indegree.get(next) === 0) queue.push(next)
    }
  }
  if (order.length !== run.tasks.length) return { ok: false, reason: 'cycle' }

  // 前推：ES = max(前置 EF)，EF = ES + 期望工期。
  const es = new Map<string, number>()
  const ef = new Map<string, number>()
  for (const id of order) {
    const start = Math.max(0, ...(deps.get(id) ?? []).map((d) => ef.get(d) ?? 0))
    es.set(id, start)
    ef.set(id, start + (expected.get(id) ?? 0))
  }
  const totalDuration = Math.max(0, ...[...ef.values()])

  // 后推：LF = min(后继 LS)，LS = LF - 期望工期。
  const lf = new Map<string, number>()
  const ls = new Map<string, number>()
  for (const id of [...order].reverse()) {
    const successors = dependents.get(id) ?? []
    const finish = successors.length ? Math.min(...successors.map((s) => ls.get(s) ?? totalDuration)) : totalDuration
    lf.set(id, finish)
    ls.set(id, finish - (expected.get(id) ?? 0))
  }

  const tasks: PertTaskResult[] = run.tasks.map((t) => {
    const slack = round2((ls.get(t.id) ?? 0) - (es.get(t.id) ?? 0))
    return {
      id: t.id,
      expected: round2(expected.get(t.id) ?? 0),
      earliestStart: round2(es.get(t.id) ?? 0),
      earliestFinish: round2(ef.get(t.id) ?? 0),
      latestStart: round2(ls.get(t.id) ?? 0),
      latestFinish: round2(lf.get(t.id) ?? 0),
      slack,
      critical: slack <= 0.01,
    }
  })

  const criticalPath = order.filter((id) => tasks.find((t) => t.id === id)?.critical)

  return { ok: true, tasks, criticalPath, totalDuration: round2(totalDuration) }
}

// ── ABC / Pareto ─────────────────────────────────────────────────

export interface AbcItemResult {
  id: string
  name: string
  value: number
  pct: number
  cumulativePct: number
  klass: 'A' | 'B' | 'C'
}

export function computeAbc(run: AbcRun): AbcItemResult[] {
  const total = run.items.reduce((sum, item) => sum + item.value, 0) || 1
  const sorted = [...run.items].sort((a, b) => b.value - a.value)
  let cumulative = 0
  return sorted.map((item) => {
    cumulative += item.value
    const cumulativePct = (cumulative / total) * 100
    const klass = cumulativePct <= 80 ? 'A' : cumulativePct <= 95 ? 'B' : 'C'
    return {
      id: item.id,
      name: item.name,
      value: item.value,
      pct: round2((item.value / total) * 100),
      cumulativePct: round2(cumulativePct),
      klass,
    }
  })
}

// ── FMEA ─────────────────────────────────────────────────────────

export type FmeaItemResult = FmeaRun['items'][number] & { rpn: number }

export function computeFmea(run: FmeaRun): FmeaItemResult[] {
  return run.items
    .map((item) => ({ ...item, rpn: item.severity * item.occurrence * item.detection }))
    .sort((a, b) => b.rpn - a.rpn)
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
