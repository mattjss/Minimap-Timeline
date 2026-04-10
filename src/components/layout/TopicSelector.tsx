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
import { motionTransition } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TopicGroupId, TopicId } from '../../types'
import { CONTROL_HIT_PX } from './controlStrip'

const GROUP_ORDER: TopicGroupId[] = ['sports', 'tech', 'history', 'gaming']
const PANEL_W = 260
const PANEL_MAX_H = 360

/** Panel fade cap — matches raised canvas */
const PANEL_BG_TOP = 'color-mix(in oklch, var(--color-canvas-raised) 96%, transparent)'

/** Minimal 2×2 grid — opens title-only topic list. */
function TopicsLibraryGlyph({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        'shrink-0 transition-colors duration-200',
        active ? 'text-ink/82' : 'text-ink-muted/58',
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
        strokeWidth="1.45"
      />
      <rect
        x="13.25"
        y="4.5"
        width="6.25"
        height="6.25"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.45"
      />
      <rect
        x="4.5"
        y="13.25"
        width="6.25"
        height="6.25"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.45"
      />
      <rect
        x="13.25"
        y="13.25"
        width="6.25"
        height="6.25"
        rx="1.25"
        stroke="currentColor"
        strokeWidth="1.45"
      />
    </svg>
  )
}

type TopicSelectorProps = {
  /** @deprecated */
  menuOpens?: 'down' | 'up'
}

/**
 * Icon-only trigger + compact sheet: search + topic titles only.
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

  /** Stable catalog order; no section headers — title-only rows. */
  const flatTopics = useMemo(() => {
    const rank = new Map(GROUP_ORDER.map((g, i) => [g, i]))
    return [...filtered].sort((a, b) => {
      const ra = rank.get(a.groupId) ?? 99
      const rb = rank.get(b.groupId) ?? 99
      if (ra !== rb) return ra - rb
      return a.label.localeCompare(b.label)
    })
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
                  className="absolute inset-0 bg-scrim/40"
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
                    'flex flex-col overflow-hidden rounded-[0.45rem]',
                    'border border-border bg-canvas-raised/95 backdrop-blur-md',
                    'shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
                  )}
                >
                  <div className="shrink-0 border-b border-border px-2.5 py-1.5">
                    <label htmlFor={searchFieldId} id={dialogLabelId} className="sr-only">
                      Filter topics
                    </label>
                    <input
                      ref={searchFieldRef}
                      id={searchFieldId}
                      type="search"
                      autoComplete="off"
                      placeholder="Search topics"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={cn(
                        'w-full border-0 bg-transparent py-0.5 text-sm font-normal',
                        'text-ink/90 placeholder:text-ink-faint/40',
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
                        'h-full max-h-[min(280px,50dvh)] overflow-y-auto overflow-x-hidden',
                        'overscroll-contain px-1 py-1',
                        '[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.07)_transparent]',
                      )}
                    >
                      {flatTopics.length === 0 ? (
                        <p className="px-2.5 py-5 text-center text-sm text-ink-faint/70">
                          No matches
                        </p>
                      ) : (
                        <ul className="space-y-0" role="listbox" aria-label="Topics">
                          {flatTopics.map((opt) => {
                            const selected = opt.id === value
                            return (
                              <li key={opt.id} className="min-w-0">
                                <button
                                  type="button"
                                  role="option"
                                  aria-selected={selected}
                                  onClick={() => select(opt.id)}
                                  className={cn(
                                    'flex w-full min-w-0 rounded-[0.3rem] px-2.5 py-1.5 text-left',
                                    'text-sm font-normal leading-snug text-ink/90',
                                    'transition-[background-color,border-color] duration-200',
                                    'border-l-[1.5px] border-transparent',
                                    'hover:bg-chrome-indicator/40',
                                    selected &&
                                      'bg-chrome-indicator/35 font-medium hover:bg-chrome-indicator/50',
                                  )}
                                  style={
                                    selected
                                      ? {
                                          borderLeftColor: `color-mix(in oklch, ${opt.accentColor} 55%, transparent)`,
                                        }
                                      : undefined
                                  }
                                >
                                  <span className="truncate">{opt.label}</span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
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
          'flex items-center justify-center rounded-[0.15rem]',
          'text-ink-faint transition-colors duration-200',
          'hover:bg-chrome-indicator/35 hover:text-ink-muted',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/8',
          open && 'bg-chrome-indicator/40 text-ink-muted',
        )}
      >
        <TopicsLibraryGlyph active={open} />
      </button>
      {paletteMounted}
    </div>
  )
}
