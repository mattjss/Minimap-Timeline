import { CURATED_TOPICS } from '../../data/curatedTopics'
import { getSortedEventsForTopic } from '../../data/topicEvents'
import type { TopicId } from '../../types'
import type { TopicBlueprint } from './types'

export function getTopicBlueprint(id: TopicId): TopicBlueprint {
  return {
    id,
    seedEventCount: getSortedEventsForTopic(id).length,
  }
}

export function listTopicBlueprints(): TopicBlueprint[] {
  return CURATED_TOPICS.map(({ id }) => getTopicBlueprint(id))
}
