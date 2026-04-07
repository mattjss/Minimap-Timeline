import type { TimelineEvent } from '../../types'

const team: TimelineEvent['related'] = [
  { kind: 'team', label: 'San Francisco Giants' },
]

function heroMedia(id: string): TimelineEvent['media'] {
  return [
    {
      id: `${id}-hero`,
      type: 'image',
      alt: 'Historical photograph (placeholder)',
    },
  ]
}

function galleryStub(id: string): TimelineEvent['media'] {
  return [
    {
      id: `${id}-g1`,
      type: 'image',
      alt: 'Archive still 1 (placeholder)',
    },
    {
      id: `${id}-g2`,
      type: 'image',
      alt: 'Archive still 2 (placeholder)',
    },
  ]
}

/** Step 3+: SF Giants — structured for hover preview + rich detail (media/APIs later). */
export const sfGiantsSeedEvents: TimelineEvent[] = [
  {
    id: 'sf-giants-1958-move',
    title: 'Giants franchise moves to San Francisco',
    year: 1958,
    dateStart: '1958-03-03',
    category: 'Franchise',
    importance: 3,
    summary:
      'The New York Giants relocate west, establishing Major League Baseball in San Francisco.',
    description:
      'Owner Horace Stoneham’s decision brought National League baseball to the Bay Area alongside the Dodgers’ move to Los Angeles. Seals Stadium hosted the club before Candlestick Park opened.',
    media: [...heroMedia('1958'), ...galleryStub('1958')],
    facts: [
      { label: 'Previous city', value: 'New York' },
      { label: 'First NL season (SF)', value: '1958' },
    ],
    sources: [
      { title: 'MLB franchise history (placeholder)' },
      { title: 'SABR BioProject (placeholder)' },
    ],
    related: [
      ...team,
      { kind: 'place', label: 'Seals Stadium' },
    ],
  },
  {
    id: 'sf-giants-1962-pennant',
    title: 'First San Francisco pennant',
    year: 1962,
    dateStart: '1962-10-03',
    category: 'Postseason',
    importance: 2,
    summary:
      'The Giants win the NL pennant in their fifth California season, reaching the World Series.',
    description:
      'Willie Mays, McCovey, and Marichal anchored a tight pennant race that ended with San Francisco facing the Yankees in the Fall Classic.',
    media: [...heroMedia('1962'), ...galleryStub('1962')],
    facts: [
      { label: 'World Series opponent', value: 'New York Yankees' },
      { label: 'Games (WS)', value: '7' },
    ],
    sources: [{ title: '1962 World Series summary (placeholder)' }],
    related: [...team, { kind: 'person', label: 'Willie Mays' }],
  },
  {
    id: 'sf-giants-1989-world-series',
    title: 'Bay Bridge World Series',
    year: 1989,
    dateStart: '1989-10-17',
    category: 'Postseason',
    importance: 3,
    summary:
      'San Francisco meets Oakland in the World Series; the Loma Prieta earthquake interrupts Game 3.',
    description:
      'A cross-bay matchup captivated the region before the October 17 earthquake postponed play and shifted the series’ tone. The A’s won the championship in a four-game sweep.',
    media: [...heroMedia('1989'), ...galleryStub('1989')],
    facts: [
      { label: 'Opponent', value: 'Oakland Athletics' },
      { label: 'Notable delay', value: 'Loma Prieta — Game 3' },
    ],
    sources: [{ title: 'USGS + MLB archives (placeholder)' }],
    related: [...team, { kind: 'place', label: 'Candlestick Park' }],
  },
  {
    id: 'sf-giants-2000-park',
    title: 'Pacific Bell Park opens',
    year: 2000,
    dateStart: '2000-04-11',
    category: 'Ballpark',
    importance: 3,
    summary:
      'The waterfront ballpark opens on China Basin, replacing Candlestick Park as the Giants’ home.',
    description:
      'Designed with the cove and McCovey Cove in play, the park became a blueprint for urban, views-first MLB venues and deepened the club’s bond with the city.',
    media: [...heroMedia('2000'), ...galleryStub('2000')],
    facts: [
      { label: 'Neighborhood', value: 'China Basin / Mission Bay' },
      { label: 'First game', value: 'April 11, 2000' },
    ],
    sources: [{ title: 'Ballpark digest (placeholder)' }],
    related: [...team, { kind: 'place', label: 'McCovey Cove' }],
  },
  {
    id: 'sf-giants-2002-pennant',
    title: 'National League champions',
    year: 2002,
    dateStart: '2002-10-21',
    category: 'Postseason',
    importance: 2,
    summary:
      'The Giants win the NL pennant and advance to the World Series behind Barry Bonds’ MVP season.',
    description:
      'Bonds posted one of the great offensive seasons in modern history; the Giants reached Game 7 of the World Series against Anaheim.',
    media: [...heroMedia('2002'), ...galleryStub('2002')],
    facts: [
      { label: 'WS opponent', value: 'Anaheim Angels' },
      { label: 'NLCS', value: 'Giants over Cardinals' },
    ],
    sources: [{ title: '2002 postseason stats (placeholder)' }],
    related: [...team, { kind: 'person', label: 'Barry Bonds' }],
  },
  {
    id: 'sf-giants-2010-championship',
    title: 'First title in San Francisco',
    year: 2010,
    dateStart: '2010-11-01',
    category: 'Championship',
    importance: 3,
    summary:
      'San Francisco wins its first World Series as Edgar Rentería’s clutch hit seals Game 5 in Texas.',
    description:
      'Pitching, defense, and timely hitting defined the postseason. Rentería earned Series MVP as the Giants closed out the Rangers on the road.',
    media: [...heroMedia('2010'), ...galleryStub('2010')],
    facts: [
      { label: 'WS MVP', value: 'Edgar Rentería' },
      { label: 'Manager', value: 'Bruce Bochy' },
    ],
    sources: [{ title: '2010 World Series film (placeholder)' }],
    related: [...team, { kind: 'person', label: 'Tim Lincecum' }],
  },
  {
    id: 'sf-giants-2012-championship',
    title: 'Second championship in three years',
    year: 2012,
    dateStart: '2012-10-28',
    category: 'Championship',
    importance: 3,
    summary:
      'The Giants sweep the Tigers for their second title, anchored by dominant postseason pitching.',
    description:
      'Scutaro’s NLCS heroics and a locked-in rotation carried October momentum into a decisive World Series performance against Detroit.',
    media: [...heroMedia('2012'), ...galleryStub('2012')],
    facts: [
      { label: 'NLCS MVP', value: 'Marco Scutaro' },
      { label: 'WS result', value: 'Giants 4–0' },
    ],
    sources: [{ title: 'Postseason WPA charts (placeholder)' }],
    related: [...team, { kind: 'person', label: 'Buster Posey' }],
  },
  {
    id: 'sf-giants-2014-championship',
    title: 'Third championship in five seasons',
    year: 2014,
    dateStart: '2014-10-29',
    category: 'Championship',
    importance: 3,
    summary:
      'Madison Bumgarner’s historic October carries San Francisco past Kansas City in seven games.',
    description:
      'Bumgarner’s extended relief outing in Game 7 capped a postseason for the ages and cemented a dynasty-era identity for the even-year Giants.',
    media: [...heroMedia('2014'), ...galleryStub('2014')],
    facts: [
      { label: 'WS MVP', value: 'Madison Bumgarner' },
      { label: 'Games', value: '7' },
    ],
    sources: [{ title: 'Game 7 pitch chart (placeholder)' }],
    related: [...team, { kind: 'person', label: 'Madison Bumgarner' }],
  },
  {
    id: 'sf-giants-2021-record',
    title: 'Franchise-record 107 wins',
    year: 2021,
    dateStart: '2021-10-03',
    category: 'Regular season',
    importance: 2,
    summary:
      'The Giants set a franchise win record but exit in the NLDS after a tight division race.',
    description:
      'A veteran core and platoons maximized matchups in a 162-game sprint with the Dodgers; the postseason ended quickly against a division rival.',
    media: [...heroMedia('2021'), ...galleryStub('2021')],
    facts: [
      { label: 'Regular-season wins', value: '107' },
      { label: 'Division', value: 'NL West' },
    ],
    sources: [{ title: 'FanGraphs team page (placeholder)' }],
    related: [...team, { kind: 'place', label: 'Oracle Park' }],
  },
]

export function getSortedSfGiantsEvents(): TimelineEvent[] {
  return [...sfGiantsSeedEvents].sort((a, b) =>
    a.dateStart.localeCompare(b.dateStart),
  )
}
