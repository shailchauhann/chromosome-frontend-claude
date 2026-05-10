import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllProjects, getProjectBySlug, getProjectSlugs } from '@/lib/mdx';
import { CaseStudy } from '@/components/work/CaseStudy';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chromosome-designs.com';

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: 'Not found' };
  const { title, location, year, seo } = project.frontmatter;
  const description = seo?.description ?? `${title} — ${location}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/work/${params.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/work/${params.slug}`,
      type: 'article',
      ...(year ? { publishedTime: `${year}-01-01` } : {}),
    },
  };
}

export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const all = await getAllProjects();
  // Related: explicit relatedSlugs first, then fall back to same-category (excluding self).
  const explicit = project.frontmatter.relatedSlugs ?? [];
  const explicitProjects = explicit
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const sameCategory = all.filter(
    (p) => p.slug !== project.slug && p.frontmatter.category === project.frontmatter.category,
  );

  const related = [...explicitProjects, ...sameCategory]
    .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
    .slice(0, 3);

  return <CaseStudy project={project} related={related} />;
}
