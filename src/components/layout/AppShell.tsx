import { LayoutGroup } from 'framer-motion'
import { EventDetailModal } from '../../features/timeline/EventDetailModal'
import { TimelineCanvas } from '../../features/timeline/TimelineCanvas'
import { useTimelineKeyboard } from '../../hooks/useTimelineKeyboard'
import { useTopicChromeVars } from '../../hooks/useTopicChromeVars'
import { CanvasBackdrop } from './CanvasBackdrop'

export function AppShell() {
  useTimelineKeyboard()
  const topicChrome = useTopicChromeVars()

  return (
    <div
      style={topicChrome}
      className="fixed inset-0 z-0 flex h-dvh min-h-dvh w-full max-w-[100vw] flex-col overflow-hidden bg-canvas text-ink"
    >
      <CanvasBackdrop />

      <LayoutGroup id="timeline-shell-sync">
        <main className="absolute inset-0 min-h-0 min-w-0">
          <TimelineCanvas />
        </main>
      </LayoutGroup>

      <EventDetailModal />
    </div>
  )
}
