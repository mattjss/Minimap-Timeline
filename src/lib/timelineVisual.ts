/**
 * Shared layout + node styling for timeline modes (SF Giants / future topics).
 * Coordinates are SVG user units for the main stage viewBox.
 * Nodes stay small and reference-faithful — minimal importance spread, no glow.
 */
export const TIMELINE_VIEW = {
  w: 640,
  h: 380,
} as const

/** Shared circular-timeline geometry: one arc with a small gap (not a closed planet ring). */
export const RADIAL_ANGULAR_GAP = 0.1 * 2 * Math.PI

export function radialTrackRadius(viewW: number, viewH: number): number {
  return Math.min(viewW, viewH) * 0.36
}

export function radialSweep(): number {
  return 2 * Math.PI - RADIAL_ANGULAR_GAP
}

/** Start angle so u=0..1 maps along the arc clockwise (same order as H/V). */
export function radialAngleAtU0(): number {
  const sweep = radialSweep()
  return -Math.PI / 2 - sweep / 2 + RADIAL_ANGULAR_GAP / 2
}

export function radialAngleForU(u: number): number {
  return radialAngleAtU0() + u * radialSweep()
}

/** SVG path for the primary circular timeline track (single arc). */
export function radialTrackArcPath(viewW: number, viewH: number): string {
  const CX = viewW / 2
  const CY = viewH / 2
  const TRACK_R = radialTrackRadius(viewW, viewH)
  const sweep = radialSweep()
  const a0 = radialAngleForU(0)
  const a1 = radialAngleForU(1)
  const x0 = CX + TRACK_R * Math.cos(a0)
  const y0 = CY + TRACK_R * Math.sin(a0)
  const x1 = CX + TRACK_R * Math.cos(a1)
  const y1 = CY + TRACK_R * Math.sin(a1)
  const largeArc = sweep > Math.PI ? 1 : 0
  return `M ${x0} ${y0} A ${TRACK_R} ${TRACK_R} 0 ${largeArc} 1 ${x1} ${y1}`
}

export type ImportanceLevel = 1 | 2 | 3

/**
 * Single reference mark size (SVG user units). Importance is data-only; visuals stay uniform.
 */
export const TIMELINE_MARK_RADIUS = 0.92

/** @deprecated Use TIMELINE_MARK_RADIUS — kept for call-site compatibility. */
export function importanceRadius(_importance: ImportanceLevel): number {
  return TIMELINE_MARK_RADIUS
}

/** Near-flat hover — tick-like, not a soft orb. */
export const NODE_HOVER_SCALE = 1.004

/** Legacy ring offset (stroke-only marks use inline stroke width). */
export const NODE_SELECT_RING_PAD = 0.65

/** Muted ticks — closer to spine, less “diagram node”. */
export const NODE_FILL_MUTED = '#5c564e'

export const NODE_FILL_MUTED_HOVER = '#6a635a'

/** Selected: ink-forward dot; accent reserved for stroke hints elsewhere. */
export const NODE_FILL_ACCENT = '#d4cfc6'

export const NODE_FILL_ACCENT_RING = '#c9ae7a'

/** @deprecated Glow removed for reference fidelity; kept for any legacy filter ids. */
export const NODE_GLOW_FILTER_ID = 'timeline-node-glow'
