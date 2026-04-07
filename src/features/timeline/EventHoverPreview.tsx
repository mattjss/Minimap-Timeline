import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { getSortedEventsForTopic } from '../../data/topicEvents'
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
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ duration: 0.16, ease: motionTransition.ease }}
          className={cn(
            'pointer-events-none absolute z-20 w-[min(15rem,calc(100%-1rem))]',
            'rounded-[0.5rem] border border-white/[0.06] bg-black/70 px-2.5 py-1.5',
            'shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.03)]',
            'backdrop-blur-md',
          )}
          style={{
            left: point.relX,
            top: point.relY,
            transform: 'translate(-50%, calc(-100% - 10px))',
          }}
        >
          <p className="text-[10px] font-medium leading-snug tracking-wide text-ink/88">
            {event.title}
          </p>
          <p className="mt-1 text-[9px] font-normal tracking-[0.12em] text-ink-muted/85">
            {event.year}
            {event.category ? ` · ${event.category}` : ''}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[9.5px] font-normal leading-relaxed text-ink-faint/95">
            {event.summary}
          </p>
          {event.notableGames && event.notableGames.length > 0 ? (
            <p className="mt-1.5 line-clamp-2 text-[9px] leading-snug text-ink-muted/70">
              {event.notableGames.slice(0, 3).join(' · ')}
            </p>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
