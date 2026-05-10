import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import type { Project } from '@/lib/projects-shared';
import { CATEGORY_LABEL } from '@/lib/projects-shared';
import { ProjectImage } from '@/components/work/ProjectImage';
import { ProjectCard } from '@/components/work/ProjectCard';
import { buildMdxComponents } from '@/components/mdx';
import { Arrow } from '@/components/ui/icons/Arrow';
import { MagneticLink } from '@/components/ui/MagneticLink';
import { Reveal } from '@/components/ui/Reveal';

type Props = {
  project: Project;
  related: Project[];
};

export function CaseStudy({ project, related }: Props) {
  const { frontmatter, body, assets } = project;
  const {
    title,
    client,
    location,
    year,
    category,
    status,
    disciplines = [],
    seo,
  } = frontmatter;

  // Pre-build a map of resolved gallery URLs so the MDX <Figure>/<Gallery>
  // components can look up an image by filename without any fs access.
  const galleryUrlMap = new Map<string, string | null>();
  for (const g of assets.gallery) {
    galleryUrlMap.set(g.src, g.url);
  }
  const components = buildMdxComponents({
    fallbackTitle: title,
    fallbackCategory: category,
    resolveImage: (filename: string) => galleryUrlMap.get(filename) ?? null,
  });

  return (
    <article className="pb-32">
      {/* 1. Hero */}
      <header className="relative">
        <div className="container-prose pt-[calc(var(--nav-height)+4rem)]">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-brand-muted transition-colors hover:text-brand-gold"
          >
            <Arrow size={12} className="rotate-180" />
            All work
          </Link>
          <Reveal>
            <p className="mt-12 font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
              {CATEGORY_LABEL[category]} · {location}
              {year ? ` · ${year}` : ''}
            </p>
            <h1 className="mt-6 max-w-5xl font-display text-display-xl font-black leading-[0.9] tracking-[-0.025em] text-brand-gold">
              {title}
            </h1>
          </Reveal>
        </div>

        <Reveal>
          <div className="container-prose mt-16">
            <ProjectImage
              src={assets.cover}
              alt={`${title} — cover image`}
              ratio="21/9"
              priority
              fallbackTitle={title}
              fallbackCategory={category}
              sizes="100vw"
            />
          </div>
        </Reveal>
      </header>

      {/* 2. Brief block */}
      <section className="container-prose mt-24 grid gap-16 lg:grid-cols-[1.6fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
            (The Brief)
          </p>
          <div className="mt-6 prose-mdx max-w-none">
            <MDXRemote source={body} components={components} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-brand-rule pt-8 lg:grid-cols-1">
            {client && <Meta label="Client" value={client} />}
            <Meta label="Location" value={location} />
            {year && <Meta label="Year" value={String(year)} />}
            <Meta label="Category" value={CATEGORY_LABEL[category]} />
            <Meta label="Status" value={statusLabel(status)} />
            {disciplines.length > 0 && (
              <div className="col-span-2 lg:col-span-1">
                <dt className="font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">
                  Disciplines
                </dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {disciplines.map((d) => (
                    <span
                      key={d}
                      className="rounded-full border border-brand-rule px-3 py-1 text-xs text-brand-text"
                    >
                      {d}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </aside>
      </section>

      {/* 3. Process gallery */}
      {assets.gallery.length > 0 && (
        <section className="container-prose mt-32 space-y-24">
          {assets.gallery.map((img, i) => (
            <Reveal key={`${img.src}-${i}`}>
              <div
                className={`grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center ${
                  i % 2 === 1 ? 'lg:[&>div:first-child]:order-last' : ''
                }`}
              >
                <div>
                  <ProjectImage
                    src={img.url}
                    alt={img.alt}
                    ratio={img.layout === 'full' ? '21/9' : '4/3'}
                    fallbackTitle={title}
                    fallbackCategory={category}
                  />
                </div>
                <div className="max-w-md">
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
                    {String(i + 1).padStart(2, '0')} /{' '}
                    {String(assets.gallery.length).padStart(2, '0')}
                  </p>
                  <p className="mt-4 font-display text-2xl font-medium leading-snug text-brand-text">
                    {img.caption ?? img.alt}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </section>
      )}

      {/* 4. Wide image moment */}
      {assets.gallery[1] && (
        <Reveal>
          <section className="mt-32">
            <div className="container-prose">
              <ProjectImage
                src={assets.gallery[1].url}
                alt={assets.gallery[1].alt}
                ratio="21/9"
                fallbackTitle={title}
                fallbackCategory={category}
                sizes="100vw"
              />
            </div>
          </section>
        </Reveal>
      )}

      {/* 6. Related projects */}
      {related.length > 0 && (
        <section className="container-prose mt-32">
          <header className="mb-12 flex items-end justify-between gap-6">
            <h2 className="font-display text-3xl font-bold text-brand-text md:text-4xl">
              Related work
            </h2>
            <MagneticLink href="/work" variant="underline" arrow>
              All projects
            </MagneticLink>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD CreativeWork */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: title,
            description: seo?.description ?? `${title} — ${location}`,
            creator: { '@type': 'Organization', name: 'Chromosome Designs' },
            ...(client ? { sourceOrganization: client } : {}),
            ...(year ? { dateCreated: String(year) } : {}),
            locationCreated: location,
            keywords: disciplines.join(', '),
          }),
        }}
      />
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">{label}</dt>
      <dd className="mt-2 text-brand-text">{value}</dd>
    </div>
  );
}

function statusLabel(s: 'completed' | 'ongoing' | 'dpr'): string {
  if (s === 'completed') return 'Completed';
  if (s === 'ongoing') return 'In Progress';
  return 'DPR Stage';
}
