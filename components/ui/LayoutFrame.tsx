import { cn } from '@/lib/cn';

type Props = {
  className?: string;
};

/**
 * Persistent layout chrome: thin vertical rule down the left edge with
 * gold `+` glyphs at intervals (lifted from the brochure). Sits behind
 * everything (`-z-10`) and is `pointer-events-none`. Hidden below `lg`.
 */
export function LayoutFrame({ className }: Props) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-y-0 left-0 z-0 hidden w-14 lg:block',
        className,
      )}
      aria-hidden="true"
    >
      {/* Vertical rule */}
      <div className="absolute inset-y-0 left-7 w-px bg-brand-rule" />

      {/* Gold + glyph markers, distributed along the rail */}
      <div className="absolute inset-y-0 left-7 flex -translate-x-1/2 flex-col justify-around py-[10vh]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="block h-3 w-3 text-brand-gold"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentColor 0 100%), linear-gradient(to bottom, currentColor 0 100%)',
              backgroundPosition: 'center, center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '100% 1px, 1px 100%',
            }}
          />
        ))}
      </div>
    </div>
  );
}
