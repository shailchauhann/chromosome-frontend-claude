'use client';

import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile widget — invisible-by-default bot challenge that
 * produces a token. The token is single-use; pass it in the form submission
 * payload and verify server-side via lib/turnstile.ts.
 *
 * Behaviour:
 *   - If NEXT_PUBLIC_TURNSTILE_SITE_KEY isn't set, renders a development
 *     notice. The server route will accept submissions without a token in
 *     dev mode (NODE_ENV !== 'production') so local testing still works.
 *   - Otherwise injects Cloudflare's script once, renders the widget into a
 *     ref'd div, and reports tokens back via the onToken callback.
 *   - Calls onToken(null) on widget error or token expiry so the parent can
 *     re-disable submit until the user re-completes.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: TurnstileOptions) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
    __cdTurnstileOnLoad?: () => void;
  }
}

type TurnstileOptions = {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'flexible' | 'compact';
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
};

const SCRIPT_ID = 'cf-turnstile-script';
const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=__cdTurnstileOnLoad&render=explicit';

type Props = {
  onToken: (token: string | null) => void;
};

export function TurnstileWidget({ onToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  // Hold the latest onToken in a ref so we don't re-render the widget on every
  // parent re-render — which would otherwise reset the user's challenge state.
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let cancelled = false;

    function render() {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey!,
          theme: 'dark',
          size: 'flexible',
          callback: (token) => onTokenRef.current(token),
          'error-callback': () => onTokenRef.current(null),
          'expired-callback': () => onTokenRef.current(null),
          'timeout-callback': () => onTokenRef.current(null),
        });
      } catch (err) {
        console.error('[turnstile] render failed', err);
      }
    }

    if (window.turnstile) {
      render();
    } else {
      window.__cdTurnstileOnLoad = render;
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      const id = widgetIdRef.current;
      if (id && window.turnstile) {
        try {
          window.turnstile.remove(id);
        } catch {
          // Widget may already be torn down — fine.
        }
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  if (!siteKey) {
    // Dev-only notice. Production server refuses submissions without the
    // secret, so this surface only appears when a developer hasn't set up
    // the local env keys yet.
    return (
      <div className="rounded border border-yellow-500/30 bg-yellow-500/5 p-4 text-xs text-yellow-200/80">
        <p className="font-mono uppercase tracking-[0.2em]">Captcha disabled</p>
        <p className="mt-2 font-body normal-case tracking-normal">
          NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set. Form submissions will
          bypass bot protection in this environment only — production
          requires the key.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-[65px]" />;
}
