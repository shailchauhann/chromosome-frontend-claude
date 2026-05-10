/**
 * Slugify per the brief's rule: lowercase, hyphenate, strip parentheticals.
 * Pure — safe to use in scripts and at build time.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // diacritics
    .replace(/\([^)]*\)/g, '') // strip parentheticals
    .replace(/&/g, ' and ')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
