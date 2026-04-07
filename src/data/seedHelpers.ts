import type { TimelineEvent } from '../types'

/** Placeholder hero + small gallery for curated seeds (URLs wired later). */
export function heroGallery(prefix: string): TimelineEvent['media'] {
  return [
    {
      id: `${prefix}-hero`,
      type: 'image',
      alt: 'Historical photograph (placeholder)',
    },
    {
      id: `${prefix}-g1`,
      type: 'image',
      alt: 'Archive still 1 (placeholder)',
    },
    {
      id: `${prefix}-g2`,
      type: 'image',
      alt: 'Archive still 2 (placeholder)',
    },
  ]
}

export function placeholderSources(): TimelineEvent['sources'] {
  return [{ title: 'Archives & references (placeholder)' }]
}
