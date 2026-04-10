import { AnimatePresence, motion } from 'framer-motion'

export { AnimatePresence, motion }

/**
 * Motion language (Framer Motion).
 * - **Mode changes** use one shared tween (ease-in-out, no overshoot) so stage, spine, nodes,
 *   and the toggle pill read as a single morph.
 * - **Springs** are reserved for small control feedback (tap) and node hover scale only.
 */

/**
 * Shared curve for timeline mode morph — smooth ease-in-out (no spring bounce on layout).
 */
export const timelineModeMorphEase = [0.45, 0, 0.55, 1] as const

/** Duration for H ↔ V ↔ radial geometry + spine + chrome layoutId (seconds). */
export const timelineModeMorphDuration = 0.78

/**
 * Primary layout choreography (legacy name): still exported for callers that expect a spring
 * object — tuned softer so any remaining spring use settles quickly without oscillation.
 */
export const referenceLayoutMorphSpring = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 42,
  mass: 0.95,
}

/** @deprecated Alias — use referenceLayoutMorphSpring; kept for toggle imports */
export const referenceModeToggleSpring = referenceLayoutMorphSpring

/** @deprecated Prefer timelineGeometryTween for mode sync */
export const timelineModeSyncSpring = referenceLayoutMorphSpring

/** Stage re-anchor (H / V / radial) */
export const stageComposeSpring = referenceLayoutMorphSpring

/**
 * Stage shell `layout` — same duration/ease as SVG morph so the box and geometry stay locked.
 */
export const stageLayoutTween = {
  layout: {
    type: 'tween' as const,
    duration: timelineModeMorphDuration,
    ease: timelineModeMorphEase,
  },
}

/**
 * SVG spine, ticks, node positions — identical to stage layout morph.
 */
export const timelineGeometryTween = {
  duration: timelineModeMorphDuration,
  ease: timelineModeMorphEase,
}

/**
 * Line spine ↔ radial arc: **same** tween as geometry (was a short snap — caused harsh handoff).
 */
export const timelineSpineMorph = {
  duration: timelineModeMorphDuration,
  ease: timelineModeMorphEase,
}

/** @deprecated Use timelineSpineMorph */
export const timelineSpineCrossfade = timelineSpineMorph

/** Short press feedback on toolbar mode buttons (does not affect layoutId spring) */
export const modeControlTapSpring = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 44,
  mass: 0.55,
}

/** Subtle UI chrome (panels, etc.) */
export const motionTransition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1] as const,
}

/** Timeline marks / ticks — slightly snappier than layout morph, still damped */
export const shellMicroSpring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 36,
  mass: 0.72,
}

/** @deprecated Use referenceModeToggleSpring */
export const modeToggleSpring = referenceModeToggleSpring

/** @deprecated Use referenceLayoutMorphSpring */
export const nodeMorphSpring = referenceLayoutMorphSpring
