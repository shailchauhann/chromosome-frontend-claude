import type { Metadata } from 'next';
import { getAllProjects } from '@/lib/mdx';
import { Hero } from '@/components/home/Hero';
import { IntroMission } from '@/components/home/IntroMission';
import { Stats } from '@/components/home/Stats';
import { CapabilityGrid } from '@/components/home/CapabilityGrid';
import { FeaturedWork } from '@/components/home/FeaturedWork';
import { ClientsMarquee } from '@/components/home/ClientsMarquee';
import { PreFooterCTA } from '@/components/home/PreFooterCTA';
import { SectionIndex } from '@/components/ui/SectionIndex';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chromosome-designs.com';

export const metadata: Metadata = {
  title: 'Chromosome Designs — Interpretive planning, exhibit design, and fabrication',
  description:
    'Ahmedabad-based studio building interpretation centers, dioramas, and sculptures for zoos, sanctuaries, museums, and science cities. 400+ projects delivered.',
  alternates: { canonical: SITE_URL },
};

export default async function HomePage() {
  const all = await getAllProjects();
  const featured = all.filter((p) => p.frontmatter.featured).slice(0, 5);

  return (
    <>
      <SectionIndex count={1} total={7} />
      <Hero />
      <IntroMission />
      <Stats />
      <CapabilityGrid />
      <FeaturedWork projects={featured} />
      <ClientsMarquee />
      <PreFooterCTA />

      {/* JSON-LD Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Chromosome Designs',
            url: SITE_URL,
            description:
              'Interpretive planning, exhibit design, and fabrication studio based in Ahmedabad.',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'G301, Sureel Willows, Ghuma, Bopal',
              addressLocality: 'Ahmedabad',
              addressRegion: 'Gujarat',
              addressCountry: 'IN',
            },
            telephone: '+91-99243-23897',
            email: 'cavinish@gmail.com',
            founder: { '@type': 'Person', name: 'Avinish Chauhan' },
            numberOfEmployees: 10,
          }),
        }}
      />
    </>
  );
}
