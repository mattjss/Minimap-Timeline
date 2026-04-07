import { motion } from 'framer-motion'
import type { Transition } from 'framer-motion'
import { REFERENCE_SCHEMATIC_NODE_COUNT } from '../../lib/referenceShell'
import {
  radialAngleForU,
  radialTrackArcPath,
  radialTrackRadius,
  TIMELINE_VIEW,
} from '../../lib/timelineVisual'
import type { TimelineLayoutMode } from '../../types'

const W = TIMELINE_VIEW.w
const H = TIMELINE_VIEW.h
const CX = W / 2
const CY = H / 2
const NODE_COUNT = REFERENCE_SCHEMATIC_NODE_COUNT
const X_PAD = W * 0.11
const Y_PAD = H * 0.13
const NODE_R = 3.25
const NODE_OPACITY = 0.44
const RADIAL_R = radialTrackRadius(W, H)

function nodePosition(mode: TimelineLayoutMode, i: number) {
  const t = i / (NODE_COUNT - 1 || 1)
  switch (mode) {
    case 'horizontal':
      return { x: X_PAD + t * (W - 2 * X_PAD), y: CY }
    case 'vertical':
      return { x: CX, y: Y_PAD + t * (H - 2 * Y_PAD) }
    case 'radial': {
      const u = i / (NODE_COUNT - 1 || 1)
      const angle = radialAngleForU(u)
      return { x: CX + RADIAL_R * Math.cos(angle), y: CY + RADIAL_R * Math.sin(angle) }
    }
    default:
      return { x: CX, y: CY }
  }
}

function tickEndpoints(
  mode: TimelineLayoutMode,
  x: number,
  y: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const k = 11
  switch (mode) {
    case 'horizontal':
      return { x1: x, y1: y - k, x2: x, y2: y + k }
    case 'vertical':
      return { x1: x - k, y1: y, x2: x + k, y2: y }
    case 'radial': {
      const dx = x - CX
      const dy = y - CY
      const len = Math.hypot(dx, dy) || 1
      const ux = dx / len
      const uy = dy / len
      return {
        x1: x - ux * 6,
        y1: y - uy * 6,
        x2: x + ux * 10,
        y2: y + uy * 10,
      }
    }
    default:
      return { x1: x, y1: y, x2: x, y2: y }
  }
}

function primarySpine(mode: TimelineLayoutMode) {
  switch (mode) {
    case 'horizontal':
      return { x1: X_PAD, y1: CY, x2: W - X_PAD, y2: CY, opacity: 0.3 }
    case 'vertical':
      return { x1: CX, y1: Y_PAD, x2: CX, y2: H - Y_PAD, opacity: 0.3 }
    case 'radial':
      return { x1: CX, y1: CY, x2: CX, y2: CY, opacity: 0 }
    default:
      return { x1: CX, y1: CY, x2: CX, y2: CY, opacity: 0 }
  }
}

const RADIAL_TRACK_D = radialTrackArcPath(W, H)

function cornerBrackets() {
  const m = W * 0.055
  const s = W * 0.035
  const o = 0.09
  return (
    <g className="text-ink" stroke="currentColor" fill="none" strokeWidth={0.75}>
      <path d={`M ${m} ${m + s} L ${m} ${m} L ${m + s} ${m}`} strokeOpacity={o} />
      <path
        d={`M ${W - m - s} ${m} L ${W - m} ${m} L ${W - m} ${m + s}`}
        strokeOpacity={o}
      />
      <path
        d={`M ${W - m} ${H - m - s} L ${W - m} ${H - m} L ${W - m - s} ${H - m}`}
        strokeOpacity={o}
      />
      <path
        d={`M ${m + s} ${H - m} L ${m} ${H - m} L ${m} ${H - m - s}`}
        strokeOpacity={o}
      />
    </g>
  )
}

type SchematicTimelineProps = {
  mode: TimelineLayoutMode
  transition: Transition
}

/** Empty-topic fallback; matches stage viewBox. */
export function SchematicTimeline({ mode, transition }: SchematicTimelineProps) {
  const spine = primarySpine(mode)
  const radialTrackOpacity = mode === 'radial' ? 0.2 : 0

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full overflow-visible text-ink/22"
      fill="none"
      aria-hidden
    >
      {cornerBrackets()}

      <motion.path
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        d={RADIAL_TRACK_D}
        animate={{ opacity: radialTrackOpacity }}
        transition={transition}
      />

      <motion.line
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        animate={{
          x1: spine.x1,
          y1: spine.y1,
          x2: spine.x2,
          y2: spine.y2,
          opacity: spine.opacity,
        }}
        transition={transition}
      />

      {Array.from({ length: NODE_COUNT }, (_, i) => {
        const { x, y } = nodePosition(mode, i)
        const tick = tickEndpoints(mode, x, y)
        return (
          <motion.line
            key={`tick-${i}`}
            stroke="currentColor"
            strokeWidth={1}
            strokeLinecap="round"
            animate={{
              x1: tick.x1,
              y1: tick.y1,
              x2: tick.x2,
              y2: tick.y2,
              opacity: 0.26,
            }}
            transition={transition}
          />
        )
      })}

      {Array.from({ length: NODE_COUNT }, (_, i) => {
        const { x, y } = nodePosition(mode, i)
        return (
          <motion.circle
            key={i}
            r={NODE_R}
            fill="currentColor"
            className="text-ink"
            animate={{
              cx: x,
              cy: y,
              opacity: NODE_OPACITY,
            }}
            transition={transition}
          />
        )
      })}
    </svg>
  )
}
