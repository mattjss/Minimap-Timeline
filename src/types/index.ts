/** Minimap timeline layout variant (prototype shell). */
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
  kind: 'person' | 'place' | 'team'
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
  /** Short line for hover preview */
  summary: string
  /** Longer narrative for detail panel (optional) */
  description?: string
  media: TimelineMediaItem[]
  facts: TimelineFact[]
  sources: TimelineSource[]
  related: TimelineRelated[]
}

export type TopicId =
  | 'sf-giants'
  | 'sf-49ers'
  | 'gs-warriors'
  | 'sj-sharks'
  | 'sv-tech'
  | 'sf-city'
  | 'us-history'
