import type { CuratedTopic, TopicGroupId, TopicId } from '../types'
import { aiHistorySeedEvents } from './seeds/aiHistory'
import { appleSeedEvents } from './seeds/apple'
import { gsWarriorsSeedEvents } from './seeds/gsWarriors'
import { nintendoSeedEvents } from './seeds/nintendo'
import { nvidiaSeedEvents } from './seeds/nvidia'
import { sf49ersSeedEvents } from './seeds/sf49ers'
import { sfCityHistorySeedEvents } from './seeds/sfCityHistory'
import { sfGiantsSeedEvents } from './seeds/sfGiants'
import { sjSharksSeedEvents } from './seeds/sjSharks'
import { svTechHistorySeedEvents } from './seeds/svTechHistory'
import { usHistorySeedEvents } from './seeds/usHistory'
import { xboxSeedEvents } from './seeds/xbox'
import { ycombinatorSeedEvents } from './seeds/ycombinator'

/** Stable group labels for menus and future accordion / section UI. */
export const TOPIC_GROUP_LABELS: Record<TopicGroupId, string> = {
  sports: 'Sports',
  tech: 'Tech',
  history: 'History',
  gaming: 'Gaming',
}

export function topicGroupLabel(groupId: TopicGroupId): string {
  return TOPIC_GROUP_LABELS[groupId]
}

/**
 * Canonical curated topics: metadata + seed events.
 * Order defines default dropdown sequence within each group.
 */
export const CURATED_TOPICS: readonly CuratedTopic[] = [
  {
    id: 'sf-giants',
    label: 'SF Giants history',
    trigger: 'SF Giants',
    groupId: 'sports',
    description:
      'San Francisco Giants milestones: pennants, ballparks, icons, and October moments.',
    accentColor: '#f47920',
    events: sfGiantsSeedEvents,
  },
  {
    id: 'sf-49ers',
    label: 'SF 49ers history',
    trigger: 'SF 49ers',
    groupId: 'sports',
    description:
      'San Francisco 49ers eras: Walsh, Montana, Young, Harbaugh, and Levi’s Stadium.',
    accentColor: '#aa0000',
    events: sf49ersSeedEvents,
  },
  {
    id: 'gs-warriors',
    label: 'Golden State Warriors history',
    trigger: 'Warriors',
    groupId: 'sports',
    description:
      'Bay Area basketball: Philadelphia roots, Oakland glory, Chase Center, and dynasties.',
    accentColor: '#1d428a',
    events: gsWarriorsSeedEvents,
  },
  {
    id: 'sj-sharks',
    label: 'San Jose Sharks history',
    trigger: 'Sharks',
    groupId: 'sports',
    description:
      'Sharks hockey: expansion, teal culture, playoff runs, and SAP Center era.',
    accentColor: '#007889',
    events: sjSharksSeedEvents,
  },
  {
    id: 'sv-tech',
    label: 'Silicon Valley Tech History',
    trigger: 'Silicon Valley',
    groupId: 'tech',
    description:
      'Valley formation: semiconductors, venture capital, internet waves, and platform shifts.',
    accentColor: '#8b7fd6',
    events: svTechHistorySeedEvents,
  },
  {
    id: 'apple',
    label: 'Apple history',
    trigger: 'Apple',
    groupId: 'tech',
    description:
      'Apple Computer to ecosystem: Mac, iPod, iPhone, silicon, services, and spatial computing.',
    accentColor: '#2997ff',
    events: appleSeedEvents,
  },
  {
    id: 'ycombinator',
    label: 'Y Combinator history',
    trigger: 'Y Combinator',
    groupId: 'tech',
    description:
      'The accelerator playbook: batches, SAFEs, alumni waves, and global founder funnel.',
    accentColor: '#ff6600',
    events: ycombinatorSeedEvents,
  },
  {
    id: 'nvidia',
    label: 'Nvidia history',
    trigger: 'Nvidia',
    groupId: 'tech',
    description:
      'Graphics to AI compute: GeForce, CUDA, data-center GPUs, and the GenAI stack.',
    accentColor: '#76b900',
    events: nvidiaSeedEvents,
  },
  {
    id: 'ai-history',
    label: 'AI history',
    trigger: 'AI',
    groupId: 'tech',
    description:
      'Artificial intelligence arcs: symbolic winters, deep learning, transformers, and LLMs.',
    accentColor: '#00c4b4',
    events: aiHistorySeedEvents,
  },
  {
    id: 'sf-city',
    label: 'San Francisco City History',
    trigger: 'San Francisco',
    groupId: 'history',
    description:
      'The city’s layers: Gold Rush, earthquakes, bridges, counterculture, and tech boom.',
    accentColor: '#c9ae7a',
    events: sfCityHistorySeedEvents,
  },
  {
    id: 'us-history',
    label: 'United States History',
    trigger: 'U.S. history',
    groupId: 'history',
    description:
      'National milestones: founding, expansion, civil rights, wars, and modern governance.',
    accentColor: '#c4a35a',
    events: usHistorySeedEvents,
  },
  {
    id: 'nintendo',
    label: 'Nintendo history',
    trigger: 'Nintendo',
    groupId: 'gaming',
    description:
      'Hardware eras, first-party franchises, handhelds, online services, and platform pivots.',
    accentColor: '#e60012',
    events: nintendoSeedEvents,
  },
  {
    id: 'xbox',
    label: 'Xbox history',
    trigger: 'Xbox',
    groupId: 'gaming',
    description:
      'Console generations, Xbox Live, Game Pass, studios, and cloud gaming strategy.',
    accentColor: '#107c10',
    events: xboxSeedEvents,
  },
]

/** Session storage and validation: all known topic ids. */
export const CURATED_TOPIC_IDS: readonly TopicId[] = CURATED_TOPICS.map((t) => t.id)

const TOPIC_BY_ID = new Map<TopicId, CuratedTopic>(
  CURATED_TOPICS.map((t) => [t.id, t]),
)

export function getCuratedTopicById(id: TopicId): CuratedTopic {
  return TOPIC_BY_ID.get(id) ?? CURATED_TOPICS[0]!
}
