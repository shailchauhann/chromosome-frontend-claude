'use client';

import Link, { type LinkProps } from 'next/link';
import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Arrow } from './icons/Arrow';

type Props = LinkProps & {
  children: ReactNode;
  strength?: number;
  arrow?: boolean;
  variant?: 'pill' | 'underline' | 'ghost';
  className?: string;
};

/** Magnetic CTA rendered as a Next.js Link. Mirror of MagneticButton. */
export function MagneticLink({
  children,
  strength = 18,
  arrow = true,
  variant = 'pill',
  className,
  href,
  ...rest
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 });

  function handleMove(e: React.PointerEvent<HTMLAnchorElement>) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - (r.left + r.width / 2);
    const py = e.clientY - (r.top + r.height / 2);
    x.set((px / (r.width / 2)) * strength);
    y.set((py / (r.height / 2)) * strength);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  const base =
    'group relative inline-flex items-center gap-3 transition-colors duration-300 ease-cinematic focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold';

  const variantClass = {
    pill: 'rounded-full border border-brand-gold/40 bg-transparent px-7 py-3 text-sm font-medium uppercase tracking-[0.2em] text-brand-gold hover:border-brand-gold hover:bg-brand-gold/10',
    underline: 'border-b border-brand-gold pb-1 text-brand-gold hover:text-brand-gold-soft',
    ghost: 'text-brand-text hover:text-brand-gold',
  }[variant];

  return (
    <motion.span
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      <Link ref={ref} href={href} className={cn(base, variantClass, className)} {...rest}>
        <span className="inline-block transition-transform duration-300 ease-cinematic group-hover:-translate-x-0.5">
          {children}
        </span>
        {arrow && (
          <Arrow
            className="transition-transform duration-300 ease-cinematic group-hover:translate-x-1 group-hover:-translate-y-0.5"
            size={14}
          />
        )}
      </Link>
    </motion.span>
  );
}
