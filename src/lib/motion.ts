import { AnimatePresence, motion } from 'framer-motion'

export { AnimatePresence, motion }

/**
 * Reference motion language (60fps / Ibelick timeline variations).
 * Shell surfaces (canvas, mode toggle, schematic nodes) MUST use these tokens only.
 * Product/domain code must not override timings on those components — add behavior
 * beneath via controllers and data, not bespoke springs on the reference shell.
 */

/** Subtle UI chrome outside the schematic (e.g. panel hooks later). */
export const motionTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
}

/** Segmented mode control — quick glide, minimal overshoot (reference toggle). */
export const referenceModeToggleSpring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 36,
  mass: 0.78,
}

/** Schematic morph — same nodes/spine/ticks reflowing together; smooth, floaty 60fps feel. */
export const referenceLayoutMorphSpring = {
  type: 'spring' as const,
  stiffness: 210,
  damping: 32,
  mass: 1.05,
}

/** Mode toggle pill + data timeline geometry — same spring so control and scene feel like one motion. */
export const timelineModeSyncSpring = referenceLayoutMorphSpring

/**
 * Stage re-anchor (H / V / radial composition) — same spring as geometry morph so
 * topology and frame read as one spatial re-compose, not a cut.
 */
export const stageComposeSpring = referenceLayoutMorphSpring

/** Horizontal node hover / selection / label — fast, quiet (same family as reference). */
export const shellMicroSpring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.72,
}

/** @deprecated Use referenceModeToggleSpring — alias for shell imports */
export const modeToggleSpring = referenceModeToggleSpring

/** @deprecated Use referenceLayoutMorphSpring — alias for shell imports */
export const nodeMorphSpring = referenceLayoutMorphSpring
