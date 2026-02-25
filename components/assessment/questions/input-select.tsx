'use client';

import { useTranslations } from 'next-intl';
import type { QuestionOption } from '@/lib/assessment/types';

interface InputSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  options: QuestionOption[];
}

export function InputSelect({ value, onChange, options }: InputSelectProps) {
  const t = useTranslations();
  const tA = useTranslations('assessment.step3');

  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 bg-elevated border border-line rounded-xl px-4 text-[14px] text-white appearance-none cursor-pointer focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30 transition-colors duration-150"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234B5563' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '40px',
      }}
    >
      <option value="" disabled className="bg-surface text-text-muted">
        {tA('selectPlaceholder')}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-surface text-white">
          {t(opt.labelKey as Parameters<typeof t>[0])}
        </option>
      ))}
    </select>
  );
}
