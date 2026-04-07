import type { TopicId, TimelineEvent } from '../types'
import { CURATED_TOPICS } from './curatedTopics'

const RAW: Record<TopicId, TimelineEvent[]> = Object.fromEntries(
  CURATED_TOPICS.map((t) => [t.id, t.events]),
) as Record<TopicId, TimelineEvent[]>

export function getSortedEventsForTopic(topicId: TopicId | null): TimelineEvent[] {
  if (topicId === null) return []
  const list = RAW[topicId]
  if (!list?.length) return []
  return [...list].sort((a, b) => a.dateStart.localeCompare(b.dateStart))
}

export function topicHasRenderableTimeline(topicId: TopicId | null): boolean {
  return getSortedEventsForTopic(topicId).length > 0
}
