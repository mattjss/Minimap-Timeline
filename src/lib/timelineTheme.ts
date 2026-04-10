/**
 * SVG stroke colors — aligned with Base Web dark `backgroundPrimary` (#161616).
 * Use these instead of `currentColor` + faint text utilities so geometry stays visible.
 */
export const TIMELINE_STROKE = {
  spine: 'var(--color-timeline-spine)',
  tick: 'var(--color-timeline-tick)',
  mark: 'var(--color-timeline-mark)',
  markEmphasis: 'var(--color-timeline-mark-emphasis)',
  muted: 'var(--color-timeline-muted)',
} as const
