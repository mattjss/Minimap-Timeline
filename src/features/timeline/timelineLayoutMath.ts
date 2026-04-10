import type { TimelineEvent, TimelineLayoutMode } from '../../types'
import {
  radialAngleForU,
  radialCenter,
  radialSweep,
  radialTrackArcPath,
  radialTrackRadius,
  TIMELINE_VIEW,
} from '../../lib/timelineVisual'

const { w: W, h: H } = TIMELINE_VIEW
export const TIMELINE_CX = W / 2
export const TIMELINE_CY = H / 2
const X0 = 12
const X1 = W - 12
const Y0 = 12
const Y1 = H - 12
const TICK_HALF = 5.25

/** Vertical mode: spine hugs the left edge of the stage (stretches with full-width SVG). */
export const VERTICAL_SPINE_X = Math.round(W * 0.068)

export type Point = { x: number; y: number }
export type Segment = { x1: number; y1: number; x2: number; y2: number }

export type ViewportBracket =
  | { kind: 'linear'; segment: Segment }
  | { kind: 'arc'; d: string }
  | { kind: 'dot'; cx: number; cy: number }

function paddedRange(tMin: number, tMax: number) {
  const span = tMax - tMin || 1
  const pad = span * 0.055
  return { t0: tMin - pad, t1: tMax + pad }
}

function timeToXRaw(dateStart: string, t0: number, t1: number): number {
  const t = new Date(dateStart).getTime()
  const u = t1 <= t0 ? 0.5 : (t - t0) / (t1 - t0)
  const clamped = Math.min(1, Math.max(0, u))
  return X0 + clamped * (X1 - X0)
}

function distributeNodeX(
  events: TimelineEvent[],
  t0: number,
  t1: number,
): number[] {
  const xs = events.map((e) => timeToXRaw(e.dateStart, t0, t1))
  const minGap = 26
  for (let i = 1; i < xs.length; i++) {
    xs[i] = Math.max(xs[i]!, xs[i - 1]! + minGap)
  }
  const left = xs[0]!
  const right = xs[xs.length - 1]!
  const span = right - left || 1
  const avail = X1 - X0
  return xs.map((x) => X0 + ((x - left) / span) * avail)
}

/**
 * Canonical normalized progress u ∈ [0, 1] for each event (same ordering as the scroll rail).
 * Vertical and radial minimaps are pure remaps of this 1D parameter.
 */
export function canonicalEventProgress(
  events: TimelineEvent[],
  tMin: number,
  tMax: number,
): { t0: number; t1: number; u: number[] } {
  const { t0, t1 } = paddedRange(tMin, tMax)
  const xs = distributeNodeX(events, t0, t1)
  const span = X1 - X0 || 1
  const u = xs.map((x) => (x - X0) / span)
  return { t0, t1, u }
}

/** Horizontal minimap: u → position on the spine line. */
export function minimapPointHorizontal(u: number): Point {
  return { x: X0 + u * (X1 - X0), y: TIMELINE_CY }
}

/** Vertical minimap: u → position on the spine line. */
export function minimapPointVertical(u: number): Point {
  return { x: VERTICAL_SPINE_X, y: Y0 + u * (Y1 - Y0) }
}

/** Radial minimap: u → position on the quarter-arc (center = bottom-right of viewBox). */
export function minimapPointRadial(u: number): Point {
  const { cx, cy } = radialCenter(W, H)
  const TRACK_R = radialTrackRadius(W, H)
  const angle = radialAngleForU(u)
  return {
    x: cx + TRACK_R * Math.cos(angle),
    y: cy + TRACK_R * Math.sin(angle),
  }
}

function tickThroughCenterHorizontal(x: number): Segment {
  return {
    x1: x,
    y1: TIMELINE_CY - TICK_HALF,
    x2: x,
    y2: TIMELINE_CY + TICK_HALF,
  }
}

function tickThroughCenterVertical(y: number): Segment {
  return {
    x1: VERTICAL_SPINE_X - TICK_HALF,
    y1: y,
    x2: VERTICAL_SPINE_X + TICK_HALF,
    y2: y,
  }
}

/** Short hash perpendicular to radius at the mark — same grammar as H/V ticks, not a center spoke. */
function tickRadialPerpendicular(c: Point): Segment {
  const { cx, cy } = radialCenter(W, H)
  const angle = Math.atan2(c.y - cy, c.x - cx)
  const tx = -Math.sin(angle)
  const ty = Math.cos(angle)
  const half = TICK_HALF * 0.92
  return {
    x1: c.x - tx * half,
    y1: c.y - ty * half,
    x2: c.x + tx * half,
    y2: c.y + ty * half,
  }
}

/**
 * Visible span on the minimap: linear segment, circular arc along u, or a dot when one card dominates.
 */
export function computeViewportBracket(
  mode: TimelineLayoutMode,
  startIndex: number,
  endIndex: number,
  centers: Point[],
  u: number[],
): ViewportBracket | null {
  if (centers.length === 0 || u.length === 0) return null
  let i0 = Math.min(startIndex, endIndex)
  let i1 = Math.max(startIndex, endIndex)
  i0 = Math.max(0, Math.min(i0, centers.length - 1))
  i1 = Math.max(0, Math.min(i1, centers.length - 1))

  if (i0 === i1) {
    const c = centers[i0]!
    return { kind: 'dot', cx: c.x, cy: c.y }
  }

  if (mode === 'horizontal') {
    const c0 = centers[i0]!
    const c1 = centers[i1]!
    return {
      kind: 'linear',
      segment: {
        x1: c0.x,
        y1: TIMELINE_CY,
        x2: c1.x,
        y2: TIMELINE_CY,
      },
    }
  }

  if (mode === 'vertical') {
    const c0 = centers[i0]!
    const c1 = centers[i1]!
    return {
      kind: 'linear',
      segment: {
        x1: TIMELINE_CX,
        y1: c0.y,
        x2: TIMELINE_CX,
        y2: c1.y,
      },
    }
  }

  const { cx: rcx, cy: rcy } = radialCenter(W, H)
  const TRACK_R = radialTrackRadius(W, H) - 4
  const a0 = radialAngleForU(u[i0]!)
  const a1 = radialAngleForU(u[i1]!)
  const spanAngle = (u[i1]! - u[i0]!) * radialSweep()
  const x0 = rcx + TRACK_R * Math.cos(a0)
  const y0 = rcy + TRACK_R * Math.sin(a0)
  const x1 = rcx + TRACK_R * Math.cos(a1)
  const y1 = rcy + TRACK_R * Math.sin(a1)
  const largeArc = Math.abs(spanAngle) > Math.PI ? 1 : 0
  const d = `M ${x0} ${y0} A ${TRACK_R} ${TRACK_R} 0 ${largeArc} 1 ${x1} ${y1}`
  return { kind: 'arc', d }
}

export type ComputedSceneLayout = {
  /** Normalized chronology parameter per event (shared across minimap modes). */
  u: number[]
  nodeCenters: Point[]
  nodeTicks: Segment[]
  /** Horizontal / vertical primary guide (line spine). */
  spineLine: Segment
  /** Radial arc `d`; opacity handled in view. */
  spineArcD: string
}

export function computeSceneLayout(
  events: TimelineEvent[],
  mode: TimelineLayoutMode,
  tMin: number,
  tMax: number,
): ComputedSceneLayout {
  const { u } = canonicalEventProgress(events, tMin, tMax)

  const nodeCenters: Point[] = []
  const nodeTicks: Segment[] = []

  if (mode === 'horizontal') {
    events.forEach((_e, i) => {
      const { x, y } = minimapPointHorizontal(u[i]!)
      nodeCenters.push({ x, y })
      nodeTicks.push(tickThroughCenterHorizontal(x))
    })
    return {
      u,
      nodeCenters,
      nodeTicks,
      spineLine: { x1: X0, y1: TIMELINE_CY, x2: X1, y2: TIMELINE_CY },
      spineArcD: radialTrackArcPath(W, H),
    }
  }

  if (mode === 'vertical') {
    events.forEach((_e, i) => {
      const { x, y } = minimapPointVertical(u[i]!)
      nodeCenters.push({ x, y })
      nodeTicks.push(tickThroughCenterVertical(y))
    })
    return {
      u,
      nodeCenters,
      nodeTicks,
      spineLine: {
        x1: VERTICAL_SPINE_X,
        y1: Y0,
        x2: VERTICAL_SPINE_X,
        y2: Y1,
      },
      spineArcD: radialTrackArcPath(W, H),
    }
  }

  events.forEach((_e, i) => {
    const c = minimapPointRadial(u[i]!)
    nodeCenters.push(c)
    nodeTicks.push(tickRadialPerpendicular(c))
  })

  return {
    u,
    nodeCenters,
    nodeTicks,
    spineLine: { x1: X0, y1: TIMELINE_CY, x2: X1, y2: TIMELINE_CY },
    spineArcD: radialTrackArcPath(W, H),
  }
}

export { TIMELINE_VIEW }
