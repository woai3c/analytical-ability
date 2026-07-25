import { useMemo, useState } from 'react'
import { Link } from 'react-router'

import { ArrowRight, Clock, FolderOpen, Sparkles, Trash2 } from 'lucide-react'

import type { Project } from '@clarity/domain'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/field'
import { deleteProject, listProjects } from '@/lib/projects'
import { useI18n } from '@/providers/i18n-provider'

const exampleGoalsZh = [
  '我想在六个月内转向 AI 产品经理岗位，但不知道需要补哪些能力、该从哪一步开始。',
  '我们产品的续费率连续三个月下滑，我想弄清楚到底是什么原因导致的。',
  '公司要在三套客服系统中选一套给 20 人团队用，预算第一年不超过 8 万元。',
]

const exampleGoalsEn = [
  'I want to move into an AI product manager role within six months, but I do not know which skills to build or where to start.',
  'Our renewal rate has declined for three months in a row and I want to find out why.',
  'We need to pick one of three customer support systems for a 20-person team, with a first-year budget under 80k CNY.',
]

export function StepGoal({
  rawGoal,
  onRawGoalChange,
  busy,
  error,
  onAnalyze,
  onOpenProject,
  onProjectsChanged,
  listVersion,
}: {
  rawGoal: string
  onRawGoalChange: (value: string) => void
  busy: boolean
  error: string
  onAnalyze: () => void
  onOpenProject: (project: Project) => void
  onProjectsChanged: () => void
  listVersion: number
}) {
  const { language, t } = useI18n()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- listVersion 是父组件传入的刷新信号
  const projects = useMemo(() => listProjects(), [listVersion])
  const examples = language === 'en' ? exampleGoalsEn : exampleGoalsZh

  return (
    <div className="space-y-6">
      {projects.length ? (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">{t('已保存的执行项目')}</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="group">
                <CardContent className="p-4">
                  <button type="button" className="block w-full text-left" onClick={() => onOpenProject(project)}>
                    <div className="line-clamp-2 text-sm font-medium leading-6">{project.name}</div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(project.updatedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN')}
                      </span>
                      <span>{t('第 {{step}} 步', { step: project.step })}</span>
                    </div>
                  </button>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                    <Button size="sm" variant="ghost" onClick={() => onOpenProject(project)}>
                      <FolderOpen className="size-3.5" />
                      {t('继续')}
                    </Button>
                    {confirmDeleteId === project.id ? (
                      <span className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          className="text-destructive underline"
                          onClick={() => {
                            deleteProject(project.id)
                            setConfirmDeleteId(null)
                            onProjectsChanged()
                          }}
                        >
                          {t('确认删除')}
                        </button>
                        <button
                          type="button"
                          className="text-muted-foreground"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          {t('取消')}
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="text-muted-foreground/60 transition hover:text-destructive"
                        onClick={() => setConfirmDeleteId(project.id)}
                        aria-label={t('删除项目')}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <Card className="overflow-hidden">
        <CardContent className="p-6 sm:p-10">
          <div className="mb-5 text-eyebrow font-medium uppercase text-muted-foreground">{t('新建分析')}</div>
          <h2 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-[34px]">
            {t('你现在最想完成的目标是什么？')}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {t(
              '用自己的话描述就行。AI 会立即分析你的目标，判断该用哪些分析方法，并告诉你为了开始分析还需要补充什么——而不是甩给你一张看不懂的固定表单。',
            )}
          </p>
          <Textarea
            className="mt-7 min-h-36 bg-background text-base leading-7 sm:text-lg"
            value={rawGoal}
            onChange={(event) => onRawGoalChange(event.target.value)}
            placeholder={t(
              '例如：我想在六个月内转向 AI 产品经理，但不知道需要补哪些能力、收集什么岗位数据，也不知道该从哪一步开始。',
            )}
            autoFocus
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="self-center text-xs text-muted-foreground">{t('试试这些目标：')}</span>
            {examples.map((example) => (
              <Button key={example} type="button" variant="outline" size="sm" onClick={() => onRawGoalChange(example)}>
                {example.slice(0, language === 'en' ? 28 : 14)}…
              </Button>
            ))}
          </div>

          {error ? (
            <div className="mt-5 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm leading-6">
              <p className="text-destructive">{error}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('检查网络和后端配置后可以重试；也可以先')}{' '}
                <Link to="/manual" className="underline">
                  {t('使用离线规则模式（不调用 AI）')}
                </Link>
                。
              </p>
            </div>
          ) : null}

          <div className="mt-8 flex justify-end">
            <Button size="lg" disabled={rawGoal.trim().length < 4 || busy} onClick={onAnalyze}>
              <Sparkles className="size-4" />
              {t(busy ? 'AI 正在分析你的目标…' : '开始分析')}
              {!busy ? <ArrowRight className="size-4" /> : null}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
