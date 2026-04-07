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
        className="aspect-video w-full border-b border-white/[0.06] object-cover"
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
        className="flex aspect-video w-full items-center justify-center border-b border-white/[0.06] bg-black/40"
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
        className="aspect-video w-full border-b border-white/[0.06] object-cover"
      />
    )
  }
  return (
    <div
      className="aspect-video w-full border-b border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-transparent"
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
          className="aspect-video overflow-hidden rounded-md border border-white/[0.06] bg-white/[0.03]"
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
            <div className="flex h-full items-center justify-center text-[9px] text-ink-faint/60">
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
      {open && event ? (
        <motion.div
          key="event-detail"
          role="presentation"
          className={cn(
            'fixed inset-0 z-50 flex max-w-[100vw]',
            isDesktop ? 'justify-end' : 'items-end',
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: motionTransition.ease }}
        >
          <button
            type="button"
            aria-label="Close event detail"
            className="absolute inset-0 bg-black/55"
            onClick={() => dismiss()}
          />
          <motion.aside
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
              'relative z-[1] flex w-full flex-col bg-canvas',
              'max-h-[min(90dvh,100%)] overflow-hidden rounded-t-[1rem] border-t border-white/[0.07]',
              'md:h-full md:max-h-dvh md:max-w-[min(24rem,100vw)] md:rounded-none md:border-l md:border-t-0',
              'shadow-[0_-16px_64px_rgba(0,0,0,0.5)] md:shadow-[-16px_0_64px_rgba(0,0,0,0.5)]',
            )}
          >
            <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-white/12 md:hidden" aria-hidden />

            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => dismiss()}
                aria-label="Close"
                className={cn(
                  'absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full',
                  'border border-white/[0.08] bg-black/40 text-ink-muted backdrop-blur-sm',
                  'transition-colors hover:border-white/14 hover:text-ink/90',
                )}
              >
                <CloseIcon />
              </button>
              <MediaHero media={event.media} />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4">
              <header className="space-y-1">
                <h2
                  id="event-detail-title"
                  className="pr-10 text-[14px] font-medium leading-snug tracking-wide text-ink/94"
                >
                  {event.title}
                </h2>
                <p className="text-[10px] font-normal tracking-wide text-ink-muted/88">
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
                    <p className="text-[10px] leading-relaxed text-ink-muted/82">
                      {narrative.lead}
                    </p>
                  ) : null}
                  <p className="text-[11px] leading-relaxed text-ink/86">
                    {narrative.body}
                  </p>
                </div>
              ) : null}

              {hasPlatformBlock ? (
                <section className="mt-5 space-y-2" aria-label="Context">
                  <dl className="space-y-2.5 text-[11px] text-ink/84">
                    {event.platformGeneration ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-[9px] text-ink-faint/80">Generation</dt>
                        <dd>{event.platformGeneration}</dd>
                      </div>
                    ) : null}
                    {event.products && event.products.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-[9px] text-ink-faint/80">Products</dt>
                        <dd>{event.products.join(' · ')}</dd>
                      </div>
                    ) : null}
                    {event.notableGames && event.notableGames.length > 0 ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-[9px] text-ink-faint/80">
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
                        <dt className="text-[9px] text-ink-faint/80">Publisher</dt>
                        <dd>{event.publisher}</dd>
                      </div>
                    ) : null}
                    {event.studio ? (
                      <div className="flex flex-col gap-0.5">
                        <dt className="text-[9px] text-ink-faint/80">Studio</dt>
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
                        <dt className="text-[9px] text-ink-faint/75">{f.label}</dt>
                        <dd className="mt-0.5 text-[11px] leading-snug text-ink/88">
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
                        <span className="inline-flex items-center rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-0.5 text-[10px] text-ink-muted/90">
                          <span className="mr-1 text-ink-faint/70">{r.kind}</span>
                          {r.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {event.sources.length > 0 ? (
                <section className="mt-6 border-t border-white/[0.06] pt-4" aria-label="Sources">
                  <ul className="space-y-1">
                    {event.sources.map((s, i) => (
                      <li key={`${s.title}-${i}`} className="text-[10px] leading-snug">
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
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
