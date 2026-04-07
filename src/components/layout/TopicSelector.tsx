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

const GROUP_ORDER: TopicGroupId[] = ['sports', 'tech', 'history', 'gaming']
const PANEL_W = 288
const PANEL_MAX_H = 320

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={cn(
        'shrink-0 text-ink-muted/50 transition-transform duration-200 ease-out',
        open && 'rotate-180',
      )}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

type TopicSelectorProps = {
  /** @deprecated Anchored to trigger; ignored. */
  menuOpens?: 'down' | 'up'
}

/**
 * Bar trigger + anchored editorial popover (not a centered utility sheet).
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
        t.groupLabel.toLowerCase().includes(q),
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
    const w = Math.min(PANEL_W, vw - 24)
    const left = Math.min(Math.max(12, anchor.left), vw - w - 12)
    const spaceBelow = vh - anchor.bottom
    const openUp = spaceBelow < PANEL_MAX_H + 24 && anchor.top > PANEL_MAX_H + 24
    const top = openUp ? anchor.top - PANEL_MAX_H - 8 : anchor.bottom + 6
    return {
      position: 'fixed',
      left,
      top: Math.max(12, Math.min(top, vh - PANEL_MAX_H - 12)),
      width: w,
      maxHeight: PANEL_MAX_H,
      zIndex: 201,
    }
  }, [anchor])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => searchFieldRef.current?.focus(), 30)
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
                transition={{ duration: 0.16, ease: motionTransition.ease }}
              >
                <button
                  type="button"
                  aria-label="Dismiss"
                  className="absolute inset-0 bg-black/28"
                  onClick={close}
                />
                <motion.div
                  id={paletteDialogId}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={dialogLabelId}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 2 }}
                  transition={{ duration: 0.18, ease: motionTransition.ease }}
                  style={popoverStyle}
                  className={cn(
                    'flex flex-col overflow-hidden rounded-lg',
                    'border border-white/[0.08]',
                    'bg-canvas/94 shadow-[0_16px_48px_rgba(0,0,0,0.45)]',
                    'backdrop-blur-md',
                  )}
                >
                  <div className="shrink-0 border-b border-white/[0.05] px-2.5 py-2">
                    <label htmlFor={searchFieldId} id={dialogLabelId} className="sr-only">
                      Filter topics
                    </label>
                    <input
                      ref={searchFieldRef}
                      id={searchFieldId}
                      type="search"
                      autoComplete="off"
                      placeholder="Filter…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={cn(
                        'w-full border-0 bg-transparent py-0.5 text-[10.5px] font-normal tracking-[0.02em]',
                        'text-ink/88 placeholder:text-ink-faint/45',
                        'outline-none focus:ring-0',
                      )}
                    />
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1 [scrollbar-width:thin]">
                    {grouped.length === 0 ? (
                      <p className="px-2.5 py-5 text-center text-[9.5px] text-ink-faint/70">
                        No matches
                      </p>
                    ) : (
                      grouped.map((group) => (
                        <div key={group.id} className="mb-1.5 last:mb-0">
                          <p className="px-2.5 pb-0.5 pt-1 text-[7.5px] font-medium uppercase tracking-[0.2em] text-ink-faint/55">
                            {group.label}
                          </p>
                          <ul className="space-y-px" role="listbox" aria-label={group.label}>
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
                                      'flex w-full min-w-0 flex-col gap-0.5 rounded-md px-2 py-1.5 text-left',
                                      'transition-colors duration-150',
                                      selected
                                        ? 'bg-white/[0.045]'
                                        : 'hover:bg-white/[0.028]',
                                    )}
                                  >
                                    <span
                                      className="text-[10px] font-medium leading-snug tracking-[0.04em] text-ink/90"
                                      style={{
                                        borderLeft:
                                          selected && opt.accentColor
                                            ? `1.5px solid ${opt.accentColor}`
                                            : '1.5px solid transparent',
                                        paddingLeft: '0.35rem',
                                        marginLeft: '-0.1rem',
                                      }}
                                    >
                                      {opt.label}
                                    </span>
                                    <span className="line-clamp-2 pl-[0.45rem] text-[8.5px] font-normal leading-relaxed tracking-wide text-ink-muted/72">
                                      {opt.description}
                                    </span>
                                  </button>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>,
          document.body,
        )
      : null

  return (
    <div className="relative min-w-0 shrink-0">
      <button
        id={btnId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? paletteDialogId : undefined}
        aria-label={`Topic: ${current.label}. Open list.`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex max-w-[9.25rem] items-center gap-1 rounded-full py-1.5 pl-2.5 pr-2 sm:max-w-[11.5rem]',
          'border border-transparent bg-transparent',
          'text-ink/88 transition-[background-color] duration-200',
          'hover:bg-white/[0.035]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/10',
          open && 'bg-white/[0.045]',
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left text-[10px] font-medium tracking-[0.06em] text-ink/86">
          {current.trigger}
        </span>
        <Chevron open={open} />
      </button>
      {paletteMounted}
    </div>
  )
}
