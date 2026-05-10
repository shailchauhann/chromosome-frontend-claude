import { cn } from '@/lib/cn';

type Props = {
  count: number;
  total: number;
  /** Override positioning; defaults to fixed bottom-left like the brochure. */
  className?: string;
};

/**
 * Numbered section index — the brochure's `(02/11)` motif. Fixed bottom-left
 * by default. The values are formatted with leading zeros (`(02/11)`).
 */
export function SectionIndex({ count, total, className }: Props) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-6 left-6 z-30 hidden font-mono text-xs tracking-[0.18em] text-brand-muted lg:block',
        className,
      )}
      aria-hidden="true"
    >
      ({pad(count)}/{pad(total)})
    </div>
  );
}
