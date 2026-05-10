#!/usr/bin/env node
// Builds the Lambda zip and updates the deployed function code.
//
// Usage:  npm run deploy:lambda
//
// Required env (in .env.deploy or shell):
//   LAMBDA_FUNCTION_NAME    e.g. chromosome-contact
//
// Optional:
//   AWS_PROFILE             named profile from ~/.aws/credentials
//   AWS_REGION              if not set in profile
//   PUBLISH=1               publish a new versioned snapshot after update
//
// This script does NOT create the function — that's a one-time AWS console
// step (or `aws lambda create-function`). See DEPLOY.md → Lambda setup.

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const lambdaDir = path.join(repoRoot, 'lambda', 'contact');
const zipPath = path.join(lambdaDir, 'dist', 'contact.zip');

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

const fnName = process.env.LAMBDA_FUNCTION_NAME;
if (!fnName) {
  console.error('LAMBDA_FUNCTION_NAME is not set. Add it to .env.deploy or your shell.');
  process.exit(1);
}

const profileFlag = process.env.AWS_PROFILE ? `--profile ${process.env.AWS_PROFILE}` : '';
const regionFlag = process.env.AWS_REGION ? `--region ${process.env.AWS_REGION}` : '';

function sh(cmd, opts = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

// 1. Package the Lambda.
console.log('→ Building Lambda zip…');
sh(`node "${path.join(lambdaDir, 'package.mjs')}"`, { cwd: lambdaDir });

if (!fs.existsSync(zipPath)) {
  console.error(`Expected ${zipPath} to exist after package step.`);
  process.exit(1);
}

// 2. Update the function code. Use fileb:// for binary upload.
//    On Windows, AWS CLI accepts forward-slash paths.
const cliPath = zipPath.replace(/\\/g, '/');

console.log('→ Updating Lambda function code…');
sh(
  `aws lambda update-function-code ` +
    `--function-name ${fnName} --zip-file fileb://${cliPath} ` +
    `${regionFlag} ${profileFlag}`,
);

// 3. Optional: publish a versioned snapshot so old behaviour stays accessible.
if (process.env.PUBLISH) {
  sh(
    `aws lambda publish-version --function-name ${fnName} ${regionFlag} ${profileFlag}`,
  );
}

console.log('\n✓ Lambda deploy complete.');
