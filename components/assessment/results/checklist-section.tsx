'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistSection as ChecklistSectionType, ItemStatus, RelevanceReason } from '@/lib/assessment/types';
import { ChecklistItemRow } from './checklist-item-row';

// ── Per-section accent colours ─────────────────────────────────────────────────

const SECTION_ACCENT: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20' },
  B: { bg: 'bg-blue-500/10',    text: 'text-blue-400',    border: 'border-blue-500/20' },
  C: { bg: 'bg-violet-500/10',  text: 'text-violet-400',  border: 'border-violet-500/20' },
  D: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  E: { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20' },
  F: { bg: 'bg-red-500/10',     text: 'text-red-400',     border: 'border-red-500/20' },
  G: { bg: 'bg-teal-500/10',    text: 'text-teal-400',    border: 'border-teal-500/20' },
  H: { bg: 'bg-purple-500/10',  text: 'text-purple-400',  border: 'border-purple-500/20' },
  I: { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20' },
  J: { bg: 'bg-orange-500/10',  text: 'text-orange-400',  border: 'border-orange-500/20' },
};

function sectionCostRange(items: ChecklistSectionType['items']): { min: number; max: number } | null {
  let min = 0, max = 0;
  for (const item of items) {
    min += item.costRange?.min ?? 0;
    max += item.costRange?.max ?? 0;
  }
  return max > 0 ? { min, max } : null;
}

function formatCostRange(range: { min: number; max: number }, locale: string): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(n);
  return range.min === range.max ? fmt(range.min) : `${fmt(range.min)}–${fmt(range.max)}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  itemStatuses: Record<string, ItemStatus>;
  onCycle: (id: string) => void;
  delay?: number;
  inclusionReasons?: Record<string, RelevanceReason>;
}

export function ChecklistSection({
  section,
  itemStatuses,
  onCycle,
  delay = 0,
  inclusionReasons,
}: ChecklistSectionProps) {
  const t      = useTranslations('assessment.sections');
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(false);

  const sectionKey    = section.id as Parameters<typeof t>[0];
  const checkedCount  = section.items.filter((i) => itemStatuses[i.id] === 'available').length;
  const totalCount    = section.items.length;
  const allChecked    = checkedCount === totalCount;
  const accent        = SECTION_ACCENT[section.id] ?? SECTION_ACCENT.A;
  const costRange     = sectionCostRange(section.items);
  const progressPct   = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  return (
    <div
      data-print="section"
      className={cn(
        'rounded-xl border transition-colors duration-200',
        'section-enter',
        allChecked
          ? 'border-emerald-500/20 bg-emerald-500/3'
          : 'border-white/8 bg-[#0d1526]',
      )}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/2 transition-colors duration-150 focus:outline-none"
      >
        {/* Section ID badge */}
        <span className={cn(
          'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-[13px] font-mono border',
          allChecked
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            : `${accent.bg} ${accent.text} ${accent.border}`,
        )}>
          {section.id}
        </span>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[13px] text-white leading-tight">
              {t(`${sectionKey}.title` as Parameters<typeof t>[0])}
            </span>
            {allChecked && (
              <span className="text-[9px] font-mono font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                {locale === 'de' ? 'Fertig' : 'Done'}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#4A5568] truncate block">
            {t(`${sectionKey}.description` as Parameters<typeof t>[0])}
          </span>
        </div>

        {/* Right: cost + count + chevron */}
        <div className="flex items-center gap-3 shrink-0">
          {costRange && (
            <span className="text-[10px] font-mono text-emerald-400/45 hidden sm:block">
              ~{formatCostRange(costRange, locale)}
            </span>
          )}
          <span className="text-[11px] font-mono text-[#4A5568]">
            {checkedCount}/{totalCount}
          </span>
          <ChevronDown
            size={13}
            className={cn(
              'text-[#4A5568] transition-transform duration-200',
              collapsed && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* Progress bar */}
      <div
        className="h-px bg-white/5 mx-4"
        role="progressbar"
        aria-valuenow={Math.round(progressPct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Section ${section.id}: ${checkedCount} of ${totalCount} checked`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            allChecked
              ? 'bg-emerald-500'
              : 'bg-linear-to-r from-amber-600 to-amber-400',
          )}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── Collapsible items list ── */}
      <motion.div
        data-print="collapse"
        initial={false}
        animate={{ height: collapsed ? 0 : 'auto' }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div className="px-3 py-3 flex flex-col gap-2">
          {section.items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              status={itemStatuses[item.id] ?? 'missing'}
              onCycle={() => onCycle(item.id)}
              inclusionReason={inclusionReasons?.[item.id]}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
