import { DayPicker } from 'react-day-picker'

import { enUS, zhCN } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export function Calendar({
  className,
  language,
  ...props
}: React.ComponentProps<typeof DayPicker> & { language: 'zh-CN' | 'en' }) {
  return (
    <DayPicker
      locale={language === 'en' ? enUS : zhCN}
      weekStartsOn={language === 'en' ? 0 : 1}
      showOutsideDays
      className={cn('text-sm', className)}
      classNames={{
        root: 'w-fit',
        months: 'relative flex flex-col',
        month: 'flex flex-col gap-3',
        month_caption: 'flex h-8 items-center justify-center px-9',
        caption_label: 'text-sm font-medium',
        nav: 'absolute inset-x-0 top-0 flex h-8 items-center justify-between',
        button_previous: cn(
          'flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        ),
        button_next: cn(
          'flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
        ),
        month_grid: 'border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-center text-xs font-normal text-muted-foreground',
        week: 'mt-1 flex',
        day: 'size-9 p-0 text-center',
        day_button: cn(
          'size-9 rounded-md text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring',
          'aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:hover:bg-primary',
        ),
        selected: '',
        today:
          '[&>button]:font-semibold [&>button]:text-accent-foreground [&>button]:underline [&>button]:underline-offset-4',
        outside: 'text-muted-foreground/50',
        disabled: 'text-muted-foreground/40 [&>button]:hover:bg-transparent',
        hidden: 'invisible',
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === 'left') return <ChevronLeft className="size-4" />
          return <ChevronRight className="size-4" />
        },
      }}
      labels={{
        labelPrevious: () => (language === 'en' ? 'Go to previous month' : '上个月'),
        labelNext: () => (language === 'en' ? 'Go to next month' : '下个月'),
      }}
      {...props}
    />
  )
}
