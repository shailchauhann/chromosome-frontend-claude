import type { Metadata } from 'next';
import { SectionIndex } from '@/components/ui/SectionIndex';
import { Reveal } from '@/components/ui/Reveal';
import { Stats } from '@/components/home/Stats';
import { MagneticLink } from '@/components/ui/MagneticLink';
import { ChromosomeGlyph } from '@/components/ui/icons/ChromosomeGlyph';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chromosome-designs.com';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Chromosome Designs is a ten-person studio of art directors, exhibit designers, an interpretive planner, researchers, and copywriters delivering interpretation centers, exhibits, and sculpture across India.',
  alternates: { canonical: `${SITE_URL}/about` },
};

const PHASES = [
  {
    no: '01',
    title: 'Discovery',
    body: 'Site survey, audience research, story framework. We arrive at a written narrative before anyone touches a sketch — what visitors should leave knowing, feeling, asking.',
  },
  {
    no: '02',
    title: 'Design Development',
    body: 'Concept art, scale models, signage maps, scripts, and material studies. Three progressive design phases let stakeholders course-correct before fabrication is committed.',
  },
  {
    no: '03',
    title: 'Value Engineering & Delivery',
    body: 'Specifications tightened for budget, climate, maintenance, and life cycle. Fabrication, on-site installation, and a year-one defect window — turnkey, no handoffs.',
  },
];

const MAKE = [
  {
    title: 'Animals',
    note: 'FRP, fiberglass, and mixed media — life-size to monumental, with anatomical and habitat accuracy.',
  },
  {
    title: 'Humans',
    note: 'Tribal, historical, and contemporary figures for museum and memorial contexts.',
  },
  {
    title: 'Botanical',
    note: 'Trees, leaves, fruiting bodies — for indoor habitats and weather-controlled dioramas.',
  },
  {
    title: 'Comic & Stylised',
    note: 'Children-first interpretation in zoos, balvatikas, and educational play spaces.',
  },
];

export default function AboutPage() {
  return (
    <>
      <SectionIndex count={2} total={7} />

      {/* Hero */}
      <section className="container-prose pt-[calc(var(--nav-height)+6rem)]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
          (02) — About
        </p>
        <h1 className="mt-8 max-w-5xl font-display text-display-xl font-black leading-[0.9] tracking-[-0.025em] text-brand-text">
          We build the spaces
          <br />
          <span className="italic text-brand-gold">that teach the world.</span>
        </h1>
      </section>

      {/* Story */}
      <section className="container-prose mt-24 grid gap-16 lg:grid-cols-[1fr_2fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <ChromosomeGlyph size={120} className="opacity-90" />
          <p className="mt-8 font-sub text-2xl italic leading-snug text-brand-muted">
            Founded by Avinish Chauhan in Ahmedabad, Gujarat.
          </p>
        </div>
        <div className="space-y-12">
          <Reveal>
            <Chapter
              kicker="(01) — Origin"
              heading="A studio built on stories first, materials second."
              body="Chromosome Designs began as a small interpretive practice in Ahmedabad and grew into a turnkey studio of ten — designers, planners, researchers, and copywriters working under one roof. We earned our place in the field by treating exhibit design as authorship: every panel, every sculpture, every kiosk is one sentence in a longer paragraph the visitor reads as they walk."
            />
          </Reveal>
          <Reveal delay={0.05}>
            <Chapter
              kicker="(02) — Practice"
              heading="Interpretive planning, exhibit design, fabrication."
              body="We work across three disciplines that most studios separate: planning the narrative, designing the artifacts, and physically building them. Holding all three under the same roof means a 12-meter dinosaur leaves the workshop already inside the story we wrote on day one — no handoffs, no translation losses."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <Chapter
              kicker="(03) — Range"
              heading="Sparrows to sauropods, comic to scientific."
              body="Our modeling capabilities span animals, humans, botanical subjects, and stylised comic forms. Where the subject calls for it — a Cretaceous diorama, a desert ecosystem, a fossil cast — scientific accuracy is non-negotiable. Where playfulness serves the audience, we lean in."
            />
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section
        className="hairline-top hairline-bottom mt-32 py-[var(--section-pad-y)]"
        aria-labelledby="process-heading"
      >
        <div className="container-prose">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
            (Process)
          </p>
          <h2
            id="process-heading"
            className="mt-6 max-w-4xl font-display text-display-md font-black leading-[0.95] text-brand-text"
          >
            Three phases. <span className="italic text-brand-gold">No handoffs.</span>
          </h2>

          <ol className="mt-20 space-y-20">
            {PHASES.map((p) => (
              <Reveal key={p.no} as="li">
                <div className="grid gap-8 lg:grid-cols-[auto_1fr_2fr] lg:items-start lg:gap-16">
                  <span className="numeral-outline text-[clamp(6rem,16vw,14rem)]">
                    {p.no}
                  </span>
                  <h3 className="font-display text-3xl font-bold text-brand-text md:text-4xl">
                    {p.title}
                  </h3>
                  <p className="max-w-prose text-lg leading-relaxed text-brand-muted">
                    {p.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* What we make */}
      <section className="container-prose py-[var(--section-pad-y)]" aria-labelledby="make-heading">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
          (Modeling)
        </p>
        <h2
          id="make-heading"
          className="mt-6 max-w-3xl font-display text-display-md font-black leading-[0.95] text-brand-text"
        >
          What <span className="italic text-brand-gold">we make.</span>
        </h2>
        <div className="mt-16 grid grid-cols-1 gap-px bg-brand-rule sm:grid-cols-2 lg:grid-cols-4">
          {MAKE.map((m, i) => (
            <div key={m.title} className="flex flex-col gap-4 bg-brand-bg p-8 md:p-10">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">
                ({String(i + 1).padStart(2, '0')})
              </span>
              <h3 className="font-display text-2xl font-medium text-brand-text">{m.title}</h3>
              <p className="text-sm leading-relaxed text-brand-muted">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats reprise */}
      <Stats />

      {/* CTA */}
      <section className="container-prose py-[var(--section-pad-y)]">
        <Reveal>
          <h2 className="max-w-4xl font-display text-display-md font-black leading-[0.95] text-brand-gold">
            Want the studio behind <span className="italic">your</span> next project?
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <MagneticLink href="/contact" variant="pill" arrow>
              Start a Project
            </MagneticLink>
            <MagneticLink href="/work" variant="underline" arrow>
              See selected work
            </MagneticLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Chapter({
  kicker,
  heading,
  body,
}: {
  kicker: string;
  heading: string;
  body: string;
}) {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">{kicker}</p>
      <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-brand-text md:text-4xl">
        {heading}
      </h2>
      <p className="mt-6 max-w-prose text-lg leading-relaxed text-brand-muted md:text-xl">
        {body}
      </p>
    </article>
  );
}
