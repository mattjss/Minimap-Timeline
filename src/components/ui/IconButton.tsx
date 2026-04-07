import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex size-9 items-center justify-center rounded-md border border-border text-ink-muted transition-colors hover:border-border-strong hover:text-ink',
          className,
        )}
        {...props}
      />
    )
  },
)
