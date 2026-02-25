'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield, UserX, BookOpen, GitBranch } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  shield: Shield,
  'user-x': UserX,
  'book-open': BookOpen,
  'git-branch': GitBranch,
};

const itemVariant = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const containerVariant = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export function TrustSecurity() {
  const t = useTranslations('trust');

  const items = [0, 1, 2, 3].map((i) => ({
    icon: t(`items.${i}.icon`),
    title: t(`items.${i}.title`),
    description: t(`items.${i}.description`),
  }));

  return (
    <section id="legal-basis" className="relative py-28 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-px opacity-20"
          style={{ background: 'linear-gradient(to right, transparent, #253447, transparent)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[500px] opacity-[0.025]"
          style={{ background: 'radial-gradient(ellipse, #3B82F6, transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: header + disclaimer */}
          <motion.div
            className="flex flex-col gap-8"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: 'easeOut' as const }}
          >
            <div className="flex flex-col gap-4">
              <p className="text-[10px] font-mono font-semibold tracking-[0.2em] text-amber-400 uppercase">
                {t('eyebrow')}
              </p>
              <h2 className="font-black text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-white">
                {t('title')}{' '}
                <span className="text-amber-400">{t('titleHighlight')}</span>
              </h2>
              <p className="text-[16px] text-text-secondary leading-relaxed max-w-[440px]">
                {t('subtitle')}
              </p>
            </div>

            {/* Disclaimer box */}
            <div className="flex gap-3 p-5 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <div className="w-1 rounded-full bg-amber-400 flex-shrink-0" />
              <p className="text-[13px] text-amber-200/70 leading-relaxed italic">
                {t('disclaimer')}
              </p>
            </div>

            {/* Law reference */}
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
                Quelle:
              </span>
              <span className="text-[11px] font-mono text-blue-400 tracking-wide">
                lrbw.landesrecht-bw.de
              </span>
            </div>
          </motion.div>

          {/* Right: trust items */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            variants={containerVariant}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {items.map((item, i) => {
              const Icon = iconMap[item.icon] ?? Shield;
              return (
                <motion.div
                  key={i}
                  variants={itemVariant}
                  className="group flex flex-col gap-4 bg-surface border border-line rounded-2xl p-5 hover:border-blue-500/30 transition-colors duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors duration-300">
                    <Icon size={18} className="text-blue-400" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-[14px] text-white leading-snug">{item.title}</h3>
                    <p className="text-[12.5px] text-text-secondary leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
