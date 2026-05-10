'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

type Stat = { value: number; suffix?: string; label: string };

const STATS: Stat[] = [
  { value: 10, label: 'Team' },
  { value: 400, suffix: '+', label: 'Projects' },
  { value: 600, suffix: '+', label: 'Clients' },
];

export function Stats() {
  return (
    <section
      className="hairline-top hairline-bottom"
      aria-labelledby="stats-heading"
    >
      <h2 id="stats-heading" className="sr-only">
        By the numbers
      </h2>
      <div className="container-prose grid grid-cols-1 divide-y divide-brand-rule md:grid-cols-3 md:divide-x md:divide-y-0">
        {STATS.map((s, i) => (
          <StatBlock key={s.label} stat={s} index={i} />
        ))}
      </div>
    </section>
  );
}

function StatBlock({ stat, index }: { stat: Stat; index: number }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(reduce ? stat.value : 0);

  useEffect(() => {
    if (reduce) {
      setN(stat.value);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let started = false;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const duration = 1600;
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setN(Math.round(eased * stat.value));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [stat.value, reduce]);

  return (
    <div
      ref={ref}
      className="flex flex-col items-start justify-center gap-3 px-2 py-12 md:px-12 md:py-20"
    >
      <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">
        ({String(index + 1).padStart(2, '0')})
      </span>
      <span className="font-display text-[clamp(4rem,12vw,9rem)] font-black leading-none tracking-[-0.04em] text-brand-gold">
        {n}
        {stat.suffix ?? ''}
      </span>
      <span className="font-display text-2xl font-medium text-brand-text">{stat.label}</span>
    </div>
  );
}
