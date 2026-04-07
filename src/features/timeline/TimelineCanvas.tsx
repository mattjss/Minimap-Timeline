import { useReducedMotion } from 'framer-motion'
import { TimelineModeToggle } from '../../components/layout/TimelineModeToggle'
import { topicHasRenderableTimeline } from '../../data/topicEvents'
import { referenceLayoutMorphSpring } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { TIMELINE_VIEW } from '../../lib/timelineVisual'
import { EventHoverPreview } from './EventHoverPreview'
import { SchematicTimeline } from './SchematicTimeline'
import { UnifiedDataTimeline } from './UnifiedDataTimeline'

/**
 * Full-viewport cinematic stage: controls + timeline read as one column;
 * the line and marks are the hero — no dominant card frame.
 */
export function TimelineCanvas() {
  const timelineMode = useAppStore((s) => s.timelineMode)
  const activeTopicId = useAppStore((s) => s.activeTopicId)
  const reduceMotion = useReducedMotion()
  const instant = reduceMotion === true
  const morphTransition = instant
    ? { duration: 0 }
    : { ...referenceLayoutMorphSpring }

  const showDataTimeline =
    topicHasRenderableTimeline(activeTopicId) &&
    (timelineMode === 'horizontal' ||
      timelineMode === 'vertical' ||
      timelineMode === 'radial')

  return (
    <>
      <TimelineModeToggle />
      <div
        role="region"
        aria-label="Timeline"
        className={cn(
          'absolute inset-0 flex min-h-0 min-w-0 flex-col',
          'pointer-events-auto pt-[3.35rem] sm:pt-[3.55rem]',
        )}
      >
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-hidden px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-0 sm:px-4 sm:pb-6">
        {/* Very soft focal wash — intentional depth, not a card frame */}
        <div
          className="pointer-events-none absolute inset-0 opacity-100"
          style={{
            background: `
              radial-gradient(ellipse 82% 56% at 50% 48%,
                color-mix(in oklch, var(--color-accent) 1.6%, transparent) 0%,
                transparent 65%),
              radial-gradient(ellipse 96% 72% at 50% 56%,
                transparent 0%,
                rgba(0,0,0,0.05) 100%)
            `,
          }}
          aria-hidden
        />

        <div
          data-timeline-stage
          className="relative z-[1] select-none"
          style={{
            aspectRatio: `${TIMELINE_VIEW.w} / ${TIMELINE_VIEW.h}`,
            width:
              'min(96vw, 1180px, calc((100dvh - 6.5rem) * 640 / 380))',
          }}
        >
          <div className="absolute inset-0 min-h-0 min-w-0">
            {showDataTimeline ? (
              <UnifiedDataTimeline />
            ) : (
              <SchematicTimeline
                mode={timelineMode}
                transition={morphTransition}
              />
            )}
          </div>
          <EventHoverPreview />
        </div>
      </div>

      <span className="sr-only">
        Interactive timeline. Use the top bar for topic and geometry mode.
      </span>
      </div>
    </>
  )
}
