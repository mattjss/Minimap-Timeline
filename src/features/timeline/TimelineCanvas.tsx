import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'
import { motionTransition, referenceLayoutMorphSpring } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import { EventHoverPreview } from './EventHoverPreview'
import { SchematicTimeline } from './SchematicTimeline'
import { UnifiedDataTimeline } from './UnifiedDataTimeline'

type TimelineCanvasProps = {
  'aria-labelledby'?: string
  'aria-label'?: string
}

/**
 * Large stage: one continuous data scene; hover preview mounted inside stage bounds.
 */
export function TimelineCanvas({
  'aria-labelledby': ariaLabelledBy,
  'aria-label': ariaLabel = 'Timeline',
}: TimelineCanvasProps) {
  const timelineMode = useAppStore((s) => s.timelineMode)
  const activeTopicId = useAppStore((s) => s.activeTopicId)
  const reduceMotion = useReducedMotion()
  const instant = reduceMotion === true
  const morphTransition = instant
    ? { duration: 0 }
    : { ...referenceLayoutMorphSpring }

  const crossfade = {
    duration: instant ? 0 : 0.32,
    ease: motionTransition.ease,
  }

  const useGiants =
    activeTopicId === 'sf-giants' || activeTopicId === null

  const showDataTimeline =
    useGiants &&
    (timelineMode === 'horizontal' ||
      timelineMode === 'vertical' ||
      timelineMode === 'radial')

  const regionA11y = ariaLabelledBy
    ? ({ 'aria-labelledby': ariaLabelledBy } as const)
    : ({ 'aria-label': ariaLabel } as const)

  return (
    <div
      role="region"
      {...regionA11y}
      className={cn(
        'absolute inset-0 flex items-center justify-center px-3 pb-32 pt-1 sm:px-5 sm:pb-36',
        showDataTimeline ? 'pointer-events-auto' : 'pointer-events-none',
      )}
    >
      <div
        className={cn(
          'relative isolate w-full max-w-[min(96vw,52rem)] overflow-hidden rounded-[1.05rem]',
          'aspect-video min-h-[min(52vh,420px)] sm:min-h-[min(56vh,480px)]',
          'border border-white/10 bg-black/20',
          'shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
          '[contain:paint]',
        )}
      >
        <div
          data-timeline-stage
          className={cn(
            'absolute inset-[3%] overflow-visible sm:inset-[2.5%]',
            'relative',
          )}
        >
          <AnimatePresence mode="wait">
            {showDataTimeline ? (
              <motion.div
                key="data-timeline"
                className="absolute inset-0 select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={crossfade}
              >
                <UnifiedDataTimeline />
              </motion.div>
            ) : (
              <motion.div
                key="schematic"
                className="absolute inset-0 overflow-hidden select-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={crossfade}
              >
                <SchematicTimeline
                  mode={timelineMode}
                  transition={morphTransition}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <EventHoverPreview />
        </div>
      </div>
    </div>
  )
}
