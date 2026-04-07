import { APP_NAME } from '../../lib/constants'

export function Header() {
  return (
    <header className="relative z-20 shrink-0 border-b border-border/50 bg-canvas/30 px-6 py-3.5 backdrop-blur-sm">
      <h1 className="text-[13px] font-medium tracking-[0.1em] text-ink">
        {APP_NAME}
      </h1>
    </header>
  )
}
