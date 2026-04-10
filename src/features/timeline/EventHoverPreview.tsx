import { AnimatePresence, motion } from 'framer-motion'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
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

const VIEW_PAD = 12

/** Safe-area insets via a probe (env() is not exposed on documentElement in all browsers). */
function readSafeAreaInsets(): { l: number; r: number; t: number; b: number } {
  if (typeof document === 'undefined') {
    return { l: 0, r: 0, t: 0, b: 0 }
  }
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText =
    'position:fixed;pointer-events:none;visibility:hidden;width:0;height:0;left:0;top:0;' +
    'padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px);' +
    'padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)'
  document.body.appendChild(probe)
  const cs = getComputedStyle(probe)
  const out = {
    l: parseFloat(cs.paddingLeft) || 0,
    r: parseFloat(cs.paddingRight) || 0,
    t: parseFloat(cs.paddingTop) || 0,
    b: parseFloat(cs.paddingBottom) || 0,
  }
  document.body.removeChild(probe)
  return out
}

function viewportMargins(): { l: number; r: number; t: number; b: number } {
  const safe = readSafeAreaInsets()
  return {
    l: VIEW_PAD + safe.l,
    r: VIEW_PAD + safe.r,
    t: VIEW_PAD + safe.t,
    b: VIEW_PAD + safe.b,
  }
}

/**
 * Iteratively nudge `translate(x,y)` so `getBoundingClientRect()` stays inside the viewport.
 * (Base transform uses % so we cannot solve purely in closed form without measuring.)
 */
function computeViewportNudge(
  el: HTMLElement,
  baseTransform: string,
  origin: string,
): { x: number; y: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const { l: ml, r: mr, t: mt, b: mb } = viewportMargins()

  let x = 0
  let y = 0
  for (let i = 0; i < 12; i++) {
    el.style.transform = `${baseTransform} translate(${x}px, ${y}px)`
    el.style.transformOrigin = origin
    const r = el.getBoundingClientRect()
    let dx = 0
    let dy = 0
    if (r.left < ml) dx += ml - r.left
    if (r.right > vw - mr) dx += vw - mr - r.right
    if (r.top < mt) dy += mt - r.top
    if (r.bottom > vh - mb) dy += vh - mb - r.bottom
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) break
    x += dx
    y += dy
  }
  el.style.removeProperty('transform')
  el.style.removeProperty('transform-origin')
  return { x, y }
}

/**
 * Hover + selection preview — portaled, clamped to the viewport so it never sits off-screen.
 */
export function EventHoverPreview() {
  const hoverId = useAppStore((s) => s.horizontalHoverEventId)
  const selectedId = useAppStore((s) => s.horizontalSelectedEventId)
  const detailOpen = useAppStore((s) => s.eventDetailOpen)
  const topicId = useAppStore((s) => s.activeTopicId)
  const timelineMode = useAppStore((s) => s.timelineMode)
  const cancelHoverClear = useAppStore((s) => s.cancelHorizontalHoverClear)
  const scheduleHoverClear = useAppStore((s) => s.scheduleHorizontalHoverClear)
  const openEventDetail = useAppStore((s) => s.openEventDetail)

  const targetId = resolveTargetEventId(hoverId, selectedId, detailOpen)

  const event = useMemo(() => {
    if (!targetId) return null
    return getSortedEventsForTopic(topicId).find((e) => e.id === targetId) ?? null
  }, [targetId, topicId])

  const [anchor, setAnchor] = useState<{ left: number; top: number } | null>(null)
  const [nudge, setNudge] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

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

  useLayoutEffect(() => {
    if (!show || typeof window === 'undefined') {
      setNudge({ x: 0, y: 0 })
      return
    }

    const placeNow = previewPlacement(timelineMode)

    let cancelled = false
    let ro: ResizeObserver | null = null

    const runClamp = (attempt = 0) => {
      if (cancelled) return
      const el = cardRef.current
      if (!el) {
        if (attempt < 12) {
          requestAnimationFrame(() => runClamp(attempt + 1))
        }
        return
      }
      const { x, y } = computeViewportNudge(el, placeNow.transform, placeNow.origin)
      setNudge({ x, y })

      if (!ro && typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => {
          if (cancelled) return
          requestAnimationFrame(() => runClamp(0))
        })
        ro.observe(el)
      }
    }

    setNudge({ x: 0, y: 0 })

    let raf1 = 0
    let raf2 = 0
    raf1 = requestAnimationFrame(() => {
      if (cancelled) return
      raf2 = requestAnimationFrame(() => {
        if (cancelled) return
        runClamp(0)
      })
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      ro?.disconnect()
    }
  }, [show, anchor?.left, anchor?.top, event?.id, timelineMode])

  const layer =
    typeof document !== 'undefined' ? (
      <AnimatePresence>
        {show && event && anchor ? (
          <motion.div
            key={event.id}
            ref={cardRef}
            role="button"
            tabIndex={0}
            aria-label={`Open details: ${event.title}, ${event.year}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: motionTransition.ease }}
            onPointerEnter={() => cancelHoverClear()}
            onPointerLeave={() => scheduleHoverClear()}
            onClick={(ev) => {
              ev.stopPropagation()
              openEventDetail(event.id)
            }}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault()
                ev.stopPropagation()
                openEventDetail(event.id)
              }
            }}
            className={cn(
              'pointer-events-auto fixed z-[320] w-[min(19rem,calc(100vw-2rem))]',
              'max-w-[calc(100vw-1.5rem)]',
              'cursor-pointer rounded-[0.35rem] border border-border bg-canvas/92 px-3 py-2',
              'shadow-[0_6px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm',
              'outline-none transition-[border-color,box-shadow] duration-150',
              'hover:border-border-strong focus-visible:border-border-strong focus-visible:ring-1 focus-visible:ring-ink/15',
              timelineMode === 'horizontal' && 'pb-5',
              timelineMode === 'vertical' && 'pl-4',
              timelineMode === 'radial' && 'pr-5',
            )}
            style={{
              left: anchor.left,
              top: anchor.top,
              transform: `${place.transform} translate(${nudge.x}px, ${nudge.y}px)`,
              transformOrigin: place.origin,
            }}
          >
            {event.subtype ? (
              <span className="mb-0.5 inline-block text-xs font-normal uppercase tracking-wider text-ink-whisper">
                {event.subtype.replace(/-/g, ' ')}
              </span>
            ) : null}
            <p className="text-sm font-medium leading-snug text-ink/90">
              {event.title}
            </p>
            <p className="mt-0.5 text-xs tabular-nums leading-snug text-ink-faint">
              {event.year}
              {event.category ? (
                <span className="text-ink-whisper"> · {event.category}</span>
              ) : null}
            </p>
            <p className="mt-1 line-clamp-3 text-sm font-normal leading-relaxed text-ink-muted">
              {event.summary}
            </p>
            {event.facts?.[0] ? (
              <p className="mt-1.5 border-t border-border pt-1.5 text-xs leading-snug text-ink-faint">
                <span className="text-ink-muted/90">{event.facts[0].label}</span>
                <span className="text-ink-whisper"> · </span>
                {event.facts[0].value}
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    ) : null

  return layer ? createPortal(layer, document.body) : null
}
