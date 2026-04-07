import type { TimelineEvent, TimelineFact, TimelineRelated } from '../types'
import { placeholderSources } from './seedHelpers'

type BuildOpts = {
  description?: string
  subtype?: string
  importance?: 1 | 2 | 3
  facts?: TimelineFact[]
  related?: TimelineRelated[]
  /** Extra gallery tiles for landmark events */
  richMedia?: boolean
  products?: string[]
  notableGames?: string[]
  platformGeneration?: string
  publisher?: string
  studio?: string
}

function mediaSeed(id: string, salt: string): string {
  let h = 2166136261
  const s = id + salt
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 1_000_000).toString(36)
}

function mediaFor(id: string, rich: boolean): TimelineEvent['media'] {
  const a = {
    id: `${id}-a`,
    type: 'image' as const,
    url: `https://picsum.photos/seed/${mediaSeed(id, 'a')}/960/540`,
    alt: 'Reference still',
  }
  if (!rich) return [a]
  return [
    a,
    {
      id: `${id}-b`,
      type: 'image' as const,
      url: `https://picsum.photos/seed/${mediaSeed(id, 'b')}/640/400`,
      alt: 'Secondary still',
    },
  ]
}

/**
 * Compact seed constructor — lightweight nodes default to importance 1–2;
 * pass importance: 3 + richMedia for deep-dive landmarks.
 */
export function ev(
  id: string,
  year: number,
  monthDay: string,
  title: string,
  category: string,
  summary: string,
  opts: BuildOpts = {},
): TimelineEvent {
  const importance = opts.importance ?? 2
  const rich = opts.richMedia === true || importance >= 3
  return {
    id,
    title,
    year,
    dateStart: `${year}-${monthDay}`,
    category,
    importance,
    subtype: opts.subtype,
    summary,
    description: opts.description,
    media: mediaFor(id, rich),
    facts:
      opts.facts && opts.facts.length > 0
        ? opts.facts
        : [{ label: 'Snapshot', value: summary }],
    sources: placeholderSources(),
    related: opts.related ?? [],
    products: opts.products,
    notableGames: opts.notableGames,
    platformGeneration: opts.platformGeneration,
    publisher: opts.publisher,
    studio: opts.studio,
  }
}

/** Dense timeline tick — minimal facts, small visual weight */
export function evMinor(
  id: string,
  year: number,
  monthDay: string,
  title: string,
  category: string,
  summary: string,
  opts: Omit<BuildOpts, 'importance'> = {},
): TimelineEvent {
  return ev(id, year, monthDay, title, category, summary, {
    ...opts,
    importance: 1,
  })
}

/**
 * Lightweight yearly node with three curated standouts (platform/topic context).
 */
export function gameYearTop3(
  id: string,
  year: number,
  platformLabel: string,
  games: readonly [string, string, string],
  opts: Pick<
    BuildOpts,
    | 'platformGeneration'
    | 'publisher'
    | 'related'
    | 'products'
  > = {},
): TimelineEvent {
  const [g1, g2, g3] = games
  return evMinor(
    id,
    year,
    '12-08',
    `${year}: standout games`,
    'Year in games',
    `${platformLabel}: ${g1}; ${g2}; ${g3}.`,
    {
      subtype: 'year-top-games',
      notableGames: [g1, g2, g3],
      platformGeneration: opts.platformGeneration,
      publisher: opts.publisher,
      products: opts.products,
      related: opts.related,
      facts: [
        { label: 'Pick 1', value: g1 },
        { label: 'Pick 2', value: g2 },
        { label: 'Pick 3', value: g3 },
      ],
    },
  )
}
