import { motion, useReducedMotion } from 'framer-motion'
import { timelineController } from '../../domain/timeline'
import { timelineModeSyncSpring } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TimelineLayoutMode } from '../../types'
import { TopicSelector } from './TopicSelector'

const MODES: { id: TimelineLayoutMode; ariaLabel: string }[] = [
  { id: 'horizontal', ariaLabel: 'Horizontal timeline' },
  { id: 'vertical', ariaLabel: 'Vertical timeline' },
  { id: 'radial', ariaLabel: 'Circular timeline' },
]

const GLYPH = 15

/** Stroke geometry: horizontal line, vertical line, circle — one system, three poses. */
function ModeGlyph({
  mode,
  active,
}: {
  mode: TimelineLayoutMode
  active: boolean
}) {
  const stroke = active ? 'rgba(236,232,225,0.9)' : 'rgba(100,96,88,0.48)'
  const common = {
    width: GLYPH,
    height: GLYPH,
    viewBox: '0 0 24 24',
    className: 'mx-auto block shrink-0',
    fill: 'none' as const,
    stroke,
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (mode) {
    case 'horizontal':
      return (
        <svg {...common}>
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )
    case 'vertical':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
        </svg>
      )
    case 'radial':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7.25" />
        </svg>
      )
    default:
      return null
  }
}

/**
 * Top floating cluster: topic (custom menu) + geometry segmented control.
 * Shares springs with the stage via LayoutGroup (`timelineModeSyncSpring`).
 */
export function TimelineModeToggle() {
  const timelineMode = useAppStore((s) => s.timelineMode)
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex justify-center px-3 sm:px-5"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0px))',
      }}
    >
      <div
        className={cn(
          'pointer-events-auto relative isolate flex items-center gap-0.5 rounded-full p-0.5 pl-1',
          'backdrop-blur-md',
        )}
        style={{
          backgroundColor: 'var(--shell-chrome-bg)',
          borderColor: 'var(--shell-chrome-border)',
          borderWidth: 1,
          borderStyle: 'solid',
          boxShadow: `
            inset 0 1px 0 var(--shell-chrome-highlight),
            0 10px 40px rgba(0,0,0,0.42),
            0 1px 0 rgba(255,255,255,0.02)
          `,
        }}
        role="toolbar"
        aria-label="Timeline and topic"
      >
        <TopicSelector menuOpens="down" />
        <div
          className="mx-0.5 h-5 w-px shrink-0 bg-white/[0.07]"
          aria-hidden
        />
        <div
          className="flex items-center gap-0.5 pr-0.5"
          role="group"
          aria-label="Timeline geometry"
        >
          {MODES.map(({ id, ariaLabel }) => {
            const active = timelineMode === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => timelineController.setLayoutMode(id)}
                aria-pressed={active}
                aria-label={ariaLabel}
                className={cn(
                  'relative z-10 flex h-9 w-9 items-center justify-center rounded-full sm:h-9 sm:w-10',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/12',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="timeline-mode-segment"
                    className="absolute inset-0 rounded-full bg-white/[0.08]"
                    transition={
                      reduceMotion ? { duration: 0 } : timelineModeSyncSpring
                    }
                  />
                ) : null}
                <span className="relative flex items-center justify-center">
                  <ModeGlyph mode={id} active={active} />
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
