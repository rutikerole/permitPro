'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MapPin, FileText, Cpu, FileDown } from 'lucide-react';

const stepIcons = [MapPin, FileText, Cpu, FileDown];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [0, 1, 2, 3].map((i) => ({
    number: t(`steps.${i}.number`),
    title: t(`steps.${i}.title`),
    description: t(`steps.${i}.description`),
    tag: t(`steps.${i}.tag`),
    Icon: stepIcons[i],
  }));

  return (
    <section id="how-it-works" className="relative py-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px opacity-30"
          style={{ background: 'linear-gradient(to right, transparent, #1E4A7A, transparent)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          className="text-center mb-20"
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
          <p className="mt-5 text-[16px] text-text-secondary max-w-[560px] mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Steps grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group relative flex flex-col gap-5 bg-surface border border-line rounded-2xl p-6 hover:border-blue-500/40 transition-colors duration-300"
            >
              {/* Connector line (not on last item) */}
              {i < 3 && (
                <div className="hidden lg:block absolute top-[2.4rem] left-full w-6 h-px bg-line z-10" />
              )}

              {/* Number + Icon row */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-text-muted tracking-widest">
                  {step.number}
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/15 transition-colors duration-300">
                  <step.Icon size={18} className="text-blue-400" />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 flex-1">
                <h3 className="font-bold text-[17px] text-white leading-snug">{step.title}</h3>
                <p className="text-[13.5px] text-text-secondary leading-relaxed flex-1">
                  {step.description}
                </p>
              </div>

              {/* Tag */}
              <div className="pt-3 border-t border-line">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-semibold tracking-widest text-amber-400 uppercase">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  {step.tag}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom connector line */}
        <motion.div
          className="mt-16 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="h-px flex-1 max-w-[160px]"
            style={{ background: 'linear-gradient(to right, transparent, #1E4A7A)' }} />
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
          <div className="h-px flex-1 max-w-[160px]"
            style={{ background: 'linear-gradient(to left, transparent, #1E4A7A)' }} />
        </motion.div>
      </div>
    </section>
  );
}
