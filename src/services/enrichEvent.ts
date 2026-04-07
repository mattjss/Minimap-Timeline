import type { TimelineEvent } from '../types'

/**
 * Merge API-enriched fields into a curated event (stub).
 */
export async function enrichEvent(event: TimelineEvent): Promise<TimelineEvent> {
  return event
}
