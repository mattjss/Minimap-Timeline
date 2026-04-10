import type { TopicGroupId, TopicId } from '../types'
import {
  CURATED_TOPICS,
  getCuratedTopicById,
  topicGroupLabel,
} from './curatedTopics'
import { getSortedEventsForTopic } from './topicEvents'

function topicYearRangeHint(id: TopicId): string {
  const ev = getSortedEventsForTopic(id)
  if (ev.length === 0) return 'Curated set'
  const y0 = ev[0]!.year
  const y1 = ev[ev.length - 1]!.year
  return y0 === y1 ? `${y0}` : `${y0}–${y1}`
}

function topicRichChrome(id: TopicId, groupId: TopicGroupId): {
  eventCount: number
  tags: string[]
  factSnippet: string | null
} {
  const events = getSortedEventsForTopic(id)
  const tags: string[] = []
  tags.push(topicGroupLabel(groupId))
  if (events.length > 0) tags.push(`${events.length} moments`)
  const mid = events[Math.floor(events.length / 2)]
  if (mid?.category) tags.push(mid.category)
  if (mid?.subtype) tags.push(mid.subtype.replace(/-/g, ' '))
  const evWithFacts = events.find((e) => e.facts && e.facts.length > 0)
  const factSnippet = evWithFacts?.facts?.[0]
    ? `${evWithFacts.facts[0]!.label}: ${evWithFacts.facts[0]!.value}`
    : null
  const uniq = [...new Set(tags)]
  return {
    eventCount: events.length,
    tags: uniq.slice(0, 5),
    factSnippet,
  }
}

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
  /** Compact editorial line (year span from seed data). */
  rangeHint: string
  eventCount: number
  /** Short chips: group, count, category, subtype, … */
  tags: string[]
  /** First curated fact from seed data (history / tech topics). */
  factSnippet: string | null
}

export const TOPIC_SELECTOR_ROWS: TopicSelectorRow[] = CURATED_TOPICS.map((t) => {
  const rich = topicRichChrome(t.id, t.groupId)
  return {
    id: t.id,
    label: t.label,
    trigger: t.trigger,
    groupId: t.groupId,
    groupLabel: topicGroupLabel(t.groupId),
    description: t.description,
    accentColor: t.accentColor,
    rangeHint: topicYearRangeHint(t.id),
    eventCount: rich.eventCount,
    tags: rich.tags,
    factSnippet: rich.factSnippet,
  }
})

export function topicLabel(id: TopicId): string {
  return getCuratedTopicById(id).label
}

export function topicDescription(id: TopicId): string {
  return getCuratedTopicById(id).description
}

export function topicAccentColor(id: TopicId): string {
  return getCuratedTopicById(id).accentColor
}
