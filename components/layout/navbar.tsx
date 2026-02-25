'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function PermitProLogo() {
  const locale = useLocale();
  return (
    <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
      {/* House icon */}
      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center transition-all duration-200 group-hover:bg-amber-500/25 group-hover:border-amber-500/50">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5L1.5 7H3V14H7V10H9V14H13V7H14.5L8 1.5Z" fill="#F59E0B" />
        </svg>
      </div>
      <span className="font-bold text-[15px] text-text-primary tracking-tight group-hover:text-white transition-colors">
        PermitPro
      </span>
    </Link>
  );
}

export function Navbar() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: t('howItWorks'), href: `/${locale}#how-it-works` },
    { label: t('features'),   href: `/${locale}#features`     },
    { label: t('legalBasis'), href: `/${locale}#legal-basis`  },
    { label: t('docs'),       href: `/${locale}#faq`          },
  ];

  const otherLocale = locale === 'de' ? 'en' : 'de';

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-canvas/90 backdrop-blur-md border-b border-line'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <nav className="flex items-center justify-between h-16">
            {/* Logo */}
            <PermitProLogo />

            {/* Desktop nav links */}
            <ul className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="px-3.5 py-2 text-sm text-text-secondary hover:text-text-primary rounded-md hover:bg-elevated transition-all duration-150 block"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Desktop right side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Language switcher */}
              <Link
                href={`/${otherLocale}`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-muted hover:text-text-secondary border border-line hover:border-line-strong rounded-md transition-all duration-150"
              >
                <Globe size={12} />
                <span className="uppercase tracking-wider">{otherLocale}</span>
              </Link>

              {/* Get started CTA */}
              <Link href={`/${locale}/assessment`}>
                <Button variant="secondary" size="sm">
                  {t('getStarted')}
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 pt-16 bg-canvas/95 backdrop-blur-lg md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="mx-auto max-w-7xl px-6 py-8 flex flex-col gap-2">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  className="py-3.5 px-4 text-base text-text-secondary hover:text-text-primary border border-line rounded-lg hover:bg-elevated transition-all"
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href={`/${otherLocale}`}
                  className="flex items-center justify-center gap-2 py-3 border border-line rounded-lg text-sm text-text-muted hover:text-text-secondary transition-colors"
                >
                  <Globe size={14} />
                  <span className="uppercase tracking-wider">{otherLocale === 'de' ? 'Deutsch' : 'English'}</span>
                </Link>
                <Link href={`/${locale}/assessment`} className="w-full">
                  <Button variant="primary" size="lg" className="w-full">
                    {t('getStarted')}
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
