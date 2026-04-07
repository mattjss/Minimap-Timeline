import { motion, useReducedMotion } from 'framer-motion'
import { timelineController } from '../../domain/timeline'
import { referenceModeToggleSpring } from '../../lib/motion'
import { cn } from '../../lib/utils'
import { useAppStore } from '../../store/useAppStore'
import type { TimelineLayoutMode } from '../../types'
import { CONTROL_HIT_PX, controlStripSurfaceStyle } from './controlStrip'
import { TopicSelector } from './TopicSelector'

const MODES: { id: TimelineLayoutMode; ariaLabel: string }[] = [
  { id: 'horizontal', ariaLabel: 'Horizontal timeline' },
  { id: 'vertical', ariaLabel: 'Vertical timeline' },
  { id: 'radial', ariaLabel: 'Circular timeline' },
]

const INDICATOR_PX = 24
const GLYPH = 13

function ModeGlyph({
  mode,
  active,
}: {
  mode: TimelineLayoutMode
  active: boolean
}) {
  const stroke = active
    ? 'rgba(236,232,225,0.78)'
    : 'rgba(100,96,88,0.36)'
  const common = {
    width: GLYPH,
    height: GLYPH,
    viewBox: '0 0 24 24',
    className: 'block shrink-0',
    fill: 'none' as const,
    stroke,
    strokeWidth: 1.35,
    strokeLinecap: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (mode) {
    case 'horizontal':
      return (
        <svg {...common}>
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      )
    case 'vertical':
      return (
        <svg {...common}>
          <line x1="12" y1="6" x2="12" y2="18" />
        </svg>
      )
    case 'radial':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="6.5" />
        </svg>
      )
    default:
      return null
  }
}

/**
 * One control strip: library icon + geometry triad — shared material, equal squares, circular active glide.
 */
export function TimelineModeToggle() {
  const timelineMode = useAppStore((s) => s.timelineMode)
  const reduceMotion = useReducedMotion()
  const segmentTransition = reduceMotion ? { duration: 0 } : referenceModeToggleSpring

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex justify-start px-[max(0.5rem,env(safe-area-inset-left))] sm:pl-[max(0.65rem,env(safe-area-inset-left))]"
      style={{
        paddingTop: 'max(0.35rem, env(safe-area-inset-top, 0px))',
      }}
    >
      <div
        className={cn(
          'pointer-events-auto relative isolate flex items-center gap-px rounded-full p-[2px]',
          'backdrop-blur-sm',
        )}
        style={controlStripSurfaceStyle}
        role="toolbar"
        aria-label="Timeline and topic"
      >
        <TopicSelector menuOpens="down" />
        <div
          className="mx-0.5 h-[18px] w-px shrink-0 bg-white/[0.035]"
          aria-hidden
        />
        <div
          className="flex items-center gap-px pr-px"
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
                style={{
                  width: CONTROL_HIT_PX,
                  height: CONTROL_HIT_PX,
                }}
                className={cn(
                  'relative flex shrink-0 items-center justify-center rounded-[0.2rem]',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/9',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="timeline-mode-segment"
                    layout="position"
                    className="pointer-events-none absolute rounded-full bg-white/[0.038]"
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
                <span className="relative z-1 flex size-full items-center justify-center">
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
