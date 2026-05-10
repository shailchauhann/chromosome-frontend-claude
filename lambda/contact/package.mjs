#!/usr/bin/env node
// Builds a deployable Lambda zip at lambda/contact/dist/contact.zip.
//
// We bundle index.mjs + lib/*.mjs + node_modules/zod (the only runtime
// dep the AWS SDK doesn't pre-include in the Lambda Node 20 runtime).
// The @aws-sdk/client-sesv2 package is intentionally omitted because the
// runtime ships it — saves ~7 MB in the zip.
//
// Idempotent. Re-run as often as you like; overwrites the output file.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const zipPath = path.join(distDir, 'contact.zip');

function hasBin(cmd) {
  try {
    execSync(`${process.platform === 'win32' ? 'where' : 'which'} ${cmd}`, {
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

fs.mkdirSync(distDir, { recursive: true });

if (fs.existsSync(zipPath)) fs.rmSync(zipPath);

// Make sure runtime deps are installed (zod) at this folder.
if (!fs.existsSync(path.join(__dirname, 'node_modules', 'zod'))) {
  console.log('Installing runtime dependencies (zod)…');
  execSync('npm install --omit=dev --no-audit --no-fund', {
    cwd: __dirname,
    stdio: 'inherit',
  });
}

// Files / directories to include in the zip.
const includes = ['index.mjs', 'lib', 'package.json', 'node_modules'];

// Use 7-Zip if available (common on Windows), then PowerShell Compress-Archive,
// then `zip` (Linux/macOS). One of these will exist on a developer machine.
function zipWith7z() {
  const args = includes.map((p) => `"${p}"`).join(' ');
  execSync(`7z a -tzip "${zipPath}" ${args}`, {
    cwd: __dirname,
    stdio: 'inherit',
  });
}

function zipWithPowerShell() {
  const list = includes.map((p) => `"${p}"`).join(',');
  // -Force overwrites existing; -CompressionLevel Optimal for smaller artefact.
  const ps = `Compress-Archive -Path ${list} -DestinationPath "${zipPath.replace(/\\/g, '\\\\')}" -CompressionLevel Optimal -Force`;
  execSync(`powershell -NoProfile -Command "${ps}"`, {
    cwd: __dirname,
    stdio: 'inherit',
  });
}

function zipWithUnixZip() {
  const args = includes.map((p) => `"${p}"`).join(' ');
  execSync(`zip -r -9 "${zipPath}" ${args} -x "*.DS_Store" "*/.gitkeep"`, {
    cwd: __dirname,
    stdio: 'inherit',
  });
}

if (hasBin('7z')) {
  zipWith7z();
} else if (process.platform === 'win32') {
  zipWithPowerShell();
} else if (hasBin('zip')) {
  zipWithUnixZip();
} else {
  console.error(
    'No zip tool found. Install 7-Zip (Windows), the `zip` package (Linux/macOS),',
  );
  console.error('or rely on PowerShell on Windows. Aborting.');
  process.exit(1);
}

const stat = fs.statSync(zipPath);
console.log(`✓ Built ${zipPath} (${(stat.size / 1024).toFixed(1)} KB)`);
console.log('  Deploy with: npm run deploy:lambda');
