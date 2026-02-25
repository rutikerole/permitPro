'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssessmentStore } from '@/store/assessment-store';
import type { WizardStep } from '@/lib/assessment/types';

export function StepIndicator() {
  const t = useTranslations('assessment');
  const { currentStep, goBack } = useAssessmentStore();

  const steps: { n: WizardStep; label: string }[] = [
    { n: 1, label: t('steps.1') },
    { n: 2, label: t('steps.2') },
    { n: 3, label: t('steps.3') },
    { n: 4, label: t('steps.4') },
  ];

  return (
    <div
      data-print="hide"
      role="navigation"
      aria-label="Assessment wizard steps"
      className="sticky top-0 z-40 border-b border-line backdrop-blur-md"
      style={{ background: 'rgba(11,15,26,0.92)' }}
    >
      <div className="mx-auto max-w-3xl px-6 py-4 flex items-center gap-6">
        {/* Back button */}
        <button
          onClick={goBack}
          disabled={currentStep === 1}
          className={cn(
            'flex items-center gap-1.5 text-[12px] font-semibold transition-all duration-150',
            currentStep === 1
              ? 'text-text-muted pointer-events-none opacity-0'
              : 'text-text-secondary hover:text-white cursor-pointer',
          )}
          aria-label={t('back')}
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">{t('back')}</span>
        </button>

        {/* Steps */}
        <div className="flex items-center gap-2 flex-1 justify-center">
          {steps.map((step, i) => {
            const isCompleted = currentStep > step.n;
            const isActive = currentStep === step.n;
            return (
              <div key={step.n} className="flex items-center gap-2">
                {/* Dot + label */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`${step.label} — ${isCompleted ? 'completed' : isActive ? 'current' : 'pending'}`}
                    className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black font-mono border transition-all duration-300',
                    isActive && 'bg-amber-500 border-amber-500 text-gray-950 shadow-[0_0_16px_rgba(245,158,11,0.4)]',
                    isCompleted && 'bg-blue-500/20 border-blue-500/50 text-blue-400',
                    !isActive && !isCompleted && 'bg-elevated border-line text-text-muted',
                  )}>
                    {isCompleted ? (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : step.n}
                  </div>
                  <span className={cn(
                    'text-[10px] font-mono tracking-wider hidden sm:block',
                    isActive ? 'text-amber-400' : 'text-text-muted',
                  )}>
                    {step.label}
                  </span>
                </div>

                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className={cn(
                    'h-px w-8 sm:w-14 mb-5 transition-colors duration-300',
                    isCompleted ? 'bg-blue-500/40' : 'bg-line',
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* PermitPro wordmark */}
        <span className="text-[13px] font-black text-text-muted tracking-tight hidden sm:block">
          Permit<span className="text-amber-400">Pro</span>
        </span>
      </div>
    </div>
  );
}
