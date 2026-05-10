import type { Metadata } from 'next';
import { SectionIndex } from '@/components/ui/SectionIndex';
import { ContactForm } from '@/components/contact/ContactForm';
import { CopyableInfo } from '@/components/contact/CopyableInfo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chromosome-designs.com';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Speak to Chromosome Designs about an interpretation center, exhibit, sculpture, or publication. Studio in Bopal, Ahmedabad.',
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactPage() {
  return (
    <>
      <SectionIndex count={5} total={7} />

      <section className="container-prose pt-[calc(var(--nav-height)+6rem)]">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-brand-muted">
          (05) — Contact
        </p>
        <h1 className="mt-8 max-w-5xl font-display text-display-xl font-black leading-[0.9] tracking-[-0.025em] text-brand-gold">
          Let's Work
          <br />
          <span className="italic">Together.</span>
        </h1>
      </section>

      <section className="container-prose mt-24 grid gap-16 pb-24 lg:grid-cols-[1fr_1fr] lg:gap-24">
        {/* Left: contact details */}
        <div className="space-y-10">
          <div className="space-y-8">
            <CopyableInfo
              label="Email"
              value="cavinish@gmail.com"
              href="mailto:cavinish@gmail.com"
            />
            <CopyableInfo label="Phone" value="+91 99243 23897" href="tel:+919924323897" />
          </div>

          <div className="hairline-top space-y-3 pt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted">
              Studio
            </p>
            <address className="not-italic">
              <p className="font-display text-xl font-medium text-brand-text">
                Avinish Chauhan
              </p>
              <p className="mt-2 max-w-xs text-brand-muted">
                G301, Sureel Willows
                <br />
                Ghuma, Bopal
                <br />
                Ahmedabad, Gujarat 380058
                <br />
                India
              </p>
            </address>
          </div>

          <div className="hairline-top space-y-3 pt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted">
              Studio hours
            </p>
            <p className="text-brand-muted">
              Monday – Saturday · 10:00 – 19:00 IST
              <br />
              Closed on national holidays
            </p>
          </div>

          <div className="hairline-top space-y-4 pt-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted">
              Studio location
            </p>
            <div className="aspect-[4/3] w-full overflow-hidden bg-brand-surface">
              <iframe
                title="Map of Chromosome Designs studio in Bopal, Ahmedabad"
                src="https://www.google.com/maps?q=Bopal,+Ahmedabad,+Gujarat&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full grayscale-[60%] [filter:invert(0.92)_grayscale(0.6)_contrast(0.9)]"
              />
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted">
            (Send a brief)
          </p>
          <h2 className="mt-3 max-w-md font-display text-3xl font-medium leading-tight text-brand-text md:text-4xl">
            Tell us about your project.
          </h2>
          <p className="mt-4 max-w-md text-brand-muted">
            Site, audience, scale, timeline — whatever you have. We'll reply within 48 hours
            with next steps.
          </p>
          <div className="mt-10">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* JSON-LD LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Chromosome Designs',
            image: `${SITE_URL}/favicon.svg`,
            telephone: '+91-99243-23897',
            email: 'cavinish@gmail.com',
            url: `${SITE_URL}/contact`,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'G301, Sureel Willows, Ghuma, Bopal',
              addressLocality: 'Ahmedabad',
              addressRegion: 'Gujarat',
              postalCode: '380058',
              addressCountry: 'IN',
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                ],
                opens: '10:00',
                closes: '19:00',
              },
            ],
          }),
        }}
      />
    </>
  );
}
