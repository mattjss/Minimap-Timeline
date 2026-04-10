import { motion, useReducedMotion } from 'framer-motion'
import { TimelineModeToggle } from '../../components/layout/TimelineModeToggle'
import { topicHasRenderableTimeline } from '../../data/topicEvents'
import {
  referenceLayoutMorphSpring,
  stageComposeSpring,
} from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { EventHoverPreview } from './EventHoverPreview'
import { SchematicTimeline } from './SchematicTimeline'
import { stageSceneClasses } from './stageComposition'
import { UnifiedDataTimeline } from './UnifiedDataTimeline'

/**
 * Scene shell: layout morphs between modes via Framer `layout` (no `left: 'auto'` animate).
 */
export function TimelineCanvas() {
  const timelineMode = useAppStore((s) => s.timelineMode)
  const activeTopicId = useAppStore((s) => s.activeTopicId)
  const reduceMotion = useReducedMotion()
  const instant = reduceMotion === true
  const morphTransition = instant
    ? { duration: 0 }
    : { ...referenceLayoutMorphSpring }
  const stageTransition = instant ? { duration: 0 } : stageComposeSpring

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
          'pointer-events-auto pt-[3.15rem] sm:pt-[3.35rem]',
        )}
      >
        <div
          className={cn(
            'relative min-h-0 min-w-0 flex-1 overflow-hidden',
            'pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]',
            'pb-[env(safe-area-inset-bottom)]',
          )}
        >
          <motion.div
            data-timeline-stage
            layout={!instant}
            className={cn('absolute z-[1] select-none', stageSceneClasses(timelineMode))}
            transition={stageTransition}
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
          </motion.div>
        </div>

        <span className="sr-only">
          Timeline scene: horizontal strip along the bottom edge, vertical strip along the
          left edge, radial dial as a quarter circle in the bottom-right corner.
        </span>
      </div>
    </>
  )
}
