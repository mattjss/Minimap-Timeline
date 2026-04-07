import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { getSortedSfGiantsEvents } from '../../data/seeds/sfGiants'
import { motionTransition } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TimelineEvent, TimelineMediaItem } from '../../types'

function MediaHero({ media }: { media: TimelineMediaItem[] }) {
  const first = media[0]
  if (first?.type === 'video') {
    return (
      <div
        className="flex aspect-video w-full items-center justify-center rounded-md border border-white/10 bg-canvas-raised/80 text-[10px] tracking-wide text-ink-muted"
        role="img"
        aria-label={first.alt ?? 'Video placeholder'}
      >
        Video placeholder
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
    return (
      <p className="text-[10px] text-ink-faint/80">
        Gallery — placeholders until media URLs are wired.
      </p>
    )
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

  const event = useMemo((): TimelineEvent | null => {
    const giants = topicId === 'sf-giants' || topicId === null
    if (!giants || !selectedId || !open) return null
    return getSortedSfGiantsEvents().find((e) => e.id === selectedId) ?? null
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

  return (
    <AnimatePresence>
      {open && event ? (
        <motion.div
          key="event-detail"
          role="presentation"
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: motionTransition.ease }}
        >
          <button
            type="button"
            aria-label="Close event detail"
            className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
            onClick={() => dismiss()}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-detail-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 36, mass: 0.85 }}
            className={cn(
              'relative z-[1] flex h-full max-h-dvh w-full max-w-[min(26rem,100vw)] flex-col',
              'border-l border-white/10 bg-canvas shadow-[-12px_0_48px_rgba(0,0,0,0.45)]',
            )}
          >
            <div className="flex items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-medium tracking-[0.16em] text-ink-muted">
                  {event.year} · {event.category}
                </p>
                <h2
                  id="event-detail-title"
                  className="mt-1 text-[15px] font-medium leading-snug tracking-wide text-ink"
                >
                  {event.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => dismiss()}
                className="shrink-0 rounded-md border border-white/12 px-2.5 py-1 text-[10px] tracking-wide text-ink-muted transition-colors hover:border-white/20 hover:text-ink"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <section className="space-y-2" aria-label="Hero media">
                <MediaHero media={event.media} />
              </section>

              <section className="mt-6 space-y-2" aria-label="Summary">
                <h3 className="text-[10px] font-medium tracking-[0.14em] text-ink-muted">
                  Overview
                </h3>
                <p className="text-[12px] leading-relaxed text-ink/88">{bodyText}</p>
              </section>

              {event.facts.length > 0 ? (
                <section className="mt-6 space-y-2" aria-label="Key facts">
                  <h3 className="text-[10px] font-medium tracking-[0.14em] text-ink-muted">
                    Key facts
                  </h3>
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

              <section className="mt-6 space-y-2" aria-label="Media gallery">
                <h3 className="text-[10px] font-medium tracking-[0.14em] text-ink-muted">
                  Gallery
                </h3>
                <GalleryStrip items={event.media} />
              </section>

              {event.sources.length > 0 ? (
                <section className="mt-6 space-y-2" aria-label="Sources">
                  <h3 className="text-[10px] font-medium tracking-[0.14em] text-ink-muted">
                    Sources
                  </h3>
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
                <section className="mt-6 space-y-2" aria-label="Related">
                  <h3 className="text-[10px] font-medium tracking-[0.14em] text-ink-muted">
                    Related
                  </h3>
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
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
