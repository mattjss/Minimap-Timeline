import type { TimelineLayoutMode } from '../../types'
import { cn } from '../../lib/utils'

/**
 * Edge-anchored stage regions — sizes are Tailwind-only so Framer `layout` can interpolate.
 * (Do not pair with `animate={{ left: 'auto' }}` — that breaks transitions.)
 *
 * — Horizontal: full width, flush bottom (within safe area on parent).
 * — Vertical: full height, flush left.
 * — Radial: large square in the bottom-right; SVG uses preserveAspectRatio xMaxYMax so the
 *   90° dial pins to the corner and the circle hangs off the top/left.
 */
export function stageSceneClasses(mode: TimelineLayoutMode): string {
  switch (mode) {
    case 'horizontal':
      return cn(
        'left-0 right-0 bottom-0 top-auto w-full',
        'h-[min(40vh,440px)] min-h-[240px]',
      )
    case 'vertical':
      return cn(
        'left-0 top-0 bottom-0 right-auto',
        'h-full w-[min(42vw,480px)] min-w-[300px]',
      )
    case 'radial':
      return cn(
        'left-auto top-auto right-0 bottom-0',
        'aspect-square w-[min(92vmin,600px)] max-w-[min(92vw,600px)]',
      )
    default:
      return cn(
        'left-0 right-0 bottom-0 top-auto w-full',
        'h-[min(40vh,440px)] min-h-[240px]',
      )
  }
}
