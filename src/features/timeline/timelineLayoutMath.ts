import type { TimelineEvent, TimelineLayoutMode } from '../../types'
import {
  importanceRadius,
  radialAngleForU,
  radialTrackArcPath,
  radialTrackRadius,
  TIMELINE_VIEW,
} from '../../lib/timelineVisual'

const { w: W, h: H } = TIMELINE_VIEW
export const TIMELINE_CX = W / 2
export const TIMELINE_CY = H / 2
const X0 = 58
const X1 = W - 58
const Y0 = 52
const Y1 = H - 52
const NODE_OFFSET = 32

export type Point = { x: number; y: number }
export type Segment = { x1: number; y1: number; x2: number; y2: number }

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
  const minGap = 22
  for (let i = 1; i < xs.length; i++) {
    xs[i] = Math.max(xs[i]!, xs[i - 1]! + minGap)
  }
  const left = xs[0]!
  const right = xs[xs.length - 1]!
  const span = right - left || 1
  const avail = X1 - X0
  return xs.map((x) => X0 + ((x - left) / span) * avail)
}

function timeToYRaw(dateStart: string, t0: number, t1: number): number {
  const t = new Date(dateStart).getTime()
  const u = t1 <= t0 ? 0.5 : (t - t0) / (t1 - t0)
  const clamped = Math.min(1, Math.max(0, u))
  return Y0 + clamped * (Y1 - Y0)
}

function distributeNodeY(
  events: TimelineEvent[],
  t0: number,
  t1: number,
): number[] {
  const ys = events.map((e) => timeToYRaw(e.dateStart, t0, t1))
  const minGap = 18
  for (let i = 1; i < ys.length; i++) {
    ys[i] = Math.max(ys[i]!, ys[i - 1]! + minGap)
  }
  const top = ys[0]!
  const bottom = ys[ys.length - 1]!
  const span = bottom - top || 1
  const avail = Y1 - Y0
  return ys.map((y) => Y0 + ((y - top) / span) * avail)
}

function layoutRadialCenters(
  events: TimelineEvent[],
  tMin: number,
  tMax: number,
): Point[] {
  const span = tMax - tMin || 1
  let us = events.map((e) => {
    const t = new Date(e.dateStart).getTime()
    return (t - tMin) / span
  })
  const minStep = 0.042
  for (let i = 1; i < us.length; i++) {
    us[i] = Math.max(us[i]!, us[i - 1]! + minStep)
  }
  const maxU = us[us.length - 1]!
  if (maxU > 1) {
    us = us.map((u) => (u / maxU) * 0.98)
  }
  const TRACK_R = radialTrackRadius(W, H)
  return events.map((_, i) => {
    const angle = radialAngleForU(us[i]!)
    return {
      x: TIMELINE_CX + TRACK_R * Math.cos(angle),
      y: TIMELINE_CY + TRACK_R * Math.sin(angle),
    }
  })
}

function decadeTickXs(
  t0: number,
  t1: number,
  yMin: number,
  yMax: number,
): { year: number; x: number }[] {
  const start = Math.floor(yMin / 10) * 10
  const out: { year: number; x: number }[] = []
  for (let y = start; y <= yMax + 10; y += 10) {
    if (y < yMin - 5) continue
    const iso = `${y}-01-01`
    out.push({ year: y, x: timeToXRaw(iso, t0, t1) })
  }
  return out
}

export type ComputedSceneLayout = {
  nodeCenters: Point[]
  nodeTicks: Segment[]
  /** Horizontal / vertical primary guide (line spine). */
  spineLine: Segment
  /** Radial arc `d`; opacity handled in view. */
  spineArcD: string
  decadeTicks: { year: number; x: number }[]
}

export function computeSceneLayout(
  events: TimelineEvent[],
  mode: TimelineLayoutMode,
  tMin: number,
  tMax: number,
): ComputedSceneLayout {
  const { t0, t1 } = paddedRange(tMin, tMax)
  const years = events.map((e) => e.year)
  const yMin = years.length ? Math.min(...years) : 0
  const yMax = years.length ? Math.max(...years) : 0
  const decadeTicks = decadeTickXs(t0, t1, yMin, yMax)
  const TRACK_R = radialTrackRadius(W, H)

  const nodeCenters: Point[] = []
  const nodeTicks: Segment[] = []

  if (mode === 'horizontal') {
    const xs = distributeNodeX(events, t0, t1)
    events.forEach((_e, i) => {
      const x = xs[i]!
      nodeCenters.push({ x, y: TIMELINE_CY })
      nodeTicks.push({
        x1: x,
        y1: TIMELINE_CY - 8,
        x2: x,
        y2: TIMELINE_CY + 8,
      })
    })
    return {
      nodeCenters,
      nodeTicks,
      spineLine: { x1: X0, y1: TIMELINE_CY, x2: X1, y2: TIMELINE_CY },
      spineArcD: radialTrackArcPath(W, H),
      decadeTicks,
    }
  }

  if (mode === 'vertical') {
    const ys = distributeNodeY(events, t0, t1)
    events.forEach((e, i) => {
      const y = ys[i]!
      const sideRight = i % 2 === 0
      const nx = sideRight ? TIMELINE_CX + NODE_OFFSET : TIMELINE_CX - NODE_OFFSET
      const br = importanceRadius(e.importance)
      const tickEnd = sideRight ? nx - br - 2 : nx + br + 2
      nodeCenters.push({ x: nx, y })
      nodeTicks.push({
        x1: TIMELINE_CX,
        y1: y,
        x2: tickEnd,
        y2: y,
      })
    })
    return {
      nodeCenters,
      nodeTicks,
      spineLine: { x1: TIMELINE_CX, y1: Y0, x2: TIMELINE_CX, y2: Y1 },
      spineArcD: radialTrackArcPath(W, H),
      decadeTicks,
    }
  }

  // radial
  const centers = layoutRadialCenters(events, tMin, tMax)
  centers.forEach((c, i) => {
    const e = events[i]!
    const br = importanceRadius(e.importance)
    const angle = Math.atan2(c.y - TIMELINE_CY, c.x - TIMELINE_CX)
    const ux = Math.cos(angle)
    const uy = Math.sin(angle)
    nodeCenters.push(c)
    nodeTicks.push({
      x1: TIMELINE_CX + (TRACK_R - 9) * ux,
      y1: TIMELINE_CY + (TRACK_R - 9) * uy,
      x2: c.x + ux * (br + 1),
      y2: c.y + uy * (br + 1),
    })
  })
  return {
    nodeCenters,
    nodeTicks,
    spineLine: { x1: X0, y1: TIMELINE_CY, x2: X1, y2: TIMELINE_CY },
    spineArcD: radialTrackArcPath(W, H),
    decadeTicks,
  }
}

export { TIMELINE_VIEW }
