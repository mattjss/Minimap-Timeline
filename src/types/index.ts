/** Timeline layout variant: horizontal, vertical, or radial spine. */
export type TimelineLayoutMode = 'horizontal' | 'vertical' | 'radial'

/** Stable id for events across topics and API merges. */
export type TimelineEventId = string

/** Importance tier for layout emphasis (1 = subtle, 3 = strongest). */
export type TimelineImportance = 1 | 2 | 3

export type TimelineMediaItem = {
  id: string
  type: 'image' | 'video'
  url?: string
  alt?: string
  caption?: string
}

export type TimelineFact = {
  label: string
  value: string
}

export type TimelineSource = {
  title: string
  url?: string
}

export type TimelineRelated = {
  kind: 'person' | 'place' | 'team' | 'company'
  label: string
}

/** Curated timeline event (local seeds + future enrichment). */
export type TimelineEvent = {
  id: TimelineEventId
  title: string
  year: number
  dateStart: string
  category: string
  importance: TimelineImportance
  /** Optional facet, e.g. "apple-product", "draft", "ipo" */
  subtype?: string
  /** Short line for hover preview */
  summary: string
  /** Longer narrative for detail panel (optional) */
  description?: string
  media: TimelineMediaItem[]
  facts: TimelineFact[]
  sources: TimelineSource[]
  related: TimelineRelated[]
  /** Hardware / SKU names tied to the milestone */
  products?: string[]
  /** Curated standouts (e.g. yearly top 3 platform picks) */
  notableGames?: string[]
  /** e.g. "5th gen", "HD era", "Switch era" */
  platformGeneration?: string
  publisher?: string
  studio?: string
}

/** High-level family for menus, accents, and future grouped navigation. */
export type TopicGroupId = 'sports' | 'tech' | 'history' | 'gaming'

export type TopicId =
  | 'sf-giants'
  | 'sf-49ers'
  | 'gs-warriors'
  | 'sj-sharks'
  | 'sv-tech'
  | 'apple'
  | 'ycombinator'
  | 'nvidia'
  | 'ai-history'
  | 'sf-city'
  | 'us-history'
  | 'nintendo'
  | 'xbox'
  | 'disney'

/** Curated topic: metadata + local seed events (single source in `curatedTopics`). */
export type CuratedTopic = {
  id: TopicId
  label: string
  /** Short label on the closed selector control */
  trigger: string
  groupId: TopicGroupId
  description: string
  /** CSS color (hex or oklch) — drives shell accent via CSS variables */
  accentColor: string
  events: TimelineEvent[]
}
