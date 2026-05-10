/**
 * MDX content loader (server-only). Reads /content/projects/*.mdx, parses
 * frontmatter, and pre-resolves image existence so client components never
 * need fs access. Re-exports the client-safe types from projects-shared.
 */
import 'server-only';

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { Project, ProjectAssets, ProjectFrontmatter } from './projects-shared';

export type { Project, ProjectAssets, ProjectFrontmatter, GalleryItem } from './projects-shared';
export type { ProjectCategory, ProjectStatus } from './projects-shared';
export { CATEGORY_LABEL } from './projects-shared';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects');
const IMAGE_ROOT = path.join(process.cwd(), 'public', 'images', 'projects');

function resolveAsset(slug: string, filename: string | undefined): string | null {
  if (!filename) return null;
  const abs = path.join(IMAGE_ROOT, slug, filename);
  return existsSync(abs) ? `/images/projects/${slug}/${filename}` : null;
}

function buildAssets(slug: string, fm: ProjectFrontmatter): ProjectAssets {
  return {
    cover: resolveAsset(slug, fm.cover),
    gallery: (fm.gallery ?? []).map((g) => ({
      ...g,
      url: resolveAsset(slug, g.src),
    })),
  };
}

let cache: Project[] | null = null;

export async function getAllProjects(): Promise<Project[]> {
  if (cache) return cache;

  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && e.name.endsWith('.mdx'));

  const projects = await Promise.all(
    files.map(async (file) => {
      const slug = file.name.replace(/\.mdx$/, '');
      const raw = await fs.readFile(path.join(CONTENT_DIR, file.name), 'utf-8');
      const { data, content } = matter(raw);
      const frontmatter = data as ProjectFrontmatter;
      return {
        slug,
        frontmatter,
        body: content,
        assets: buildAssets(slug, frontmatter),
      } satisfies Project;
    }),
  );

  // Stable order: featured first, then year desc, then alpha title.
  projects.sort((a, b) => {
    const af = a.frontmatter.featured ? 0 : 1;
    const bf = b.frontmatter.featured ? 0 : 1;
    if (af !== bf) return af - bf;
    const ay = Number(a.frontmatter.year ?? 0);
    const by = Number(b.frontmatter.year ?? 0);
    if (ay !== by) return by - ay;
    return a.frontmatter.title.localeCompare(b.frontmatter.title);
  });

  cache = projects;
  return projects;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const all = await getAllProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getProjectSlugs(): Promise<string[]> {
  const all = await getAllProjects();
  return all.map((p) => p.slug);
}
