/**
 * Centralized GSAP registration. Import from this module everywhere — never
 * import gsap directly in components. Guarantees plugins register exactly once
 * and only on the client.
 */
'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

export { gsap, ScrollTrigger, Flip };

/** Returns true when the user has requested reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
