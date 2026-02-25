'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAssessmentStore } from '@/store/assessment-store';
import {
  getVisibleQuestions,
  getVisibleQuestionsForGroup,
  areGroupQuestionsComplete,
} from '@/lib/data/question-trees';
import { classify } from '@/lib/assessment/classifier';
import { generateChecklist } from '@/lib/assessment/checklist-gen';
import { QuestionCard } from './questions/question-card';
import { Button } from '@/components/ui/button';
import { LiveChecklistPanel } from './live-checklist-panel';
import type { ProjectTypeId, QuestionGroup, Answers } from '@/lib/assessment/types';

// ─── Sub-step definitions ──────────────────────────────────────────────────────

type SubStepId = QuestionGroup | 'review';

const SUB_STEPS: { id: SubStepId; label: string; labelDe: string; code: string }[] = [
  { id: 'buildingDetails',   label: 'Building Details',   labelDe: 'Gebäudedaten',    code: '3A' },
  { id: 'zoningLegal',       label: 'Zoning & Legal',     labelDe: 'Planung & Recht', code: '3B' },
  { id: 'specialConditions', label: 'Special Conditions', labelDe: 'Besonderheiten',  code: '3C' },
  { id: 'technicalSystems',  label: 'Technical Systems',  labelDe: 'Haustechnik',     code: '3D' },
  { id: 'review',            label: 'Review',             labelDe: 'Prüfung',         code: '3E' },
];

// ─── Main component ────────────────────────────────────────────────────────────

export function Step3Questions() {
  const t      = useTranslations('assessment');
  const locale = useLocale();
  const { projectType, municipality, answers, setAnswer, setResult, goBack } = useAssessmentStore();

  const [subStepIdx, setSubStepIdx]               = useState(0);
  const [firstUnansweredId, setFirstUnansweredId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!projectType || !municipality) return null;

  const currentSubStep = SUB_STEPS[subStepIdx];
  const isReview       = currentSubStep.id === 'review';

  const groupQuestions = isReview
    ? getVisibleQuestions(projectType, answers)
    : getVisibleQuestionsForGroup(projectType, answers, currentSubStep.id as QuestionGroup);

  const groupComplete = isReview
    ? true
    : areGroupQuestionsComplete(projectType, answers, currentSubStep.id as QuestionGroup);

  const answeredInGroup = groupQuestions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== '',
  ).length;

  const groupProgress = groupQuestions.length > 0 ? answeredInGroup / groupQuestions.length : 0;

  // Overall progress across all questions
  const allQuestions  = getVisibleQuestions(projectType, answers);
  const totalAnswered = allQuestions.filter(
    (q) => answers[q.id] !== undefined && answers[q.id] !== '',
  ).length;
  const totalProgress = allQuestions.length > 0 ? totalAnswered / allQuestions.length : 0;

  const handleNext = () => {
    if (!isReview && !groupComplete) {
      const first = groupQuestions.find((q) => answers[q.id] === undefined || answers[q.id] === '');
      if (first) {
        setFirstUnansweredId(first.id);
        const el = scrollRef.current?.querySelector(`[data-question-id="${first.id}"]`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setFirstUnansweredId(null), 2000);
      }
      return;
    }
    setSubStepIdx((i) => Math.min(i + 1, SUB_STEPS.length - 1));
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (subStepIdx === 0) {
      goBack();
    } else {
      setSubStepIdx((i) => i - 1);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGenerate = () => {
    const classification = classify(projectType, answers, municipality);
    const checklist      = generateChecklist(projectType, municipality, classification, answers);
    setResult(checklist);
  };

  const projectTypeTitle = t(`projectTypes.${projectType}.title` as Parameters<typeof t>[0]);
  const subStepLabel     = locale === 'de' ? currentSubStep.labelDe : currentSubStep.label;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <motion.div
        className="relative flex flex-col w-full lg:w-[420px] xl:w-[460px] flex-shrink-0 bg-[#080d1a] border-r border-white/5 overflow-hidden"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* ── Header ── */}
        <div className="flex-shrink-0 px-4 pt-5 pb-4 sm:px-7 sm:pt-7 sm:pb-5 border-b border-white/5">
          <p className="text-[9px] font-mono font-bold tracking-[0.25em] text-amber-400 uppercase mb-2">
            {t('step3.stepLabel')} · {municipality.name} · {projectTypeTitle}
          </p>
          <h2 className="text-[20px] font-black text-white tracking-tight leading-tight">
            {subStepLabel}
          </h2>

          {/* Sub-step pill nav */}
          <div className="mt-3 flex items-center gap-1.5">
            {SUB_STEPS.map((s, i) => {
              const isDone    = i < subStepIdx;
              const isCurrent = i === subStepIdx;
              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-center h-5 rounded-full text-[9px] font-bold font-mono transition-all duration-300 ${
                    isCurrent
                      ? 'bg-amber-500 text-[#080d1a] px-2.5'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400 px-2'
                      : 'bg-white/5 text-[#3A5070] px-2'
                  }`}
                >
                  {isDone ? '✓' : s.code}
                </div>
              );
            })}
            {/* Overall progress counter */}
            <span className="ml-auto text-[10px] font-mono text-[#3A5070]">
              {totalAnswered}/{allQuestions.length}
            </span>
          </div>

          {/* Per-group progress bar (hidden on review step) */}
          {!isReview && (
            <div className="mt-2.5 flex items-center gap-3">
              <div
                role="progressbar"
                aria-valuenow={answeredInGroup}
                aria-valuemin={0}
                aria-valuemax={groupQuestions.length}
                className="flex-1 h-0.75 rounded-full bg-white/5 overflow-hidden"
              >
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                  animate={{ width: `${groupProgress * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#4A5568] flex-shrink-0">
                {answeredInGroup}/{groupQuestions.length}
              </span>
            </div>
          )}

          {/* Overall progress bar (on review step) */}
          {isReview && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex-1 h-0.75 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full transition-colors duration-500 ${
                    totalProgress >= 1 ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                  animate={{ width: `${totalProgress * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Scrollable content ── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-2.5 scrollbar-thin"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={subStepIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex flex-col gap-2.5"
            >
              {isReview ? (
                <ReviewPanel
                  projectType={projectType}
                  answers={answers}
                  totalAnswered={totalAnswered}
                  totalQuestions={allQuestions.length}
                  totalProgress={totalProgress}
                  locale={locale}
                />
              ) : (
                groupQuestions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                  const isShaking  = firstUnansweredId === q.id;
                  return (
                    <motion.div
                      key={q.id}
                      layout
                      data-question-id={q.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={
                        isShaking
                          ? { opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }
                          : { opacity: 1, y: 0 }
                      }
                      transition={{
                        duration: 0.28,
                        ease: 'easeOut',
                        delay: isShaking ? 0 : idx * 0.03,
                      }}
                      className="relative"
                    >
                      {/* Left accent border */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-full transition-all duration-500 ${
                          isAnswered ? 'bg-emerald-500' : isShaking ? 'bg-red-500' : 'bg-white/8'
                        }`}
                      />

                      {/* Step number badge */}
                      <div
                        className={`absolute -left-[1px] top-4 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold z-10 transition-all duration-400 ${
                          isAnswered
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-[#1A2235] border border-white/10 text-[#4A5568]'
                        }`}
                      >
                        {isAnswered ? (
                          <CheckCircle2 size={11} strokeWidth={2.5} />
                        ) : (
                          String(idx + 1).padStart(2, '0')
                        )}
                      </div>

                      <div className="pl-6">
                        <QuestionCard
                          question={q}
                          value={answers[q.id]}
                          onChange={(val) => setAnswer(q.id, val)}
                          isAnswered={isAnswered}
                        />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Sticky footer ── */}
        <div className="flex-shrink-0 px-4 pb-5 pt-3 sm:px-6 sm:pb-6 sm:pt-4 border-t border-white/5 bg-[#080d1a] flex flex-col gap-3">
          {/* Incomplete hint */}
          <AnimatePresence>
            {!isReview && !groupComplete && answeredInGroup > 0 && (
              <motion.p
                key="hint"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11.5px] text-amber-400/70 leading-relaxed"
              >
                {t('step3.answerAllFirst')}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 flex-shrink-0"
            >
              <ArrowLeft size={14} />
              {t('step3.backButton')}
            </Button>

            {isReview ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleGenerate}
                className="flex-1 gap-2 font-bold text-[14px]"
              >
                {t('step3.continueButton')}
                <ArrowRight size={17} />
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleNext}
                className="flex-1 gap-2 font-bold text-[14px]"
              >
                {locale === 'de' ? 'Weiter' : 'Next'}
                <ArrowRight size={17} />
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* ══════════════ RIGHT PANEL — Live checklist ══════════════ */}
      <LiveChecklistPanel />

    </div>
  );
}

// ─── Review Panel ──────────────────────────────────────────────────────────────

function ReviewPanel({
  projectType,
  answers,
  totalAnswered,
  totalQuestions,
  totalProgress,
  locale,
}: {
  projectType: string;
  answers: Answers;
  totalAnswered: number;
  totalQuestions: number;
  totalProgress: number;
  locale: string;
}) {
  const allDone = totalAnswered === totalQuestions;

  return (
    <div className="flex flex-col gap-3 py-1">

      {/* Overall status */}
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border ${
          allDone
            ? 'border-emerald-500/25 bg-emerald-500/8'
            : 'border-amber-500/25 bg-amber-500/6'
        }`}
      >
        <CheckCircle2
          size={20}
          className={allDone ? 'text-emerald-400 shrink-0' : 'text-amber-400 shrink-0'}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <span className={`text-[13px] font-bold ${allDone ? 'text-emerald-300' : 'text-amber-300'}`}>
            {totalAnswered}/{totalQuestions}{' '}
            {locale === 'de' ? 'Fragen beantwortet' : 'questions answered'}
          </span>
          {!allDone && (
            <span className="text-[11px] text-amber-400/60 mt-0.5">
              {locale === 'de'
                ? 'Gehen Sie zurück und beantworten Sie alle Fragen.'
                : 'Go back and complete remaining questions.'}
            </span>
          )}
          <div className="mt-1.5 h-0.75 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allDone ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${totalProgress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Per-group summaries */}
      {SUB_STEPS.filter((s) => s.id !== 'review').map((subStep) => {
        const qs = getVisibleQuestionsForGroup(
          projectType as ProjectTypeId,
          answers,
          subStep.id as QuestionGroup,
        );
        if (qs.length === 0) return null;
        const answered = qs.filter(
          (q) => answers[q.id] !== undefined && answers[q.id] !== '',
        ).length;
        const complete = answered === qs.length;

        return (
          <div
            key={subStep.id}
            className={`p-3 rounded-xl border ${
              complete
                ? 'border-white/8 bg-white/[0.02]'
                : 'border-amber-500/20 bg-amber-500/5'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  complete
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {subStep.code}
              </span>
              <span className="text-[12px] font-semibold text-white/80">
                {locale === 'de' ? subStep.labelDe : subStep.label}
              </span>
              <span className="ml-auto text-[10px] font-mono text-[#4A5568]">
                {answered}/{qs.length}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {qs.map((q) => {
                const val   = answers[q.id];
                const isAns = val !== undefined && val !== '';
                return (
                  <span
                    key={q.id}
                    className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded border ${
                      isAns
                        ? 'border-white/8 text-[#4A6080]'
                        : 'border-amber-500/30 text-amber-400/60'
                    }`}
                  >
                    {q.id}: {isAns ? String(val) : '—'}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-[11px] text-[#3A5070] leading-relaxed text-center px-2 pt-1">
        {locale === 'de'
          ? 'Überprüfen Sie Ihre Angaben und generieren Sie dann Ihre individuelle Checkliste.'
          : 'Review your answers above, then generate your personalised checklist.'}
      </p>
    </div>
  );
}
