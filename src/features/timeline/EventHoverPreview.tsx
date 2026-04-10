import { AnimatePresence, motion } from 'framer-motion'
import { useLayoutEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getSortedEventsForTopic } from '../../data/topicEvents'
import { motionTransition } from '../../lib/motion'
import { clientViewportHoverAnchor } from '../../lib/svgPointer'
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

function resolveTargetEventId(
  hoverId: string | null,
  selectedId: string | null,
  detailOpen: boolean,
): string | null {
  if (detailOpen) return null
  return hoverId ?? selectedId
}

/**
 * Hover + selection preview — portaled with viewport anchoring so it isn’t clipped by
 * `overflow-hidden` on the timeline shell. Position tracks layout / scroll via ResizeObserver.
 */
export function EventHoverPreview() {
  const hoverId = useAppStore((s) => s.horizontalHoverEventId)
  const selectedId = useAppStore((s) => s.horizontalSelectedEventId)
  const detailOpen = useAppStore((s) => s.eventDetailOpen)
  const topicId = useAppStore((s) => s.activeTopicId)
  const timelineMode = useAppStore((s) => s.timelineMode)

  const targetId = resolveTargetEventId(hoverId, selectedId, detailOpen)

  const event = useMemo(() => {
    if (!targetId) return null
    return getSortedEventsForTopic(topicId).find((e) => e.id === targetId) ?? null
  }, [targetId, topicId])

  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null)

  useLayoutEffect(() => {
    let ro: ResizeObserver | null = null

    const measure = () => {
      if (!targetId || typeof document === 'undefined') {
        setAnchor(null)
        return
      }
      const stage = document.querySelector('[data-timeline-stage]')
      if (!stage) {
        setAnchor(null)
        return
      }
      const g = stage.querySelector(
        `[data-event-node="${CSS.escape(targetId)}"]`,
      ) as SVGGElement | null
      if (!g) {
        setAnchor(null)
        return
      }
      setAnchor(clientViewportHoverAnchor(g, timelineMode))
    }

    const raf = requestAnimationFrame(measure)

    const stage = document.querySelector('[data-timeline-stage]')
    ro =
      stage && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => requestAnimationFrame(measure))
        : null
    if (stage && ro) ro.observe(stage)

    const onWin = () => requestAnimationFrame(measure)
    window.addEventListener('resize', onWin)
    window.addEventListener('scroll', onWin, true)

    return () => {
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('resize', onWin)
      window.removeEventListener('scroll', onWin, true)
    }
  }, [targetId, timelineMode, topicId])

  const show = Boolean(event && anchor)
  const place = previewPlacement(timelineMode)

  const layer =
    typeof document !== 'undefined' ? (
      <AnimatePresence>
        {show && event && anchor ? (
          <motion.div
            key={event.id}
            role="tooltip"
            initial={{ opacity: 0, y: timelineMode === 'horizontal' ? 4 : 0, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.16, ease: motionTransition.ease }}
            className={cn(
              'pointer-events-none fixed z-[320] w-[min(15rem,calc(100vw-2rem))]',
              'rounded-[0.45rem] border border-white/[0.08] bg-canvas/95 px-2.5 py-2 shadow-lg',
              'backdrop-blur-sm',
            )}
            style={{
              left: anchor.left,
              top: anchor.top,
              transform: place.transform,
              transformOrigin: place.origin,
            }}
          >
            {event.subtype ? (
              <span className="mb-1 inline-block rounded border border-white/[0.06] bg-white/[0.04] px-1.5 py-0.5 text-[6.5px] font-medium uppercase tracking-[0.16em] text-ink-muted/80">
                {event.subtype.replace(/-/g, ' ')}
              </span>
            ) : null}
            <p className="text-[9.5px] font-medium leading-snug tracking-[0.06em] text-ink/88">
              {event.title}
            </p>
            <p className="mt-0.5 text-[8.5px] tabular-nums tracking-[0.08em] text-ink-muted/72">
              {event.year}
              {event.category ? (
                <span className="text-ink-faint/55"> · {event.category}</span>
              ) : null}
            </p>
            <p className="mt-1 line-clamp-3 text-[8.5px] font-normal leading-relaxed tracking-wide text-ink-faint/82">
              {event.summary}
            </p>
            {event.facts?.[0] ? (
              <p className="mt-1.5 border-t border-white/[0.06] pt-1.5 text-[8px] leading-snug text-ink-muted/85">
                <span className="font-medium text-ink-faint/90">{event.facts[0].label}</span>
                <span className="text-ink-faint/50"> · </span>
                {event.facts[0].value}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    ) : null

  return layer ? createPortal(layer, document.body) : null
}
