import { cn } from '@/lib/cn';

type Props = {
  className?: string;
  size?: number;
  'aria-hidden'?: boolean;
};

/** Diagonal upward-right arrow used as the brand link / CTA indicator. */
export function Arrow({ className, size = 16, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('inline-block flex-shrink-0', className)}
      aria-hidden={rest['aria-hidden'] ?? true}
    >
      <path
        d="M4 12L12 4M12 4H5M12 4V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
    </svg>
  );
}
