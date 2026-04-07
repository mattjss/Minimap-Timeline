import { type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export type EmptyStateProps = {
  title: string
  description?: string
  className?: string
  children?: ReactNode
}

export function EmptyState({
  title,
  description,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 py-12 text-center',
        className,
      )}
    >
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? (
        <p className="max-w-sm text-sm text-ink-muted">{description}</p>
      ) : null}
      {children}
    </div>
  )
}
