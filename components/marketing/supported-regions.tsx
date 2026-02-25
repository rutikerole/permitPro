'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CheckCircle2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' as const } },
};

interface RegionCardProps {
  flag: string;
  name: string;
  status: string;
  isActive: boolean;
  municipalities: string;
  law: string;
  lawDate: string;
  features: string[];
  delay?: number;
}

function RegionCard({ flag, name, status, isActive, municipalities, law, lawDate, features, delay = 0 }: RegionCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      className={`relative flex flex-col gap-6 rounded-2xl border p-8 overflow-hidden ${
        isActive
          ? 'bg-surface border-blue-500/30'
          : 'bg-surface/50 border-line opacity-75'
      }`}
    >
      {/* Active glow */}
      {isActive && (
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse, #3B82F6, transparent)' }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* State abbreviation badge */}
          <div className={`w-14 h-14 rounded-xl border flex items-center justify-center font-black text-lg tracking-tight ${
            isActive
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-elevated border-line text-text-muted'
          }`}>
            {flag}
          </div>
          <div>
            <h3 className="font-bold text-[18px] text-white leading-tight">{name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              {isActive
                ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                : <Clock size={11} className="text-text-muted" />
              }
              <span className={`text-[11px] font-mono font-semibold tracking-widest uppercase ${
                isActive ? 'text-emerald-400' : 'text-text-muted'
              }`}>{status}</span>
            </div>
          </div>
        </div>
        <Badge variant={isActive ? 'blue' : 'default'}>
          {municipalities}
        </Badge>
      </div>

      {/* Law reference */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        isActive ? 'bg-blue-500/5 border-blue-500/15' : 'bg-elevated border-line'
      }`}>
        <div className="flex flex-col">
          <span className={`font-black text-[15px] font-mono ${isActive ? 'text-white' : 'text-text-secondary'}`}>
            {law}
          </span>
          <span className="text-[11px] text-text-muted font-mono">{lawDate}</span>
        </div>
      </div>

      {/* Feature list */}
      <ul className="flex flex-col gap-2.5">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckCircle2
              size={15}
              className={`mt-0.5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-text-muted'}`}
            />
            <span className={`text-[13.5px] leading-snug ${isActive ? 'text-text-secondary' : 'text-text-muted'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export function SupportedRegions() {
  const t = useTranslations('regions');

  const bwFeatures = [
    t('bw.feature1'),
    t('bw.feature2'),
    t('bw.feature3'),
    t('bw.feature4'),
  ];
  const bavariaFeatures = [
    t('bavaria.feature1'),
    t('bavaria.feature2'),
    t('bavaria.feature3'),
    t('bavaria.feature4'),
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
        {/* Section header */}
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

        {/* Two region cards */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <RegionCard
            flag={t('bw.flag')}
            name={t('bw.name')}
            status={t('bw.status')}
            isActive={true}
            municipalities={t('bw.municipalities')}
            law={t('bw.law')}
            lawDate={t('bw.lawDate')}
            features={bwFeatures}
            delay={0}
          />
          <RegionCard
            flag={t('bavaria.flag')}
            name={t('bavaria.name')}
            status={t('bavaria.status')}
            isActive={false}
            municipalities={t('bavaria.municipalities')}
            law={t('bavaria.law')}
            lawDate={t('bavaria.lawDate')}
            features={bavariaFeatures}
            delay={0.1}
          />
        </motion.div>

        {/* Coming soon strip */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border border-line bg-elevated/50"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="flex gap-1.5">
            {['NRW', 'HE', 'BY', 'NI', 'BB'].map((s) => (
              <span key={s} className="text-[10px] font-mono font-bold tracking-wider text-text-muted px-2 py-0.5 rounded border border-line">
                {s}
              </span>
            ))}
          </div>
          <span className="text-[12px] text-text-muted font-mono">· {t('comingSoon')}</span>
        </motion.div>
      </div>
    </section>
  );
}
