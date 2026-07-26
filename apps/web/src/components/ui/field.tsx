import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function Field({
  label,
  hint,
  htmlFor,
  required = false,
  error,
  children,
}: {
  label: string
  hint?: string
  htmlFor: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <label className="text-sm font-medium" htmlFor={htmlFor}>
          {label}
          {required ? (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
      {error ? (
        <p className="text-xs leading-5 text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-9 w-full rounded-md border border-input bg-background px-3 text-sm transition placeholder:text-muted-foreground/70 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-6 transition placeholder:text-muted-foreground/70 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
