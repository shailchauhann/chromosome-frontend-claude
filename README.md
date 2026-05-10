# Chromosome Designs — Marketing Site

Production marketing site for **Chromosome Designs** (Ahmedabad), an
interpretive planning, exhibit design, and fabrication studio. Built with
Next.js 14 (App Router) + TypeScript + Tailwind, with **MDX-driven case
studies** and a **WebGL hero**.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in keys when ready
npm run dev                  # http://localhost:3000
```

| Script                   | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `npm run dev`            | Dev server                                             |
| `npm run build`          | Production build                                       |
| `npm run start`          | Run the production build                               |
| `npm run lint`           | ESLint (zero warnings expected)                        |
| `npm run typecheck`      | `tsc --noEmit`                                         |
| `npm run format`         | Prettier write                                         |
| `npm run new-project`    | Create a new project page from a stub                  |

## What's in the box

- **Routes** — `/`, `/about`, `/expertise`, `/work`, `/work/[slug]`,
  `/contact`, `/api/contact`, `/sitemap.xml`, `/robots.txt`. ~60 static
  pages (50+ project case studies) prerender at build time.
- **Design system** — warm-black canvas (`#0A0A0B`), molten-gold accent
  (`#E8B11E`), Bodoni Moda display, Cormorant Garamond italic accent,
  Inter body, JetBrains Mono indices. Tokens in `styles/tokens.css` and
  Tailwind theme.
- **Interaction** — custom cursor, magnetic CTAs, page-transition curtain,
  scroll-driven reveals (Framer + GSAP), pinned horizontal showcase on the
  home page, dual marquees, oversized typographic numerals.
- **3D hero** — molten-gold chromosome (R3F + drei + three.js) with
  mouse-tilt, slow Y-spin, and frameloop suspension on tab blur. Falls
  back to a static SVG under `prefers-reduced-motion`,
  `hardwareConcurrency < 4`, or any WebGL-init failure. The three.js bundle
  is dynamic-imported so it never enters the initial JS payload.
- **MDX content** — one `.mdx` per project, one image folder per slug,
  no CMS required. The Work index is auto-populated at build time.
- **Forms** — react-hook-form + zod, posting to `/api/contact`. Email
  delivery via **Amazon SES v2**; bot protection via **Cloudflare
  Turnstile** (mostly invisible challenge); per-IP rate limit of 3 sends
  per hour; honeypot field. Without AWS credentials the route logs the
  payload and returns success so the form never appears broken in dev.
- **Accessibility** — skip link, `aria-current` on active route, semantic
  landmarks, `prefers-reduced-motion` honored across cursor / 3D / page
  transitions / scroll counters, keyboard-visible focus rings, AA
  color contrast on body text.
- **SEO** — per-page `generateMetadata`, Open Graph, JSON-LD
  `Organization`/`CreativeWork`/`LocalBusiness`, sitemap, robots.

## Adding a new project (no developer required)

A project page is a pair: one Markdown file and one image folder.

1. Run the helper:
   ```bash
   npm run new-project "Butterfly Park" "Khandwa, Madhya Pradesh"
   ```
   Optional flags:
   ```bash
   npm run new-project "Title" "Location" -- \
     --category sanctuaries \
     --client "Client Name" \
     --year 2024
   ```
   This generates:
   - `content/projects/butterfly-park-khandwa.mdx` — frontmatter pre-filled
   - `public/images/projects/butterfly-park-khandwa/` — empty folder

2. Open the `.mdx` file and:
   - Adjust the frontmatter (year, category, disciplines, etc.)
   - Write the brief and approach in the body — Markdown works
   - List images in `gallery:` once you've dropped them in the folder

3. Drop photographs into the matching `public/images/projects/[slug]/`
   folder. Anything you reference in `cover` or `gallery[].src` is resolved
   against that folder. Missing images render as a tasteful gold-on-black
   SVG placeholder until you supply the real photo, so the page never breaks.

4. Commit and deploy. The Work index (`/work`) is auto-populated from the
   MDX folder at build time — the new project appears on its own URL,
   inside the bento grid, and inside category filters automatically.

### MDX components available in project bodies

Drop these into any `.mdx` body:

- `<Figure src="01-entrance.jpg" caption="…" layout="wide|half|full" />`
- `<Gallery images={[{ src: "…", alt: "…", caption: "…" }, …]} />`
- `<Quote author="…">Pull-quote text</Quote>`
- `<Stats><Stat value="14" label="months" /><Stat value="250k" label="visitors" /></Stats>`
- `<Video src="…" poster="…" caption="…" />`

## Project structure

```
app/
  (marketing)/                 ← shell (Nav, Footer, Cursor, transitions)
    layout.tsx
    page.tsx                   ← Home
    about/page.tsx
    expertise/page.tsx
    work/page.tsx              ← bento grid + filters
    work/[slug]/page.tsx       ← case-study template
    contact/page.tsx
  api/contact/route.ts
  sitemap.ts / robots.ts
  layout.tsx                   ← root html, fonts, metadata
  globals.css
components/
  layout/                      ← Nav, Footer, PageTransition
  ui/                          ← Cursor, MagneticButton, Marquee, SectionIndex,
                                 LayoutFrame, Reveal, ProjectPlaceholder, icons/
  home/                        ← Hero, Hero3D, ChromosomeCanvas, Stats,
                                 IntroMission, CapabilityGrid, FeaturedWork,
                                 ClientsMarquee, PreFooterCTA
  work/                        ← ProjectCard, ProjectImage, WorkIndex, CaseStudy
  contact/                     ← ContactForm, CopyableInfo
  mdx/                         ← components map for MDX bodies
content/projects/              ← author content here (one .mdx per project)
public/
  images/projects/[slug]/      ← drop photographs into per-slug folders
  favicon.svg                  ← reconstructed chromosome glyph
data/                          ← capabilities.json
lib/                           ← mdx loader (server-only), projects-shared,
                                 gsap registry, framer variants, cn, slug
scripts/                       ← seed-projects.mjs, new-project.mjs, _lib.mjs
styles/tokens.css              ← all CSS variables
```

## Performance & a11y

- Initial home page: ~204 kB First Load JS (three.js code-split out).
- Other pages: 119–149 kB First Load JS.
- All `next/image` with explicit aspect ratios — no CLS.
- Self-hosted fonts via `next/font` with `display: 'swap'`.
- `prefers-reduced-motion` is honored at four layers: global CSS,
  framer-motion `useReducedMotion`, the GSAP `prefersReducedMotion()` helper,
  and the 3D fallback in `Hero3D.tsx`.
- Custom cursor is **additive** — the OS cursor stays visible so focus
  rings, IME, and screen-reader cursors are unaffected.

## Brand & tech

- **Palette** — warm-black canvas (`#0A0A0B`), surface (`#141414`), molten gold
  (`#E8B11E`), gold-soft hover (`#F4C842`), warm off-white text (`#F5F2E8`),
  muted body (`#A8A29A`), hairline rule (`#2A2A2A`).
- **Type** — Bodoni Moda (display, weight 400–900), Cormorant Garamond (sub
  italic), Inter (body, weights 300–700), JetBrains Mono (mono accents).
  Self-hosted via `next/font`.
- **Animation** — GSAP 3.12 + ScrollTrigger + Flip; Framer Motion for
  component-level micro-interactions and route transitions.
- **3D** — three.js + @react-three/fiber + @react-three/drei.
- **Forms** — react-hook-form + zod, Resend for email.

## Setting up the contact form (one-time)

The form has three layers — email delivery (SES), bot protection
(Turnstile), and rate limiting (built-in). All three need to be configured
once for production.

### 1. Amazon SES (email delivery)

1. **Pick a region.** `ap-south-1` (Mumbai) is closest to the studio.
   `us-east-1` historically has the highest sending quotas. The verified
   identity below must live in the region you choose.
2. **Verify the sender identity** in the SES console. Two options:
   - **Domain (recommended)** — verify `chromosome-designs.com` by adding
     the DKIM CNAMEs SES gives you. After that, *any* address on the
     domain (`studio@`, `hello@`, …) works as a sender.
   - **Single mailbox** — verify one address (slower path, requires
     clicking a link sent to that mailbox).
3. **Leave the SES sandbox.** New AWS accounts can only send *to*
   verified addresses. In the SES console → "Account dashboard" → "Request
   production access". Approval typically takes a business day. Until then,
   add `cavinish@gmail.com` to "Verified identities" so the form works for
   in-house testing.
4. **Create a narrow IAM user.** Don't use root credentials. Make a user
   with this single-statement policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": ["ses:SendEmail"],
       "Resource": ["arn:aws:ses:REGION:ACCOUNT:identity/YOUR_DOMAIN"]
     }]
   }
   ```
   Generate an access key for the user and put it in the env vars below.

### 2. Cloudflare Turnstile (bot protection)

1. Go to https://dash.cloudflare.com → Turnstile → Add site.
2. Hostnames: add your production domain (and `localhost` for dev).
3. Widget mode: **Managed** (Cloudflare picks the right challenge
   automatically — the most invisible option for real users).
4. Copy the site key and secret key into env vars.

For **local dev** you can use Cloudflare's "always passes" test keys:
- Site key: `1x00000000000000000000AA`
- Secret key: `1x0000000000000000000000000000000AA`

These let you exercise the full code path without consuming quota.

### 3. Environment variables

Set on Vercel (Project Settings → Environment Variables) and locally in
`.env.local`. See `.env.example` for the complete list:

| Variable | Required for | Notes |
| --- | --- | --- |
| `AWS_REGION` | SES | `ap-south-1` or `us-east-1` typically |
| `AWS_ACCESS_KEY_ID` | SES | IAM user with `ses:SendEmail` |
| `AWS_SECRET_ACCESS_KEY` | SES | IAM user secret |
| `CONTACT_FROM_EMAIL` | SES | **Must** be a verified identity |
| `CONTACT_TO_EMAIL` | SES | Where enquiries land |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile | Public, embedded in widget |
| `TURNSTILE_SECRET_KEY` | Turnstile | Server only — never expose |

### 4. Behaviour without configuration

The form is intentionally tolerant of missing credentials so dev never
breaks:

- **Without AWS keys** → API route `console.log`s the payload, returns
  `{ ok: true, delivered: false }`. Visitor sees the success state.
- **Without Turnstile keys** → widget shows an inline yellow dev notice;
  server skips verification *only when `NODE_ENV !== 'production'`*. In
  production, missing `TURNSTILE_SECRET_KEY` causes the API to return 403
  on every submission — fail-closed by design.

### Rate limiting note

The rate limit (3 submissions per IP per hour) is in-memory and therefore
per-serverless-instance on Vercel. Catches casual abuse but won't survive
a determined attacker hitting many instances at once. For production-grade
limits across instances, swap `lib/rate-limit.ts`'s storage layer to
Upstash Redis or Vercel KV — the `rateLimit()` signature stays the same.

## Deploying to Vercel

1. Push to GitHub, import the repo in Vercel.
2. Set the environment variables listed above.
3. Deploy. The default `next build` is enough; no `vercel.json` required.

## Future enhancements (not built in v1)

- **CMS migration** — if the team wants a dashboard instead of editing MDX
  files, the cleanest path is **Sanity Studio** or **Payload CMS** mirroring
  the same schema as the MDX frontmatter. Author logic in `lib/mdx.ts` is the
  single read point and can swap to a CMS client without touching pages.
- **i18n** — site is structured English-only today; adding a `[locale]`
  segment under `app/` is the natural extension.
- **Per-project OG images** — `generateMetadata` is wired; switching to
  `next/og` runtime image generation per case-study is a small follow-up.

## Content gaps

See [`CONTENT.md`](./CONTENT.md) for the canonical list of placeholder copy
and missing imagery the client needs to supply.

## Contact

Studio: G301, Sureel Willows, Ghuma, Bopal, Ahmedabad
Avinish Chauhan — +91 99243 23897 — cavinish@gmail.com
