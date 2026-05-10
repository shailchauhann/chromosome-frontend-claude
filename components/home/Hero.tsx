import { Suspense } from 'react';
import { ChromosomeGlyph } from '@/components/ui/icons/ChromosomeGlyph';
import { Hero3D } from './Hero3D';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Home hero. Section 1 — 100vh, dark canvas, oversized stacked wordmark
 * with the rotating 3D chromosome on the right. The 3D component is loaded
 * lazily (Suspense) so the static SVG glyph is shown until WebGL is ready,
 * and is the only content rendered when WebGL/reduced-motion bail out.
 */
export function Hero() {
  return (
    <section
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-[var(--nav-height)]"
      aria-labelledby="hero-heading"
    >
      {/* Top-left meta */}
      <div className="absolute left-6 top-[calc(var(--nav-height)+1.5rem)] hidden font-mono text-xs uppercase tracking-[0.3em] text-brand-muted lg:left-20 lg:block">
        Avinish Chauhan
      </div>

      {/* Top-right meta */}
      <div className="absolute right-6 top-[calc(var(--nav-height)+1.5rem)] hidden font-mono text-xs uppercase tracking-[0.3em] text-brand-muted lg:right-16 lg:block">
        Ahmedabad, India
      </div>

      <div className="container-prose grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr]">
        {/* Wordmark */}
        <Reveal>
          <div>
            <h1
              id="hero-heading"
              className="font-display font-black leading-[0.85] tracking-[-0.025em]"
            >
              <span className="block text-display-lg text-brand-text">Chromosome</span>
              <span className="block text-display-lg text-brand-text">Designs</span>
              <span className="mt-2 block text-display-xl italic text-brand-gold">Studio</span>
            </h1>
            <p className="mt-10 max-w-md font-sub text-2xl italic leading-snug text-brand-muted md:text-3xl">
              We design experiences that inspire people.
            </p>
          </div>
        </Reveal>

        {/* 3D / SVG chromosome */}
        <div className="relative flex h-[60vh] min-h-[420px] items-center justify-center lg:h-[80vh]">
          <Suspense
            fallback={
              <ChromosomeGlyph size={360} className="opacity-90 motion-safe:animate-pulse" />
            }
          >
            <Hero3D />
          </Suspense>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 right-6 hidden flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-muted lg:right-16 lg:flex">
        <span className="motion-safe:animate-scroll-cue">↓</span>
        <span>Scroll</span>
      </div>
    </section>
  );
}
