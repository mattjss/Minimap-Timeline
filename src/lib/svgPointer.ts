import type { TimelineLayoutMode } from '../types'

/**
 * Anchor point for hover preview in stage-local coordinates, biased toward the
 * “open” quadrant for the current layout mode (reference composition).
 */
export function stageRelativeHoverAnchor(
  groupEl: SVGGElement,
  mode: TimelineLayoutMode,
): { relX: number; relY: number } | null {
  const stage = groupEl.closest('[data-timeline-stage]')
  if (!stage) return null
  const nodeBounds = groupEl.getBoundingClientRect()
  const stageBounds = stage.getBoundingClientRect()
  const cx = nodeBounds.left - stageBounds.left + nodeBounds.width / 2
  const cyTop = nodeBounds.top - stageBounds.top
  const cyMid = cyTop + nodeBounds.height / 2

  switch (mode) {
    case 'horizontal':
      return { relX: cx, relY: cyTop }
    case 'vertical':
      return {
        relX: nodeBounds.right - stageBounds.left + 6,
        relY: cyMid,
      }
    case 'radial':
      return {
        relX: nodeBounds.left - stageBounds.left - 6,
        relY: cyMid,
      }
    default:
      return { relX: cx, relY: cyTop }
  }
}

/** @deprecated Use stageRelativeHoverAnchor(group, mode) */
export function stageRelativeAnchorAboveNode(
  groupEl: SVGGElement,
): { relX: number; relY: number } | null {
  return stageRelativeHoverAnchor(groupEl, 'horizontal')
}
