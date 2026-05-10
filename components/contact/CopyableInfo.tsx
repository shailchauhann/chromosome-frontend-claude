'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

type Props = {
  label: string;
  value: string;
  href?: string;
  className?: string;
};

/**
 * Display + click-to-copy. The visible value is also a link (mailto/tel) when
 * `href` is supplied; the copy button is keyboard-reachable as a sibling.
 */
export function CopyableInfo({ label, value, href, className }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked — silently no-op; user can still click the link.
    }
  }

  return (
    <div className={cn('group flex flex-col', className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted">
        {label}
      </span>
      <div className="mt-2 flex items-baseline gap-3">
        {href ? (
          <a
            href={href}
            className="font-display text-2xl font-medium text-brand-text transition-colors hover:text-brand-gold sm:text-3xl"
          >
            {value}
          </a>
        ) : (
          <span className="font-display text-2xl font-medium text-brand-text sm:text-3xl">
            {value}
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
          className="rounded-full border border-brand-rule px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-brand-muted transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
