import { motion, useReducedMotion } from 'framer-motion'
import { timelineController } from '../../domain/timeline'
import { TOPIC_SELECTOR_ROWS } from '../../data/topicCatalog'
import { modeControlTapSpring, stageLayoutTween } from '../../lib/motion'
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
const GLYPH = 16

function ModeGlyph({
  mode,
  active,
}: {
  mode: TimelineLayoutMode
  active: boolean
}) {
  const common = {
    width: GLYPH,
    height: GLYPH,
    viewBox: '0 0 24 24',
    className: cn('block shrink-0', active ? 'text-ui-active' : 'text-ink-faint'),
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 1.35,
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
 * Reference-style chrome: topic + library left, geometry pill centered, range hint right.
 * layoutId segment + stage share `stageLayoutTween` (one continuous mode morph).
 */
export function TimelineModeToggle() {
  const timelineMode = useAppStore((s) => s.timelineMode)
  const activeTopicId = useAppStore((s) => s.activeTopicId)
  const reduceMotion = useReducedMotion()
  const segmentTransition = reduceMotion ? { duration: 0 } : stageLayoutTween
  const tapTransition = reduceMotion ? { duration: 0 } : modeControlTapSpring

  const topicId = activeTopicId ?? 'sf-giants'
  const current =
    TOPIC_SELECTOR_ROWS.find((t) => t.id === topicId) ?? TOPIC_SELECTOR_ROWS[0]!

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 top-0 z-40',
        'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-x-3',
        'px-[max(0.65rem,env(safe-area-inset-left))]',
        'pr-[max(0.65rem,env(safe-area-inset-right))]',
      )}
      style={{
        paddingTop: 'max(0.35rem, env(safe-area-inset-top, 0px))',
      }}
    >
      <div className="pointer-events-auto flex min-w-0 items-stretch gap-0">
        <div
          className="w-[2px] shrink-0 rounded-full"
          style={{ backgroundColor: current.accentColor }}
          aria-hidden
        />
        <div className="flex min-w-0 flex-1 items-start gap-2.5 pl-2.5">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-normal uppercase tracking-wider text-ink-whisper">
              {current.groupLabel}
            </p>
            <h1 className="mt-0.5 truncate text-base font-medium leading-snug text-ink">
              {current.label}
            </h1>
            <p className="mt-0.5 line-clamp-2 text-sm font-normal leading-relaxed text-ink-faint">
              {current.description}
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <TopicSelector menuOpens="down" />
          </div>
        </div>
      </div>

      <div className="pointer-events-auto flex justify-center self-start pt-px">
        <div
          className="relative isolate flex items-center gap-px rounded-full p-px"
          style={controlStripSurfaceStyle}
          role="group"
          aria-label="Timeline geometry"
        >
          {MODES.map(({ id, ariaLabel }) => {
            const active = timelineMode === id
            return (
              <motion.button
                key={id}
                type="button"
                onClick={() => timelineController.setLayoutMode(id)}
                aria-pressed={active}
                aria-label={ariaLabel}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
                transition={tapTransition}
                style={{
                  width: CONTROL_HIT_PX,
                  height: CONTROL_HIT_PX,
                }}
                className={cn(
                  'relative flex shrink-0 items-center justify-center rounded-[0.15rem]',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink/12',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="timeline-mode-segment"
                    layout="position"
                    initial={false}
                    className="pointer-events-none absolute rounded-full bg-chrome-indicator"
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
              </motion.button>
            )
          })}
        </div>
      </div>

      <div className="pointer-events-none min-w-0 justify-self-end pt-0.5 text-right">
        <p
          className="ml-auto max-w-44 truncate text-sm font-normal leading-snug text-ink-muted sm:max-w-56"
          aria-live="polite"
        >
          {current.groupLabel}
          <span className="text-ink-whisper"> · </span>
          <span className="tabular-nums text-ink-faint">{current.rangeHint}</span>
        </p>
        <p className="mt-0.5 ml-auto max-w-44 text-xs font-normal tabular-nums text-ink-whisper sm:max-w-56">
          {current.eventCount} moments
        </p>
      </div>
    </div>
  )
}
