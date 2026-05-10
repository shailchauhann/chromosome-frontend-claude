import Image from 'next/image';
import type { ProjectCategory } from '@/lib/projects-shared';
import { ProjectPlaceholder } from '@/components/ui/ProjectPlaceholder';
import { cn } from '@/lib/cn';

type Props = {
  /** Resolved URL (e.g., "/images/projects/foo/cover.jpg") or null when the file is missing. */
  src: string | null;
  alt: string;
  /** Aspect ratio used by the wrapper. Both presence and fallback share this ratio. */
  ratio?: '16/9' | '4/3' | '3/4' | '1/1' | '21/9';
  fallbackTitle?: string;
  fallbackCategory?: ProjectCategory;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Renders a project photo if `src` is non-null; otherwise renders the SVG
 * placeholder. Existence has already been resolved server-side in lib/mdx.ts —
 * this component never touches the filesystem.
 */
export function ProjectImage({
  src,
  alt,
  ratio = '4/3',
  fallbackTitle,
  fallbackCategory,
  className,
  priority,
  sizes = '(min-width: 1024px) 50vw, 100vw',
}: Props) {
  const aspect = {
    '16/9': 'aspect-[16/9]',
    '4/3': 'aspect-[4/3]',
    '3/4': 'aspect-[3/4]',
    '1/1': 'aspect-square',
    '21/9': 'aspect-[21/9]',
  }[ratio];

  if (!src) {
    return (
      <div className={cn('relative overflow-hidden bg-brand-surface', aspect, className)}>
        <ProjectPlaceholder
          title={fallbackTitle ?? alt}
          category={fallbackCategory}
          ratio={ratio === '21/9' ? '16/9' : ratio === '1/1' ? '1/1' : '4/3'}
        />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-brand-surface', aspect, className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
