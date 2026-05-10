#!/usr/bin/env node
/**
 * Create a new project stub.
 *
 *   npm run new-project "Butterfly Park" "Khandwa, Madhya Pradesh" [-- --category sanctuaries]
 *
 * Generates:
 *   content/projects/<slug>.mdx
 *   public/images/projects/<slug>/.gitkeep
 *
 * Frontmatter is pre-populated; disciplines are inferred from the title and
 * tagged for client review. Edit the .mdx body and drop images into the
 * matching folder — page goes live on next build.
 */

import process from 'node:process';
import { writeProject, slugify } from './_lib.mjs';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const [title, location] = positional;

function flag(name, fallback) {
  const idx = args.findIndex((a) => a === `--${name}`);
  if (idx === -1) return fallback;
  return args[idx + 1] ?? fallback;
}

if (!title || !location) {
  console.error('Usage: npm run new-project "Project Title" "Location" [-- --category zoos|sanctuaries|science|sculpture|ongoing] [--client "Client Name"] [--year 2024]');
  process.exit(1);
}

const category = flag('category', 'sanctuaries');
const client = flag('client', undefined);
const yearArg = flag('year', undefined);
const year = yearArg ? Number(yearArg) : undefined;
const slug = flag('slug', slugify(`${title}-${location}`));

const result = await writeProject(
  { title, client, location, year, category, slug },
  { force: false },
);

if (result.skipped) {
  console.log(`Slug already exists — leaving "${slug}.mdx" untouched.`);
  console.log(`Edit:  content/projects/${slug}.mdx`);
  console.log(`Images: public/images/projects/${slug}/`);
  process.exit(0);
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
console.log('\nCreated:');
console.log(`  ${result.mdxPath}`);
console.log(`  ${result.imageDir}/`);
console.log(`\nNext: edit the MDX, drop images into the folder, then visit`);
console.log(`  ${SITE_URL}/work/${slug}\n`);
