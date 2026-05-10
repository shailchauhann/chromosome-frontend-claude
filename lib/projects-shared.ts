/**
 * Client-safe types and constants for projects. NO fs access here — anything
 * server-only lives in lib/mdx.ts. Client components import from this file.
 */

export type ProjectCategory = 'zoos' | 'sanctuaries' | 'science' | 'sculpture' | 'ongoing';
export type ProjectStatus = 'completed' | 'ongoing' | 'dpr';

export type GalleryItem = {
  src: string;
  alt: string;
  layout?: 'wide' | 'half' | 'full';
  caption?: string;
};

export type ProjectFrontmatter = {
  title: string;
  client?: string;
  location: string;
  year?: number | string;
  category: ProjectCategory;
  status: ProjectStatus;
  disciplines?: string[];
  cover?: string;
  gallery?: GalleryItem[];
  featured?: boolean;
  relatedSlugs?: string[];
  seo?: { description?: string; ogImage?: string };
};

/**
 * Resolved asset URLs computed at build time. `null` means the file is not
 * present on disk; the renderer should show the placeholder.
 */
export type ProjectAssets = {
  cover: string | null;
  gallery: Array<GalleryItem & { url: string | null }>;
};

export type Project = {
  slug: string;
  frontmatter: ProjectFrontmatter;
  body: string;
  assets: ProjectAssets;
};

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  zoos: 'Zoos & Theme Parks',
  sanctuaries: 'National Parks & Sanctuaries',
  science: 'Science Centers',
  sculpture: 'Public Sculpture',
  ongoing: 'Ongoing & DPR',
};
