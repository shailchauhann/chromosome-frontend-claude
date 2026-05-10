import { Reveal } from '@/components/ui/Reveal';

/**
 * Section 2 — split layout. Sticky italic phrase on the left; three short
 * paragraphs revealing on scroll on the right.
 */
export function IntroMission() {
  return (
    <section
      className="container-prose py-[var(--section-pad-y)]"
      aria-labelledby="intro-heading"
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
        (02) — About
      </p>
      <div className="mt-12 grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-24">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2
            id="intro-heading"
            className="font-sub text-3xl italic leading-[1.15] text-brand-gold md:text-4xl lg:text-5xl"
          >
            Interpretive planning.
            <br />
            Exhibit design.
            <br />
            Fabrication.
          </h2>
        </div>
        <div className="space-y-8 text-lg leading-relaxed text-brand-muted md:text-xl">
          <Reveal>
            <p>
              Chromosome Designs is an Ahmedabad-based studio that builds the spaces where the
              public meets the natural and scientific world. Nature parks, wildlife sanctuaries,
              science centers, museums, zoos, interpretation centers, and corporate lobbies — we
              design and fabricate them end to end.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              A team of art directors, exhibit designers, graphic designers, an interpretive
              planner, researchers, and copywriters move every project through three progressive
              design phases — discovery, design development, and value engineering — before a
              single piece is fabricated.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p>
              Our modeling capabilities span animals, humans, botanical subjects, and comic
              themes. Where the subject matter calls for it, scientific accuracy is non-negotiable.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
