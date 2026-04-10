import type { CSSProperties } from 'react'

/** Quiet hit target — small; presentation stays annotation-scale */
export const CONTROL_HIT_PX = 32

/** Whisper chrome — not a dashboard pill */
export const controlStripSurfaceStyle: CSSProperties = {
  backgroundColor: 'var(--color-chrome-surface)',
  borderColor: 'var(--color-chrome-border)',
  borderWidth: 1,
  borderStyle: 'solid',
  boxShadow: 'none',
}
