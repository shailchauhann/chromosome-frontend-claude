import type { Variants } from 'framer-motion';

/** Cubic-bezier curve used across all cinematic transitions in the site. */
export const cinematicEase = [0.65, 0.05, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: cinematicEase },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: cinematicEase } },
};

export const stagger = (gap = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap } },
});

/** Curtain wipe used for page transitions — gold rectangle from bottom. */
export const curtain: Variants = {
  initial: { scaleY: 0, transformOrigin: 'bottom' },
  animate: { scaleY: 1, transition: { duration: 0.4, ease: cinematicEase } },
  exit: {
    scaleY: 0,
    transformOrigin: 'top',
    transition: { duration: 0.3, ease: cinematicEase, delay: 0.05 },
  },
};
