import type { MetadataRoute } from 'next';
import { getProjectSlugs } from '@/lib/mdx';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chromosome-designs.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = ['', '/about', '/expertise', '/work', '/contact'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency: path === '' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.8,
    }),
  );

  let slugs: string[] = [];
  try {
    slugs = await getProjectSlugs();
  } catch {
    // Content directory may be empty during initial scaffold.
    slugs = [];
  }

  const projectRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/work/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
