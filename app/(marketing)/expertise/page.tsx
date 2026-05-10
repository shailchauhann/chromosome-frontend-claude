import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/mdx';
import capabilities from '@/data/capabilities.json';
import { SectionIndex } from '@/components/ui/SectionIndex';
import { Reveal } from '@/components/ui/Reveal';
import { ProjectCard } from '@/components/work/ProjectCard';
import { MagneticLink } from '@/components/ui/MagneticLink';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chromosome-designs.com';

export const metadata: Metadata = {
  title: 'Expertise',
  description:
    'Nine disciplines under one studio: models and sculptures, interpretation centers, exhibits and dioramas, signage, publishing, film, software, kiosks, and AR/VR.',
  alternates: { canonical: `${SITE_URL}/expertise` },
};

/**
 * Map each capability to project keywords used to surface example tiles.
 * Keep loose — we'd rather show 3 tangentially-related projects than none.
 */
const CAPABILITY_PROJECT_KEYWORDS: Record<string, RegExp> = {
  'models-sculptures': /(sculpture|model|dinosaur|sauropod)/i,
  'interpretation-centers': /(interpret|center)/i,
  'exhibits-dioramas': /(exhibit|diorama)/i,
  'panels-signages': /(entrance|gate|trail|park)/i,
  'books-publicity': /(publication|book|brochure)/i,
  'film-making': /(film)/i,
  'web-software': /(interactive|software|web)/i,
  kiosks: /(kiosk)/i,
  'ar-vr': /(ar|vr|augmented|virtual)/i,
};

export default async function ExpertisePage() {
  const all = await getAllProjects();

  return (
    <>
      <SectionIndex count={3} total={7} />

      {/* Hero */}
      <section className="container-prose pt-[calc(var(--nav-height)+6rem)]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
          (03) — Expertise
        </p>
        <h1 className="mt-8 max-w-5xl font-display text-display-xl font-black leading-[0.9] tracking-[-0.025em] text-brand-text">
          Nine disciplines.
          <br />
          <span className="italic text-brand-gold">One studio.</span>
        </h1>
        <p className="mt-10 max-w-xl text-balance font-sub text-xl italic text-brand-muted md:text-2xl">
          From narrative to fabrication, every capability lives under one roof — so a 12-meter
          sauropod ships ready to walk into the story we wrote on day one.
        </p>
      </section>

      {/* Pillars */}
      <div className="mt-32">
        {capabilities.map((c) => {
          const re = CAPABILITY_PROJECT_KEYWORDS[c.id];
          const examples = re
            ? all
                .filter((p) => re.test(p.frontmatter.title) || re.test(p.frontmatter.location))
                .slice(0, 4)
            : [];

          return (
            <section
              key={c.id}
              id={c.id}
              className="hairline-top scroll-mt-32 py-[var(--section-pad-y)]"
              aria-labelledby={`heading-${c.id}`}
            >
              <div className="container-prose">
                <Reveal>
                  <div className="grid gap-10 lg:grid-cols-[auto_1fr_1.6fr] lg:items-start lg:gap-16">
                    <span className="numeral-outline text-[clamp(6rem,18vw,18rem)]">
                      {c.index}
                    </span>
                    <h2
                      id={`heading-${c.id}`}
                      className="font-display text-display-md font-black leading-[0.95] tracking-[-0.02em] text-brand-text"
                    >
                      {c.title}
                    </h2>
                    <p className="max-w-prose text-lg leading-relaxed text-brand-muted md:text-xl">
                      {c.blurb}
                    </p>
                  </div>
                </Reveal>

                {examples.length > 0 && (
                  <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {examples.map((p) => (
                      <ProjectCard key={p.slug} project={p} size="sm" />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* CTA */}
      <section className="hairline-top container-prose py-[var(--section-pad-y)]">
        <Reveal>
          <h2 className="max-w-4xl font-display text-display-md font-black leading-[0.95] text-brand-gold">
            Need a discipline we haven't named?
          </h2>
          <p className="mt-6 max-w-prose text-lg text-brand-muted">
            We've taken on hybrid commissions — books that ship with kiosks, films that live
            inside dioramas, sculptures with embedded AR layers. If your project sits at an
            intersection, that's the conversation we want to have.
          </p>
          <div className="mt-10">
            <MagneticLink href="/contact" variant="pill" arrow>
              Talk to the studio
            </MagneticLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
