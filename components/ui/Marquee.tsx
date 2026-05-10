import { cn } from '@/lib/cn';

type Props = {
  items: string[];
  /** Direction of travel. */
  direction?: 'left' | 'right';
  /** Seconds for one full loop. Higher = slower. */
  duration?: number;
  className?: string;
  /** Visual treatment — text-only or with the diagonal arrow between items. */
  separator?: 'dot' | 'arrow' | 'plus';
};

/**
 * Slowly-scrolling marquee strip. Pure-CSS animation (no JS), respects
 * `prefers-reduced-motion` automatically via the global CSS rule that
 * neutralises animations.
 *
 * Items are duplicated once so the loop is seamless (we translate -50%).
 */
export function Marquee({
  items,
  direction = 'left',
  duration = 50,
  className,
  separator = 'plus',
}: Props) {
  const sep = separator === 'dot' ? '·' : separator === 'arrow' ? '↗' : '+';
  return (
    <div
      className={cn(
        'hairline-top hairline-bottom relative flex overflow-hidden py-6',
        className,
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          'flex shrink-0 items-center gap-12 whitespace-nowrap pr-12',
          direction === 'left' ? 'animate-marquee-l' : 'animate-marquee-r',
        )}
        style={{ animationDuration: `${duration}s` }}
      >
        {[...items, ...items].map((item, idx) => (
          <span key={idx} className="flex items-center gap-12">
            <span className="font-display text-2xl font-medium tracking-tight text-brand-gold sm:text-3xl">
              {item}
            </span>
            <span className="font-mono text-xs text-brand-rule">{sep}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
