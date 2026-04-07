import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'
import { getSortedEventsForTopic } from '../../data/topicEvents'
import {
  referenceLayoutMorphSpring,
  shellMicroSpring,
  timelineModeSyncSpring,
} from '../../lib/motion'
import { stageRelativeAnchorAboveNode } from '../../lib/svgPointer'
import { NODE_HOVER_SCALE, TIMELINE_MARK_RADIUS } from '../../lib/timelineVisual'
import { useAppStore } from '../../store/useAppStore'
import {
  computeSceneLayout,
  TIMELINE_CY,
  TIMELINE_VIEW,
  type Point,
  type Segment,
} from './timelineLayoutMath'

const { w: W, h: H } = TIMELINE_VIEW

/** Refined hash scale — small marks, tick grammar (reference density). */
const MARK_SCALE = 0.56
const TICK_SCALE = 0.64

function scaleTickTowardCenter(
  tick: Segment,
  cx: number,
  cy: number,
  k: number,
): Segment {
  return {
    x1: cx + (tick.x1 - cx) * k,
    y1: cy + (tick.y1 - cy) * k,
    x2: cx + (tick.x2 - cx) * k,
    y2: cy + (tick.y2 - cy) * k,
  }
}

/**
 * Hero timeline: one morphing scene across horizontal / vertical / radial (same ids, same springs).
 */
export function UnifiedDataTimeline() {
  const reduceMotion = useReducedMotion()
  const instant = reduceMotion === true
  const morph = instant ? { duration: 0 } : referenceLayoutMorphSpring
  const spineOpacityTransition = instant
    ? { duration: 0 }
    : timelineModeSyncSpring

  const timelineMode = useAppStore((s) => s.timelineMode)
  const activeTopicId = useAppStore((s) => s.activeTopicId)
  const hoverId = useAppStore((s) => s.horizontalHoverEventId)
  const selectedId = useAppStore((s) => s.horizontalSelectedEventId)
  const setHoverId = useAppStore((s) => s.setHorizontalHoverEventId)
  const setPreviewPoint = useAppStore((s) => s.setEventPreviewPoint)
  const openEventDetail = useAppStore((s) => s.openEventDetail)
  const dismiss = useAppStore((s) => s.dismissTimelineInteraction)
  const setSelectedId = useAppStore((s) => s.setHorizontalSelectedEventId)

  const events = useMemo(
    () => getSortedEventsForTopic(activeTopicId),
    [activeTopicId],
  )

  const { tMin, tMax } = useMemo(() => {
    if (events.length === 0) return { tMin: 0, tMax: 1 }
    const times = events.map((e) => new Date(e.dateStart).getTime())
    return { tMin: Math.min(...times), tMax: Math.max(...times) }
  }, [events])

  const layout = useMemo(
    () => computeSceneLayout(events, timelineMode, tMin, tMax),
    [events, timelineMode, tMin, tMax],
  )

  const morphXY = { x1: morph, y1: morph, x2: morph, y2: morph } as const
  const tickTransition = {
    ...morphXY,
    opacity: shellMicroSpring,
  } as const
  const nodeTransition = {
    cx: morph,
    cy: morph,
    r: shellMicroSpring,
  } as const

  if (events.length === 0) {
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full text-ink/22"
        fill="none"
        role="img"
        aria-label="No events"
      >
        <line
          x1={58}
          y1={TIMELINE_CY}
          x2={W - 58}
          y2={TIMELINE_CY}
          stroke="currentColor"
          strokeWidth={1}
          strokeOpacity={0.2}
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full cursor-default overflow-visible text-ink/22"
      fill="none"
      role="img"
      aria-label="Timeline"
    >
      <rect
        width={W}
        height={H}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
        onClick={() => dismiss()}
        aria-hidden
      />

      <motion.line
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        initial={false}
        animate={{
          x1: layout.spineLine.x1,
          y1: layout.spineLine.y1,
          x2: layout.spineLine.x2,
          y2: layout.spineLine.y2,
          opacity: timelineMode === 'radial' ? 0 : 0.19,
        }}
        transition={{
          x1: morph,
          y1: morph,
          x2: morph,
          y2: morph,
          opacity: spineOpacityTransition,
        }}
        style={{ pointerEvents: 'none' }}
      />

      <motion.path
        d={layout.spineArcD}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        initial={false}
        animate={{
          opacity: timelineMode === 'radial' ? 0.2 : 0,
        }}
        transition={{ opacity: spineOpacityTransition }}
        style={{ pointerEvents: 'none' }}
      />

      {events.map((e, i) => {
        const center: Point = layout.nodeCenters[i]!
        const tickRaw = layout.nodeTicks[i]!
        const tick = scaleTickTowardCenter(
          tickRaw,
          center.x,
          center.y,
          TICK_SCALE,
        )
        const baseR = TIMELINE_MARK_RADIUS * MARK_SCALE
        const isSelected = selectedId === e.id
        const isHovered = hoverId === e.id
        const tickBase = timelineMode === 'radial' ? 0.1 : 0.16
        const markOpacity = isSelected ? 0.92 : isHovered ? 0.52 : 0.34
        const markStroke = isSelected ? 0.72 : 0.5

        return (
          <g
            key={e.id}
            style={{ pointerEvents: 'all' }}
            onPointerEnter={(ev) => {
              setHoverId(e.id)
              const p = stageRelativeAnchorAboveNode(
                ev.currentTarget as SVGGElement,
              )
              setPreviewPoint(p)
            }}
            onPointerLeave={() => {
              setHoverId(null)
              setPreviewPoint(null)
            }}
            onClick={(ev) => {
              ev.stopPropagation()
              openEventDetail(e.id)
            }}
          >
            <motion.line
              stroke="currentColor"
              strokeWidth={1}
              strokeLinecap="round"
              initial={false}
              animate={{
                x1: tick.x1,
                y1: tick.y1,
                x2: tick.x2,
                y2: tick.y2,
                opacity: isSelected
                  ? timelineMode === 'radial'
                    ? 0.22
                    : 0.28
                  : isHovered
                    ? tickBase + 0.05
                    : tickBase,
              }}
              transition={tickTransition}
              style={{ pointerEvents: 'none' }}
            />
            <motion.circle
              cx={center.x}
              cy={center.y}
              r={baseR}
              fill="none"
              stroke="currentColor"
              initial={false}
              animate={{
                cx: center.x,
                cy: center.y,
                r: isHovered ? baseR * NODE_HOVER_SCALE : baseR,
                strokeOpacity: markOpacity,
                strokeWidth: markStroke,
              }}
              transition={nodeTransition}
              style={{ cursor: 'pointer', pointerEvents: 'all' }}
              tabIndex={0}
              focusable="true"
              aria-label={`${e.title}, ${e.year}`}
              aria-current={isSelected ? 'true' : undefined}
              onFocus={() => {
                setHoverId(null)
                setPreviewPoint(null)
                setSelectedId(e.id)
              }}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault()
                  openEventDetail(e.id)
                }
              }}
            />
          </g>
        )
      })}
    </svg>
  )
}
