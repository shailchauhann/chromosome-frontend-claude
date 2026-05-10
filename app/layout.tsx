import type { Metadata, Viewport } from 'next';
import { Bodoni_Moda, Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
  // Bodoni Moda isn't in next/font's metric-override table yet (Next 14.2)
  // so the auto-adjustment lookup fails. Disable it to silence the
  // "Failed to find font override values" dev-server warning. Browser
  // still uses our fallback chain ('Bodoni Moda', Didot, serif).
  adjustFontFallback: false,
});

const sub = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-sub',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  display: 'swap',
  variable: '--font-body',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chromosome-designs.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Chromosome Designs — Interpretive planning, exhibit design, and fabrication',
    template: '%s — Chromosome Designs',
  },
  description:
    'Ahmedabad-based studio designing interpretation centers, exhibits, dioramas, and sculpture for zoos, museums, sanctuaries, and science cities. 400+ projects delivered.',
  applicationName: 'Chromosome Designs',
  authors: [{ name: 'Chromosome Designs', url: SITE_URL }],
  keywords: [
    'exhibit design',
    'interpretation center',
    'museum design',
    'diorama',
    'wildlife sanctuary',
    'science center',
    'sculpture',
    'Ahmedabad',
    'fabrication',
  ],
  openGraph: {
    type: 'website',
    siteName: 'Chromosome Designs',
    locale: 'en_IN',
    url: SITE_URL,
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sub.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-brand-bg text-brand-text font-body antialiased selection:bg-brand-gold selection:text-brand-bg">
        {children}
      </body>
    </html>
  );
}
