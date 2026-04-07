import type { TimelineLayoutMode } from '../../types'
import { cn } from '../../lib/utils'

/**
 * Scene architecture (reference model): no centered demo card.
 * — Horizontal: full-width strip along the bottom.
 * — Vertical: full-height strip along the left (purposeful open field to the right).
 * — Radial: oversized plane, corner-anchored, mostly off-canvas (cropped arc).
 */
export function stageSceneClasses(mode: TimelineLayoutMode): string {
  switch (mode) {
    case 'horizontal':
      return cn(
        'left-0 right-0 bottom-0 top-auto w-full',
        'h-[min(26vh,220px)] max-h-[220px]',
      )
    case 'vertical':
      return cn(
        'left-0 top-0 bottom-0 right-auto h-full',
        'w-[min(24vw,260px)] max-w-[260px] min-w-[200px]',
      )
    case 'radial':
      return cn(
        'left-auto top-auto right-0 bottom-0',
        'w-[min(118vw,1240px)] max-w-none',
        'aspect-[640/380]',
      )
    default:
      return 'left-0 right-0 bottom-0 top-auto h-[min(26vh,220px)] w-full'
  }
}

/** Framer position props — always complete to avoid sticky values across modes. */
export function stageSceneMotion(mode: TimelineLayoutMode): Record<string, string | number> {
  const z = { x: 0, y: 0 }
  switch (mode) {
    case 'horizontal':
      return { ...z, left: 0, right: 0, top: 'auto', bottom: 0 }
    case 'vertical':
      return { ...z, left: 0, right: 'auto', top: 0, bottom: 0 }
    case 'radial':
      return { ...z, left: 'auto', right: '-26%', top: 'auto', bottom: '-36%' }
    default:
      return { ...z, left: 0, right: 0, top: 'auto', bottom: 0 }
  }
}
