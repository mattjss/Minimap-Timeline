import { motion, useReducedMotion } from 'framer-motion'
import { timelineController } from '../../domain/timeline'
import { referenceModeToggleSpring } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TimelineLayoutMode } from '../../types'
import { TopicSelector } from './TopicSelector'

const MODES: { id: TimelineLayoutMode; ariaLabel: string }[] = [
  { id: 'horizontal', ariaLabel: 'Horizontal timeline' },
  { id: 'vertical', ariaLabel: 'Vertical timeline' },
  { id: 'radial', ariaLabel: 'Circular timeline' },
]

/** Square hit target (px). Indicator circle is smaller, centered inside. */
const SLOT_PX = 32
const INDICATOR_PX = 26

const GLYPH = 15

/** Stroke geometry: horizontal line, vertical line, circle — one system, three poses. */
function ModeGlyph({
  mode,
  active,
}: {
  mode: TimelineLayoutMode
  active: boolean
}) {
  const stroke = active
    ? 'rgba(236,232,225,0.82)'
    : 'rgba(100,96,88,0.42)'
  const common = {
    width: GLYPH,
    height: GLYPH,
    viewBox: '0 0 24 24',
    className: 'block shrink-0',
    fill: 'none' as const,
    stroke,
    strokeWidth: 1.65,
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
 * Single top control cluster: topic + geometry modes.
 * Active geometry indicator is a fixed-size circle, centered in a square slot (`layoutId` glide).
 */
export function TimelineModeToggle() {
  const timelineMode = useAppStore((s) => s.timelineMode)
  const reduceMotion = useReducedMotion()
  const segmentTransition = reduceMotion ? { duration: 0 } : referenceModeToggleSpring

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex justify-center px-4 sm:px-6"
      style={{
        paddingTop: 'max(0.4rem, env(safe-area-inset-top, 0px))',
      }}
    >
      <div
        className={cn(
          'pointer-events-auto relative isolate flex max-w-[min(100%,28rem)] items-center gap-0.5 rounded-full p-[2px] pl-1.5',
          'backdrop-blur-sm',
        )}
        style={{
          backgroundColor: 'color-mix(in oklch, var(--color-canvas) 82%, transparent)',
          borderColor: 'color-mix(in oklch, var(--color-ink) 4.5%, transparent)',
          borderWidth: 1,
          borderStyle: 'solid',
          boxShadow:
            'inset 0 1px 0 color-mix(in oklch, var(--color-ink) 2.5%, transparent)',
        }}
        role="toolbar"
        aria-label="Timeline and topic"
      >
        <TopicSelector menuOpens="down" />
        <div
          className="mx-0.5 h-3.5 w-px shrink-0 bg-white/[0.04]"
          aria-hidden
        />
        <div
          className="flex items-center gap-0 pr-0.5"
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
                style={{ width: SLOT_PX, height: SLOT_PX }}
                className={cn(
                  'relative flex shrink-0 items-center justify-center rounded-sm',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/[0.12]',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="timeline-mode-segment"
                    layout="position"
                    className="pointer-events-none absolute rounded-full bg-white/[0.045]"
                    style={{
                      width: INDICATOR_PX,
                      height: INDICATOR_PX,
                      left: '50%',
                      top: '50%',
                      marginLeft: -INDICATOR_PX / 2,
                      marginTop: -INDICATOR_PX / 2,
                    }}
                    transition={segmentTransition}
                  />
                ) : null}
                <span className="relative z-[1] flex size-full items-center justify-center">
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
