'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedChecklist, ItemStatus } from '@/lib/assessment/types';

interface ChecklistOverviewProps {
  checklist: GeneratedChecklist;
  itemStatuses: Record<string, ItemStatus>;
}

export function ChecklistOverview({ checklist, itemStatuses }: ChecklistOverviewProps) {
  const locale = useLocale();
  const t      = useTranslations();

  const allItems = checklist.sections.flatMap((s) => s.items);

  // Critical items still unchecked (not 'available')
  const criticalRemaining = allItems.filter(
    (i) => i.priority === 'critical' && itemStatuses[i.id] !== 'available',
  ).length;

  // Total professional-fee cost range (excluding €0 items)
  const costMin = allItems.reduce((acc, i) => acc + (i.costRange?.min ?? 0), 0);
  const costMax = allItems.reduce((acc, i) => acc + (i.costRange?.max ?? 0), 0);

  const fmtCost = (n: number) =>
    new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(n);

  // Longest lead time across all items
  const maxWeeks = Math.max(0, ...allItems.map((i) => i.timeWeeks?.max ?? 0));

  // First non-available critical or required item → "Next step"
  const nextItem = allItems.find(
    (i) => itemStatuses[i.id] !== 'available' && (i.priority === 'critical' || i.priority === 'required'),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="px-3 pt-1 pb-1 flex flex-col gap-2"
    >
      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-2">

        {/* Critical remaining */}
        <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl bg-white/3 border border-white/8">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#4A5568]">
            {locale === 'de' ? 'Kritisch' : 'Critical'}
          </span>
          <span className={cn(
            'text-[22px] font-black leading-none',
            criticalRemaining > 0 ? 'text-red-400' : 'text-emerald-400',
          )}>
            {criticalRemaining}
          </span>
          <span className="text-[9px] text-[#4A5568]">
            {locale === 'de' ? 'ausstehend' : 'remaining'}
          </span>
        </div>

        {/* Estimated cost */}
        <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl bg-white/3 border border-white/8">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#4A5568]">
            {locale === 'de' ? 'Kosten ca.' : 'Cost est.'}
          </span>
          <span className="text-[13px] font-bold text-emerald-400 leading-snug">
            {fmtCost(costMin)}
          </span>
          <span className="text-[9px] text-[#4A5568]">
            {locale === 'de' ? 'bis' : 'to'} {fmtCost(costMax)}
          </span>
        </div>

        {/* Max lead time */}
        <div className="flex flex-col gap-0.5 px-3 py-2.5 rounded-xl bg-white/3 border border-white/8">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#4A5568]">
            {locale === 'de' ? 'Vorlaufzeit' : 'Lead time'}
          </span>
          <span className="text-[22px] font-black text-amber-400 leading-none">
            {maxWeeks}
          </span>
          <span className="text-[9px] text-[#4A5568]">
            {locale === 'de' ? 'Wochen max' : 'weeks max'}
          </span>
        </div>

      </div>

      {/* ── Next step hint ── */}
      {nextItem && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/6 border border-amber-500/15">
          <ChevronRight size={12} className="text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-500/50 block">
              {locale === 'de' ? 'Nächster Schritt' : 'Next step'}
            </span>
            <span className="text-[11px] text-amber-200/70 truncate block">
              <span className="font-mono font-bold">{nextItem.id}</span>
              {' · '}
              {t(nextItem.titleKey as Parameters<typeof t>[0])}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
