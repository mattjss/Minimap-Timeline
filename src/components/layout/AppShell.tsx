import { LayoutGroup } from 'framer-motion'
import { EventDetailModal } from '../../features/timeline/EventDetailModal'
import { TimelineCanvas } from '../../features/timeline/TimelineCanvas'
import { useTimelineKeyboard } from '../../hooks/useTimelineKeyboard'
import { CanvasBackdrop } from './CanvasBackdrop'
import { Header } from './Header'
import { TimelineModeToggle } from './TimelineModeToggle'

export function AppShell() {
  useTimelineKeyboard()

  return (
    <div className="relative min-h-dvh overflow-hidden bg-canvas text-ink">
      <CanvasBackdrop />

      <LayoutGroup id="timeline-shell-sync">
        <div className="relative z-10 flex min-h-dvh flex-col">
          <Header />
          <main className="relative min-h-0 flex-1 overflow-hidden">
            <span id="timeline-region-desc" className="sr-only">
              Interactive timeline; arrow keys move between events
            </span>
            <TimelineCanvas aria-labelledby="timeline-region-desc" />
          </main>
        </div>

        <TimelineModeToggle />
      </LayoutGroup>

      <EventDetailModal />
    </div>
  )
}
