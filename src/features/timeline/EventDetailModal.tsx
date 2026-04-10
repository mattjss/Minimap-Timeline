import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { getSortedEventsForTopic } from '../../data/topicEvents'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { motionTransition } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TimelineEvent, TimelineMediaItem } from '../../types'

const MD_UP = '(min-width: 768px)'

function MediaHero({ media }: { media: TimelineMediaItem[] }) {
  const first = media[0]
  if (first?.type === 'video' && first.url) {
    return (
      <video
        className="aspect-video w-full border-b border-border object-cover"
        controls
        muted
        playsInline
        preload="metadata"
        src={first.url}
        aria-label={first.alt ?? 'Video'}
      />
    )
  }
  if (first?.type === 'video') {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center border-b border-border bg-canvas-muted/50"
        role="img"
        aria-label={first.alt ?? 'Video'}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="text-ink-faint/45"
          aria-hidden
        >
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M10.5 8.5v7L16 12l-5.5-3.5z"
            fill="currentColor"
            fillOpacity="0.35"
          />
        </svg>
      </div>
    )
  }
  if (first?.url) {
    return (
      <img
        src={first.url}
        alt={first.alt ?? ''}
        className="aspect-video w-full border-b border-border object-cover"
      />
    )
  }
  return (
    <div
      className="aspect-video w-full border-b border-border bg-gradient-to-br from-canvas-muted/80 to-transparent"
      role="img"
      aria-label={first?.alt ?? 'Media'}
    />
  )
}

function GalleryStrip({ items }: { items: TimelineMediaItem[] }) {
  const rest = items.slice(1)
  if (rest.length === 0) {
    return null
  }
  return (
    <ul className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
      {rest.map((m) => (
        <li
          key={m.id}
          className="aspect-video overflow-hidden rounded-md border border-border bg-canvas-muted/40"
        >
          {m.type === 'video' && m.url ? (
            <video
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
              src={m.url}
              aria-label={m.alt ?? ''}
            />
          ) : m.url ? (
            <img
              src={m.url}
              alt={m.alt ?? ''}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-ink-faint/70">
              {m.type === 'video' ? 'Video' : 'Image'}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function EventDetailModal() {
  const open = useAppStore((s) => s.eventDetailOpen)
  const selectedId = useAppStore((s) => s.horizontalSelectedEventId)
  const dismiss = useAppStore((s) => s.dismissTimelineInteraction)
  const topicId = useAppStore((s) => s.activeTopicId)
  const isDesktop = useMediaQuery(MD_UP)

  const event = useMemo((): TimelineEvent | null => {
    if (!selectedId || !open) return null
    return (
      getSortedEventsForTopic(topicId).find((e) => e.id === selectedId) ?? null
    )
  }, [open, selectedId, topicId])

  const displayFacts = useMemo(() => {
    if (!event) return []
    const s = event.summary.trim()
    return event.facts.filter(
      (f) => !(f.label === 'Snapshot' && f.value.trim() === s),
    )
  }, [event])

  const narrative = useMemo(() => {
    if (!event) return { lead: null as string | null, body: '' }
    const summary = event.summary.trim()
    const desc = event.description?.trim() ?? ''
    if (desc && desc !== summary) {
      return { lead: summary, body: desc }
    }
    return { lead: null, body: desc || summary }
  }, [event])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const sheetSpring = {
    type: 'spring' as const,
    stiffness: 420,
    damping: 38,
    mass: 0.88,
  }

  const drawerSpring = {
    type: 'spring' as const,
    stiffness: 320,
    damping: 36,
    mass: 0.85,
  }

  /** Fade scrim on its own layer so the panel’s slide-out isn’t cut off by a parent opacity exit. */
  const scrimTransition = {
    duration: 0.38,
    ease: motionTransition.ease,
  }

  const hasPlatformBlock =
    Boolean(
      event &&
        (event.platformGeneration ||
          event.products?.length ||
          event.notableGames?.length ||
          event.publisher ||
          event.studio),
    )

  return (
    <AnimatePresence>
      {open && event
        ? [
            <motion.button
              key="event-detail-scrim"
              type="button"
              aria-label="Close event detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={scrimTransition}
              className="fixed inset-0 z-50 bg-scrim"
              onClick={() => dismiss()}
            />,
            <motion.aside
              key="event-detail-panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="event-detail-title"
              initial={
                isDesktop
                  ? { x: '100%', y: 0 }
                  : { x: 0, y: '100%' }
              }
              animate={{ x: 0, y: 0 }}
              exit={
                isDesktop
                  ? { x: '100%', y: 0 }
                  : { x: 0, y: '100%' }
              }
              transition={isDesktop ? drawerSpring : sheetSpring}
              className={cn(
                'fixed z-[51] flex w-full flex-col bg-canvas',
                'bottom-0 left-0 right-0 max-h-[min(90dvh,100%)] overflow-hidden rounded-t-[0.65rem] border-t border-border',
                'md:inset-y-0 md:left-auto md:right-0 md:max-h-dvh md:max-w-[min(28rem,100vw)] md:rounded-none md:border-l md:border-t-0',
                'shadow-[0_-12px_48px_rgba(0,0,0,0.45)] md:shadow-[-12px_0_48px_rgba(0,0,0,0.45)]',
              )}
            >
            <div className="mx-auto mt-2 h-0.5 w-7 shrink-0 rounded-full bg-ink-whisper/35 md:hidden" aria-hidden />

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => dismiss()}
                aria-label="Close"
                className={cn(
                  'absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full',
                  'border border-border bg-canvas-raised/90 text-ink-faint',
                  'transition-colors hover:border-border-strong hover:text-ink-muted',
                )}
              >
                <CloseIcon />
              </button>
              <MediaHero media={event.media} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-3 md:px-5">
              <header className="space-y-1">
                <h2
                  id="event-detail-title"
                  className="pr-9 text-lg font-medium leading-snug text-ink"
                >
                  {event.title}
                </h2>
                <p className="text-sm font-normal text-ink-muted">
                  {event.year}
                  {event.category ? ` · ${event.category}` : ''}
                  {event.subtype ? (
                    <span className="text-ink-faint/75"> · {event.subtype}</span>
                  ) : null}
                </p>
              </header>

              {narrative.body ? (
                <div className="mt-4 space-y-2">
                  {narrative.lead ? (
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {narrative.lead}
                    </p>
                  ) : null}
                  <p className="text-base leading-relaxed text-ink/95">
                    {narrative.body}
                  </p>
                </div>
              ) : null}

              {hasPlatformBlock ? (
                <section className="mt-5 space-y-2" aria-label="Context">
                  <dl className="space-y-2.5 text-sm text-ink/90">
                    {event.platformGeneration ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-ink-faint">Generation</dt>
                        <dd>{event.platformGeneration}</dd>
                      </div>
                    ) : null}
                    {event.products && event.products.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-ink-faint">Products</dt>
                        <dd>{event.products.join(' · ')}</dd>
                      </div>
                    ) : null}
                    {event.notableGames && event.notableGames.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-ink-faint">
                          {event.subtype === 'year-top-games'
                            ? 'Standouts'
                            : 'Notable'}
                        </dt>
                        <dd>
                          <ol className="mt-0.5 list-decimal space-y-0.5 pl-3.5">
                            {event.notableGames.map((g) => (
                              <li key={g}>{g}</li>
                            ))}
                          </ol>
                        </dd>
                      </div>
                    ) : null}
                    {event.publisher ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-ink-faint">Publisher</dt>
                        <dd>{event.publisher}</dd>
                      </div>
                    ) : null}
                    {event.studio ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-xs font-medium text-ink-faint">Studio</dt>
                        <dd>{event.studio}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              {displayFacts.length > 0 ? (
                <section className="mt-5" aria-label="Facts">
                  <dl className="grid gap-x-4 gap-y-3 md:grid-cols-2">
                    {displayFacts.map((f) => (
                      <div key={`${f.label}-${f.value}`} className="min-w-0">
                        <dt className="text-xs font-medium text-ink-faint">{f.label}</dt>
                        <dd className="mt-0.5 text-sm leading-snug text-ink/90">
                          {f.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}

              {event.media.length > 1 ? (
                <section className="mt-5 space-y-2" aria-label="More media">
                  <GalleryStrip items={event.media} />
                </section>
              ) : null}

              {event.related.length > 0 ? (
                <section className="mt-5" aria-label="Related">
                  <ul className="flex flex-wrap gap-1">
                    {event.related.map((r, i) => (
                      <li key={`${r.kind}-${r.label}-${i}`}>
                        <span className="inline-flex items-center rounded-md border border-border bg-canvas-muted/50 px-2 py-0.5 text-xs font-normal text-ink-faint">
                          <span className="mr-1 text-ink-faint/70">{r.kind}</span>
                          {r.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {event.sources.length > 0 ? (
                <section className="mt-6 border-t border-border pt-4" aria-label="Sources">
                  <ul className="space-y-1">
                    {event.sources.map((s, i) => (
                      <li key={`${s.title}-${i}`} className="text-sm leading-snug">
                        {s.url ? (
                          <a
                            href={s.url}
                            className="text-ink-muted/90 underline-offset-2 hover:text-accent hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {s.title}
                          </a>
                        ) : (
                          <span className="text-ink-faint/80">{s.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div
                className="pb-[max(0.25rem,env(safe-area-inset-bottom))] md:hidden"
                aria-hidden
              />
            </div>
          </motion.aside>,
          ]
        : null}
    </AnimatePresence>
  )
}
