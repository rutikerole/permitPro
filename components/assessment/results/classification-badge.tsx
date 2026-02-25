'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import type { ClassificationResult } from '@/lib/assessment/types';

interface ClassificationBadgeProps {
  classification: ClassificationResult;
}

const procedureVariant = {
  kenntnisgabe: 'success',
  vereinfacht: 'blue',
  normal: 'amber',
} as const;

export function ClassificationBadge({ classification }: ClassificationBadgeProps) {
  const t = useTranslations('assessment.classification');

  const procedureLabel = {
    kenntnisgabe: t('kenntnisgabeFull'),
    vereinfacht: t('vereinfachtFull'),
    normal: t('normalFull'),
  } as const;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Building class */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25">
        <span className="text-[11px] font-mono text-amber-400/70 uppercase tracking-widest">
          {t('buildingClass')}
        </span>
        <span className="font-black text-[18px] text-amber-400 font-mono leading-none">
          {classification.buildingClass.replace('GK', 'GK ')}
        </span>
      </div>

      {/* Procedure */}
      <Badge variant={procedureVariant[classification.procedure]}>
        {procedureLabel[classification.procedure]}
      </Badge>

      {/* Sonderbau warning */}
      {classification.isSonderbau && (
        <Badge variant="error">{t('sonderbauLabel')}</Badge>
      )}

      {/* Legal refs */}
      {classification.legalRefs.map((ref) => (
        <span
          key={ref}
          data-print="badge"
          className="text-[10px] font-mono text-text-muted border border-line rounded-lg px-2 py-1"
        >
          {ref}
        </span>
      ))}
    </div>
  );
}
