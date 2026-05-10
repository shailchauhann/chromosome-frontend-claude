import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { LayoutFrame } from '@/components/ui/LayoutFrame';
import { Cursor } from '@/components/ui/Cursor';
import { PageTransition } from '@/components/layout/PageTransition';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded-full focus:bg-brand-gold focus:px-5 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-[0.2em] focus:text-brand-bg"
      >
        Skip to content
      </a>
      <LayoutFrame />
      <Cursor />
      <Nav />
      <PageTransition>
        <main id="main">{children}</main>
      </PageTransition>
      <Footer />
    </>
  );
}
