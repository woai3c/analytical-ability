import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { BookOpen, X } from 'lucide-react'

import { MethodAnimation } from '@/components/method-animations/method-animation'
import type { MethodId } from '@/data/domain'
import { findMethodSpec, getMethodSpec, taskTypeLabels, taskTypeLabelsEn } from '@/data/methods'
import { cn } from '@/lib/utils'
import type { Translate } from '@/providers/i18n-provider'

function RichText({ text }: { text: string }) {
  const blocks = text.split('\n\n')
  const elements: ReactNode[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!.trim()
    if (!block) continue

    const lines = block.split('\n')
    const isBulletList = lines.every((line) => /^[·\-]\s/.test(line))
    const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line))

    if (isBulletList) {
      elements.push(
        <ul key={i} className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {lines.map((line, j) => (
            <li key={j} className="flex gap-2 leading-relaxed">
              <span className="shrink-0 text-muted-foreground/60">·</span>
              <span>{line.replace(/^[·\-]\s*/, '')}</span>
            </li>
          ))}
        </ul>,
      )
    } else if (isNumberedList) {
      elements.push(
        <ol key={i} className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          {lines.map((line, j) => {
            const match = line.match(/^(\d+)\.\s(.*)/)
            return (
              <li key={j} className="flex gap-2 leading-relaxed">
                <span className="shrink-0 text-muted-foreground/60">{match?.[1]}.</span>
                <span>{match?.[2]}</span>
              </li>
            )
          })}
        </ol>,
      )
    } else {
      elements.push(
        <p key={i} className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {block}
        </p>,
      )
    }
  }

  return <>{elements}</>
}

export function MethodSummary({
  methodId,
  en,
  t,
  headingLevel = 'h1',
}: {
  methodId: MethodId
  en: boolean
  t: Translate
  headingLevel?: 'h1' | 'h3'
}) {
  const spec = getMethodSpec(methodId)
  const labels = en ? taskTypeLabelsEn : taskTypeLabels
  const Heading = headingLevel

  return (
    <>
      <Heading className="text-xl font-semibold">{en ? spec.name.en : spec.name.zh}</Heading>
      <p className="mt-1.5 text-sm text-muted-foreground">{en ? spec.purpose.en : spec.purpose.zh}</p>
      <div className="mt-2 text-xs text-muted-foreground">
        {spec.taskTypes.map((type) => labels[type]).join(' · ')}
        {' · '}
        {spec.depth === 'interactive' ? t('交互式') : t('引导式')}
      </div>
    </>
  )
}

export function MethodDetailsContent({
  methodId,
  en,
  t,
  headingLevel = 'h2',
}: {
  methodId: MethodId
  en: boolean
  t: Translate
  headingLevel?: 'h2' | 'h4'
}) {
  const spec = getMethodSpec(methodId)
  const Heading = headingLevel

  return (
    <>
      <section className="mt-8 border-t border-border pt-6">
        <Heading className="text-sm font-medium">{t('方法介绍')}</Heading>
        <RichText text={en ? spec.introduction.en : spec.introduction.zh} />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <Heading className="text-sm font-medium">{t('什么时候用')}</Heading>
        <RichText text={en ? spec.whenToUse.en : spec.whenToUse.zh} />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <Heading className="text-sm font-medium">{t('什么时候不用')}</Heading>
        <RichText text={en ? spec.whenNotToUse.en : spec.whenNotToUse.zh} />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <Heading className="text-sm font-medium">{t('和其他方法的区别')}</Heading>
        <RichText text={en ? spec.vsOtherMethods.en : spec.vsOtherMethods.zh} />
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <Heading className="text-sm font-medium">{t('操作步骤')}</Heading>
        <ol className="mt-3 space-y-2 text-sm">
          {spec.steps.map((step, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed">
              <span className="mt-px shrink-0 text-muted-foreground">{i + 1}.</span>
              <span className="text-muted-foreground">{en ? step.en : step.zh}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Heading className="text-sm font-medium">{t('你需要准备')}</Heading>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {spec.requiredInputs.map((input, i) => (
                <li key={i}>· {en ? input.en : input.zh}</li>
              ))}
            </ul>
          </div>
          <div>
            <Heading className="text-sm font-medium">{t('你会得到')}</Heading>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {spec.outputs.map((output, i) => (
                <li key={i}>· {en ? output.en : output.zh}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <Heading className="text-sm font-medium">{t('完整示例')}</Heading>
        <div className="mt-3 rounded-lg border border-border bg-secondary px-4 py-3">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {en ? spec.exampleWalkthrough.en : spec.exampleWalkthrough.zh}
          </pre>
        </div>
        <p className="mt-5 text-xs text-muted-foreground">{t('点击播放，看这个方法从零到完成的全过程。')}</p>
        <div className="mt-2">
          <MethodAnimation methodId={methodId} />
        </div>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <Heading className="text-sm font-medium">{t('使用边界与常见误区')}</Heading>
        <p className="mt-2 text-sm text-muted-foreground">{en ? spec.caution.en : spec.caution.zh}</p>
      </section>
    </>
  )
}

export function MethodIntroductionButton({
  methodIds,
  en,
  t,
  className,
  children,
}: {
  methodIds: readonly string[]
  en: boolean
  t: Translate
  className?: string
  children?: ReactNode
}) {
  const methods = methodIds.map(findMethodSpec).filter((method) => method !== undefined)
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<MethodId | null>(null)
  const dialogTitleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }

      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open])

  const selectedMethod = methods.find((method) => method.id === selectedId) ?? methods[0]

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={methods.length === 0}
        aria-haspopup="dialog"
        title={methods.length === 0 ? t('请先选择一个方法') : undefined}
        className={cn(
          'inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
          className,
        )}
      >
        <BookOpen className="size-3.5 shrink-0" />
        {children ?? t('方法介绍')}
      </button>

      {open && selectedMethod
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-6"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false)
              }}
            >
              <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={dialogTitleId}
                className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-background shadow-xl"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
                  <h2 id={dialogTitleId} className="text-base font-semibold">
                    {t('方法介绍')}
                  </h2>
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label={t('关闭')}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {methods.length > 1 && (
                  <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-border px-5 py-2" role="tablist">
                    {methods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        role="tab"
                        aria-selected={method.id === selectedMethod.id}
                        onClick={() => {
                          setSelectedId(method.id)
                          bodyRef.current?.scrollTo({ top: 0 })
                        }}
                        className={cn(
                          'shrink-0 rounded-md px-3 py-1.5 text-xs transition-colors',
                          method.id === selectedMethod.id
                            ? 'bg-foreground text-background'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                      >
                        {en ? method.name.en : method.name.zh}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={bodyRef} className="overflow-y-auto px-5 py-5 sm:px-6">
                  <MethodSummary methodId={selectedMethod.id} en={en} t={t} headingLevel="h3" />
                  <MethodDetailsContent methodId={selectedMethod.id} en={en} t={t} headingLevel="h4" />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
