'use client';

import { useMemo, useState, useId } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Project, ProjectCategory } from '@/lib/projects-shared';
import { ProjectCard } from './ProjectCard';
import { cn } from '@/lib/cn';

const FILTERS: Array<{ id: 'all' | ProjectCategory; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'zoos', label: 'Zoos & Theme Parks' },
  { id: 'sanctuaries', label: 'Sanctuaries' },
  { id: 'science', label: 'Science Centers' },
  { id: 'sculpture', label: 'Sculpture' },
  { id: 'ongoing', label: 'Ongoing' },
];

/**
 * Bento layout pattern: a repeating sequence of tile sizes (lg/md/md/sm/md/sm…)
 * applied across the project list. Asymmetric without being random.
 */
const BENTO_PATTERN = ['lg', 'md', 'md', 'sm', 'md', 'lg', 'sm', 'md', 'md'] as const;

type Size = (typeof BENTO_PATTERN)[number];

const SIZE_TO_COLSPAN: Record<Size, string> = {
  lg: 'md:col-span-3 md:row-span-2',
  md: 'md:col-span-2',
  sm: 'md:col-span-2',
};

type Props = {
  projects: Project[];
};

export function WorkIndex({ projects }: Props) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<'all' | ProjectCategory>('all');
  const groupId = useId();

  const filtered = useMemo(() => {
    if (active === 'all') return projects;
    return projects.filter((p) => p.frontmatter.category === active);
  }, [active, projects]);

  return (
    <div>
      {/* Filter pills */}
      <div
        role="tablist"
        aria-label="Filter projects by category"
        className="hairline-bottom mb-12 flex flex-wrap gap-2 pb-6"
      >
        {FILTERS.map((f) => {
          const count =
            f.id === 'all'
              ? projects.length
              : projects.filter((p) => p.frontmatter.category === f.id).length;
          const selected = active === f.id;
          return (
            <button
              type="button"
              key={f.id}
              id={`${groupId}-${f.id}`}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(f.id)}
              className={cn(
                'group relative inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-colors duration-300',
                selected
                  ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                  : 'border-brand-rule text-brand-text hover:border-brand-gold/50 hover:text-brand-gold',
              )}
            >
              {f.label}
              <span className="font-mono text-[10px] tracking-[0.2em] opacity-70">
                ({count.toString().padStart(2, '0')})
              </span>
            </button>
          );
        })}
      </div>

      {/* Bento grid — 6-col on md+, layout animations on filter change */}
      <motion.div
        layout={!reduce}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-6 md:auto-rows-[18rem]"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((project, i) => {
            const size: Size = (BENTO_PATTERN[i % BENTO_PATTERN.length] ?? 'md') as Size;
            const ratio = size === 'lg' ? '4/3' : size === 'sm' ? '3/4' : '4/3';
            return (
              <motion.div
                key={project.slug}
                layout={!reduce}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: [0.65, 0.05, 0.36, 1] }}
                className={cn(
                  'flex flex-col',
                  SIZE_TO_COLSPAN[size],
                )}
              >
                <ProjectCard project={project} size={size} ratio={ratio} priority={i < 3} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-24 text-center font-mono text-sm uppercase tracking-[0.25em] text-brand-muted">
          Nothing here yet.
        </p>
      )}
    </div>
  );
}
