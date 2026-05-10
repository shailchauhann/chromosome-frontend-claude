# Content gaps & client deliverables

Every spot in the site where placeholder copy, imagery, or configuration is
in use. The client should treat this file as the v1-launch checklist.

## Imagery (highest priority)

- [ ] **Project photography** — One cover image per project, plus 3–5 gallery
      images each. Drop them into `public/images/projects/[slug]/`.
      Filename referenced by `cover:` or `gallery[].src` in the project's
      `.mdx` frontmatter is resolved against that folder.
      Until photographs arrive, every page renders a tasteful gold-on-black
      SVG placeholder typeset with the project title — pages never break.
- [ ] **Studio / team environmental shot** — currently absent on `/about`.
      Suggested: one hero-grade horizontal shot of the studio floor.
- [ ] **Founder portrait** — Avinish Chauhan portrait for the About page.
      Currently the page works without one; design space is reserved.

## Copy

- [ ] **Per-project briefs** — Each `content/projects/*.mdx` body is a stub
      with `## The Brief` and `## Approach` sections marked
      `{/* TODO: client to provide */}`. The frontmatter (title, location,
      category, disciplines) is already populated from the brochure and
      tagged for client review where inferred.
- [ ] **About page narrative** — Long-form paragraphs are paraphrased from
      the brochure's About section; expect at least one editing pass.
- [ ] **Process descriptions** — The three progressive design phases are
      summarised as Discovery → Design Development → Value Engineering &
      Delivery. Confirm phrasing.
- [ ] **Capability descriptions** — Starter copy for the 9 pillars taken
      from the brochure; tightened on `/expertise`. Request review.
- [ ] **Per-project disciplines** — Inferred from project titles via a
      keyword rule in `scripts/_lib.mjs`. Every project's frontmatter has
      a `disciplines:` array — please verify these are correct before
      launch (or hand back annotated copies).
- [ ] **Testimonials / press quotes** — None on the brochure; ask if any
      exist for inclusion on case-study or about pages. The `<Quote />` MDX
      component is ready to drop in.
- [ ] **Improved hero headline on About** — currently
      *"We build the spaces / that teach the world."* This is a placeholder
      from the brief. Confirm or replace.

## Configuration

- [ ] **Domain** — Currently `chromosome-designs.com` placeholder in
      `.env.example` and metadata. Confirm or replace.
- [ ] **Email delivery (Amazon SES v2)** — Verify the sender domain
      (`chromosome-designs.com` recommended) in SES, request production
      access to leave the sandbox, create a narrow-scoped IAM user, and
      set `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
      `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`. Full walkthrough in
      `README.md` → "Setting up the contact form". Without these the form
      still functions — the route logs payloads and returns success.
- [ ] **Bot protection (Cloudflare Turnstile)** — Add a site at
      dash.cloudflare.com → Turnstile, copy the site/secret keys into
      `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. For
      local dev the always-passes test keys are documented in
      `.env.example`.
- [ ] **Analytics** — Plausible and GA4 hooks are env-var-gated and inert
      until `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` or `NEXT_PUBLIC_GA_ID` is set.
      Wiring is in `.env.example` only — script injection is left for the
      analytics decision.
- [ ] **Logo SVG** — The chromosome glyph in `public/favicon.svg` and
      `components/ui/icons/ChromosomeGlyph.tsx` is a reconstruction from
      the brochure's textual description (we couldn't visually render the
      brochure PDF in the build environment). Replace with the
      authoritative SVG when supplied.
- [ ] **OG images** — Per-route metadata is wired; `next/og` runtime
      generation per case study is documented as a future enhancement in
      `README.md`. v1 ships with the cover image (or placeholder) used
      for OG tags via standard `metadataBase` resolution.
- [ ] **Studio map embed** — Contact page uses a Google Maps `iframe`
      pointed at `Bopal, Ahmedabad`. Replace with a precise pin (lat/lng)
      or My Maps custom-styled link if preferred.

## Known content notes

- **Geological Interpretation Park** appears under both Sanctuaries and
  Science Cities in the brochure listing. The site keeps a single project
  page (`geological-interpretation-park-indroda`) under Sanctuaries to avoid
  duplicate listings; verify this matches client intent.
- **Sakkarbaug Zoological Park** appears under both Zoos (completed
  masterplan, slug `sakkarbaug-zoo-masterplan-junagadh`) and Ongoing
  (extension work, slug `sakkarbaug-ongoing`). Both pages exist; confirm
  whether to keep them separate or merge.
- **Featured projects** on the home page horizontal showcase are flagged
  via `featured: true` in MDX frontmatter. Five projects are currently
  featured per the brief. To re-curate, edit any project's frontmatter —
  no code change required.

## Optional

- [ ] **Hindi / Gujarati copy** — Site is English-only. i18n infrastructure
      is not yet wired; adding a `[locale]` route segment is straightforward
      when copy is ready.
- [ ] **Press / awards section** — Not in the brochure; flag if needed.
- [ ] **Hiring / careers page** — Not in scope; add if relevant.
- [ ] **Per-project published year** — Not in the brochure. Year fields in
      MDX frontmatter are blank; populate when you supply briefs.
