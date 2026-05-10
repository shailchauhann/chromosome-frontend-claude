'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChromosomeGlyph } from '@/components/ui/icons/ChromosomeGlyph';
import { MagneticLink } from '@/components/ui/MagneticLink';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { href: '/work', label: 'Work' },
  { href: '/expertise', label: 'Expertise' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function Nav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 32);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-500 ease-cinematic',
        scrolled
          ? 'border-b border-brand-rule/60 bg-brand-bg/85 backdrop-blur-xl'
          : 'bg-transparent',
      )}
    >
      <nav
        aria-label="Primary"
        className="container-prose flex h-[var(--nav-height)] items-center justify-between"
      >
        <Link
          href="/"
          aria-label="Chromosome Designs — home"
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <ChromosomeGlyph size={28} className="transition-transform group-hover:rotate-12" />
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-brand-text">
              Chromosome
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-muted">
              Designs · Studio
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-10 md:flex">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative font-body text-sm font-medium tracking-tight transition-colors',
                    active ? 'text-brand-gold' : 'text-brand-text hover:text-brand-gold',
                  )}
                >
                  {item.label}
                  {active && !reduce && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-1 left-0 right-0 h-px bg-brand-gold"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
          <MagneticLink href="/contact" variant="pill" arrow>
            Let's Work Together
          </MagneticLink>
        </div>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-rule text-brand-text md:hidden"
        >
          <span aria-hidden className="relative block h-3 w-5">
            <span
              className={cn(
                'absolute left-0 right-0 h-px bg-current transition-all duration-300',
                open ? 'top-1.5 rotate-45' : 'top-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 right-0 h-px bg-current transition-all duration-300',
                open ? 'top-1.5 -rotate-45' : 'top-3',
              )}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          'overflow-hidden border-t border-brand-rule bg-brand-bg/95 backdrop-blur-xl transition-[max-height] duration-500 ease-cinematic md:hidden',
          open ? 'max-h-[80vh]' : 'max-h-0 border-transparent',
        )}
        aria-hidden={!open}
      >
        <ul className="container-prose flex flex-col gap-1 py-6">
          {NAV_ITEMS.map((item, idx) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between border-b border-brand-rule py-4"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-muted">
                      0{idx + 1}
                    </span>
                    <span
                      className={cn(
                        'font-display text-3xl font-medium',
                        active ? 'text-brand-gold' : 'text-brand-text',
                      )}
                    >
                      {item.label}
                    </span>
                  </span>
                  <span className="text-brand-gold" aria-hidden>
                    ↗
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="pt-6">
            <MagneticLink href="/contact" variant="pill" arrow>
              Let's Work Together
            </MagneticLink>
          </li>
        </ul>
      </div>
    </header>
  );
}
