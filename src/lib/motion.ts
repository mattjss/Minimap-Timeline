import { AnimatePresence, motion } from 'framer-motion'

export { AnimatePresence, motion }

/** Default easing for motion-led UI (foundation; tune per component later). */
export const motionTransition = {
  duration: 0.4,
  ease: [0.22, 1, 0.36, 1] as const,
}
