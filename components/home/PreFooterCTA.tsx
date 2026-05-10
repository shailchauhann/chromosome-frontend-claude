import { MagneticLink } from '@/components/ui/MagneticLink';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Section 7 — pre-footer CTA. Sits *above* the global Footer (which has its
 * own pre-footer block). On the home page only, this is the first invitation
 * to act after the project showcase. We mute the global Footer's pre-footer
 * via a className contract — see Footer.tsx if needed; for now both blocks
 * are tonally distinct so they read as two beats rather than a duplicate.
 */
export function PreFooterCTA() {
  return (
    <section
      className="hairline-top container-prose py-[var(--section-pad-y)]"
      aria-labelledby="cta-heading"
    >
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
          (07) — Begin
        </p>
        <h2
          id="cta-heading"
          className="mt-6 max-w-5xl font-display text-display-xl font-black leading-[0.92] tracking-[-0.02em] text-brand-gold"
        >
          Have a story
          <br />
          <span className="italic">to build?</span>
        </h2>
        <p className="mt-10 max-w-xl text-balance text-lg leading-relaxed text-brand-muted md:text-xl">
          Whether it's a 2-acre dinosaur park, a 12-meter sculpture, or a kiosk that runs unattended
          for ten years — start with a conversation.
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <MagneticLink href="/contact" variant="pill" arrow>
            Start a Project
          </MagneticLink>
          <a
            href="mailto:cavinish@gmail.com"
            className="font-mono text-xs uppercase tracking-[0.25em] text-brand-text transition-colors hover:text-brand-gold"
          >
            cavinish@gmail.com
          </a>
        </div>
      </Reveal>
    </section>
  );
}
