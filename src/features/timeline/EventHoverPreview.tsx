import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { getSortedSfGiantsEvents } from '../../data/seeds/sfGiants'
import { motionTransition } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'

/**
 * Hover micro-card — absolutely positioned inside `[data-timeline-stage]` (scene-local).
 */
export function EventHoverPreview() {
  const hoverId = useAppStore((s) => s.horizontalHoverEventId)
  const point = useAppStore((s) => s.eventPreviewPoint)
  const detailOpen = useAppStore((s) => s.eventDetailOpen)
  const topicId = useAppStore((s) => s.activeTopicId)

  const event = useMemo(() => {
    const giants = topicId === 'sf-giants' || topicId === null
    if (!giants || !hoverId || detailOpen) return null
    return getSortedSfGiantsEvents().find((e) => e.id === hoverId) ?? null
  }, [hoverId, detailOpen, topicId])

  const show = Boolean(event && point)

  return (
    <AnimatePresence>
      {show && event && point ? (
        <motion.div
          key={event.id}
          role="presentation"
          aria-hidden
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.16, ease: motionTransition.ease }}
          className={cn(
            'pointer-events-none absolute z-20 w-[min(18rem,calc(100%-1rem))]',
            'rounded-lg border border-white/12 bg-black/78 px-3 py-2.5',
            'shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md',
          )}
          style={{
            left: point.relX,
            top: point.relY,
            transform: 'translate(-50%, calc(-100% - 10px))',
          }}
        >
          <p className="text-[11px] font-medium leading-snug tracking-wide text-ink/95">
            {event.title}
          </p>
          <p className="mt-1 text-[9px] tracking-[0.14em] text-ink-muted">
            {event.year}
            {event.category ? ` · ${event.category}` : ''}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[10px] leading-relaxed text-ink-muted/90">
            {event.summary}
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
