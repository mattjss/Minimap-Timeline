import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, type = 'button', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-md border border-border bg-canvas-raised px-3 py-1.5 text-sm text-ink transition-colors hover:border-border-strong hover:text-ink',
          className,
        )}
        {...props}
      />
    )
  },
)
