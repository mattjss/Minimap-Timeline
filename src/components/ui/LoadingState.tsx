import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

export type LoadingStateProps = {
  label?: string
  className?: string
}

export function LoadingState({ label = 'Loading', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 text-sm text-ink-muted',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span>{label}</span>
    </div>
  )
}
