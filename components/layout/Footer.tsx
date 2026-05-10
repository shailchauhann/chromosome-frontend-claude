import Link from 'next/link';
import { ChromosomeGlyph } from '@/components/ui/icons/ChromosomeGlyph';
import { MagneticLink } from '@/components/ui/MagneticLink';
import { Arrow } from '@/components/ui/icons/Arrow';

const STUDIO = {
  email: 'cavinish@gmail.com',
  phone: '+91 99243 23897',
  phoneHref: 'tel:+919924323897',
  address: 'G301, Sureel Willows, Ghuma, Bopal, Ahmedabad',
  founder: 'Avinish Chauhan',
};

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden bg-brand-bg" aria-labelledby="footer-heading">
      {/* Pre-footer CTA — echoes brochure page 11 */}
      <section
        className="border-t border-brand-rule"
        aria-labelledby="lets-work-together"
      >
        <div className="container-prose py-24 sm:py-32 lg:py-44">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
            (Let's begin)
          </p>
          <h2
            id="lets-work-together"
            className="mt-6 font-display text-display-xl font-black leading-[0.92] tracking-[-0.02em] text-brand-gold"
          >
            Let's Work
            <br />
            <span className="italic">Together.</span>
          </h2>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid gap-6 sm:grid-cols-2">
              <a
                href={`mailto:${STUDIO.email}`}
                className="group flex flex-col"
                aria-label={`Email ${STUDIO.email}`}
              >
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">
                  Email
                </span>
                <span className="mt-2 font-display text-2xl font-medium text-brand-text transition-colors group-hover:text-brand-gold sm:text-3xl">
                  {STUDIO.email}
                </span>
              </a>
              <a
                href={STUDIO.phoneHref}
                className="group flex flex-col"
                aria-label={`Call ${STUDIO.phone}`}
              >
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand-muted">
                  Phone
                </span>
                <span className="mt-2 font-display text-2xl font-medium text-brand-text transition-colors group-hover:text-brand-gold sm:text-3xl">
                  {STUDIO.phone}
                </span>
              </a>
            </div>

            <MagneticLink href="/contact" variant="pill" arrow>
              Start a Project
            </MagneticLink>
          </div>
        </div>
      </section>

      {/* Thin footer */}
      <div id="footer-heading" className="sr-only">
        Site footer
      </div>
      <div className="border-t border-brand-rule">
        <div className="container-prose flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <ChromosomeGlyph size={40} />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brand-text">
                Chromosome Designs
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-muted">
                Interpretive Planning · Exhibit Design · Fabrication
              </span>
              <span className="mt-3 max-w-xs text-sm text-brand-muted">{STUDIO.address}</span>
            </div>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-4">
            <FooterLink href="/work">Work</FooterLink>
            <FooterLink href="/expertise">Expertise</FooterLink>
            <FooterLink href="/about">About</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
          </nav>

          <div className="flex flex-col items-start gap-2 text-xs text-brand-muted md:items-end">
            <span className="font-mono uppercase tracking-[0.25em]">
              © {new Date().getFullYear()} Chromosome Designs
            </span>
            <span className="font-mono uppercase tracking-[0.25em]">
              {STUDIO.founder} · Ahmedabad, IN
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-text transition-colors hover:text-brand-gold"
    >
      {children}
      <Arrow size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}
