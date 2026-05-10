# Contact-form Lambda

Standalone AWS Lambda for the contact-form handler. Deployed independently
of the static site; CloudFront proxies `/api/contact` requests to this
function's URL.

## Local dev

```bash
cd lambda/contact
npm install            # one-time
npm run dev            # serves on http://localhost:8787
```

In the web app's `.env.local`, set:

```
NEXT_PUBLIC_CONTACT_API_URL=http://localhost:8787
```

The dev-server reads `.env.local` from the repo root, so AWS / Turnstile
keys you've configured for the rest of the app are picked up automatically.

## Building a deployable zip

```bash
npm run package        # writes dist/contact.zip
```

That file is what gets uploaded with `aws lambda update-function-code`.
See the repo root's `DEPLOY.md` for the full deployment walkthrough.

## What the zip contains

- `index.mjs` — Lambda handler entry
- `lib/*.mjs` — email, turnstile, rate-limit modules
- `node_modules/zod` — the only runtime dep not in the Lambda Node 20
  base image. `@aws-sdk/client-sesv2` is **intentionally omitted** because
  it ships with the runtime — saves ~7 MB in the artefact.

## Environment variables (set in Lambda console / IaC)

| Variable | Required | Purpose |
| --- | --- | --- |
| `CONTACT_FROM_EMAIL` | yes | Verified SES sender identity |
| `CONTACT_TO_EMAIL` | no (default `cavinish@gmail.com`) | Recipient |
| `TURNSTILE_SECRET_KEY` | yes (in prod) | Cloudflare server secret |
| `ALLOWED_ORIGIN` | optional | e.g. `https://chromosome-designs.com` |
| `NODE_ENV` | should be `production` in Lambda | Strict mode for Turnstile |

**AWS credentials are not env vars.** The Lambda's IAM execution role
provides them automatically. Attach a policy with `ses:SendEmail` on your
verified SES identity ARNs.
