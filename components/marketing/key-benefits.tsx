'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Euro, UserX, MapPin, Scale, Languages, Cpu, FileDown, RefreshCw,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  euro: Euro,
  'user-x': UserX,
  'map-pin': MapPin,
  scale: Scale,
  languages: Languages,
  cpu: Cpu,
  'file-down': FileDown,
  'refresh-cw': RefreshCw,
};

const cardVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const containerVariant = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export function KeyBenefits() {
  const t = useTranslations('benefits');

  const items = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
    icon: t(`items.${i}.icon`),
    title: t(`items.${i}.title`),
    description: t(`items.${i}.description`),
  }));

  return (
    <section id="features" className="relative py-28">
      {/* Subtle separator */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-px opacity-20"
          style={{ background: 'linear-gradient(to right, transparent, #253447, transparent)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          className="text-center mb-18"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: 'easeOut' as const }}
        >
          <p className="text-[10px] font-mono font-semibold tracking-[0.2em] text-amber-400 uppercase mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="font-black text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-white">
            {t('title')}{' '}
            <span className="text-amber-400">{t('titleHighlight')}</span>
          </h2>
          <p className="mt-5 text-[16px] text-text-secondary max-w-[520px] mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* 4×2 grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16"
          variants={containerVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] ?? Cpu;
            return (
              <motion.div
                key={i}
                variants={cardVariant}
                className="group relative flex flex-col gap-4 bg-surface border border-line rounded-2xl p-6 hover:border-amber-500/30 hover:bg-elevated transition-all duration-300 cursor-default"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top left, rgba(245,158,11,0.04), transparent 70%)' }} />

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-amber-500/8 border border-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/12 group-hover:border-amber-500/25 transition-all duration-300">
                  <Icon size={20} className="text-amber-400" />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-[15px] text-white leading-snug">{item.title}</h3>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
