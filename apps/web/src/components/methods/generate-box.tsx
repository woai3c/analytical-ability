import { useState } from 'react'

import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/field'
import { useI18n } from '@/providers/i18n-provider'

/** 方法面板共用的"生成候选内容"区块：未生成时显示材料输入 + 生成按钮；已生成时显示重新生成入口。 */
export function MethodGenerateBox({
  busy,
  hasRun,
  materialHint,
  onGenerate,
}: {
  busy: boolean
  hasRun: boolean
  materialHint?: string | undefined
  onGenerate: (material: string) => void
}) {
  const { t } = useI18n()
  const [material, setMaterial] = useState('')

  if (hasRun) {
    return (
      <div className="mt-4 flex justify-end">
        <Button size="sm" variant="ghost" disabled={busy} onClick={() => onGenerate(material)}>
          <Sparkles className="size-3.5" />
          {t(busy ? '正在生成…' : '重新生成候选内容（会覆盖当前修改）')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Textarea
        value={material}
        onChange={(event) => setMaterial(event.target.value)}
        placeholder={materialHint ?? t('可选：把相关资料贴在这里，AI 会结合它生成候选内容。')}
        className="min-h-20"
      />
      <Button disabled={busy} onClick={() => onGenerate(material)}>
        <Sparkles className="size-4" />
        {t(busy ? 'AI 正在生成候选内容…' : '生成候选内容')}
      </Button>
    </div>
  )
}
