import { motion, useReducedMotion } from 'framer-motion'
import { useMemo } from 'react'
import { getSortedSfGiantsEvents } from '../../data/seeds/sfGiants'
import {
  referenceLayoutMorphSpring,
  shellMicroSpring,
  timelineModeSyncSpring,
} from '../../lib/motion'
import { stageRelativeAnchorAboveNode } from '../../lib/svgPointer'
import {
  importanceRadius,
  NODE_FILL_ACCENT,
  NODE_FILL_MUTED,
  NODE_FILL_MUTED_HOVER,
  NODE_HOVER_SCALE,
  NODE_SELECT_RING_PAD,
} from '../../lib/timelineVisual'
import { useAppStore } from '../../store/useAppStore'
import { computeSceneLayout, TIMELINE_CY, TIMELINE_VIEW } from './timelineLayoutMath'

const { w: W, h: H } = TIMELINE_VIEW

/**
 * One SVG scene: nodes and guides interpolate between H / V / Radial geometries
 * (no per-mode remount — continuous transformation).
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

  const events = useMemo(() => {
    const useGiants =
      activeTopicId === 'sf-giants' || activeTopicId === null
    if (!useGiants) return []
    return getSortedSfGiantsEvents()
  }, [activeTopicId])

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
  const morphCenter = { cx: morph, cy: morph, r: morph } as const
  const tickTransition = {
    ...morphXY,
    opacity: shellMicroSpring,
  } as const
  /** cx/cy use layout morph spring; r uses micro spring (hover bump + no SVG transform scale). */
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
        aria-label="No timeline events for this topic"
      >
        <line
          x1={58}
          y1={TIMELINE_CY}
          x2={W - 58}
          y2={TIMELINE_CY}
          stroke="currentColor"
          strokeWidth={1}
          strokeOpacity={0.22}
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full cursor-default overflow-hidden text-ink/22"
      fill="none"
      role="group"
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

      {layout.decadeTicks.map(({ year, x }) => (
        <motion.line
          key={`decade-${year}`}
          stroke="currentColor"
          strokeWidth={1}
          initial={false}
          animate={{
            x1: x,
            y1: TIMELINE_CY - 44,
            x2: x,
            y2: TIMELINE_CY + 44,
            opacity: timelineMode === 'horizontal' ? 0.07 : 0,
          }}
          transition={{
            ...morphXY,
            opacity: spineOpacityTransition,
          }}
          style={{ pointerEvents: 'none' }}
        />
      ))}

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
          opacity: timelineMode === 'radial' ? 0 : 0.22,
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
          opacity: timelineMode === 'radial' ? 0.22 : 0,
        }}
        transition={{ opacity: spineOpacityTransition }}
        style={{ pointerEvents: 'none' }}
      />

      {events.map((e, i) => {
        const center = layout.nodeCenters[i]!
        const tick = layout.nodeTicks[i]!
        const baseR = importanceRadius(e.importance)
        const isSelected = selectedId === e.id
        const isHovered = hoverId === e.id
        const fill = isSelected
          ? NODE_FILL_ACCENT
          : isHovered
            ? NODE_FILL_MUTED_HOVER
            : NODE_FILL_MUTED

        const tickBase =
          timelineMode === 'horizontal'
            ? 0.18
            : timelineMode === 'vertical'
              ? 0.16
              : 0.11

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
                  ? timelineMode === 'horizontal'
                    ? 0.35
                    : timelineMode === 'vertical'
                      ? 0.32
                      : 0.26
                  : isHovered
                    ? tickBase + 0.08
                    : tickBase,
              }}
              transition={tickTransition}
              style={{ pointerEvents: 'none' }}
            />
            <motion.circle
              fill="none"
              stroke={NODE_FILL_ACCENT}
              strokeWidth={1}
              initial={false}
              animate={{
                cx: center.x,
                cy: center.y,
                r: baseR + NODE_SELECT_RING_PAD,
                strokeOpacity: isSelected ? 0.2 : 0,
              }}
              transition={morphCenter}
              style={{ pointerEvents: 'none' }}
            />
            <motion.circle
              cx={center.x}
              cy={center.y}
              r={baseR}
              fill={fill}
              initial={false}
              animate={{
                cx: center.x,
                cy: center.y,
                r: isHovered ? baseR * NODE_HOVER_SCALE : baseR,
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
