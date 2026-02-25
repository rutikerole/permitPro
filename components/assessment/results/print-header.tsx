'use client';

import { useTranslations, useLocale } from 'next-intl';
import type { GeneratedChecklist } from '@/lib/assessment/types';

interface PrintHeaderProps {
  checklist: GeneratedChecklist;
}

export function PrintHeader({ checklist }: PrintHeaderProps) {
  const t = useTranslations('assessment');
  const locale = useLocale();

  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB';
  const date = new Date(checklist.generatedAt).toLocaleDateString(dateLocale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const projectTypeTitle = t(
    `projectTypes.${checklist.projectType}.title` as Parameters<typeof t>[0]
  );

  const procedureFull = {
    kenntnisgabe: t('print.procedureFull.kenntnisgabe'),
    vereinfacht: t('print.procedureFull.vereinfacht'),
    normal: t('print.procedureFull.normal'),
  };

  return (
    <div className="hidden print:block mb-6 pb-4 border-b border-gray-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-black text-[20px] tracking-tight">PermitPro</p>
          <p className="text-[13px] text-gray-600">{t('print.subtitle')}</p>
        </div>
        <div className="text-right text-[11px] text-gray-500">
          <p>{t('print.generatedPrefix')} {date}</p>
          <p>permitpro.de</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-[12px]">
        <div>
          <p className="text-gray-500 uppercase tracking-wider text-[10px]">{t('print.municipality')}</p>
          <p className="font-semibold">{checklist.municipality.name}</p>
          <p className="text-gray-500">{checklist.municipality.landkreis}</p>
        </div>
        <div>
          <p className="text-gray-500 uppercase tracking-wider text-[10px]">{t('print.projectType')}</p>
          <p className="font-semibold">{projectTypeTitle}</p>
        </div>
        <div>
          <p className="text-gray-500 uppercase tracking-wider text-[10px]">{t('print.classificationLabel')}</p>
          <p className="font-semibold">
            {checklist.classification.buildingClass.replace('GK', 'GK ')}
          </p>
          <p className="text-gray-500 text-[11px]">
            {procedureFull[checklist.classification.procedure]}
          </p>
        </div>
      </div>

      <p className="mt-4 text-[10px] text-gray-400 italic">
        {t('print.disclaimer')}
      </p>
    </div>
  );
}
