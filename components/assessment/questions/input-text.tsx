'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface InputTextProps {
  value: number | string | undefined;
  onChange: (value: number | '') => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export function InputText({ value, onChange, unit, min, max, step = 1, placeholder = '0' }: InputTextProps) {
  const [error, setError] = useState<string | null>(null);
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (value === undefined || value === '') return '';
    return String(value);
  });
  const internalChange = useRef(false);

  // Decimals allowed when step has a fractional part (e.g. 0.1)
  const allowDecimals = step % 1 !== 0;

  // Sync displayValue from external prop changes (store rehydration, blur clamp)
  // but NOT when we ourselves triggered the change
  useEffect(() => {
    if (internalChange.current) {
      internalChange.current = false;
      return;
    }
    if (value === undefined || value === '') {
      setDisplayValue('');
    } else {
      setDisplayValue(String(value));
    }
  }, [value]);

  function isValidInput(str: string): boolean {
    if (str === '') return true;
    if (allowDecimals) return /^\d*\.?\d*$/.test(str);
    return /^\d*$/.test(str);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;

    if (!isValidInput(raw)) return;

    setDisplayValue(raw);
    internalChange.current = true;

    // Empty → signal cleared
    if (raw === '') {
      onChange('');
      setError(null);
      return;
    }

    // Intermediate decimal states ("3.", ".") — don't push to store yet
    if (raw === '.' || raw.endsWith('.')) {
      setError(null);
      return;
    }

    const n = parseFloat(raw);
    if (isNaN(n) || !isFinite(n)) return;

    onChange(n);

    if (min !== undefined && n < min) {
      setError(`Min: ${min}${unit ? ' ' + unit : ''}`);
    } else if (max !== undefined && n > max) {
      setError(`Max: ${max}${unit ? ' ' + unit : ''}`);
    } else {
      setError(null);
    }
  }

  function handleBlur() {
    // Empty or lone dot → clear
    if (displayValue === '' || displayValue === '.') {
      if (displayValue === '.') {
        setDisplayValue('');
        internalChange.current = true;
        onChange('');
      }
      setError(null);
      return;
    }

    let n = parseFloat(displayValue);
    if (isNaN(n)) {
      setDisplayValue('');
      internalChange.current = true;
      onChange('');
      setError(null);
      return;
    }

    // Clamp to min/max
    if (min !== undefined && n < min) n = min;
    if (max !== undefined && n > max) n = max;

    // Round for integer-only fields
    if (!allowDecimals) n = Math.round(n);

    const finalStr = String(n);
    setDisplayValue(finalStr);
    internalChange.current = true;
    onChange(n);
    setError(null);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text');
    const input = e.currentTarget;
    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const candidate = displayValue.slice(0, start) + pasted + displayValue.slice(end);

    if (!isValidInput(candidate)) {
      e.preventDefault();
    }
  }

  const hasError = error !== null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-0">
        <input
          type="text"
          inputMode={allowDecimals ? 'decimal' : 'numeric'}
          value={displayValue}
          placeholder={placeholder}
          onChange={handleChange}
          onBlur={handleBlur}
          onPaste={handlePaste}
          autoComplete="off"
          className={cn(
            'h-11 bg-elevated border rounded-xl px-4',
            'text-white text-[14px] font-mono placeholder:text-text-muted',
            'focus:outline-none transition-colors duration-150 w-full',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
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
