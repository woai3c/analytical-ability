import { Plus, X } from 'lucide-react'

import { computeAbc, computeFmea } from '@clarity/analysis-engine'
import type {
  AbcRun,
  CausalGraphRun,
  DmaicRun,
  FiveWhyRun,
  FmeaRun,
  ForecastRun,
  KjRun,
  MethodId,
  PdsaRun,
  ValueAnalysisRun,
} from '@clarity/domain'

import { MethodGenerateBox } from '@/components/methods/generate-box'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/field'
import { uid } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

interface GuidedPanelProps {
  methodId: MethodId
  run: unknown
  busy: boolean
  onGenerate: (material: string) => void
  onChange: (run: unknown) => void
}

const materialHints: Partial<Record<MethodId, string>> = {
  kj: '把访谈记录、用户评论、笔记等原始材料贴在这里（每条一行效果更好），AI 会帮你归类。',
  'five-why': '可选：描述问题发生时的具体情况，追问链会更贴合事实。',
  abc: '可选：列出要排序的项目清单（如任务、功能、支出项）。',
  fmea: '可选：描述你要检查的方案或计划。',
  dmaic: '可选：描述当前流程的基线数据。',
  pdsa: '可选：描述你想尝试的改动。',
  forecast: '可选：贴入你找到的历史数据或基准率。',
  'value-analysis': '可选：列出要评估的功能或支出项。',
  'causal-graph': '可选：列出你认为可能相关的因素。',
}

/** FMEA / ABC 等"guided"方法的通用面板：LLM 生成结构化草稿，用户表格化编辑，代码做计算。 */
export function GuidedMethodPanel({ methodId, run, busy, onGenerate, onChange }: GuidedPanelProps) {
  const { t } = useI18n()

  if (!run) {
    return (
      <MethodGenerateBox
        busy={busy}
        hasRun={false}
        materialHint={materialHints[methodId] ? t(materialHints[methodId] as string) : undefined}
        onGenerate={onGenerate}
      />
    )
  }

  return (
    <div>
      {methodId === 'five-why' ? <FiveWhyEditor run={run as FiveWhyRun} onChange={onChange} /> : null}
      {methodId === 'kj' ? <KjEditor run={run as KjRun} onChange={onChange} /> : null}
      {methodId === 'abc' ? <AbcEditor run={run as AbcRun} onChange={onChange} /> : null}
      {methodId === 'causal-graph' ? <CausalGraphEditor run={run as CausalGraphRun} onChange={onChange} /> : null}
      {methodId === 'value-analysis' ? <ValueAnalysisEditor run={run as ValueAnalysisRun} onChange={onChange} /> : null}
      {methodId === 'fmea' ? <FmeaEditor run={run as FmeaRun} onChange={onChange} /> : null}
      {methodId === 'dmaic' ? <DmaicEditor run={run as DmaicRun} onChange={onChange} /> : null}
      {methodId === 'pdsa' ? <PdsaEditor run={run as PdsaRun} onChange={onChange} /> : null}
      {methodId === 'forecast' ? <ForecastEditor run={run as ForecastRun} onChange={onChange} /> : null}
      <MethodGenerateBox busy={busy} hasRun onGenerate={onGenerate} />
    </div>
  )
}

// ── 5 Why ────────────────────────────────────────────────────────

function FiveWhyEditor({ run, onChange }: { run: FiveWhyRun; onChange: (run: unknown) => void }) {
  const { t } = useI18n()
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{t('问题')}</span>
        <Input value={run.problem} onChange={(event) => onChange({ ...run, problem: event.target.value })} />
      </label>
      {run.chains.map((chain, chainIndex) => (
        <section key={chain.id} className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{t('链条 {{index}}', { index: chainIndex + 1 })}</Badge>
            <Input
              value={chain.startCause}
              className="h-8 text-xs"
              onChange={(event) =>
                onChange({
                  ...run,
                  chains: run.chains.map((item) =>
                    item.id === chain.id ? { ...item, startCause: event.target.value } : item,
                  ),
                })
              }
            />
          </div>
          <ol className="mt-3 space-y-2">
            {chain.whys.map((why, whyIndex) => (
              <li key={whyIndex} className="flex items-center gap-2 border-l-2 border-border pl-3">
                <span className="text-[11px] text-muted-foreground">
                  {t('为什么 {{index}}', { index: whyIndex + 1 })}
                </span>
                <Input
                  value={why}
                  className="h-8 text-xs"
                  onChange={(event) =>
                    onChange({
                      ...run,
                      chains: run.chains.map((item) =>
                        item.id === chain.id
                          ? {
                              ...item,
                              whys: item.whys.map((entry, i) => (i === whyIndex ? event.target.value : entry)),
                            }
                          : item,
                      ),
                    })
                  }
                />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

// ── KJ / 亲和图 ───────────────────────────────────────────────────

function KjEditor({ run, onChange }: { run: KjRun; onChange: (run: unknown) => void }) {
  const { t } = useI18n()
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{t('主题组：')}</span>
        {run.groups.map((group) => (
          <span key={group.id} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1">
            <Input
              value={group.name}
              className="h-6 w-28 border-none bg-transparent p-0 text-xs font-medium"
              onChange={(event) =>
                onChange({
                  ...run,
                  groups: run.groups.map((item) =>
                    item.id === group.id ? { ...item, name: event.target.value } : item,
                  ),
                })
              }
            />
          </span>
        ))}
        <Button
          size="sm"
          variant="outline"
          onClick={() => onChange({ ...run, groups: [...run.groups, { id: uid('grp'), name: t('新主题') }] })}
        >
          <Plus className="size-3.5" />
          {t('加主题组')}
        </Button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {run.cards.map((card) => (
          <div key={card.id} className="rounded-md border border-border bg-background p-2.5">
            <Textarea
              value={card.text}
              className="min-h-14 text-xs"
              onChange={(event) =>
                onChange({
                  ...run,
                  cards: run.cards.map((item) => (item.id === card.id ? { ...item, text: event.target.value } : item)),
                })
              }
            />
            <select
              value={card.groupId ?? ''}
              className="mt-1.5 h-7 w-full rounded border border-input bg-background px-1 text-[11px]"
              onChange={(event) =>
                onChange({
                  ...run,
                  cards: run.cards.map((item) =>
                    item.id === card.id ? { ...item, groupId: event.target.value || null } : item,
                  ),
                })
              }
            >
              <option value="">{t('未分类')}</option>
              {run.groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ABC / Pareto ─────────────────────────────────────────────────

function AbcEditor({ run, onChange }: { run: AbcRun; onChange: (run: unknown) => void }) {
  const { t } = useI18n()
  const rows = computeAbc(run)
  const klassVariant = { A: 'default', B: 'secondary', C: 'outline' } as const
  return (
    <div>
      <label className="mb-3 block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">{t('价值口径（按什么排序）')}</span>
        <Input value={run.valueLabel} onChange={(event) => onChange({ ...run, valueLabel: event.target.value })} />
      </label>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 rounded-md border border-border bg-background p-2.5">
            <Badge variant={klassVariant[row.klass]}>{row.klass}</Badge>
            <Input
              value={row.name}
              className="h-8 flex-1 text-xs"
              onChange={(event) =>
                onChange({
                  ...run,
                  items: run.items.map((item) => (item.id === row.id ? { ...item, name: event.target.value } : item)),
                })
              }
            />
            <input
              type="number"
              min={0}
              value={row.value}
              className="h-8 w-24 rounded border border-input bg-background px-1.5 text-xs"
              onChange={(event) =>
                onChange({
                  ...run,
                  items: run.items.map((item) =>
                    item.id === row.id ? { ...item, value: Math.max(0, Number(event.target.value) || 0) } : item,
                  ),
                })
              }
            />
            <div className="hidden w-32 sm:block">
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(row.pct, 100)}%` }} />
              </div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                {row.pct}% · {t('累计 {{pct}}%', { pct: row.cumulativePct })}
              </div>
            </div>
            <button
              type="button"
              className="text-muted-foreground/60 hover:text-destructive"
              onClick={() => onChange({ ...run, items: run.items.filter((item) => item.id !== row.id) })}
              aria-label={t('删除条目')}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={() => onChange({ ...run, items: [...run.items, { id: uid('item'), name: '', value: 0 }] })}
      >
        <Plus className="size-3.5" />
        {t('加项目')}
      </Button>
    </div>
  )
}

// ── 基础因果图 ────────────────────────────────────────────────────

const nodeKindLabels = { factor: '影响因素', outcome: '结果', confounder: '混杂因素' } as const

function CausalGraphEditor({ run, onChange }: { run: CausalGraphRun; onChange: (run: unknown) => void }) {
  const { t } = useI18n()
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-xs font-medium text-muted-foreground">{t('变量')}</div>
        <div className="flex flex-wrap gap-2">
          {run.nodes.map((node) => (
            <span
              key={node.id}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1"
            >
              <Badge variant={node.kind === 'outcome' ? 'default' : node.kind === 'confounder' ? 'warning' : 'outline'}>
                {t(nodeKindLabels[node.kind])}
              </Badge>
              <Input
                value={node.label}
                className="h-6 w-28 border-none bg-transparent p-0 text-xs"
                onChange={(event) =>
                  onChange({
                    ...run,
                    nodes: run.nodes.map((item) =>
                      item.id === node.id ? { ...item, label: event.target.value } : item,
                    ),
                  })
                }
              />
            </span>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 text-xs font-medium text-muted-foreground">{t('关系（方向 = 前者影响后者）')}</div>
        <div className="space-y-2">
          {run.edges.map((edge, index) => (
            <div
              key={index}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2.5 text-xs"
            >
              <select
                value={edge.from}
                className="h-7 rounded border border-input bg-background px-1"
                onChange={(event) =>
                  onChange({
                    ...run,
                    edges: run.edges.map((item, i) => (i === index ? { ...item, from: event.target.value } : item)),
                  })
                }
              >
                {run.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
              <span className="text-muted-foreground">{'->'}</span>
              <select
                value={edge.to}
                className="h-7 rounded border border-input bg-background px-1"
                onChange={(event) =>
                  onChange({
                    ...run,
                    edges: run.edges.map((item, i) => (i === index ? { ...item, to: event.target.value } : item)),
                  })
                }
              >
                {run.nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.label}
                  </option>
                ))}
              </select>
              <select
                value={edge.relation}
                className="h-7 rounded border border-input bg-background px-1"
                onChange={(event) =>
                  onChange({
                    ...run,
                    edges: run.edges.map((item, i) =>
                      i === index
                        ? { ...item, relation: event.target.value as CausalGraphRun['edges'][number]['relation'] }
                        : item,
                    ),
                  })
                }
              >
                <option value="candidate">{t('仅假设')}</option>
                <option value="evidence-backed">{t('有证据')}</option>
              </select>
              <Input
                value={edge.note}
                placeholder={t('依据')}
                className="h-7 min-w-32 flex-1 text-xs"
                onChange={(event) =>
                  onChange({
                    ...run,
                    edges: run.edges.map((item, i) => (i === index ? { ...item, note: event.target.value } : item)),
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 价值分析 ─────────────────────────────────────────────────────

const necessityLabels = { essential: '必需', 'nice-to-have': '锦上添花', waste: '可削减' } as const

function ValueAnalysisEditor({ run, onChange }: { run: ValueAnalysisRun; onChange: (run: unknown) => void }) {
  const { t } = useI18n()
  return (
    <div className="space-y-3">
      {run.functions.map((fn) => (
        <section key={fn.id} className="rounded-lg border border-border bg-background p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={fn.name}
              className="h-8 min-w-40 flex-1 text-sm font-medium"
              onChange={(event) =>
                onChange({
                  ...run,
                  functions: run.functions.map((item) =>
                    item.id === fn.id ? { ...item, name: event.target.value } : item,
                  ),
                })
              }
            />
            <select
              value={fn.necessity}
              className="h-8 rounded border border-input bg-background px-1.5 text-xs"
              onChange={(event) =>
                onChange({
                  ...run,
                  functions: run.functions.map((item) =>
                    item.id === fn.id
                      ? { ...item, necessity: event.target.value as ValueAnalysisRun['functions'][number]['necessity'] }
                      : item,
                  ),
                })
              }
            >
              {Object.entries(necessityLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {t(label)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {(
              [
                ['cost', '成本'],
                ['worth', '价值判断'],
                ['alternative', '更省的替代'],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="block">
                <span className="mb-1 block text-[11px] text-muted-foreground">{t(label)}</span>
                <Input
                  value={fn[field]}
                  className="h-8 text-xs"
                  onChange={(event) =>
                    onChange({
                      ...run,
                      functions: run.functions.map((item) =>
                        item.id === fn.id ? { ...item, [field]: event.target.value } : item,
                      ),
                    })
                  }
                />
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

// ── FMEA ─────────────────────────────────────────────────────────

function FmeaEditor({ run, onChange }: { run: FmeaRun; onChange: (run: unknown) => void }) {
  const { t } = useI18n()
  const rows = computeFmea(run)
  const updateItem = (id: string, patch: Partial<FmeaRun['items'][number]>) =>
    onChange({ ...run, items: run.items.map((item) => (item.id === id ? { ...item, ...patch } : item)) })
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {t('严重度 / 发生度 / 可探测度均为 1-10，RPN = 三者乘积，由代码计算排序。')}
      </p>
      {rows.map((row) => (
        <section key={row.id} className="rounded-lg border border-border bg-background p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={row.rpn >= 200 ? 'warning' : 'outline'}>RPN {row.rpn}</Badge>
            <Input
              value={row.failureMode}
              placeholder={t('失效模式：可能怎样失败')}
              className="h-8 min-w-48 flex-1 text-xs"
              onChange={(event) => updateItem(row.id, { failureMode: event.target.value })}
            />
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Input
              value={row.effect}
              placeholder={t('影响')}
              className="h-8 text-xs"
              onChange={(event) => updateItem(row.id, { effect: event.target.value })}
            />
            <Input
              value={row.mitigation}
              placeholder={t('缓解措施')}
              className="h-8 text-xs"
              onChange={(event) => updateItem(row.id, { mitigation: event.target.value })}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
            {(
              [
                ['severity', '严重度'],
                ['occurrence', '发生度'],
                ['detection', '可探测度'],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="flex items-center gap-1">
                {t(label)}
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={row[field]}
                  className="h-7 w-14 rounded border border-input bg-background px-1.5"
                  onChange={(event) =>
                    updateItem(row.id, { [field]: Math.max(1, Math.min(10, Number(event.target.value) || 1)) })
                  }
                />
              </label>
            ))}
          </div>
        </section>
      ))}
      <Button
        size="sm"
        variant="outline"
        onClick={() =>
          onChange({
            ...run,
            items: [
              ...run.items,
              {
                id: uid('risk'),
                failureMode: '',
                effect: '',
                severity: 5,
                occurrence: 5,
                detection: 5,
                mitigation: '',
              },
            ],
          })
        }
      >
        <Plus className="size-3.5" />
        {t('加失效模式')}
      </Button>
    </div>
  )
}

// ── DMAIC ────────────────────────────────────────────────────────

const dmaicSections = [
  ['define', 'Define · 定义'],
  ['measure', 'Measure · 测量'],
  ['analyze', 'Analyze · 分析'],
  ['improve', 'Improve · 改进'],
  ['control', 'Control · 控制'],
] as const

function DmaicEditor({ run, onChange }: { run: DmaicRun; onChange: (run: unknown) => void }) {
  return (
    <div className="space-y-4">
      {dmaicSections.map(([field, label]) => (
        <label key={field} className="block">
          <span className="mb-1 block text-xs font-medium">{label}</span>
          <Textarea
            value={run[field]}
            className="min-h-20 text-sm"
            onChange={(event) => onChange({ ...run, [field]: event.target.value })}
          />
        </label>
      ))}
    </div>
  )
}

// ── PDSA ─────────────────────────────────────────────────────────

const pdsaFields = [
  ['prediction', '预测（改动后预期发生什么）'],
  ['scope', '试验范围（小而可停止）'],
  ['stopRule', '停止条件'],
  ['nextCycle', '下一轮怎么安排'],
] as const

function PdsaEditor({ run, onChange }: { run: PdsaRun; onChange: (run: unknown) => void }) {
  const { t } = useI18n()
  return (
    <div className="space-y-4">
      {pdsaFields.map(([field, label]) => (
        <label key={field} className="block">
          <span className="mb-1 block text-xs font-medium">{t(label)}</span>
          <Textarea
            value={run[field]}
            className="min-h-16 text-sm"
            onChange={(event) => onChange({ ...run, [field]: event.target.value })}
          />
        </label>
      ))}
      <div>
        <span className="mb-1 block text-xs font-medium">{t('观察指标')}</span>
        <div className="flex flex-wrap gap-2">
          {run.metrics.map((metric, index) => (
            <Input
              key={index}
              value={metric}
              className="h-8 w-48 text-xs"
              onChange={(event) =>
                onChange({ ...run, metrics: run.metrics.map((item, i) => (i === index ? event.target.value : item)) })
              }
            />
          ))}
          <Button size="sm" variant="outline" onClick={() => onChange({ ...run, metrics: [...run.metrics, ''] })}>
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── 概率预测 ─────────────────────────────────────────────────────

function ForecastEditor({ run, onChange }: { run: ForecastRun; onChange: (run: unknown) => void }) {
  const { t } = useI18n()
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-medium">{t('预测陈述（可验证）')}</span>
        <Textarea
          value={run.statement}
          className="min-h-16 text-sm"
          onChange={(event) => onChange({ ...run, statement: event.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">{t('基准率（类似情况通常怎样；不知道就写缺失）')}</span>
        <Textarea
          value={run.baseRate}
          className="min-h-16 text-sm"
          onChange={(event) => onChange({ ...run, baseRate: event.target.value })}
        />
      </label>
      <div>
        <span className="mb-2 block text-xs font-medium">{t('情景')}</span>
        <div className="space-y-2">
          {run.scenarios.map((scenario) => (
            <div
              key={scenario.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-background p-2.5"
            >
              <Input
                value={scenario.name}
                className="h-8 min-w-32 flex-1 text-xs"
                onChange={(event) =>
                  onChange({
                    ...run,
                    scenarios: run.scenarios.map((item) =>
                      item.id === scenario.id ? { ...item, name: event.target.value } : item,
                    ),
                  })
                }
              />
              <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={scenario.probability}
                  className="h-8 w-16 rounded border border-input bg-background px-1.5"
                  onChange={(event) =>
                    onChange({
                      ...run,
                      scenarios: run.scenarios.map((item) =>
                        item.id === scenario.id
                          ? { ...item, probability: Math.max(0, Math.min(100, Number(event.target.value) || 0)) }
                          : item,
                      ),
                    })
                  }
                />
                %
              </label>
              <Input
                value={scenario.rationale}
                placeholder={t('依据')}
                className="h-8 min-w-40 flex-1 text-xs"
                onChange={(event) =>
                  onChange({
                    ...run,
                    scenarios: run.scenarios.map((item) =>
                      item.id === scenario.id ? { ...item, rationale: event.target.value } : item,
                    ),
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">{t('综合概率（%）')}</span>
          <input
            type="number"
            min={0}
            max={100}
            value={run.probability}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            onChange={(event) =>
              onChange({ ...run, probability: Math.max(0, Math.min(100, Number(event.target.value) || 0)) })
            }
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">{t('验证时间')}</span>
          <Input value={run.resolveBy} onChange={(event) => onChange({ ...run, resolveBy: event.target.value })} />
        </label>
      </div>
    </div>
  )
}
