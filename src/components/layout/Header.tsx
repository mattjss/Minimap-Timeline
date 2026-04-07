import { APP_NAME } from '../../lib/constants'

export function Header() {
  return (
    <header className="border-b border-border px-6 py-4">
      <p className="text-sm font-medium tracking-wide text-ink">{APP_NAME}</p>
    </header>
  )
}
