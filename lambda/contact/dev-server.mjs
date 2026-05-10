#!/usr/bin/env node
// Local dev wrapper — runs the Lambda handler behind a plain Node http
// server so you can develop the form without deploying. The web app's
// .env.local should point NEXT_PUBLIC_CONTACT_API_URL at this:
//
//     NEXT_PUBLIC_CONTACT_API_URL=http://localhost:8787
//
// Reads .env from the repo root so AWS / Turnstile credentials configured
// for the rest of the app are reused here.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');

// Tiny .env reader — no dotenv dep so this script needs zero install.
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnv(path.join(repoRoot, '.env.local'));
loadEnv(path.join(repoRoot, '.env'));

const { handler } = await import('./index.mjs');

const PORT = Number(process.env.LAMBDA_DEV_PORT ?? 8787);

const server = http.createServer(async (req, res) => {
  // Collect body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString('utf8');

  // Build a Lambda-Function-URL-shaped event from the http request.
  const event = {
    body,
    headers: Object.fromEntries(
      Object.entries(req.headers).map(([k, v]) => [k.toLowerCase(), Array.isArray(v) ? v.join(', ') : v]),
    ),
    requestContext: {
      http: {
        method: req.method,
        sourceIp: req.socket.remoteAddress?.replace('::ffff:', '') ?? 'unknown',
      },
    },
    rawPath: req.url ?? '/',
  };

  try {
    const result = await handler(event);
    res.statusCode = result.statusCode ?? 200;
    for (const [k, v] of Object.entries(result.headers ?? {})) {
      res.setHeader(k, String(v));
    }
    res.end(result.body ?? '');
  } catch (err) {
    console.error('[dev-server] handler threw:', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: false, error: 'handler_threw' }));
  }
});

server.listen(PORT, () => {
  console.log(`▲ Lambda dev-server listening on http://localhost:${PORT}`);
  console.log('  POST a JSON body to test, or set in your .env.local:');
  console.log(`    NEXT_PUBLIC_CONTACT_API_URL=http://localhost:${PORT}`);
});
