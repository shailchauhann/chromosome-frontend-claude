#!/usr/bin/env node
// Deploys the static site to S3 and invalidates CloudFront.
//
// Usage:  npm run deploy:static
//
// Required env (in .env.deploy or shell):
//   S3_BUCKET                   target bucket name (e.g. chromosome-designs-site)
//   CLOUDFRONT_DISTRIBUTION_ID  your distribution ID (E1ABCDEF…)
//
// Optional:
//   AWS_PROFILE                 named profile from ~/.aws/credentials
//   AWS_REGION                  fallback when bucket lookup fails
//   SKIP_BUILD=1                skip `next build` (use existing out/)
//   SKIP_INVALIDATE=1           skip CloudFront invalidation
//
// Behaviour:
//   1. Runs `next build` with NEXT_BUILD_TARGET=s3 → produces ./out/
//   2. Syncs to s3://$S3_BUCKET, deleting orphaned files
//   3. Sets cache-control: long for /_next/static/* (immutable hashed assets)
//      and short for everything else (HTML must be revalidated)
//   4. Issues a CloudFront invalidation for /* so the next visitor sees fresh HTML
//
// Requires AWS CLI v2 on PATH.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outDir = path.join(repoRoot, 'out');

// Load .env.deploy or .env.local for deploy-time credentials/config.
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv(path.join(repoRoot, '.env.deploy'));
loadEnv(path.join(repoRoot, '.env.local'));

const bucket = process.env.S3_BUCKET;
const distId = process.env.CLOUDFRONT_DISTRIBUTION_ID;

if (!bucket) {
  console.error('S3_BUCKET is not set. Add it to .env.deploy or your shell.');
  process.exit(1);
}

const profileFlag = process.env.AWS_PROFILE ? `--profile ${process.env.AWS_PROFILE}` : '';

function sh(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: repoRoot, ...opts });
}

// 1. Build (unless skipped).
if (!process.env.SKIP_BUILD) {
  sh('npx next build', {
    env: { ...process.env, NEXT_BUILD_TARGET: 's3' },
  });
} else {
  console.log('Skipping build (SKIP_BUILD=1)');
}

if (!fs.existsSync(outDir)) {
  console.error(`Expected build output at ${outDir}, not found. Did the build succeed?`);
  process.exit(1);
}

// 2. Sync to S3 in two passes — long cache for hashed assets, short cache for HTML.
//    /_next/static/* contains content-hashed filenames so 1 year + immutable is safe.
//    Everything else (HTML, sitemap, robots, images) gets a short cache so content
//    updates appear quickly when CloudFront invalidates.

const longCache = 'public, max-age=31536000, immutable';
const shortCache = 'public, max-age=300, must-revalidate';

console.log('\n→ Syncing /_next/static/* with long cache…');
sh(
  `aws s3 sync "${outDir}/_next/static" "s3://${bucket}/_next/static" ` +
    `--delete --cache-control "${longCache}" ${profileFlag}`,
);

console.log('\n→ Syncing remaining assets with short cache…');
sh(
  `aws s3 sync "${outDir}" "s3://${bucket}" ` +
    `--delete --exclude "_next/static/*" ` +
    `--cache-control "${shortCache}" ${profileFlag}`,
);

// 3. CloudFront invalidation.
if (process.env.SKIP_INVALIDATE) {
  console.log('Skipping CloudFront invalidation (SKIP_INVALIDATE=1)');
} else if (!distId) {
  console.warn(
    '\n⚠ CLOUDFRONT_DISTRIBUTION_ID not set — skipping invalidation. ' +
      'Visitors may see stale HTML until CloudFront expires it.',
  );
} else {
  console.log('\n→ Invalidating CloudFront cache…');
  sh(
    `aws cloudfront create-invalidation ` +
      `--distribution-id ${distId} --paths "/*" ${profileFlag}`,
  );
}

console.log('\n✓ Static deploy complete.');
