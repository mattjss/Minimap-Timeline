import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { getSortedEventsForTopic } from '../../data/topicEvents'
import { motionTransition } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TimelineLayoutMode } from '../../types'

function previewPlacement(mode: TimelineLayoutMode): {
  transform: string
  origin: string
} {
  switch (mode) {
    case 'horizontal':
      return {
        transform: 'translate(-50%, calc(-100% - 8px))',
        origin: 'bottom center',
      }
    case 'vertical':
      return {
        transform: 'translate(0, -50%)',
        origin: 'center left',
      }
    case 'radial':
      return {
        transform: 'translate(calc(-100% - 10px), -50%)',
        origin: 'center right',
      }
    default:
      return {
        transform: 'translate(-50%, calc(-100% - 8px))',
        origin: 'bottom center',
      }
  }
}

/**
 * Hover preview in the open quadrant relative to layout mode (stage-local).
 */
export function EventHoverPreview() {
  const hoverId = useAppStore((s) => s.horizontalHoverEventId)
  const point = useAppStore((s) => s.eventPreviewPoint)
  const detailOpen = useAppStore((s) => s.eventDetailOpen)
  const topicId = useAppStore((s) => s.activeTopicId)
  const timelineMode = useAppStore((s) => s.timelineMode)

  const event = useMemo(() => {
    if (!hoverId || detailOpen) return null
    return (
      getSortedEventsForTopic(topicId).find((e) => e.id === hoverId) ?? null
    )
  }, [hoverId, detailOpen, topicId])

  const show = Boolean(event && point)
  const place = previewPlacement(timelineMode)

  return (
    <AnimatePresence>
      {show && event && point ? (
        <motion.div
          key={event.id}
          role="presentation"
          aria-hidden
          initial={{ opacity: 0, y: timelineMode === 'horizontal' ? 4 : 0, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.16, ease: motionTransition.ease }}
          className={cn(
            'pointer-events-none absolute z-20 w-[min(14rem,calc(100vw-2rem))]',
            'rounded-[0.45rem] border border-white/[0.05] bg-canvas/95 px-2.5 py-2',
          )}
          style={{
            left: point.relX,
            top: point.relY,
            transform: place.transform,
            transformOrigin: place.origin,
          }}
        >
          <p className="text-[9.5px] font-medium leading-snug tracking-[0.06em] text-ink/84">
            {event.title}
          </p>
          <p className="mt-0.5 text-[8.5px] tabular-nums tracking-[0.08em] text-ink-muted/68">
            {event.year}
          </p>
          <p className="mt-1 line-clamp-2 text-[8.5px] font-normal leading-relaxed tracking-wide text-ink-faint/80">
            {event.summary}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
