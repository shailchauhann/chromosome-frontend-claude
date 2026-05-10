'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

/**
 * Per-route fade/slide entry. Uses a single motion.div keyed by pathname so
 * each navigation re-mounts the wrapper and re-runs the entry animation —
 * no AnimatePresence required (which doesn't compose cleanly with App
 * Router's render lifecycle and was causing intermittent removeChild
 * errors during navigation).
 *
 * The "gold curtain" wipe is rendered as a separate one-shot CSS animation
 * keyed alongside this wrapper so the two never share reconciliation state.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <>
      {/* Curtain wipe — pure CSS keyframe, animation-fill-mode: forwards.
          Restarts every route change because the key changes. */}
      <span
        key={`curtain-${pathname}`}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[200] origin-bottom bg-brand-gold motion-safe:animate-page-curtain"
      />
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.65, 0.05, 0.36, 1], delay: 0.15 }}
      >
        {children}
      </motion.div>
    </>
  );
}
