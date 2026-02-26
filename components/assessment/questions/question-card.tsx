'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { Question, Answers } from '@/lib/assessment/types';
import { InputText } from './input-text';
import { InputSelect } from './input-select';
import { InputBoolean } from './input-boolean';

interface QuestionCardProps {
  question: Question;
  value: Answers[string] | undefined;
  onChange: (value: string | number | boolean) => void;
  isAnswered?: boolean;
}

export function QuestionCard({ question, value, onChange, isAnswered = false }: QuestionCardProps) {
  const t = useTranslations();

  return (
    <motion.div
      layout
      className={`flex flex-col gap-2.5 rounded-xl px-4 py-3.5 transition-all duration-300 ${
        isAnswered
          ? 'bg-[#0D1526]'
          : 'bg-[#0F1A2E] ring-1 ring-amber-500/20'
      }`}
    >
      {/* Label + legal ref */}
      <div className="flex items-start justify-between gap-2">
        <label
          className={`text-[13px] font-semibold leading-snug flex-1 transition-colors duration-300 ${
            isAnswered ? 'text-[#8899AA]' : 'text-white'
          }`}
        >
          {t(question.labelKey as Parameters<typeof t>[0])}
        </label>
        {question.legalRef && (
          <span className="flex-shrink-0 text-[9.5px] font-mono text-[#3A4A60] tracking-wider border border-white/6 rounded-md px-1.5 py-0.5 bg-white/3 whitespace-nowrap">
            {question.legalRef}
          </span>
        )}
      </div>

      {/* Hint */}
      {question.hintKey && (
        <p className="text-[11.5px] text-[#4A5568] leading-relaxed -mt-0.5">
          {t(question.hintKey as Parameters<typeof t>[0])}
        </p>
      )}

      {/* Input */}
      <div>
        {question.inputType === 'number' && (
          <InputText
            value={value as number | string | undefined}
            onChange={(v) => onChange(v)}
            unit={question.unit}
            min={question.min}
            max={question.max}
            step={question.step}
          />
        )}
        {question.inputType === 'select' && question.options && (
          <InputSelect
            value={value as string | undefined}
            onChange={(v) => onChange(v)}
            options={question.options}
          />
        )}
        {question.inputType === 'boolean' && (
          <InputBoolean
            value={value as boolean | undefined}
            onChange={(v) => onChange(v)}
          />
        )}
      </div>
    </motion.div>
  );
}
