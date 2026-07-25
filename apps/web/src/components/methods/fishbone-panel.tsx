import { AlertTriangle, Plus, X } from 'lucide-react'

import type { FishboneRun } from '@clarity/domain'

import { MethodGenerateBox } from '@/components/methods/generate-box'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/field'
import { uid } from '@/lib/utils'
import { useI18n } from '@/providers/i18n-provider'

export function FishbonePanel({
  run,
  busy,
  onGenerate,
  onChange,
}: {
  run: FishboneRun | undefined
  busy: boolean
  onGenerate: (material: string) => void
  onChange: (run: FishboneRun) => void
}) {
  const { t } = useI18n()

  if (!run) {
    return (
      <MethodGenerateBox
        busy={busy}
        hasRun={false}
        materialHint={t('可选：贴入与问题相关的日志、访谈记录或数据摘要，候选原因会更贴近实际。')}
        onGenerate={onGenerate}
      />
    )
  }

  const update = (next: FishboneRun) => onChange(next)

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-md border border-[color-mix(in_oklch,var(--warning)_38%,var(--border))] bg-[color-mix(in_oklch,var(--warning)_8%,transparent)] p-3 text-xs leading-5 text-muted-foreground">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--warning)]" />
        {t('下面所有原因都是候选假设，需要证据验证后才能当成结论。可以直接修改、增删。')}
      </div>

      <label className="mb-1 block text-xs font-medium text-muted-foreground">{t('要解释的问题')}</label>
      <Input value={run.problem} onChange={(event) => update({ ...run, problem: event.target.value })} />

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {run.categories.map((category, categoryIndex) => (
          <section key={category.id} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-center gap-2">
              <Input
                value={category.name}
                className="h-8 font-medium"
                onChange={(event) =>
                  update({
                    ...run,
                    categories: run.categories.map((item, index) =>
                      index === categoryIndex ? { ...item, name: event.target.value } : item,
                    ),
                  })
                }
              />
              <button
                type="button"
                className="text-muted-foreground/60 hover:text-destructive"
                onClick={() => update({ ...run, categories: run.categories.filter((item) => item.id !== category.id) })}
                aria-label={t('删除类别')}
              >
                <X className="size-4" />
              </button>
            </div>

            <ul className="mt-3 space-y-2">
              {category.causes.map((cause) => (
                <li key={cause.id} className="rounded-md bg-muted p-2.5">
                  <div className="flex items-start gap-2">
                    <Input
                      value={cause.text}
                      className="h-8 bg-background text-xs"
                      onChange={(event) =>
                        update({
                          ...run,
                          categories: run.categories.map((item) =>
                            item.id === category.id
                              ? {
                                  ...item,
                                  causes: item.causes.map((entry) =>
                                    entry.id === cause.id ? { ...entry, text: event.target.value } : entry,
                                  ),
                                }
                              : item,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      className="mt-1.5 text-muted-foreground/60 hover:text-destructive"
                      onClick={() =>
                        update({
                          ...run,
                          categories: run.categories.map((item) =>
                            item.id === category.id
                              ? { ...item, causes: item.causes.filter((entry) => entry.id !== cause.id) }
                              : item,
                          ),
                        })
                      }
                      aria-label={t('删除原因')}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  {cause.subCauses.map((subCause, subIndex) => (
                    <div key={subIndex} className="mt-1.5 flex items-center gap-2 border-l-2 border-border pl-3">
                      <Input
                        value={subCause}
                        className="h-7 bg-background text-xs"
                        onChange={(event) =>
                          update({
                            ...run,
                            categories: run.categories.map((item) =>
                              item.id === category.id
                                ? {
                                    ...item,
                                    causes: item.causes.map((entry) =>
                                      entry.id === cause.id
                                        ? {
                                            ...entry,
                                            subCauses: entry.subCauses.map((sub, i) =>
                                              i === subIndex ? event.target.value : sub,
                                            ),
                                          }
                                        : entry,
                                    ),
                                  }
                                : item,
                            ),
                          })
                        }
                      />
                    </div>
                  ))}
                </li>
              ))}
            </ul>

            <Button
              size="sm"
              variant="ghost"
              className="mt-3"
              onClick={() =>
                update({
                  ...run,
                  categories: run.categories.map((item) =>
                    item.id === category.id
                      ? { ...item, causes: [...item.causes, { id: uid('cause'), text: '', subCauses: [] }] }
                      : item,
                  ),
                })
              }
            >
              <Plus className="size-3.5" />
              {t('加一条候选原因')}
            </Button>
          </section>
        ))}
      </div>

      <Button
        size="sm"
        variant="outline"
        className="mt-4"
        onClick={() =>
          update({
            ...run,
            categories: [...run.categories, { id: uid('cat'), name: t('新类别'), causes: [] }],
          })
        }
      >
        <Plus className="size-3.5" />
        {t('加一个类别')}
      </Button>

      <MethodGenerateBox busy={busy} hasRun onGenerate={onGenerate} />
    </div>
  )
}
