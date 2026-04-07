/**
 * Anchor above the event node, in coordinates relative to `[data-timeline-stage]`
 * (in-scene hover card; not viewport-fixed).
 */
export function stageRelativeAnchorAboveNode(
  groupEl: SVGGElement,
): { relX: number; relY: number } | null {
  const stage = groupEl.closest('[data-timeline-stage]')
  if (!stage) return null
  const nodeBounds = groupEl.getBoundingClientRect()
  const stageBounds = stage.getBoundingClientRect()
  return {
    relX: nodeBounds.left - stageBounds.left + nodeBounds.width / 2,
    relY: nodeBounds.top - stageBounds.top,
  }
}
