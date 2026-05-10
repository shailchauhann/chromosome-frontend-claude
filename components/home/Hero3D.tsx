'use client';

import { useEffect, useState } from 'react';
import { ChromosomeGlyph } from '@/components/ui/icons/ChromosomeGlyph';

/**
 * Wrapper that decides whether to render the WebGL chromosome or fall back to
 * a static SVG. Keeps the heavy three.js bundle out of the initial JS load by
 * lazy-importing only after we've confirmed the device can handle it.
 *
 * Bailouts (any → static SVG):
 *   1. prefers-reduced-motion
 *   2. navigator.hardwareConcurrency < 4 (low-end device proxy)
 *   3. WebGL context creation fails
 *   4. Browser tab is hidden when component first mounts (avoid wasted work)
 */
export function Hero3D() {
  const [Mode, setMode] = useState<'pending' | '3d' | 'svg'>('pending');
  const [Comp, setComp] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setMode('svg');
      return;
    }

    const cores = navigator.hardwareConcurrency ?? 4;
    if (cores < 4) {
      setMode('svg');
      return;
    }

    // Probe WebGL.
    let canCreateGL = false;
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') ?? c.getContext('webgl');
      canCreateGL = Boolean(gl);
      if (gl && 'getExtension' in gl) {
        const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context');
        lose?.loseContext();
      }
    } catch {
      canCreateGL = false;
    }

    if (!canCreateGL) {
      setMode('svg');
      return;
    }

    let cancelled = false;
    import('./ChromosomeCanvas')
      .then((mod) => {
        if (cancelled) return;
        setComp(() => mod.ChromosomeCanvas);
        setMode('3d');
      })
      .catch(() => {
        if (cancelled) return;
        setMode('svg');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (Mode === '3d' && Comp) return <Comp />;
  return <ChromosomeGlyph size={360} className="opacity-90" />;
}
