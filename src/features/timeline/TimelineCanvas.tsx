import { useReducedMotion } from 'framer-motion'
import { topicHasRenderableTimeline } from '../../data/topicEvents'
import { referenceLayoutMorphSpring } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { TIMELINE_VIEW } from '../../lib/timelineVisual'
import { EventHoverPreview } from './EventHoverPreview'
import { SchematicTimeline } from './SchematicTimeline'
import { UnifiedDataTimeline } from './UnifiedDataTimeline'

/**
 * Cinematic centered stage: timeline geometry is the hero (reference composition).
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
    <div
      role="region"
      aria-label="Timeline"
      className={cn(
        'absolute inset-0 flex min-h-0 min-w-0 flex-col',
        'pointer-events-auto',
        'items-center justify-center',
        'px-4 pb-8 pt-[4.75rem] sm:pb-10 sm:pt-[5.25rem]',
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.85]"
        style={{
          background: `
            radial-gradient(ellipse 72% 58% at 50% 46%, transparent 0%, rgba(0,0,0,0.34) 100%),
            radial-gradient(ellipse 88% 70% at 50% 50%, transparent 22%, rgba(0,0,0,0.18) 100%)
          `,
        }}
        aria-hidden
      />

      <div
        data-timeline-stage
        className="relative z-[1] w-full max-w-[min(92vw,640px)] select-none"
        style={{ aspectRatio: `${TIMELINE_VIEW.w} / ${TIMELINE_VIEW.h}` }}
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

      <span className="sr-only">
        Interactive timeline. Top bar: topic and geometry mode.
      </span>
    </div>
  )
}
