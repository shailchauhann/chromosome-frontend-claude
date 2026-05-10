import { cn } from '@/lib/cn';

type Props = {
  className?: string;
  size?: number;
  /** Render only outline (used for in-text accents). */
  outline?: boolean;
  /** Optional gradient id suffix to avoid collisions when multiple instances are on a page. */
  gradientId?: string;
};

/**
 * Chromosome (X-form) brand mark — molten gold gradient with a centromere dot.
 * Reconstructed from the brochure description; replace once the client supplies
 * the authoritative SVG.
 */
export function ChromosomeGlyph({
  className,
  size = 28,
  outline = false,
  gradientId = 'cd-glyph',
}: Props) {
  const id = `${gradientId}-grad`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block flex-shrink-0', className)}
      role="img"
      aria-label="Chromosome Designs"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4C842" />
          <stop offset="55%" stopColor="#E8B11E" />
          <stop offset="100%" stopColor="#A77F0E" />
        </linearGradient>
      </defs>
      <g
        fill={outline ? 'none' : `url(#${id})`}
        stroke={outline ? 'currentColor' : 'none'}
        strokeWidth={outline ? 1.4 : 0}
      >
        <path d="M16 12 C 22 18, 28 24, 32 32 C 28 24, 22 18, 16 12 Z" />
        <path d="M14 18 C 22 22, 28 26, 32 32 C 24 30, 18 26, 14 18 Z" />
        <path d="M48 12 C 42 18, 36 24, 32 32 C 36 24, 42 18, 48 12 Z" />
        <path d="M50 18 C 42 22, 36 26, 32 32 C 40 30, 46 26, 50 18 Z" />
        <path d="M16 52 C 22 46, 28 40, 32 32 C 28 40, 22 46, 16 52 Z" />
        <path d="M14 46 C 22 42, 28 38, 32 32 C 24 34, 18 38, 14 46 Z" />
        <path d="M48 52 C 42 46, 36 40, 32 32 C 36 40, 42 46, 48 52 Z" />
        <path d="M50 46 C 42 42, 36 38, 32 32 C 40 34, 46 38, 50 46 Z" />
        <circle cx="32" cy="32" r="3" />
      </g>
    </svg>
  );
}
