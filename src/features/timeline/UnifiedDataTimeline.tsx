import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'
import { getSortedEventsForTopic } from '../../data/topicEvents'
import {
  referenceLayoutMorphSpring,
  shellMicroSpring,
  timelineModeSyncSpring,
} from '../../lib/motion'
import { TIMELINE_STROKE } from '../../lib/timelineTheme'
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

const MARK_SCALE = 0.58
const TICK_SCALE = 0.58

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
 * Hero timeline: morphing H / V / radial — strokes use dedicated dark-mode tokens.
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
    strokeWidth: shellMicroSpring,
  } as const

  if (events.length === 0) {
    return (
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-full w-full"
        fill="none"
        role="img"
        aria-label="No events"
        preserveAspectRatio="xMidYMid meet"
      >
        <line
          x1={58}
          y1={TIMELINE_CY}
          x2={W - 58}
          y2={TIMELINE_CY}
          stroke={TIMELINE_STROKE.spine}
          strokeWidth={1.1}
          strokeOpacity={0.45}
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full cursor-default overflow-visible"
      fill="none"
      role="img"
      aria-label="Timeline"
      preserveAspectRatio={
        timelineMode === 'radial' ? 'xMaxYMax meet' : 'xMidYMid meet'
      }
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
        stroke={TIMELINE_STROKE.spine}
        strokeWidth={1.2}
        strokeLinecap="round"
        initial={false}
        animate={{
          x1: layout.spineLine.x1,
          y1: layout.spineLine.y1,
          x2: layout.spineLine.x2,
          y2: layout.spineLine.y2,
          opacity: timelineMode === 'radial' ? 0 : 1,
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
        stroke={TIMELINE_STROKE.spine}
        strokeWidth={1.2}
        strokeLinecap="round"
        initial={false}
        animate={{
          opacity: timelineMode === 'radial' ? 1 : 0,
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
        const tickOpacity = isSelected
          ? 1
          : isHovered
            ? 0.88
            : timelineMode === 'radial'
              ? 0.62
              : 0.68
        const markStroke =
          isSelected || isHovered
            ? TIMELINE_STROKE.markEmphasis
            : TIMELINE_STROKE.mark
        const markW = isSelected ? 0.95 : isHovered ? 0.82 : 0.68
        const hitR = Math.max(12, baseR * 14)

        return (
          <g
            key={e.id}
            data-event-node={e.id}
            style={{ pointerEvents: 'all' }}
            onPointerEnter={() => setHoverId(e.id)}
            onPointerLeave={() => setHoverId(null)}
            onClick={(ev) => {
              ev.stopPropagation()
              openEventDetail(e.id)
            }}
          >
            <circle
              cx={center.x}
              cy={center.y}
              r={hitR}
              fill="transparent"
              stroke="none"
              tabIndex={0}
              role="button"
              aria-label={`${e.title}, ${e.year}`}
              aria-current={isSelected ? 'true' : undefined}
              className="cursor-pointer outline-none"
              style={{ pointerEvents: 'all' }}
              onFocus={() => setSelectedId(e.id)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault()
                  openEventDetail(e.id)
                }
              }}
            />
            <motion.line
              stroke={TIMELINE_STROKE.tick}
              strokeWidth={0.9}
              strokeLinecap="round"
              initial={false}
              animate={{
                x1: tick.x1,
                y1: tick.y1,
                x2: tick.x2,
                y2: tick.y2,
                opacity: tickOpacity,
              }}
              transition={tickTransition}
              style={{ pointerEvents: 'none' }}
            />
            <motion.circle
              cx={center.x}
              cy={center.y}
              r={baseR}
              fill="none"
              stroke={markStroke}
              initial={false}
              animate={{
                cx: center.x,
                cy: center.y,
                r: isHovered ? baseR * NODE_HOVER_SCALE : baseR,
                strokeWidth: markW,
                strokeOpacity: isSelected ? 1 : isHovered ? 0.96 : 0.88,
              }}
              transition={nodeTransition}
              style={{ pointerEvents: 'none' }}
            />
          </g>
        )
      })}
    </svg>
  )
}
