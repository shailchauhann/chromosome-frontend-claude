'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  children: ReactNode;
  delay?: number;
  /** Translate distance (px). */
  y?: number;
  className?: string;
  as?: 'div' | 'span' | 'section' | 'article' | 'p' | 'li';
  once?: boolean;
};

/**
 * Lightweight viewport-reveal wrapper. For section-level entrances; for
 * complex scroll choreography use GSAP via the page-specific component.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = 'div',
  once = true,
}: Props) {
  const reduce = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.8, ease: [0.65, 0.05, 0.36, 1], delay }}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}

/** Reveal each direct child sequentially. */
export function RevealStagger({
  children,
  className,
  gap = 0.08,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const revealItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.65, 0.05, 0.36, 1] } },
};
