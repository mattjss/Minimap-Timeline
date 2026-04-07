import { AnimatePresence, motion } from 'framer-motion'
import { Fragment, useCallback, useEffect, useId, useRef, useState } from 'react'
import { timelineController } from '../../domain/timeline'
import { TOPIC_SELECTOR_ROWS } from '../../data/topicCatalog'
import { motionTransition } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TopicId } from '../../types'

/** Stacked rules — topic source, no canvas text (label lives in aria only). */
function TopicGlyph({ open }: { open: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      width={15}
      height={15}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.65}
      strokeLinecap="round"
      className="text-ink-muted/75"
      animate={{ opacity: open ? 0.95 : 0.72 }}
      transition={{ duration: 0.18, ease: motionTransition.ease }}
      aria-hidden
    >
      <line x1="5" y1="7" x2="19" y2="7" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <line x1="5" y1="17" x2="15" y2="17" />
    </motion.svg>
  )
}

type TopicSelectorProps = {
  /** `down` for top-mounted cluster; `up` for bottom-mounted. */
  menuOpens?: 'down' | 'up'
}

export function TopicSelector({ menuOpens = 'down' }: TopicSelectorProps) {
  const activeTopicId = useAppStore((s) => s.activeTopicId)
  const value = activeTopicId ?? 'sf-giants'
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const btnId = useId()

  const current =
    TOPIC_SELECTOR_ROWS.find((t) => t.id === value) ?? TOPIC_SELECTOR_ROWS[0]!

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  const select = (id: TopicId) => {
    timelineController.selectTopic(id)
    close()
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        id={btnId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Topic: ${current.label}. Open menu.`}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full',
          'border border-transparent bg-transparent',
          'text-ink/88 transition-[background-color,opacity] duration-200',
          'hover:bg-white/[0.06]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/12',
          open && 'bg-white/[0.07]',
        )}
      >
        <TopicGlyph open={open} />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="topic-menu"
            id={listId}
            role="listbox"
            aria-labelledby={btnId}
            initial={
              menuOpens === 'down'
                ? { opacity: 0, y: -8, scale: 0.98 }
                : { opacity: 0, y: 8, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              menuOpens === 'down'
                ? { opacity: 0, y: -5, scale: 0.99 }
                : { opacity: 0, y: 6, scale: 0.99 }
            }
            transition={{ duration: 0.2, ease: motionTransition.ease }}
            className={cn(
              'absolute z-[100] min-w-[13.5rem] max-w-[min(calc(100vw-1.5rem),17rem)]',
              'overflow-hidden rounded-[0.6rem] py-1',
              'border border-white/[0.08] bg-black/80',
              menuOpens === 'down'
                ? 'left-0 top-[calc(100%+0.4rem)] shadow-[0_20px_50px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.04)]'
                : 'bottom-[calc(100%+0.45rem)] right-0 shadow-[0_24px_56px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)]',
              'backdrop-blur-xl',
            )}
          >
            <div className="max-h-[min(62dvh,22rem)] overflow-y-auto overscroll-contain py-0.5">
              {TOPIC_SELECTOR_ROWS.map((opt, index) => {
                const selected = opt.id === value
                const prev = index > 0 ? TOPIC_SELECTOR_ROWS[index - 1] : null
                const showGroup = !prev || prev.groupId !== opt.groupId
                return (
                  <Fragment key={opt.id}>
                    {showGroup ? (
                      <>
                        {index > 0 ? (
                          <div
                            role="separator"
                            className="mx-3 my-1.5 h-px bg-white/[0.06]"
                            aria-hidden
                          />
                        ) : null}
                        <span className="sr-only">{opt.groupLabel}</span>
                      </>
                    ) : null}
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      title={opt.description}
                      onClick={() => select(opt.id)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-left',
                        'text-[10px] font-medium leading-snug tracking-wide transition-colors duration-150',
                        selected
                          ? 'bg-white/[0.06] text-ink/95'
                          : 'text-ink-muted/88 hover:bg-white/[0.035] hover:text-ink/88',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-3 w-3 shrink-0 items-center justify-center rounded-full border',
                          selected
                            ? 'border-white/25 bg-white/[0.08]'
                            : 'border-white/[0.07] bg-transparent',
                        )}
                        aria-hidden
                      >
                        {selected ? (
                          <span className="h-1 w-1 rounded-full bg-ink/70" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">{opt.label}</span>
                    </button>
                  </Fragment>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
