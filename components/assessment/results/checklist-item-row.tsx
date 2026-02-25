'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import {
  ChevronDown,
  Home, Compass, Layers3, Map, Zap, Flame, Mountain, Volume2, Building, Briefcase,
  Info, Lightbulb, Clock, Copy, Ruler,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistItem, ItemProvider, ItemPriority, ItemStatus } from '@/lib/assessment/types';

// ── Config maps ────────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<ItemPriority, {
  label: string; labelDe: string;
  dot: string; badge: string; rowBorder: string;
}> = {
  critical:    {
    label: 'Critical',    labelDe: 'Kritisch',
    dot: 'bg-red-400',
    badge: 'bg-red-500/20 text-red-300 border-red-500/40',
    rowBorder: 'border-l-red-500/50',
  },
  required:    {
    label: 'Required',    labelDe: 'Pflicht',
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    rowBorder: 'border-l-amber-500/40',
  },
  conditional: {
    label: 'Conditional', labelDe: 'Bedingt',
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    rowBorder: 'border-l-blue-500/40',
  },
  recommended: {
    label: 'Recommended', labelDe: 'Empfohlen',
    dot: 'bg-slate-400',
    badge: 'bg-white/8 text-slate-400 border-white/15',
    rowBorder: 'border-l-slate-500/30',
  },
};

const PROVIDER_ICON: Record<ItemProvider, React.ComponentType<{ size?: number; className?: string }>> = {
  owner:      Home,
  architect:  Compass,
  structural: Layers3,
  surveyor:   Map,
  energy:     Zap,
  fire:       Flame,
  geo:        Mountain,
  acoustic:   Volume2,
  authority:  Building,
  specialist: Briefcase,
};

const PROVIDER_LABEL: Record<ItemProvider, { en: string; de: string }> = {
  owner:      { en: 'Owner',       de: 'Bauherr' },
  architect:  { en: 'Architect',   de: 'Architekt' },
  structural: { en: 'Structural',  de: 'Tragwerk' },
  surveyor:   { en: 'Surveyor',    de: 'Vermessung' },
  energy:     { en: 'Energy',      de: 'Energie' },
  fire:       { en: 'Fire Eng.',   de: 'Brandschutz' },
  geo:        { en: 'Geotech',     de: 'Geotechnik' },
  acoustic:   { en: 'Acoustic',    de: 'Akustik' },
  authority:  { en: 'Authority',   de: 'Behörde' },
  specialist: { en: 'Specialist',  de: 'Gutachter' },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatCost(range: { min: number; max: number }, locale: string): string | null {
  if (range.min === 0 && range.max === 0) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    }).format(n);
  return range.min === range.max ? fmt(range.min) : `${fmt(range.min)}–${fmt(range.max)}`;
}

function formatTime(range: { min: number; max: number }, locale: string): string {
  const unit = locale === 'de' ? 'Wo.' : 'wks';
  return range.min === range.max
    ? `${range.min} ${unit}`
    : `${range.min}–${range.max} ${unit}`;
}

// ── Component ──────────────────────────────────────────────────────────────────

// ── Status cycle button config ──────────────────────────────────────────────

const STATUS_CONFIG: Record<ItemStatus, {
  label: string; labelDe: string;
  icon: React.ReactNode;
  className: string;
  titleEn: string; titleDe: string;
}> = {
  missing: {
    label: 'Missing', labelDe: 'Fehlt',
    icon: null,
    className: 'border-slate-600 hover:border-amber-500/70',
    titleEn: 'Click: mark In Progress', titleDe: 'Klicken: In Bearbeitung',
  },
  in_progress: {
    label: 'In Progress', labelDe: 'In Bearb.',
    icon: (
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <circle cx="4.5" cy="4.5" r="2.5" fill="#F59E0B" />
      </svg>
    ),
    className: 'bg-amber-500/15 border-amber-400',
    titleEn: 'Click: mark Available', titleDe: 'Klicken: Vorhanden',
  },
  available: {
    label: 'Available', labelDe: 'Vorhanden',
    icon: (
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    className: 'bg-emerald-500/25 border-emerald-400',
    titleEn: 'Click: mark Missing', titleDe: 'Klicken: Fehlt',
  },
};

interface ChecklistItemRowProps {
  item: ChecklistItem;
  status: ItemStatus;
  onCycle: () => void;
}

export function ChecklistItemRow({ item, status, onCycle }: ChecklistItemRowProps) {
  const t      = useTranslations();
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);

  const priority   = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.required;
  const costStr    = item.costRange ? formatCost(item.costRange, locale) : null;
  const hasDetails = !!(
    item.whatIsThisKey || item.tipsKey || item.dependencies?.length || item.formatRequirements
  );
  const statusCfg  = STATUS_CONFIG[status];
  const isAvailable = status === 'available';

  return (
    <div
      data-print="item"
      className={cn(
        'rounded-lg border-l-2 border border-white/10 transition-all duration-150',
        priority.rowBorder,
        isAvailable
          ? 'bg-white/2 opacity-60'
          : 'bg-slate-900/80 hover:bg-slate-800/80 hover:border-white/20',
        expanded && !isAvailable && 'bg-slate-800/80 border-white/20',
      )}
    >
      {/* ── Main row ── */}
      <div className="flex items-start gap-3 px-3 py-3">

        {/* 3-state status button */}
        <button
          role="checkbox"
          aria-checked={isAvailable}
          onClick={onCycle}
          title={locale === 'de' ? statusCfg.titleDe : statusCfg.titleEn}
          className={cn(
            'shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center',
            'transition-all duration-150 cursor-pointer focus:outline-none',
            'focus-visible:ring-2 focus-visible:ring-amber-500/50',
            statusCfg.className,
          )}
        >
          {statusCfg.icon}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row: ID + Title + Priority + Expand */}
          <div className="flex items-start justify-between gap-2">

            {/* ID + Title — clicking either cycles the status */}
            <button onClick={onCycle} className="text-left flex-1 min-w-0 group">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                  {item.id}
                </span>
                <span className={cn(
                  'text-sm font-semibold leading-snug transition-colors duration-150',
                  isAvailable ? 'text-slate-500 line-through' : 'text-slate-100 group-hover:text-white',
                )}>
                  {t(item.titleKey as Parameters<typeof t>[0])}
                </span>
              </div>
            </button>

            {/* Priority badge + expand toggle */}
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', priority.dot)} />
              <span className={cn(
                'text-[9px] font-mono font-bold tracking-wide uppercase px-1.5 py-0.5 rounded border',
                priority.badge,
              )}>
                {locale === 'de' ? priority.labelDe : priority.label}
              </span>

              {hasDetails && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className={cn(
                    'w-6 h-6 rounded flex items-center justify-center cursor-pointer',
                    'border border-white/10 hover:border-white/30 text-slate-500 hover:text-slate-200',
                    'transition-all duration-150 focus:outline-none',
                    expanded && 'border-white/25 text-slate-200 bg-white/5',
                  )}
                  aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                  <ChevronDown
                    size={12}
                    className={cn('transition-transform duration-200', expanded && 'rotate-180')}
                  />
                </button>
              )}
            </div>
          </div>

          {/* Meta row: legal ref · XBau tag · cost · time · copies */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
            <span className="text-[10px] font-mono text-blue-400/80 tracking-wide">
              {item.legalRef}
            </span>
            {item.xbauTag && (
              <span className="hidden sm:inline text-[9px] font-mono text-slate-600 bg-white/3 border border-white/8 rounded px-1.5 py-0.5 tracking-wide">
                XBau:{item.xbauTag}
              </span>
            )}
            {costStr && (
              <span className="text-[10px] font-mono text-emerald-400/80">{costStr}</span>
            )}
            {item.timeWeeks && (
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Clock size={9} />
                {formatTime(item.timeWeeks, locale)}
              </span>
            )}
            {item.copies && (
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Copy size={9} />
                {item.copies}×
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Expandable detail panel (CSS-only, no Framer Motion) ── */}
      <div
        style={{
          maxHeight: expanded ? '600px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.22s ease-in-out',
        }}
      >
        <div className="px-4 pb-4 pt-2 border-t border-white/8 flex flex-col gap-2.5">

          {/* Who provides */}
          {item.providers && item.providers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.providers.map((p) => {
                const Icon  = PROVIDER_ICON[p];
                const label = locale === 'de' ? PROVIDER_LABEL[p].de : PROVIDER_LABEL[p].en;
                return (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400"
                  >
                    {Icon && <Icon size={9} />}
                    {label}
                  </span>
                );
              })}
            </div>
          )}

          {/* What is this? */}
          {item.whatIsThisKey && (
            <div className="flex gap-2 p-2.5 rounded-lg bg-blue-500/8 border border-blue-500/15">
              <Info size={12} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-200/70 leading-relaxed">
                {t(item.whatIsThisKey as Parameters<typeof t>[0])}
              </p>
            </div>
          )}

          {/* Tips */}
          {item.tipsKey && (
            <div className="flex gap-2 p-2.5 rounded-lg bg-amber-500/8 border border-amber-500/15">
              <Lightbulb size={12} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-200/60 leading-relaxed">
                {t(item.tipsKey as Parameters<typeof t>[0])}
              </p>
            </div>
          )}

          {/* Format requirements */}
          {item.formatRequirements && (
            <div className="flex items-start gap-2">
              <Ruler size={10} className="text-slate-500 mt-0.5 shrink-0" />
              <span className="text-[10.5px] text-slate-500 leading-relaxed">
                {item.formatRequirements}
              </span>
            </div>
          )}

          {/* Dependencies */}
          {item.dependencies && item.dependencies.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-500">
                {locale === 'de' ? 'Benötigt:' : 'Requires:'}
              </span>
              {item.dependencies.map((d) => (
                <span
                  key={d}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400"
                >
                  {d}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
