'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Custom cursor — additive layer over the OS cursor (we do NOT hide the OS
 * cursor; that breaks accessibility and keyboard-focus visibility for many
 * users). The OS cursor stays; this is a gold "follow" ring that grows on
 * interactive elements and shows a label over project tiles.
 *
 * Disabled when:
 *   - touch / coarse-pointer device
 *   - prefers-reduced-motion
 */
export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<'default' | 'link' | 'view'>('default');
  const [label, setLabel] = useState<string>('');

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.4 });

  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    setEnabled(true);

    function onMove(e: PointerEvent) {
      x.set(e.clientX);
      y.set(e.clientY);
    }

    function onOver(e: PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const view = target.closest<HTMLElement>('[data-cursor="view"]');
      if (view) {
        setVariant('view');
        setLabel(view.dataset.cursorLabel ?? 'View');
        return;
      }
      const link = target.closest('a, button, [role="button"], input, textarea, select, label');
      if (link) {
        setVariant('link');
        setLabel('');
      } else {
        setVariant('default');
        setLabel('');
      }
    }

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
    };
  }, [reduce, x, y]);

  if (!enabled) return null;

  const size = variant === 'view' ? 88 : variant === 'link' ? 44 : 18;

  return (
    <motion.div
      ref={ringRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full border border-brand-gold-soft text-[10px] font-medium uppercase tracking-[0.2em] text-brand-gold-soft"
        animate={{
          width: size,
          height: size,
          backgroundColor:
            variant === 'view' ? 'rgba(232,177,30,0.15)' : 'rgba(232,177,30,0)',
        }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
      >
        {variant === 'view' && label}
      </motion.div>
    </motion.div>
  );
}
