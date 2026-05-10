'use client';

import Link from 'next/link';
import capabilities from '@/data/capabilities.json';
import { Arrow } from '@/components/ui/icons/Arrow';
import { RevealStagger, revealItem } from '@/components/ui/Reveal';
import { motion } from 'framer-motion';

/**
 * Section 4 — 9 capability cards in a 3×3 grid (1-col on mobile). Each card
 * links to the matching anchor on /expertise.
 */
export function CapabilityGrid() {
  return (
    <section
      className="container-prose py-[var(--section-pad-y)]"
      aria-labelledby="capabilities-heading"
    >
      <header className="hairline-bottom flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
            (04) — What we do
          </p>
          <h2
            id="capabilities-heading"
            className="mt-4 font-display text-display-md font-black leading-[0.95] text-brand-text"
          >
            Nine disciplines.
            <br />
            <span className="italic text-brand-gold">One studio.</span>
          </h2>
        </div>
        <Link
          href="/expertise"
          className="group inline-flex items-center gap-2 self-start border-b border-brand-gold pb-1 font-mono text-xs uppercase tracking-[0.25em] text-brand-gold md:self-end"
        >
          See full expertise
          <Arrow size={12} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </header>

      <RevealStagger className="mt-12 grid grid-cols-1 gap-px bg-brand-rule sm:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((c) => (
          <CapabilityCard key={c.id} {...c} />
        ))}
      </RevealStagger>
    </section>
  );
}

function CapabilityCard({
  id,
  index,
  title,
  blurb,
}: {
  id: string;
  index: string;
  title: string;
  blurb: string;
}) {
  return (
    <motion.div variants={revealItem}>
      <Link
        href={`/expertise#${id}`}
        className="group relative flex h-full flex-col gap-6 bg-brand-bg p-8 transition-colors duration-500 hover:bg-brand-surface md:p-10"
      >
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">
            ({index})
          </span>
          <Arrow
            size={16}
            className="text-brand-gold opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
          />
        </div>
        <h3 className="font-display text-2xl font-medium leading-tight text-brand-text transition-colors group-hover:text-brand-gold md:text-3xl">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-brand-muted">{blurb}</p>
        <div className="mt-auto h-px w-12 origin-left scale-x-0 bg-brand-gold transition-transform duration-500 group-hover:scale-x-100" />
      </Link>
    </motion.div>
  );
}
