import { useState } from 'react'

import { format, isValid, parse } from 'date-fns'
import { enUS, zhCN } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'

import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

function parseValue(value: string): Date | undefined {
  if (!value) return undefined
  const date = parse(value, 'yyyy-MM-dd', new Date())
  return isValid(date) ? date : undefined
}

export function DatePicker({
  id,
  value,
  onChange,
  language,
  placeholder,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  language: 'zh-CN' | 'en'
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const selected = parseValue(value)
  const displayLocale = language === 'en' ? enUS : zhCN

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm outline-none transition focus:border-ring focus:ring-1 focus:ring-ring/15',
            !selected && 'text-muted-foreground/70',
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          {selected ? format(selected, 'PPP', { locale: displayLocale }) : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? format(date, 'yyyy-MM-dd') : '')
            setOpen(false)
          }}
          defaultMonth={selected ?? new Date()}
          language={language}
        />
      </PopoverContent>
    </Popover>
  )
}
