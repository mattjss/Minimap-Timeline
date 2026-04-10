/**
 * Shared layout + node styling for the main stage viewBox.
 * Radial mode: bottom **semicircle** — diameter runs **corner to corner** along the bottom edge
 * (x = 0 → W), bulging upward with a full half-turn so the track has a clear arc (not a shallow
 * flattened chord).
 */
export const TIMELINE_VIEW = {
  w: 640,
  h: 380,
} as const

/** Visible arc span — half circle along the bottom. */
export const RADIAL_SEMI_SWEEP = Math.PI

export type RadialTrackParams = {
  cx: number
  cy: number
  R: number
  xL: number
  xR: number
  thetaL: number
  thetaR: number
  sweep: number
}

/** Full radial geometry: semicircle through bottom-left and bottom-right corners. */
export function radialTrackParams(viewW: number, viewH: number): RadialTrackParams {
  const R = viewW / 2
  const cx = viewW / 2
  const cy = viewH
  return {
    cx,
    cy,
    R,
    xL: 0,
    xR: viewW,
    thetaL: Math.PI,
    thetaR: Math.PI * 2,
    sweep: RADIAL_SEMI_SWEEP,
  }
}

/** @deprecated Use RADIAL_SEMI_SWEEP */
export const RADIAL_QUARTER_SWEEP = RADIAL_SEMI_SWEEP

/** Circle center: midpoint of the bottom edge (semicircle hub). */
export function radialCenter(viewW: number, viewH: number): { cx: number; cy: number } {
  return { cx: viewW / 2, cy: viewH }
}

/** Semicircle radius (half the view width). */
export function radialTrackRadius(viewW: number, _viewH: number): number {
  return viewW / 2
}

export function radialSweep(): number {
  return RADIAL_SEMI_SWEEP
}

/**
 * u ∈ [0,1] along the upper semicircle: u=0 at bottom-left corner, u=1 at bottom-right.
 */
export function radialAngleAtU0(): number {
  return Math.PI
}

export function radialAngleForU(u: number): number {
  return Math.PI + u * RADIAL_SEMI_SWEEP
}

/**
 * Bottom semicircle from **corner to corner** (upper arc). Pins to x=0 and x=W on the bottom edge.
 */
export function radialTrackArcPath(viewW: number, viewH: number): string {
  const R = viewW / 2
  const cy = viewH
  const largeArc = 1
  const sweep = 1
  return `M 0 ${cy} A ${R} ${R} 0 ${largeArc} ${sweep} ${viewW} ${cy}`
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
