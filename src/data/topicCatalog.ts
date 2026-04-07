import type { TopicGroupId, TopicId } from '../types'
import {
  CURATED_TOPICS,
  getCuratedTopicById,
  topicGroupLabel,
} from './curatedTopics'

/** Compact shape for legacy call sites and simple lists. */
export const TOPIC_OPTIONS: readonly {
  id: TopicId
  label: string
  trigger: string
}[] = CURATED_TOPICS.map(({ id, label, trigger }) => ({
  id,
  label,
  trigger,
}))

/** Dropdown / future grouped nav: includes family metadata. */
export type TopicSelectorRow = {
  id: TopicId
  label: string
  trigger: string
  groupId: TopicGroupId
  groupLabel: string
  description: string
  accentColor: string
}

export const TOPIC_SELECTOR_ROWS: TopicSelectorRow[] = CURATED_TOPICS.map((t) => ({
  id: t.id,
  label: t.label,
  trigger: t.trigger,
  groupId: t.groupId,
  groupLabel: topicGroupLabel(t.groupId),
  description: t.description,
  accentColor: t.accentColor,
}))

export function topicLabel(id: TopicId): string {
  return getCuratedTopicById(id).label
}

export function topicDescription(id: TopicId): string {
  return getCuratedTopicById(id).description
}

export function topicAccentColor(id: TopicId): string {
  return getCuratedTopicById(id).accentColor
}
