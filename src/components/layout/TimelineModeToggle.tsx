import { motion, useReducedMotion } from 'framer-motion'
import { timelineController } from '../../domain/timeline'
import { timelineModeSyncSpring } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TimelineLayoutMode } from '../../types'

/** Minus bar from minus-sign-solid-rounded.svg — horizontal = default; vertical = rotate 90°. */
const MINUS_BAR_PATH =
  'M21.25 12C21.25 12.6904 20.6904 13.25 20 13.25H4C3.30964 13.25 2.75 12.6904 2.75 12C2.75 11.3096 3.30964 10.75 4 10.75L20 10.75C20.6904 10.75 21.25 11.3096 21.25 12Z'

const MODES: { id: TimelineLayoutMode; label: string }[] = [
  { id: 'horizontal', label: 'Horizontal layout' },
  { id: 'vertical', label: 'Vertical layout' },
  { id: 'radial', label: 'Circular layout' },
]

const ICON_SIZE = 18

function ModeGlyph({
  mode,
  active,
}: {
  mode: TimelineLayoutMode
  active: boolean
}) {
  const opacity = active ? 0.95 : 0.4
  const common = {
    width: ICON_SIZE,
    height: ICON_SIZE,
    viewBox: '0 0 24 24',
    className: 'mx-auto block shrink-0',
    'aria-hidden': true as const,
    style: { opacity },
  }

  switch (mode) {
    case 'horizontal':
      return (
        <svg {...common}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={MINUS_BAR_PATH}
            fill="currentColor"
          />
        </svg>
      )
    case 'vertical':
      return (
        <svg {...common}>
          <g transform="rotate(90 12 12)">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d={MINUS_BAR_PATH}
              fill="currentColor"
            />
          </g>
        </svg>
      )
    case 'radial':
      return (
        <svg {...common} fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinejoin="round"
          />
        </svg>
      )
    default:
      return null
  }
}

export function TimelineModeToggle() {
  const timelineMode = useAppStore((s) => s.timelineMode)
  const reduceMotion = useReducedMotion()

  return (
    <div
      className="pointer-events-auto fixed bottom-7 left-1/2 z-30 -translate-x-1/2 px-4"
      style={{
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 0px))',
      }}
    >
      <div
        className={cn(
          'relative isolate flex items-stretch rounded-lg border border-white/10',
          'bg-black/55 p-0.5',
          'shadow-[0_8px_28px_rgba(0,0,0,0.45)]',
        )}
        role="group"
      >
        <span className="sr-only">Timeline layout mode</span>
        {MODES.map(({ id, label }) => {
          const active = timelineMode === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => timelineController.setLayoutMode(id)}
              aria-pressed={active}
              className={cn(
                'relative z-10 flex min-w-11 items-center justify-center px-2 py-2',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/20',
                active ? 'text-ink' : 'text-ink-faint/70',
              )}
            >
              <span className="sr-only">{label}</span>
              {active ? (
                <motion.span
                  layoutId="timeline-mode-segment"
                  className="absolute inset-0.5 rounded-[6px] bg-white/[0.14]"
                  transition={
                    reduceMotion ? { duration: 0 } : timelineModeSyncSpring
                  }
                />
              ) : null}
              <span
                className="relative flex items-center justify-center"
                aria-hidden
              >
                <ModeGlyph mode={id} active={active} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
