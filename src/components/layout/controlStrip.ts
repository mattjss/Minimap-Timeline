import type { CSSProperties } from 'react'

/** Shared geometry for topic trigger + mode slots (one control family). */
export const CONTROL_HIT_PX = 32

/** Outer strip chrome — matches topic panel material family. */
export const controlStripSurfaceStyle: CSSProperties = {
  backgroundColor: 'color-mix(in oklch, var(--color-canvas) 90%, transparent)',
  borderColor: 'color-mix(in oklch, var(--color-ink) 3.2%, transparent)',
  borderWidth: 1,
  borderStyle: 'solid',
  boxShadow:
    'inset 0 1px 0 color-mix(in oklch, var(--color-ink) 1.6%, transparent)',
}
