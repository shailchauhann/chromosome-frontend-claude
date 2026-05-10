import { CATEGORY_LABEL, type ProjectCategory } from '@/lib/projects-shared';
import { cn } from '@/lib/cn';

type Props = {
  title: string;
  category?: ProjectCategory;
  className?: string;
  ratio?: '16/9' | '4/3' | '3/4' | '1/1';
};

/**
 * SVG placeholder for projects without supplied photography. Renders the
 * project title in display serif gold over a warm-black field with the
 * chromosome glyph as a faint watermark and a category tag. Inline SVG —
 * no external image generation, no runtime cost.
 */
export function ProjectPlaceholder({ title, category, className, ratio = '4/3' }: Props) {
  const [w, h] = ratio.split('/').map(Number) as [number, number];
  const W = w * 200;
  const H = h * 200;
  const id = `pp-${title.replace(/\W+/g, '-').toLowerCase()}`;

  // Wrap long titles into ~22-char lines without breaking words.
  const words = title.split(' ');
  const lines: string[] = [];
  let buf = '';
  for (const word of words) {
    if ((buf + ' ' + word).trim().length > 22) {
      if (buf) lines.push(buf.trim());
      buf = word;
    } else {
      buf = (buf + ' ' + word).trim();
    }
  }
  if (buf) lines.push(buf);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label={`${title} — placeholder image`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0A0A0B" />
          <stop offset="100%" stopColor="#141414" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4C842" />
          <stop offset="55%" stopColor="#E8B11E" />
          <stop offset="100%" stopColor="#A77F0E" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />

      {/* Faint chromosome watermark, top-right */}
      <g
        transform={`translate(${W - 280} 60) scale(4)`}
        opacity="0.06"
        fill={`url(#${id}-gold)`}
      >
        <path d="M16 12 C 22 18, 28 24, 32 32 C 28 24, 22 18, 16 12 Z" />
        <path d="M48 12 C 42 18, 36 24, 32 32 C 36 24, 42 18, 48 12 Z" />
        <path d="M16 52 C 22 46, 28 40, 32 32 C 28 40, 22 46, 16 52 Z" />
        <path d="M48 52 C 42 46, 36 40, 32 32 C 36 40, 42 46, 48 52 Z" />
        <circle cx="32" cy="32" r="3" />
      </g>

      {/* Hairline framing */}
      <line x1="80" y1={H - 80} x2={W - 80} y2={H - 80} stroke="#2A2A2A" strokeWidth="1" />

      {/* Title */}
      <g
        fontFamily="'Bodoni Moda', Didot, serif"
        fontWeight="900"
        fontSize="84"
        fill={`url(#${id}-gold)`}
        letterSpacing="-2"
      >
        {lines.map((ln, i) => (
          <text key={i} x="80" y={H / 2 - (lines.length - 1) * 50 + i * 100}>
            {ln}
          </text>
        ))}
      </g>

      {/* Bottom-left: category */}
      {category && (
        <text
          x="80"
          y={H - 40}
          fontFamily="'JetBrains Mono', ui-monospace, monospace"
          fontSize="22"
          fill="#A8A29A"
          letterSpacing="3"
        >
          {CATEGORY_LABEL[category].toUpperCase()}
        </text>
      )}

      {/* Bottom-right: brand */}
      <text
        x={W - 80}
        y={H - 40}
        textAnchor="end"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="22"
        fill="#A8A29A"
        letterSpacing="3"
      >
        CHROMOSOME / DESIGNS
      </text>
    </svg>
  );
}
