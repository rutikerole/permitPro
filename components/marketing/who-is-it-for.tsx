'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Home, DraftingCompass, HardHat, CheckCircle2 } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

const roleIcons: Record<string, React.ComponentType<LucideProps>> = {
  home: Home,
  'drafting-compass': DraftingCompass,
  'hard-hat': HardHat,
};

const cardVariant = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

const containerVariant = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

export function WhoIsItFor() {
  const t = useTranslations('audience');

  const roles = [0, 1, 2].map((i) => ({
    icon: t(`roles.${i}.icon`),
    tag: t(`roles.${i}.tag`),
    title: t(`roles.${i}.title`),
    description: t(`roles.${i}.description`),
    points: [0, 1, 2].map((j) => t(`roles.${i}.points.${j}`)),
  }));

  const accentColors = [
    { bg: 'bg-amber-500/8', border: 'border-amber-500/20', icon: 'text-amber-400', hoverBorder: 'hover:border-amber-500/35', tag: 'text-amber-400' },
    { bg: 'bg-blue-500/8', border: 'border-blue-500/20', icon: 'text-blue-400', hoverBorder: 'hover:border-blue-500/35', tag: 'text-blue-400' },
    { bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', icon: 'text-emerald-400', hoverBorder: 'hover:border-emerald-500/35', tag: 'text-emerald-400' },
  ];

  return (
    <section className="relative py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-px opacity-20"
          style={{ background: 'linear-gradient(to right, transparent, #253447, transparent)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
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

        {/* Role cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariant}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {roles.map((role, i) => {
            const Icon = roleIcons[role.icon] ?? Home;
            const colors = accentColors[i];

            return (
              <motion.div
                key={i}
                variants={cardVariant}
                className={`group relative flex flex-col gap-6 rounded-2xl bg-surface border border-line p-7 ${colors.hoverBorder} transition-all duration-300 overflow-hidden`}
              >
                {/* Subtle top gradient */}
                <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to right, transparent, ${i === 0 ? 'rgba(245,158,11,0.4)' : i === 1 ? 'rgba(59,130,246,0.4)' : 'rgba(52,211,153,0.4)'}, transparent)` }}
                />

                {/* Tag */}
                <span className={`text-[10px] font-mono font-bold tracking-[0.18em] uppercase ${colors.tag}`}>
                  {role.tag}
                </span>

                {/* Icon + Title */}
                <div className="flex flex-col gap-3">
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center`}>
                    <Icon size={22} className={colors.icon} />
                  </div>
                  <h3 className="font-black text-[22px] text-white leading-tight">{role.title}</h3>
                </div>

                {/* Description */}
                <p className="text-[13.5px] text-text-secondary leading-relaxed">{role.description}</p>

                {/* Points */}
                <ul className="flex flex-col gap-2 pt-4 border-t border-line">
                  {role.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className={`mt-0.5 flex-shrink-0 ${colors.icon}`} />
                      <span className="text-[13px] text-text-secondary leading-snug">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
