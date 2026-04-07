import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { getSortedEventsForTopic } from '../../data/topicEvents'
import { motionTransition } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'

/**
 * Node-attached micro-preview: title, year, one-line summary only (no category chips / lists).
 */
export function EventHoverPreview() {
  const hoverId = useAppStore((s) => s.horizontalHoverEventId)
  const point = useAppStore((s) => s.eventPreviewPoint)
  const detailOpen = useAppStore((s) => s.eventDetailOpen)
  const topicId = useAppStore((s) => s.activeTopicId)

  const event = useMemo(() => {
    if (!hoverId || detailOpen) return null
    return (
      getSortedEventsForTopic(topicId).find((e) => e.id === hoverId) ?? null
    )
  }, [hoverId, detailOpen, topicId])

  const show = Boolean(event && point)

  return (
    <AnimatePresence>
      {show && event && point ? (
        <motion.div
          key={event.id}
          role="presentation"
          aria-hidden
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.14, ease: motionTransition.ease }}
          className={cn(
            'pointer-events-none absolute z-20 w-[min(13rem,calc(100vw-1.25rem))]',
            'rounded-md border border-white/[0.06] bg-canvas/92 px-2 py-1.5',
          )}
          style={{
            left: point.relX,
            top: point.relY,
            transform: 'translate(-50%, calc(-100% - 6px))',
          }}
        >
          <p className="text-[10px] font-medium leading-tight tracking-wide text-ink/90">
            {event.title}
          </p>
          <p className="mt-0.5 text-[9px] tabular-nums tracking-wide text-ink-muted/80">
            {event.year}
          </p>
          <p className="mt-1 line-clamp-2 text-[9px] font-normal leading-snug text-ink-faint/92">
            {event.summary}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
