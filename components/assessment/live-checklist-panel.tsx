'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { ClipboardList, TrendingUp, Clock, ChevronDown, X } from 'lucide-react';
import { useLiveChecklist } from '@/lib/hooks/use-live-checklist';
import { useAssessmentStore } from '@/store/assessment-store';
import type { ItemPriority } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

// ── Priority colours ───────────────────────────────────────────────────────────

const PRIORITY_DOT: Record<ItemPriority, string> = {
  critical:    'bg-red-500',
  required:    'bg-amber-400',
  recommended: 'bg-blue-400',
  conditional: 'bg-slate-500',
};

const PRIORITY_LABEL: Record<ItemPriority, { de: string; en: string }> = {
  critical:    { de: 'Krit.',   en: 'Critical' },
  required:    { de: 'Pflicht', en: 'Required'  },
  recommended: { de: 'Empf.',   en: 'Recomm.'  },
  conditional: { de: 'Bedingt', en: 'Cond.'    },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtEuro(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `€${Math.round(n / 1_000)}K`;
  return `€${n}`;
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState({ locale }: { locale: string }) {
  const de = locale === 'de';
  const municipality = useAssessmentStore((s) => s.municipality);
  const projectType  = useAssessmentStore((s) => s.projectType);

  const message = !municipality
    ? { title: de ? 'Gemeinde wählen' : 'Select a municipality',
        sub:   de ? 'Dann erscheint Ihre Checkliste hier' : 'Your checklist will appear here' }
    : !projectType
    ? { title: de ? 'Projekttyp wählen' : 'Select a project type',
        sub:   de ? 'Checkliste wird sofort generiert' : 'Checklist generates instantly' }
    : { title: de ? 'Berechnung läuft…' : 'Calculating…',
        sub:   de ? 'Bitte warten' : 'Please wait' };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 gap-5">
      {/* Animated clipboard icon */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
          <ClipboardList size={28} className="text-amber-400/50" />
        </div>
        {/* Pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl border border-amber-400/25"
        />
      </motion.div>

      <div>
        <p className="text-[14px] font-semibold text-slate-300 mb-1">{message.title}</p>
        <p className="text-[12px] text-slate-600 leading-relaxed">{message.sub}</p>
      </div>

      {/* Placeholder skeleton rows */}
      <div className="w-full max-w-[220px] space-y-2.5 mt-2">
        {[1, 0.6, 0.8].map((w, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            className="flex gap-2.5 items-center"
          >
            <div className="w-2 h-2 rounded-full bg-white/10 shrink-0" />
            <div
              className="h-2 rounded-full bg-white/8"
              style={{ width: `${w * 100}%` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────

export function LiveChecklistPanel() {
  const locale   = useLocale();
  const de       = locale === 'de';
  const t        = useTranslations();
  const checklist = useLiveChecklist();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Flatten all items for animation — preserve section order
  const allItems = useMemo(() => {
    if (!checklist) return [];
    return checklist.sections.flatMap((s) =>
      s.items.map((item) => ({ ...item, sectionId: s.id })),
    );
  }, [checklist]);

  // Stats
  const stats = useMemo(() => {
    if (!allItems.length) return null;
    const costMin = allItems.reduce((s, i) => s + (i.costRange?.min ?? 0), 0);
    const costMax = allItems.reduce((s, i) => s + (i.costRange?.max ?? 0), 0);
    const weeks   = Math.max(...allItems.map((i) => i.timeWeeks?.max ?? 0));
    return { costMin, costMax, weeks };
  }, [allItems]);

  // Section item counts for category chips
  const sectionCounts = useMemo(() => {
    if (!checklist) return {};
    return Object.fromEntries(checklist.sections.map((s) => [s.id, s.items.length]));
  }, [checklist]);

  // Section ids in order
  const sectionIds = useMemo(
    () => checklist?.sections.map((s) => s.id) ?? [],
    [checklist],
  );

  const SECTION_COLORS: Record<string, string> = {
    A: 'text-amber-400  border-amber-400/30  bg-amber-400/8',
    B: 'text-blue-400   border-blue-400/30   bg-blue-400/8',
    C: 'text-violet-400 border-violet-400/30 bg-violet-400/8',
    D: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/8',
    E: 'text-sky-400    border-sky-400/30    bg-sky-400/8',
    F: 'text-red-400    border-red-400/30    bg-red-400/8',
    G: 'text-orange-400 border-orange-400/30 bg-orange-400/8',
    H: 'text-pink-400   border-pink-400/30   bg-pink-400/8',
    I: 'text-indigo-400 border-indigo-400/30 bg-indigo-400/8',
    J: 'text-slate-400  border-slate-400/30  bg-slate-400/8',
  };

  // ── Content (used in both right panel and mobile sheet) ─────────────────────

  const content = (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono font-bold tracking-[0.22em] text-amber-400/70 uppercase">
              {de ? 'Checkliste Live' : 'Live Checklist'}
            </p>
            {/* Pulsing dot when active */}
            {checklist && (
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-amber-400"
              />
            )}
          </div>

          <AnimatePresence mode="wait">
            {checklist ? (
              <motion.span
                key="count"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-[11px] font-mono font-bold text-slate-300"
              >
                {checklist.totalItems} {de ? 'Dokumente' : 'documents'}
              </motion.span>
            ) : (
              <motion.span key="zero" className="text-[11px] font-mono text-slate-600">
                0 {de ? 'Dokumente' : 'documents'}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Stats row */}
        <AnimatePresence>
          {stats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 flex-wrap mb-3">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <TrendingUp size={11} className="text-amber-400/60" />
                  {fmtEuro(stats.costMin)}–{fmtEuro(stats.costMax)}
                </span>
                <span className="text-slate-700">·</span>
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Clock size={11} className="text-amber-400/60" />
                  {de ? `max. ${stats.weeks} Wo.` : `max. ${stats.weeks} wks`}
                </span>
              </div>

              {/* Section chips */}
              <div className="flex flex-wrap gap-1.5">
                {sectionIds.map((id) => (
                  <motion.span
                    key={id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      'px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border',
                      SECTION_COLORS[id] ?? 'text-slate-400 border-slate-400/20 bg-slate-400/8',
                    )}
                  >
                    {id}:{sectionCounts[id]}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scrollable items ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        <AnimatePresence mode="popLayout">
          {checklist ? (
            allItems.length > 0 ? (
              allItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 14, scale: 0.97 }}
                  animate={{ opacity: 1, x: 0,  scale: 1    }}
                  exit={{    opacity: 0, x: -10, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/3 transition-colors group"
                >
                  {/* Priority dot */}
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0 mt-1.5',
                      PRIORITY_DOT[item.priority],
                    )}
                  />

                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-[11px] font-medium text-slate-300 leading-tight">
                        <span className="text-[10px] font-mono text-slate-600 mr-1">{item.id}</span>
                        {t(item.titleKey as Parameters<typeof t>[0])}
                      </p>
                      <span className={cn(
                        'text-[9px] font-mono shrink-0 mt-0.5',
                        item.priority === 'critical'    && 'text-red-400',
                        item.priority === 'required'    && 'text-amber-400',
                        item.priority === 'recommended' && 'text-blue-400',
                        item.priority === 'conditional' && 'text-slate-500',
                      )}>
                        {PRIORITY_LABEL[item.priority][de ? 'de' : 'en']}
                      </span>
                    </div>
                    {item.legalRef && (
                      <p className="text-[9px] font-mono text-slate-600 mt-0.5 leading-tight truncate">
                        {item.legalRef}
                      </p>
                    )}
                    {item.xbauTag && (
                      <p className="text-[9px] font-mono text-slate-700 mt-0.5 leading-tight truncate hidden lg:block">
                        XBau:{item.xbauTag}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-[12px] text-slate-600">
                {de ? 'Keine Einträge' : 'No items'}
              </div>
            )
          ) : (
            <EmptyState locale={locale} />
          )}
        </AnimatePresence>
      </div>

      {/* ── Sticky bottom hint ── */}
      {checklist && (
        <div className="shrink-0 px-5 py-3 border-t border-white/5">
          <p className="text-[10px] text-slate-600 leading-relaxed text-center">
            {de
              ? 'Checkliste aktualisiert sich mit jeder Antwort'
              : 'Checklist updates with every answer'}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop right panel (lg+) ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col h-full flex-1 min-w-0 bg-[#07101f] border-l border-white/5 overflow-hidden">
        {/* Top accent */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none" />
        {content}
      </div>

      {/* ── Mobile floating button (< lg) ─────────────────────────────────────── */}
      <div className="lg:hidden">
        <AnimatePresence>
          {checklist && (
            <motion.button
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              onClick={() => setIsSheetOpen(true)}
              className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2.5 px-5 py-3 rounded-full bg-amber-500 text-black font-bold text-[13px] shadow-lg shadow-amber-900/40"
            >
              <ClipboardList size={15} />
              {de ? 'Checkliste' : 'Checklist'} ({checklist.totalItems})
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-black/40"
              />
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Mobile bottom sheet ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {isSheetOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsSheetOpen(false)}
              />

              {/* Sheet */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                className="fixed bottom-0 inset-x-0 z-50 h-[80vh] flex flex-col bg-[#07101f] rounded-t-3xl border-t border-white/10 overflow-hidden"
              >
                {/* Drag handle + close */}
                <div className="shrink-0 flex items-center justify-between px-5 pt-4 pb-2">
                  <div className="w-10 h-1 rounded-full bg-white/15 mx-auto absolute left-1/2 -translate-x-1/2 top-3" />
                  <p className="text-[13px] font-bold text-white mt-2">
                    {de ? 'Live-Checkliste' : 'Live Checklist'}
                    <span className="ml-2 text-[11px] font-mono text-slate-500">
                      ({checklist?.totalItems ?? 0})
                    </span>
                  </p>
                  <button
                    onClick={() => setIsSheetOpen(false)}
                    className="text-slate-500 hover:text-slate-300 mt-2"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  {content}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
