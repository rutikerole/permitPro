'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Building2, SquarePlus, Wrench, ArrowLeftRight, Hammer, ArrowUpFromLine,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useAssessmentStore } from '@/store/assessment-store';
import { PROJECT_TYPES } from '@/lib/data/project-types';
import { LiveChecklistPanel } from './live-checklist-panel';
import type { ProjectTypeId } from '@/lib/assessment/types';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Building2, SquarePlus, ArrowUpFromLine, Wrench, ArrowLeftRight, Hammer,
};

// ─── Color map ────────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  neubau:            '#F59E0B',
  anbau:             '#60A5FA',
  aufstockung:       '#818CF8',
  umbau:             '#A78BFA',
  nutzungsaenderung: '#34D399',
  abbruch:           '#F87171',
};

// ─── Main Step 2 ──────────────────────────────────────────────────────────────

export function Step2ProjectType() {
  const t = useTranslations();
  const { setProjectType, municipality } = useAssessmentStore();
  const [hoveredType, setHoveredType] = useState<ProjectTypeId | null>(null);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ══ LEFT: Project type cards ══ */}
      <motion.div
        className="flex flex-col w-full lg:w-[50%] xl:w-[48%] shrink-0 bg-[#080d1a] border-r border-white/5 overflow-hidden"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent shrink-0" />

        {/* Header */}
        <div className="shrink-0 px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6 border-b border-white/5">
          <p className="text-[9px] font-mono font-bold tracking-[0.3em] text-amber-400 uppercase mb-2">
            {t('assessment.step2.stepLabel')} · {municipality?.name}
          </p>
          <h1 className="text-[clamp(22px,2.5vw,34px)] font-black text-white leading-tight tracking-tight">
            {t('assessment.step2.title')}
          </h1>
          <p className="mt-1.5 text-[13px] text-[#6B7A99] leading-relaxed">
            {t('assessment.step2.subtitle')}
          </p>
        </div>

        {/* Cards */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-3">
          {PROJECT_TYPES.map((pt, i) => {
            const Icon = ICON_MAP[pt.iconName] ?? Building2;
            const color = TYPE_COLORS[pt.id] ?? '#F59E0B';
            const isHovered = hoveredType === pt.id;

            return (
              <motion.button
                key={pt.id}
                aria-label={t(`assessment.projectTypes.${pt.id}.title` as Parameters<typeof t>[0])}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: 'easeOut' }}
                onMouseEnter={() => setHoveredType(pt.id as ProjectTypeId)}
                onMouseLeave={() => setHoveredType(null)}
                onFocus={() => setHoveredType(pt.id as ProjectTypeId)}
                onBlur={() => setHoveredType(null)}
                onClick={() => setProjectType(pt.id as ProjectTypeId)}
                className="group relative flex items-center gap-5 p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                style={{
                  background: isHovered ? `${color}0D` : '#0D1526',
                  borderColor: isHovered ? `${color}50` : 'rgba(255,255,255,0.06)',
                }}
              >
                {/* Left accent */}
                <div
                  className="absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full transition-all duration-250"
                  style={{ background: isHovered ? color : 'transparent' }}
                />

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-250"
                  style={{
                    background: isHovered ? `${color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isHovered ? `${color}40` : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <Icon size={20} style={{ color: isHovered ? color : '#4A6080' }} className="transition-colors duration-200" />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[15px] font-bold text-white leading-tight">
                      {t(`assessment.projectTypes.${pt.id}.title` as Parameters<typeof t>[0])}
                    </h3>
                    <span
                      className="shrink-0 text-[10px] font-mono border rounded-md px-2 py-0.5 transition-colors duration-200"
                      style={{
                        color: isHovered ? color : '#2A3A50',
                        borderColor: isHovered ? `${color}30` : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      {pt.legalRef}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#4A6080] leading-relaxed line-clamp-2">
                    {t(`assessment.projectTypes.${pt.id}.description` as Parameters<typeof t>[0])}
                  </p>
                </div>

                {/* Arrow */}
                <div className="shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform duration-200 ${isHovered ? 'translate-x-0.5' : ''}`}>
                    <path d="M2.5 7H11.5M8 4L11.5 7L8 10" stroke={isHovered ? color : '#2A3A50'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ══ RIGHT: Live checklist panel ══ */}
      <LiveChecklistPanel />
    </div>
  );
}
