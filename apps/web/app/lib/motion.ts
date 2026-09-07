// Shared motion presets for Community of Christ Scripture Study.
//
// Import from "motion/react" in components (the actively-maintained successor to
// Framer Motion). Everything here is deliberately calm and quick -- tasteful
// micro-motion (page/section fades, modal enter/exit, hover/press feedback), never
// gratuitous. Reuse these presets instead of inventing one-off timings/easings so
// motion feels consistent across the app.
//
// Example usage:
//   import { motion } from 'motion/react';
//   import { fadeInUp, modalOverlay, modalContent } from '@/app/lib/motion';
//
//   <motion.div variants={fadeInUp} initial="hidden" animate="visible" exit="hidden" />

import type { Transition, Variants } from 'motion/react';

/** Standard easing for most UI motion -- a gentle deceleration, not a bounce. */
export const easeStandard: Transition['ease'] = [0.16, 1, 0.3, 1];

/** Default transition for content entering the screen (fades, slides). */
export const transitionDefault: Transition = {
  duration: 0.25,
  ease: easeStandard,
};

/** Snappier transition for hover/press feedback on interactive elements. */
export const transitionFast: Transition = {
  duration: 0.15,
  ease: easeStandard,
};

/** Slightly slower transition for larger surfaces (modals, panels, page sections). */
export const transitionPanel: Transition = {
  duration: 0.3,
  ease: easeStandard,
};

/**
 * Fade + rise -- the workhorse entrance for cards, list items, and page sections.
 * Pair with `initial="hidden" animate="visible" exit="hidden"`.
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: transitionDefault },
};

/** Plain fade, no movement -- for content where a rise would feel distracting. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitionDefault },
};

/** Backdrop for a modal/dialog overlay (Radix Dialog.Overlay, Sheet backdrops, etc). */
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitionFast },
};

/** The modal/dialog panel itself -- a subtle scale + rise feels calmer than a slide. */
export const modalContent: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: transitionPanel },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: transitionFast },
};

/** A right-hand drawer/sheet (e.g. mobile sidebar) sliding in from off-screen. */
export const drawerRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: transitionPanel },
  exit: { opacity: 0, x: 24, transition: transitionFast },
};

/**
 * Parent wrapper that staggers its children's own `fadeInUp`-style variants.
 * Put this on the parent (`variants={staggerChildren}`) and `fadeInUp` on each child.
 */
export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

/** Subtle hover lift for cards/buttons -- pass as `whileHover`. */
export const hoverLift = {
  y: -2,
  transition: transitionFast,
};

/** Subtle press-down feedback -- pass as `whileTap`. */
export const tapPress = {
  scale: 0.97,
  transition: transitionFast,
};
