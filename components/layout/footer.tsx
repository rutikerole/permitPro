'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';

function PermitProLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect width="28" height="28" rx="7" fill="rgba(245,158,11,0.12)" />
        <path
          d="M14 5 L22 10 L22 18 L14 23 L6 18 L6 10 Z"
          stroke="#F59E0B"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
        <path d="M14 5 L14 23" stroke="#F59E0B" strokeWidth="0.8" opacity="0.4" />
        <path d="M6 10 L22 10" stroke="#F59E0B" strokeWidth="0.8" opacity="0.4" />
      </svg>
      <span className="font-black text-[16px] tracking-tight text-white">
        Permit<span className="text-amber-400">Pro</span>
      </span>
    </div>
  );
}

export function Footer() {
  const t = useTranslations('footer');
  const params = useParams();
  const locale = (params?.locale as string) || 'de';

  const year = new Date().getFullYear();

  const productLinks = [
    { label: t('links.howItWorks'), href: `/${locale}#how-it-works` },
    { label: t('links.features'), href: `/${locale}#features` },
    { label: t('links.legalBasis'), href: `/${locale}#legal-basis` },
    { label: t('links.changelog'), href: `/${locale}#faq` },
  ];

  const legalLinks = [
    { label: t('links.impressum'), href: `/${locale}/impressum` },
    { label: t('links.datenschutz'), href: `/${locale}/datenschutz` },
    { label: t('links.nutzungsbedingungen'), href: `/${locale}/nutzungsbedingungen` },
  ];

  const regionLinks = [
    { label: t('links.bw'), href: '#' },
    { label: t('links.bavaria'), href: '#' },
    { label: t('links.nrw'), href: '#' },
    { label: t('links.hessen'), href: '#' },
  ];

  return (
    <footer className="relative border-t border-line bg-canvas">
      {/* Top separator glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px opacity-30"
        style={{ background: 'linear-gradient(to right, transparent, #1E4A7A, transparent)' }}
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="flex flex-col gap-5 lg:col-span-1">
            <PermitProLogo />
            <p className="text-[13px] text-text-muted leading-relaxed max-w-[220px]">
              {t('description')}
            </p>

            {/* Law version badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-line bg-elevated w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-mono text-text-muted tracking-wider">
                {t('lawVersion')}
              </span>
            </div>
          </div>

          {/* Product links */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-mono font-bold tracking-[0.15em] text-text-muted uppercase">
              {t('colProduct')}
            </p>
            <ul className="flex flex-col gap-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-text-secondary hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-mono font-bold tracking-[0.15em] text-text-muted uppercase">
              {t('colLegal')}
            </p>
            <ul className="flex flex-col gap-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-text-secondary hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://lrbw.landesrecht-bw.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13.5px] text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Landesrecht BW
                  <ExternalLink size={11} />
                </a>
              </li>
            </ul>
          </div>

          {/* Region links */}
          <div className="flex flex-col gap-4">
            <p className="text-[11px] font-mono font-bold tracking-[0.15em] text-text-muted uppercase">
              {t('colRegions')}
            </p>
            <ul className="flex flex-col gap-2.5">
              {regionLinks.map((link, i) => (
                <li key={link.label} className="flex items-center gap-2">
                  {i === 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                  {i === 1 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50 flex-shrink-0" />}
                  {i > 1 && <span className="w-1.5 h-1.5 rounded-full bg-text-muted/30 flex-shrink-0" />}
                  <span className={`text-[13.5px] ${i === 0 ? 'text-text-secondary' : 'text-text-muted'}`}>
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          className="mt-14 pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[12px] text-text-muted font-mono">
            © {year} {t('copyright')}
          </p>
          <p className="text-[11px] text-text-muted max-w-[480px] text-right leading-relaxed">
            {t('disclaimer')}
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
