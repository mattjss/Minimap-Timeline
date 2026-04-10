import type { TimelineLayoutMode } from '../../types'
import { cn } from '../../lib/utils'

/**
 * Edge-anchored stage regions — sizes are Tailwind-only so Framer `layout` can interpolate.
 * (Do not pair with `animate={{ left: 'auto' }}` — that breaks transitions.)
 *
 * — Horizontal: full-width bottom band; SVG uses preserveAspectRatio none so the spine spans
 *   the entire stage width (no letterboxing).
 * — Vertical: full content area; spine is laid out along the left edge of the viewBox and
 *   stretches with the full-width stage.
 * — Radial: same full-width bottom band as horizontal; semicircle arc corner-to-corner in the viewBox
 *   along the bottom edge (preserveAspectRatio none).
 */
export function stageSceneClasses(mode: TimelineLayoutMode): string {
  switch (mode) {
    case 'horizontal':
      return cn(
        'left-0 right-0 bottom-0 top-auto w-full max-w-none',
        'max-h-full',
        'h-[min(52dvh,680px)] min-h-[260px]',
      )
    case 'vertical':
      return cn(
        'left-0 right-0 top-0 bottom-0',
        'h-full min-h-0 max-h-full w-full max-w-none',
      )
    case 'radial':
      return cn(
        'left-0 right-0 bottom-0 top-auto w-full max-w-none',
        'max-h-full',
        'h-[min(52dvh,680px)] min-h-[260px]',
      )
    default:
      return cn(
        'left-0 right-0 bottom-0 top-auto w-full max-w-none',
        'max-h-full',
        'h-[min(52dvh,680px)] min-h-[260px]',
      )
  }
}
