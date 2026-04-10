import { AnimatePresence, motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { timelineController } from '../../domain/timeline'
import { TOPIC_SELECTOR_ROWS } from '../../data/topicCatalog'
import { topicGroupLabel } from '../../data/curatedTopics'
import { motionTransition } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TopicGroupId, TopicId } from '../../types'
import { CONTROL_HIT_PX } from './controlStrip'

const GROUP_ORDER: TopicGroupId[] = ['sports', 'tech', 'history', 'gaming']
const PANEL_W = 328
const PANEL_MAX_H = 440

/** Base Web backgroundPrimary — scroll fade matches panel surface */
const PANEL_BG_TOP = 'rgba(22, 22, 22, 0.96)'

/** Minimal 2×2 grid — library / collections, not a chevron dropdown. */
function TopicsLibraryGlyph({ active }: { active: boolean }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        'shrink-0 transition-colors duration-200',
        active ? 'text-ink/78' : 'text-ink-muted/52',
      )}
      aria-hidden
    >
      <rect
        x="4.5"
        y="4.5"
        width="6.25"
        height="6.25"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect
        x="13.25"
        y="4.5"
        width="6.25"
        height="6.25"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect
        x="4.5"
        y="13.25"
        width="6.25"
        height="6.25"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <rect
        x="13.25"
        y="13.25"
        width="6.25"
        height="6.25"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  )
}

type TopicSelectorProps = {
  /** @deprecated */
  menuOpens?: 'down' | 'up'
}

function shortDescriptor(text: string, max = 72): string {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

/**
 * Icon-only trigger + anchored editorial sheet (gradient-masked scroll).
 */
export function TopicSelector({ menuOpens: _menuOpens }: TopicSelectorProps) {
  const activeTopicId = useAppStore((s) => s.activeTopicId)
  const value = activeTopicId ?? 'sf-giants'
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const [query, setQuery] = useState('')
  const searchFieldRef = useRef<HTMLInputElement>(null)
  const searchFieldId = useId()
  const paletteDialogId = useId()
  const btnId = useId()
  const dialogLabelId = useId()

  const current =
    TOPIC_SELECTOR_ROWS.find((t) => t.id === value) ?? TOPIC_SELECTOR_ROWS[0]!

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setAnchor(null)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return TOPIC_SELECTOR_ROWS
    return TOPIC_SELECTOR_ROWS.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.trigger.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.groupLabel.toLowerCase().includes(q) ||
        t.rangeHint.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        (t.factSnippet?.toLowerCase().includes(q) ?? false),
    )
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<TopicGroupId, typeof filtered>()
    for (const g of GROUP_ORDER) map.set(g, [])
    for (const row of filtered) {
      const arr = map.get(row.groupId)
      if (arr) arr.push(row)
    }
    return GROUP_ORDER.map((id) => ({
      id,
      label: topicGroupLabel(id),
      items: map.get(id) ?? [],
    })).filter((g) => g.items.length > 0)
  }, [filtered])

  const popoverStyle = useMemo((): CSSProperties | undefined => {
    if (!anchor || typeof window === 'undefined') return undefined
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = Math.min(PANEL_W, vw - 20)
    const left = Math.min(Math.max(10, anchor.left), vw - w - 10)
    const spaceBelow = vh - anchor.bottom
    const openUp = spaceBelow < PANEL_MAX_H + 20 && anchor.top > PANEL_MAX_H + 20
    const top = openUp ? anchor.top - PANEL_MAX_H - 6 : anchor.bottom + 5
    return {
      position: 'fixed',
      left,
      top: Math.max(10, Math.min(top, vh - PANEL_MAX_H - 10)),
      width: w,
      maxHeight: PANEL_MAX_H,
      zIndex: 201,
    }
  }, [anchor])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => searchFieldRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open])

  useLayoutEffect(() => {
    if (!open) {
      setAnchor(null)
      return
    }
    const measure = () => {
      const btn = document.getElementById(btnId)
      setAnchor(btn?.getBoundingClientRect() ?? null)
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open, btnId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  const select = (id: TopicId) => {
    timelineController.selectTopic(id)
    close()
  }

  const fadeTopStyle: CSSProperties = {
    background: `linear-gradient(to bottom, ${PANEL_BG_TOP}, transparent)`,
  }
  const fadeBotStyle: CSSProperties = {
    background: `linear-gradient(to top, ${PANEL_BG_TOP}, transparent)`,
  }

  const paletteMounted =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {open && anchor ? (
              <motion.div
                key="topic-popover-layer"
                role="presentation"
                className="fixed inset-0 z-[200]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: motionTransition.ease }}
              >
                <button
                  type="button"
                  aria-label="Dismiss"
                  className="absolute inset-0 bg-black/32"
                  onClick={close}
                />
                <motion.div
                  id={paletteDialogId}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={dialogLabelId}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.2, ease: motionTransition.ease }}
                  style={popoverStyle}
                  className={cn(
                    'flex flex-col overflow-hidden rounded-[0.55rem]',
                    'border border-white/[0.065]',
                    'bg-black/48 backdrop-blur-xl',
                    'shadow-[0_22px_64px_rgba(0,0,0,0.52)]',
                  )}
                >
                  <div className="shrink-0 border-b border-white/[0.045] px-3 py-2">
                    <label htmlFor={searchFieldId} id={dialogLabelId} className="sr-only">
                      Filter topics
                    </label>
                    <input
                      ref={searchFieldRef}
                      id={searchFieldId}
                      type="search"
                      autoComplete="off"
                      placeholder="Search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={cn(
                        'w-full border-0 bg-transparent py-1 text-[10px] font-normal tracking-[0.04em]',
                        'text-ink/82 placeholder:text-ink-faint/40',
                        'outline-none focus:ring-0',
                      )}
                    />
                  </div>

                  <div className="relative min-h-0 flex-1">
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-7"
                      style={fadeTopStyle}
                      aria-hidden
                    />
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-8"
                      style={fadeBotStyle}
                      aria-hidden
                    />

                    <div
                      className={cn(
                        'h-full max-h-[min(340px,56dvh)] overflow-y-auto overflow-x-hidden',
                        'overscroll-contain px-1 py-2',
                        '[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.07)_transparent]',
                      )}
                    >
                      {grouped.length === 0 ? (
                        <p className="px-3 py-6 text-center text-[9px] tracking-wide text-ink-faint/65">
                          No matches
                        </p>
                      ) : (
                        grouped.map((group) => (
                          <div key={group.id} className="mb-2 last:mb-0">
                            <p className="px-3 pb-1 pt-1.5 text-[7px] font-medium uppercase tracking-[0.22em] text-ink-faint/48">
                              {group.label}
                            </p>
                            <ul className="space-y-0" role="listbox" aria-label={group.label}>
                              {group.items.map((opt) => {
                                const selected = opt.id === value
                                return (
                                  <li key={opt.id} className="min-w-0">
                                    <button
                                      type="button"
                                      role="option"
                                      aria-selected={selected}
                                      onClick={() => select(opt.id)}
                                      className={cn(
                                        'group flex w-full min-w-0 flex-col gap-0.5 rounded-[0.35rem] py-2 pl-3 pr-2 text-left',
                                        'transition-[background-color,border-color] duration-200',
                                        'border-l-[1.5px] border-transparent',
                                        'hover:bg-white/[0.022]',
                                        selected &&
                                          'bg-white/[0.02] hover:bg-white/[0.028]',
                                      )}
                                      style={
                                        selected
                                          ? {
                                              borderLeftColor: `color-mix(in oklch, ${opt.accentColor} 55%, transparent)`,
                                            }
                                          : undefined
                                      }
                                    >
                                      <span className="text-[10px] font-medium leading-tight tracking-[0.05em] text-ink/88">
                                        {opt.label}
                                      </span>
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {opt.tags.map((tag) => (
                                          <span
                                            key={`${opt.id}-${tag}`}
                                            className="rounded-[0.2rem] border border-white/[0.07] bg-white/[0.035] px-1.5 py-0.5 text-[6.5px] font-medium uppercase tracking-[0.14em] text-ink-muted/78"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                      <span className="mt-1 line-clamp-2 text-[8px] font-normal leading-relaxed tracking-wide text-ink-muted/58">
                                        <span className="tabular-nums text-ink-faint/62">
                                          {opt.rangeHint}
                                        </span>
                                        <span className="mx-1 text-ink-faint/25">·</span>
                                        <span>{shortDescriptor(opt.description, 96)}</span>
                                      </span>
                                      {opt.factSnippet ? (
                                        <p className="mt-1.5 line-clamp-2 border-l border-white/[0.08] pl-2 text-[7.5px] leading-snug tracking-wide text-ink-faint/75">
                                          {opt.factSnippet}
                                        </p>
                                      ) : null}
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null

  return (
    <div className="relative shrink-0">
      <button
        id={btnId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? paletteDialogId : undefined}
        aria-label={`Topics: ${current.label}. Open library.`}
        onClick={() => setOpen((o) => !o)}
        style={{ width: CONTROL_HIT_PX, height: CONTROL_HIT_PX }}
        className={cn(
          'flex items-center justify-center rounded-[0.2rem]',
          'text-ink transition-colors duration-200',
          'hover:bg-white/[0.04]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/[0.1]',
          open && 'bg-white/[0.05]',
        )}
      >
        <TopicsLibraryGlyph active={open} />
      </button>
      {paletteMounted}
    </div>
  )
}
