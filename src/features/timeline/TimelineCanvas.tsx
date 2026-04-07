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
import { stageSceneClasses, stageSceneMotion } from './stageComposition'
import { UnifiedDataTimeline } from './UnifiedDataTimeline'

/**
 * Scene shell: edge-anchored regions per mode — not a centered staging card.
 * SVG viewBox is unchanged; the *viewport* for the scene is structural.
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
            'pl-[max(0.5rem,env(safe-area-inset-left))]',
            'pr-[max(0.5rem,env(safe-area-inset-right))]',
            'pb-[max(0.5rem,env(safe-area-inset-bottom))]',
          )}
        >
          <motion.div
            data-timeline-stage
            className={cn('absolute z-[1] select-none', stageSceneClasses(timelineMode))}
            initial={false}
            animate={stageSceneMotion(timelineMode)}
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
          Timeline scene: horizontal strip at bottom, vertical strip at left,
          radial geometry cropped at the corner.
        </span>
      </div>
    </>
  )
}
