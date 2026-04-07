/** Stable id for events across topics and API merges. */
export type TimelineEventId = string

/** Curated timeline event (seed + enriched). Schema in `data/schema.ts`. */
export type TimelineEvent = {
  id: TimelineEventId
  title: string
}

export type TopicId =
  | 'sf-giants'
  | 'sf-49ers'
  | 'gs-warriors'
  | 'sj-sharks'
  | 'sv-tech'
  | 'sf-city'
  | 'us-history'
