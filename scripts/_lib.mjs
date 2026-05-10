// Shared helpers for the project-bootstrap and new-project scripts. Pure ESM.

import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';

export const ROOT = path.resolve(process.cwd());
export const CONTENT_DIR = path.join(ROOT, 'content', 'projects');
export const IMAGES_DIR = path.join(ROOT, 'public', 'images', 'projects');

/** Brief's slug rule: lowercase, hyphenate, strip parentheticals. */
export function slugify(input) {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Infer disciplines (the 9 brand pillars) from a project title. Conservative —
 * always flagged in the MDX body so the client can review.
 */
export function inferDisciplines(title) {
  const t = title.toLowerCase();
  const out = new Set();

  if (/(interpret|center|centre)/.test(t)) {
    out.add('Interpretation Centers');
    out.add('Exhibits and Dioramas');
    out.add('Informative Panels and Signages');
  }
  if (/(diorama|exhibit)/.test(t)) {
    out.add('Exhibits and Dioramas');
    out.add('Models and Sculptures');
  }
  if (/(model|sculpture|statue|figur)/.test(t)) {
    out.add('Models and Sculptures');
  }
  if (/(panel|signage|sign)/.test(t)) {
    out.add('Informative Panels and Signages');
  }
  if (/(park|garden|trail|vatika)/.test(t)) {
    out.add('Interpretation Centers');
    out.add('Models and Sculptures');
    out.add('Exhibits and Dioramas');
    out.add('Informative Panels and Signages');
  }
  if (/(book|publication|publicity|brochure|catalogue|catalog)/.test(t)) {
    out.add('Books and Publicity Materials');
  }
  if (/(film|video|documentar)/.test(t)) {
    out.add('Film Making');
  }
  if (/\b(ar|vr|augmented|virtual)\b/.test(t)) {
    out.add('AR & VR Applications');
    out.add('Web Applications & Interactive Software');
  }
  if (/kiosk/.test(t)) {
    out.add('Kiosks');
    out.add('Web Applications & Interactive Software');
  }
  if (/(web|software|interactive|app)/.test(t)) {
    out.add('Web Applications & Interactive Software');
  }
  if (/(entrance|gate)/.test(t)) {
    out.add('Models and Sculptures');
    out.add('Informative Panels and Signages');
  }
  if (/(museum|hall)/.test(t)) {
    out.add('Interpretation Centers');
    out.add('Exhibits and Dioramas');
    out.add('Informative Panels and Signages');
  }

  // Sensible default — every project at minimum involves design + signage.
  if (out.size === 0) {
    out.add('Exhibits and Dioramas');
    out.add('Informative Panels and Signages');
  }
  return [...out];
}

/** Render frontmatter for a project record. Idempotent — same input → same YAML. */
export function renderMdx(project) {
  const {
    title,
    client,
    location,
    year,
    category,
    status = 'completed',
    disciplines = inferDisciplines(title),
    featured = false,
    seoDescription,
  } = project;

  const yamlList = (arr) => arr.map((s) => `  - ${JSON.stringify(s)}`).join('\n');

  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    client ? `client: ${JSON.stringify(client)}` : null,
    `location: ${JSON.stringify(location)}`,
    year !== undefined ? `year: ${year}` : null,
    `category: ${JSON.stringify(category)}`,
    `status: ${JSON.stringify(status)}`,
    'disciplines:',
    yamlList(disciplines),
    'cover: "cover.jpg"',
    'gallery: []',
    `featured: ${featured ? 'true' : 'false'}`,
    'relatedSlugs: []',
    'seo:',
    `  description: ${JSON.stringify(seoDescription ?? `${title} — ${location}`)}`,
    '  ogImage: "cover.jpg"',
    '---',
    '',
    '## The Brief',
    '',
    '{/* TODO: client to provide 1–2 paragraph description */}',
    '',
    '## Approach',
    '',
    '{/* TODO: client to provide approach narrative */}',
    '',
  ]
    .filter((l) => l !== null)
    .join('\n');

  return fm;
}

/** Write a single project: .mdx file + image folder. Skips if .mdx already exists. */
export async function writeProject(project, opts = {}) {
  const { force = false } = opts;
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  const slug = project.slug ?? slugify(`${project.title}-${project.location}`);
  const mdxPath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const imageDir = path.join(IMAGES_DIR, slug);

  await fs.mkdir(imageDir, { recursive: true });
  const gitkeep = path.join(imageDir, '.gitkeep');
  if (!existsSync(gitkeep)) await fs.writeFile(gitkeep, '');

  if (!force && existsSync(mdxPath)) {
    return { slug, mdxPath, imageDir, skipped: true };
  }

  const body = renderMdx(project);
  await fs.writeFile(mdxPath, body, 'utf8');
  return { slug, mdxPath, imageDir, skipped: false };
}
