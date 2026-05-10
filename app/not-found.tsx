import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container-prose flex min-h-[100svh] flex-col items-start justify-center py-32">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-muted">404</p>
      <h1 className="mt-6 font-display text-display-lg font-black text-brand-gold">
        Page not found.
      </h1>
      <p className="mt-6 max-w-xl text-brand-muted">
        The page you were looking for has either moved or is in our archive.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex items-center gap-2 border-b border-brand-gold pb-1 text-brand-gold transition-opacity hover:opacity-80"
      >
        Back to home
        <span aria-hidden>↗</span>
      </Link>
    </main>
  );
}
