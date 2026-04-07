import type { TimelineLayoutMode, TopicId } from '../../types'

export type TimelineShellSnapshot = {
  layoutMode: TimelineLayoutMode
  activeTopicId: TopicId | null
}

export type TopicBlueprint = {
  id: TopicId
  /** Curated seed count; does not drive schematic node count on canvas. */
  seedEventCount: number
}
