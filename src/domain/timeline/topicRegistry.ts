import {
  gsWarriorsSeedEvents,
  sf49ersSeedEvents,
  sfCityHistorySeedEvents,
  sfGiantsSeedEvents,
  sjSharksSeedEvents,
  svTechHistorySeedEvents,
  usHistorySeedEvents,
} from '../../data'
import type { TopicId } from '../../types'
import type { TopicBlueprint } from './types'

const TOPICS: Record<TopicId, TopicBlueprint> = {
  'sf-giants': {
    id: 'sf-giants',
    seedEventCount: sfGiantsSeedEvents.length,
  },
  'sf-49ers': {
    id: 'sf-49ers',
    seedEventCount: sf49ersSeedEvents.length,
  },
  'gs-warriors': {
    id: 'gs-warriors',
    seedEventCount: gsWarriorsSeedEvents.length,
  },
  'sj-sharks': {
    id: 'sj-sharks',
    seedEventCount: sjSharksSeedEvents.length,
  },
  'sv-tech': {
    id: 'sv-tech',
    seedEventCount: svTechHistorySeedEvents.length,
  },
  'sf-city': {
    id: 'sf-city',
    seedEventCount: sfCityHistorySeedEvents.length,
  },
  'us-history': {
    id: 'us-history',
    seedEventCount: usHistorySeedEvents.length,
  },
}

export function getTopicBlueprint(id: TopicId): TopicBlueprint {
  return TOPICS[id]
}

export function listTopicBlueprints(): TopicBlueprint[] {
  return Object.values(TOPICS)
}
