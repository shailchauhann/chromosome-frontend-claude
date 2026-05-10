import Link from 'next/link';
import type { Project } from '@/lib/projects-shared';
import { CATEGORY_LABEL } from '@/lib/projects-shared';
import { ProjectImage } from './ProjectImage';
import { Arrow } from '@/components/ui/icons/Arrow';
import { cn } from '@/lib/cn';

type Props = {
  project: Project;
  /** Bento sizing — large tiles span 2 cols on lg+. */
  size?: 'sm' | 'md' | 'lg';
  /** Aspect ratio override for the cover image. */
  ratio?: '16/9' | '4/3' | '3/4' | '1/1';
  className?: string;
  priority?: boolean;
};

export function ProjectCard({ project, size = 'md', ratio, className, priority }: Props) {
  const { slug, frontmatter, assets } = project;
  const { title, location, category, year } = frontmatter;
  const finalRatio = ratio ?? (size === 'lg' ? '16/9' : size === 'sm' ? '3/4' : '4/3');

  return (
    <Link
      href={`/work/${slug}`}
      data-cursor="view"
      data-cursor-label="View"
      className={cn(
        'group relative block overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold',
        className,
      )}
    >
      <div className="relative overflow-hidden">
        <div className="transition-transform duration-700 ease-cinematic group-hover:scale-[1.04]">
          <ProjectImage
            src={assets.cover}
            alt={`${title} — ${location}`}
            ratio={finalRatio}
            fallbackTitle={title}
            fallbackCategory={category}
            priority={priority}
            sizes={
              size === 'lg'
                ? '(min-width: 1024px) 60vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            }
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-bg/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted">
            {CATEGORY_LABEL[category]}
            {year ? ` · ${year}` : ''}
          </p>
          <h3
            className={cn(
              'mt-2 font-display font-medium leading-tight text-brand-text transition-colors group-hover:text-brand-gold',
              size === 'lg' ? 'text-3xl md:text-4xl' : size === 'sm' ? 'text-lg' : 'text-xl md:text-2xl',
            )}
          >
            {title}
          </h3>
          <p className="mt-1 text-sm text-brand-muted">{location}</p>
        </div>
        <Arrow
          size={18}
          className="mt-2 flex-shrink-0 text-brand-gold opacity-0 transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:opacity-100"
        />
      </div>
    </Link>
  );
}
