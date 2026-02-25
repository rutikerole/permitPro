'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface InputBooleanProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}

export function InputBoolean({ value, onChange }: InputBooleanProps) {
  const t = useTranslations('assessment.questions');

  return (
    <div className="flex gap-3">
      {([true, false] as const).map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={String(opt)}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(opt)}
            className={cn(
              'flex-1 h-11 rounded-xl border font-semibold text-[13px] transition-all duration-150 cursor-pointer',
              selected
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.15)]'
                : 'bg-elevated border-line text-text-secondary hover:border-line-strong hover:text-white',
            )}
          >
            {opt ? t('answerYes') : t('answerNo')}
          </button>
        );
      })}
    </div>
  );
}
