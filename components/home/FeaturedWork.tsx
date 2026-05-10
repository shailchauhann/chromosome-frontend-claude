'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Project } from '@/lib/mdx';
import { ProjectCard } from '@/components/work/ProjectCard';
// ScrollTrigger is registered as a side effect of importing gsap from this module.
import { gsap } from '@/lib/gsap';
import { Arrow } from '@/components/ui/icons/Arrow';
import Link from 'next/link';

type Props = {
  projects: Project[];
};

/**
 * Section 5 — pinned horizontal showcase. Below `lg`, falls back to a vertical
 * stack (no pinning). The track is slightly wider than the viewport sum so
 * users get the sense of "more to discover" before exit.
 */
export function FeaturedWork({ projects }: Props) {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) return;
    if (typeof window === 'undefined') return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const distance = () => track.scrollWidth - window.innerWidth + 80;
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, [reduce]);

  if (!projects.length) return null;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden lg:h-screen"
      aria-labelledby="featured-heading"
    >
      <div className="container-prose pt-[var(--section-pad-y)] lg:pt-32">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
              (05) — Featured work
            </p>
            <h2
              id="featured-heading"
              className="mt-4 font-display text-display-md font-black leading-[0.95] text-brand-text"
            >
              Selected
              <span className="italic text-brand-gold"> projects.</span>
            </h2>
          </div>
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 self-start border-b border-brand-gold pb-1 font-mono text-xs uppercase tracking-[0.25em] text-brand-gold md:self-end"
          >
            All work
            <Arrow size={12} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </header>
      </div>

      <div className="relative mt-12 lg:mt-20">
        <div
          ref={trackRef}
          className="flex flex-col gap-12 px-6 sm:px-10 lg:flex-row lg:gap-12 lg:px-20 lg:will-change-transform"
        >
          {projects.map((p) => (
            <div
              key={p.slug}
              className="lg:w-[clamp(420px,42vw,640px)] lg:flex-shrink-0"
            >
              <ProjectCard project={p} size="lg" />
            </div>
          ))}
          {/* Tail spacer for a graceful exit on horizontal scroll */}
          <div aria-hidden className="hidden lg:block lg:w-32" />
        </div>
      </div>
    </section>
  );
}
