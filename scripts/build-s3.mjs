#!/usr/bin/env node
// Cross-platform wrapper for `NEXT_BUILD_TARGET=s3 next build`.
// Use `npm run build:s3` to produce the static export under ./out/ without
// going through the full deploy pipeline.

import { execSync } from 'node:child_process';

execSync('npx next build', {
  stdio: 'inherit',
  env: { ...process.env, NEXT_BUILD_TARGET: 's3' },
});
