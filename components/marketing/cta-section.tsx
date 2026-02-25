'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DemoModal } from './demo-modal';

export function CtaSection() {
  const t = useTranslations('cta');
  const locale = useLocale();
  const [demoOpen, setDemoOpen] = useState(false);

  const stats = [
    { value: t('stat1Value'), label: t('stat1Label') },
    { value: t('stat2Value'), label: t('stat2Label') },
    { value: t('stat3Value'), label: t('stat3Label') },
  ];

  return (
    <section className="relative py-28 overflow-hidden">
      {/* Separator */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-px opacity-20"
          style={{ background: 'linear-gradient(to right, transparent, #253447, transparent)' }}
        />
      </div>

      {/* Glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] opacity-[0.05]"
          style={{ background: 'radial-gradient(ellipse, #F59E0B, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse, #3B82F6, transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 lg:px-12 text-center">
        <motion.div
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' as const }}
        >
          {/* Eyebrow */}
          <p className="text-[10px] font-mono font-semibold tracking-[0.2em] text-amber-400 uppercase">
            {t('eyebrow')}
          </p>

          {/* Headline */}
          <h2 className="font-black text-[clamp(36px,5.5vw,64px)] leading-[1.03] tracking-tight text-white">
            {t('title')}{' '}
            <span
              className="text-amber-400"
              style={{ textShadow: '0 0 60px rgba(245,158,11,0.3)' }}
            >
              {t('titleHighlight')}
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-[17px] text-text-secondary leading-relaxed max-w-[520px]">
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href={`/${locale}/assessment`}>
              <Button variant="primary" size="xl" className="gap-2.5 font-bold">
                {t('primary')}
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Button variant="ghost" size="xl" className="gap-2.5" onClick={() => setDemoOpen(true)}>
              <span className="flex items-center justify-center w-6 h-6 rounded-full border border-line-strong">
                <Play size={10} className="ml-0.5" />
              </span>
              {t('secondary')}
            </Button>
          </div>

          {/* Stats bar */}
          <motion.div
            className="flex flex-wrap justify-center gap-px mt-4 rounded-2xl border border-line overflow-hidden bg-line"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 px-10 py-5 bg-surface flex-1 min-w-[140px]"
              >
                <span className="font-black text-[22px] text-white font-mono tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest text-center">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <DemoModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}
