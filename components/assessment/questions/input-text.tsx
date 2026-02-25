'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InputTextProps {
  value: number | string | undefined;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export function InputText({ value, onChange, unit, min, max, step = 1, placeholder = '0' }: InputTextProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '' || e.target.value === '-') {
      setError(null);
      return;
    }
    const n = parseFloat(e.target.value);
    if (isNaN(n)) return;
    onChange(n);
    if (min !== undefined && n < min) {
      setError(`Min: ${min}${unit ? ' ' + unit : ''}`);
    } else if (max !== undefined && n > max) {
      setError(`Max: ${max}${unit ? ' ' + unit : ''}`);
    } else {
      setError(null);
    }
  };

  const handleBlur = () => {
    if (value === undefined || value === '') return;
    const n = Number(value);
    if (min !== undefined && n < min) {
      onChange(min);
    } else if (max !== undefined && n > max) {
      onChange(max);
    }
    setError(null);
  };

  const hasError = error !== null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-0">
        <input
          type="number"
          value={value === undefined || value === '' ? '' : value}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'h-11 bg-elevated border rounded-xl px-4',
            'text-white text-[14px] font-mono placeholder:text-text-muted',
            'focus:outline-none transition-colors duration-150 w-full',
            hasError
              ? 'border-red-500/60 ring-1 ring-red-500/30 focus:border-red-500/80 focus:ring-red-500/40'
              : 'border-line focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/30',
            unit && 'rounded-r-none border-r-0',
          )}
        />
        {unit && (
          <div className={cn(
            'h-11 px-4 flex items-center bg-overlay border rounded-r-xl border-l-0 text-[13px] font-mono shrink-0',
            hasError ? 'border-red-500/60 text-red-400/70' : 'border-line text-text-muted',
          )}>
            {unit}
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-[11px] text-red-400 font-mono pl-1">{error}</p>
      )}
    </div>
  );
}
