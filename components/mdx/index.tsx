import { ProjectImage } from '@/components/work/ProjectImage';
import type { ProjectCategory } from '@/lib/projects-shared';
import { cn } from '@/lib/cn';

/**
 * Custom components exposed to MDX bodies. Authors drop these into any
 * project's .mdx; the renderer (CaseStudy.tsx) injects an image-resolution
 * function so <Figure src="..." /> can look up a pre-resolved URL by
 * filename.
 */

type FigureProps = {
  src: string;
  caption?: string;
  alt?: string;
  layout?: 'wide' | 'half' | 'full';
};

type GalleryItemAuthored = { src: string; alt?: string; caption?: string };

type GalleryProps = {
  images: GalleryItemAuthored[];
};

type QuoteProps = {
  children: React.ReactNode;
  author?: string;
};

type StatProps = { value: string | number; label: string };

type VideoProps = { src: string; poster?: string; caption?: string };

type Context = {
  fallbackTitle: string;
  fallbackCategory: ProjectCategory;
  resolveImage: (filename: string) => string | null;
};

export function buildMdxComponents(ctx: Context) {
  const { fallbackTitle, fallbackCategory, resolveImage } = ctx;

  function Figure({ src, caption, alt, layout = 'wide' }: FigureProps) {
    const url = resolveImage(src);
    const widthClass = {
      full: 'w-screen max-w-none -mx-[max(0px,calc((100vw-1440px)/2))]',
      wide: 'w-full',
      half: 'w-full md:w-2/3 mx-auto',
    }[layout];

    return (
      <figure className={cn('my-12 md:my-20', widthClass)}>
        <ProjectImage
          src={url}
          alt={alt ?? caption ?? ''}
          ratio={layout === 'full' ? '21/9' : '4/3'}
          fallbackTitle={fallbackTitle}
          fallbackCategory={fallbackCategory}
        />
        {caption && (
          <figcaption className="mt-4 max-w-prose font-mono text-xs uppercase tracking-[0.2em] text-brand-muted">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  function Gallery({ images }: GalleryProps) {
    return (
      <div className="my-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <figure key={i} className="flex flex-col">
            <ProjectImage
              src={resolveImage(img.src)}
              alt={img.alt ?? ''}
              ratio="4/3"
              fallbackTitle={fallbackTitle}
              fallbackCategory={fallbackCategory}
            />
            {img.caption && (
              <figcaption className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-muted">
                {img.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    );
  }

  function Quote({ children, author }: QuoteProps) {
    return (
      <blockquote className="relative my-16 border-l-2 border-brand-gold pl-8 md:pl-12">
        <p className="font-display text-3xl font-medium italic leading-tight text-brand-gold md:text-4xl lg:text-5xl">
          {children}
        </p>
        {author && (
          <footer className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">
            — {author}
          </footer>
        )}
      </blockquote>
    );
  }

  function Stat({ value, label }: StatProps) {
    return (
      <div className="flex flex-col gap-2 border-l border-brand-rule pl-4 first:border-l-0 first:pl-0 md:pl-8">
        <span className="font-display text-5xl font-black leading-none text-brand-gold md:text-6xl">
          {value}
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">
          {label}
        </span>
      </div>
    );
  }

  function Stats({ children }: { children: React.ReactNode }) {
    return (
      <div className="my-12 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-0">{children}</div>
    );
  }

  function Video({ src, poster, caption }: VideoProps) {
    return (
      <figure className="my-12">
        <video
          controls
          playsInline
          preload="metadata"
          poster={poster}
          className="w-full rounded-sm bg-brand-surface"
        >
          <source src={src} />
          Your browser does not support embedded video.
        </video>
        {caption && (
          <figcaption className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-brand-muted">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return {
    Figure,
    Gallery,
    Quote,
    Stat,
    Stats,
    Video,
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="mt-16 font-display text-3xl font-bold tracking-tight text-brand-text md:text-4xl">
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="mt-10 font-display text-2xl font-semibold text-brand-text">{children}</h3>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-brand-muted">{children}</p>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="mt-6 max-w-prose space-y-3 text-lg leading-relaxed text-brand-muted">
        {children}
      </ul>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="relative pl-6 before:absolute before:left-0 before:top-3 before:h-px before:w-3 before:bg-brand-gold">
        {children}
      </li>
    ),
    a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
      <a
        href={href}
        className="border-b border-brand-gold/40 text-brand-text transition-colors hover:border-brand-gold hover:text-brand-gold"
      >
        {children}
      </a>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-brand-text">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="font-sub italic text-brand-text">{children}</em>
    ),
  };
}
