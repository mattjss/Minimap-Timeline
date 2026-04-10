/**
 * Shared layout + node styling for timeline modes (SF Giants / future topics).
 * Coordinates are SVG user units for the main stage viewBox.
 * Radial mode: 90° dial anchored at the bottom-right corner (center on corner point).
 */
export const TIMELINE_VIEW = {
  w: 640,
  h: 380,
} as const

/** Visible arc span — quarter circle (dial in the corner). */
export const RADIAL_QUARTER_SWEEP = Math.PI / 2

/** Center of radial geometry: bottom-right of the viewBox (arc hangs off top/left). */
export function radialCenter(viewW: number, viewH: number): { cx: number; cy: number } {
  return { cx: viewW, cy: viewH }
}

export function radialTrackRadius(viewW: number, viewH: number): number {
  return Math.min(viewW, viewH) * 0.9
}

export function radialSweep(): number {
  return RADIAL_QUARTER_SWEEP
}

/**
 * u ∈ [0,1] along the quarter arc: from west (along bottom toward −x) to north (−y in SVG).
 * Chronology matches H/V left→right / top→bottom mapping.
 */
export function radialAngleAtU0(): number {
  return Math.PI
}

export function radialAngleForU(u: number): number {
  return Math.PI + u * RADIAL_QUARTER_SWEEP
}

/** SVG path for the primary radial track (90° arc). */
export function radialTrackArcPath(viewW: number, viewH: number): string {
  const { cx, cy } = radialCenter(viewW, viewH)
  const TRACK_R = radialTrackRadius(viewW, viewH)
  const a0 = radialAngleForU(0)
  const a1 = radialAngleForU(1)
  const x0 = cx + TRACK_R * Math.cos(a0)
  const y0 = cy + TRACK_R * Math.sin(a0)
  const x1 = cx + TRACK_R * Math.cos(a1)
  const y1 = cy + TRACK_R * Math.sin(a1)
  const largeArc = 0
  return `M ${x0} ${y0} A ${TRACK_R} ${TRACK_R} 0 ${largeArc} 1 ${x1} ${y1}`
}

export type ImportanceLevel = 1 | 2 | 3

export const TIMELINE_MARK_RADIUS = 0.78

/** @deprecated Use TIMELINE_MARK_RADIUS — kept for call-site compatibility. */
export function importanceRadius(_importance: ImportanceLevel): number {
  return TIMELINE_MARK_RADIUS
}

export const NODE_HOVER_SCALE = 1.02

export const NODE_SELECT_RING_PAD = 0.65

export const NODE_FILL_MUTED = '#5c564e'

export const NODE_FILL_MUTED_HOVER = '#6a635a'

export const NODE_FILL_ACCENT = '#d4cfc6'

export const NODE_FILL_ACCENT_RING = '#c9ae7a'

export const NODE_GLOW_FILTER_ID = 'timeline-node-glow'
