import { motion } from 'framer-motion'
import type { Transition } from 'framer-motion'
import { REFERENCE_SCHEMATIC_NODE_COUNT } from '../../lib/referenceShell'
import { TIMELINE_STROKE } from '../../lib/timelineTheme'
import {
  radialAngleForU,
  radialCenter,
  radialTrackArcPath,
  radialTrackRadius,
  TIMELINE_MARK_RADIUS,
  TIMELINE_VIEW,
} from '../../lib/timelineVisual'
import type { TimelineLayoutMode } from '../../types'

const W = TIMELINE_VIEW.w
const H = TIMELINE_VIEW.h
const CX = W / 2
const CY = H / 2
const RCX = radialCenter(W, H).cx
const RCY = radialCenter(W, H).cy
const NODE_COUNT = REFERENCE_SCHEMATIC_NODE_COUNT
const X_PAD = W * 0.11
const Y_PAD = H * 0.13
const NODE_R = TIMELINE_MARK_RADIUS * 0.44
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
      return {
        x: RCX + RADIAL_R * Math.cos(angle),
        y: RCY + RADIAL_R * Math.sin(angle),
      }
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
  const k = 7
  switch (mode) {
    case 'horizontal':
      return { x1: x, y1: y - k, x2: x, y2: y + k }
    case 'vertical':
      return { x1: x - k, y1: y, x2: x + k, y2: y }
    case 'radial': {
      const angle = Math.atan2(y - RCY, x - RCX)
      const tx = -Math.sin(angle)
      const ty = Math.cos(angle)
      const half = 5.5 * 0.92
      return {
        x1: x - tx * half,
        y1: y - ty * half,
        x2: x + tx * half,
        y2: y + ty * half,
      }
    }
    default:
      return { x1: x, y1: y, x2: x, y2: y }
  }
}

function primarySpine(mode: TimelineLayoutMode) {
  switch (mode) {
    case 'horizontal':
      return { x1: X_PAD, y1: CY, x2: W - X_PAD, y2: CY, opacity: 1 }
    case 'vertical':
      return { x1: CX, y1: Y_PAD, x2: CX, y2: H - Y_PAD, opacity: 1 }
    case 'radial':
      return { x1: CX, y1: CY, x2: CX, y2: CY, opacity: 0 }
    default:
      return { x1: CX, y1: CY, x2: CX, y2: CY, opacity: 0 }
  }
}

const RADIAL_TRACK_D = radialTrackArcPath(W, H)

type SchematicTimelineProps = {
  mode: TimelineLayoutMode
  transition: Transition
}

/** Empty-topic fallback — same stroke system as `UnifiedDataTimeline`. */
export function SchematicTimeline({ mode, transition }: SchematicTimelineProps) {
  const spine = primarySpine(mode)
  const radialTrackOpacity = mode === 'radial' ? 1 : 0

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-full w-full overflow-visible"
      fill="none"
      aria-hidden
    >
      <motion.path
        fill="none"
        stroke={TIMELINE_STROKE.spine}
        strokeWidth={1.2}
        strokeLinecap="round"
        d={RADIAL_TRACK_D}
        animate={{ opacity: radialTrackOpacity }}
        transition={transition}
      />

      <motion.line
        stroke={TIMELINE_STROKE.spine}
        strokeWidth={1.2}
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
            stroke={TIMELINE_STROKE.tick}
            strokeWidth={0.9}
            strokeLinecap="round"
            animate={{
              x1: tick.x1,
              y1: tick.y1,
              x2: tick.x2,
              y2: tick.y2,
              opacity: 0.72,
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
            fill="none"
            stroke={TIMELINE_STROKE.mark}
            strokeWidth={0.65}
            animate={{
              cx: x,
              cy: y,
              strokeOpacity: 0.9,
            }}
            transition={transition}
          />
        )
      })}
    </svg>
  )
}
