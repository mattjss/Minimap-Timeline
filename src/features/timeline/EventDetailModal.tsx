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
  if (first?.type === 'video') {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center rounded-md border border-white/[0.08] bg-black/35"
        role="img"
        aria-label={first.alt ?? 'Video'}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          className="text-ink-faint/50"
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
        className="aspect-video w-full rounded-md border border-white/10 object-cover"
      />
    )
  }
  return (
    <div
      className="aspect-video w-full rounded-md border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent"
      role="img"
      aria-label={first?.alt ?? 'Image placeholder'}
    />
  )
}

function GalleryStrip({ items }: { items: TimelineMediaItem[] }) {
  const rest = items.slice(1)
  if (rest.length === 0) {
    return null
  }
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {rest.map((m) => (
        <li
          key={m.id}
          className="aspect-video rounded border border-white/8 bg-white/[0.04]"
        >
          {m.url ? (
            <img
              src={m.url}
              alt={m.alt ?? ''}
              className="h-full w-full rounded object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[9px] text-ink-faint/70">
              {m.type === 'video' ? 'Video' : 'Image'}
            </div>
          )}
        </li>
      ))}
    </ul>
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

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const bodyText = event?.description ?? event?.summary ?? ''

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
            className="absolute inset-0 bg-black/50"
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
              'relative z-[1] flex w-full flex-col bg-canvas shadow-[0_-24px_80px_rgba(0,0,0,0.55)]',
              'max-h-[min(88dvh,100%)] rounded-t-[1.25rem] border-t border-white/[0.08]',
              'md:h-full md:max-h-dvh md:max-w-[min(26rem,100vw)] md:rounded-none md:border-l md:border-t-0',
              'md:shadow-[-20px_0_80px_rgba(0,0,0,0.55)]',
            )}
          >
            {/* Bottom-sheet affordance (mobile) */}
            <div
              className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-white/15 md:hidden"
              aria-hidden
            />
            <div className="flex items-start justify-between gap-3 border-b border-white/[0.08] px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-normal uppercase tracking-[0.2em] text-ink-faint/80">
                  {event.year}
                  <span className="text-ink-faint/40"> · </span>
                  {event.category}
                  {event.subtype ? (
                    <>
                      <span className="text-ink-faint/40"> · </span>
                      <span className="text-ink-faint/65">{event.subtype}</span>
                    </>
                  ) : null}
                </p>
                <p
                  id="event-detail-title"
                  className="mt-1.5 text-[13px] font-medium leading-snug tracking-wide text-ink/92"
                >
                  {event.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismiss()}
                className="shrink-0 rounded-full border border-white/[0.1] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-ink-muted/90 transition-colors hover:border-white/16 hover:text-ink/88"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <section className="space-y-2" aria-label="Hero media">
                <MediaHero media={event.media} />
              </section>

              <section className="mt-5 space-y-2" aria-label="Summary">
                <div className="text-[9px] font-normal uppercase tracking-[0.2em] text-ink-faint/65">
                  Overview
                </div>
                <p className="text-[11px] font-normal leading-relaxed text-ink/84">
                  {bodyText}
                </p>
              </section>

              {event.platformGeneration ||
              event.products?.length ||
              event.notableGames?.length ||
              event.publisher ||
              event.studio ? (
                <section className="mt-5 space-y-2" aria-label="Platform and releases">
                  <div className="text-[9px] font-normal uppercase tracking-[0.2em] text-ink-faint/65">
                    Platform & releases
                  </div>
                  <dl className="space-y-2 text-[11px] text-ink/85">
                    {event.platformGeneration ? (
                      <div className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-2">
                        <dt className="text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                          Generation
                        </dt>
                        <dd>{event.platformGeneration}</dd>
                      </div>
                    ) : null}
                    {event.products && event.products.length > 0 ? (
                      <div className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-2">
                        <dt className="text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                          Products
                        </dt>
                        <dd>{event.products.join(' · ')}</dd>
                      </div>
                    ) : null}
                    {event.notableGames && event.notableGames.length > 0 ? (
                      <div className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-2">
                        <dt className="text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                          {event.subtype === 'year-top-games'
                            ? 'Year standouts'
                            : 'Notable games'}
                        </dt>
                        <dd>
                          <ol className="mt-1 list-decimal space-y-1 pl-4">
                            {event.notableGames.map((g) => (
                              <li key={g}>{g}</li>
                            ))}
                          </ol>
                        </dd>
                      </div>
                    ) : null}
                    {event.publisher ? (
                      <div className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-2">
                        <dt className="text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                          Publisher
                        </dt>
                        <dd>{event.publisher}</dd>
                      </div>
                    ) : null}
                    {event.studio ? (
                      <div className="flex flex-col gap-0.5 pb-2">
                        <dt className="text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                          Studio
                        </dt>
                        <dd>{event.studio}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              {event.facts.length > 0 ? (
                <section className="mt-5 space-y-2" aria-label="Key facts">
                  <div className="text-[9px] font-normal uppercase tracking-[0.2em] text-ink-faint/65">
                    Key facts
                  </div>
                  <dl className="space-y-2">
                    {event.facts.map((f) => (
                      <div
                        key={`${f.label}-${f.value}`}
                        className="flex flex-col gap-0.5 border-b border-white/[0.06] pb-2 last:border-0"
                      >
                        <dt className="text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                          {f.label}
                        </dt>
                        <dd className="text-[11px] text-ink/90">{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}

              {event.media.length > 1 ? (
                <section className="mt-5 space-y-2" aria-label="Media gallery">
                  <div className="text-[9px] font-normal uppercase tracking-[0.2em] text-ink-faint/65">
                    Gallery
                  </div>
                  <GalleryStrip items={event.media} />
                </section>
              ) : null}

              {event.sources.length > 0 ? (
                <section className="mt-5 space-y-2" aria-label="Sources">
                  <div className="text-[9px] font-normal uppercase tracking-[0.2em] text-ink-faint/65">
                    Sources
                  </div>
                  <ul className="space-y-1.5">
                    {event.sources.map((s, i) => (
                      <li key={`${s.title}-${i}`} className="text-[11px]">
                        {s.url ? (
                          <a
                            href={s.url}
                            className="text-accent underline-offset-2 hover:underline"
                            target="_blank"
                            rel="noreferrer"
                          >
                            {s.title}
                          </a>
                        ) : (
                          <span className="text-ink-muted">{s.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {event.related.length > 0 ? (
                <section className="mt-5 space-y-2" aria-label="Related">
                  <div className="text-[9px] font-normal uppercase tracking-[0.2em] text-ink-faint/65">
                    Related
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {event.related.map((r, i) => (
                      <li key={`${r.kind}-${r.label}-${i}`}>
                        <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-ink-muted">
                          <span className="mr-1 text-ink-faint">{r.kind}</span>
                          {r.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <div
                className="pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
                aria-hidden
              />
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
