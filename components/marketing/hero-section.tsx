'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BuildingDiagram } from './building-diagram';
import { DemoModal } from './demo-modal';

// ─── Animation variants ───────────────────────────────────────
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* ─── Background: subtle radial gradient ─────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse, #3B82F6, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-64 w-[600px] h-[600px] opacity-[0.03]"
          style={{ background: 'radial-gradient(ellipse, #F59E0B, transparent 70%)' }}
        />
      </div>

      {/* ─── Main content ─────────────────────────────────────── */}
      <div className="relative flex-1 flex items-center">
        <div className="w-full mx-auto max-w-7xl px-6 lg:px-12 pt-28 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* ── Left column: text content ─────────────────── */}
            <motion.div
              className="flex flex-col gap-8"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {/* Compliance badge */}
              <motion.div variants={item}>
                <Badge variant="outline" className="gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  {t('badge')}
                </Badge>
              </motion.div>

              {/* Headline */}
              <motion.div variants={item} className="flex flex-col gap-0">
                <h1 className="font-black leading-[1.0] tracking-tight">
                  {/* Line 1 — white */}
                  <span className="block text-[clamp(44px,7vw,80px)] text-white">
                    {t('headlineLine1')}
                  </span>
                  {/* Line 2 — amber (the highlighted word) */}
                  <span
                    className="block text-[clamp(44px,7vw,80px)] text-amber-400"
                    style={{
                      textShadow: '0 0 80px rgba(245,158,11,0.25)',
                    }}
                  >
                    {t('headlineHighlight')}
                  </span>
                  {/* Line 3 — white */}
                  <span className="block text-[clamp(44px,7vw,80px)] text-white">
                    {t('headlineLine3')}
                  </span>
                </h1>
              </motion.div>

              {/* Description */}
              <motion.p
                variants={item}
                className="text-[17px] text-text-secondary leading-relaxed max-w-[480px]"
              >
                {t('description')}
              </motion.p>

              {/* CTA buttons */}
              <motion.div variants={item} className="flex flex-wrap gap-3">
                <Link href={`/${locale}/assessment`}>
                  <Button variant="primary" size="lg" className="gap-2.5 font-bold">
                    {t('ctaPrimary')}
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Button variant="ghost" size="lg" className="gap-2.5" onClick={() => setDemoOpen(true)}>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full border border-line-strong">
                    <Play size={10} className="ml-0.5" />
                  </span>
                  {t('ctaSecondary')}
                </Button>
              </motion.div>

              {/* Trust strip */}
              <motion.div
                variants={item}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 border-t border-line"
              >
                {[t('trust1'), t('trust2'), t('trust3')].map((label) => (
                  <span key={label} className="flex items-center gap-2 text-[11px] font-semibold tracking-widest text-text-muted uppercase font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-80" />
                    {label}
                  </span>
                ))}
                <span className="text-[11px] text-text-muted font-mono uppercase tracking-widest ml-auto opacity-50">
                  {t('trustRef')}
                </span>
              </motion.div>
            </motion.div>

            {/* ── Right column: building visualization ──────── */}
            <motion.div
              className="relative h-[480px] lg:h-[580px]"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' as const }}
            >
              <BuildingDiagram />
            </motion.div>

          </div>
        </div>
      </div>

      {/* ─── Bottom fade ──────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #0B0F1A)' }}
      />

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
