import { foundationPlaceholderMessage } from '../../lib/content'
import { Header } from './Header'

export function AppShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas text-ink">
      <Header />
      <main className="flex flex-1 items-center justify-center px-6">
        <p className="text-center text-sm tracking-wide text-ink-muted">
          {foundationPlaceholderMessage}
        </p>
      </main>
    </div>
  )
}
