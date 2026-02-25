'use client';

import dynamic from 'next/dynamic';
import { useMemo, Component, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { classify } from '@/lib/assessment/classifier';
import type { ProjectTypeId, Answers } from '@/lib/assessment/types';

const BuildingScene = dynamic(
  () => import('./building-scene').then((m) => ({ default: m.BuildingScene })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#060c18]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-20 rounded-t-sm bg-linear-to-t from-[#0F1A2E] to-[#1A2A40] animate-pulse" />
            <div className="w-16 h-0.5 bg-line mt-1 animate-pulse" />
          </div>
          <p className="text-[10px] font-mono tracking-[0.3em] text-[#1E3A5F] uppercase animate-pulse">
            Loading 3D Scene
          </p>
        </div>
      </div>
    ),
  },
);

// ─── Color tokens ─────────────────────────────────────────────────────────────

const GK_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  GK1: { bg: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  GK2: { bg: 'bg-emerald-500/10 border-emerald-500/25', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  GK3: { bg: 'bg-amber-500/10 border-amber-500/25',     text: 'text-amber-400',   dot: 'bg-amber-500'   },
  GK4: { bg: 'bg-orange-500/10 border-orange-500/25',   text: 'text-orange-400',  dot: 'bg-orange-500'  },
  GK5: { bg: 'bg-red-500/10 border-red-500/25',         text: 'text-red-400',     dot: 'bg-red-500'     },
};

const PROC_COLOR: Record<string, { bg: string; text: string }> = {
  kenntnisgabe: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
  vereinfacht:  { bg: 'bg-amber-500/10 border-amber-500/20',     text: 'text-amber-400'   },
  normal:       { bg: 'bg-red-500/10 border-red-500/20',         text: 'text-red-400'     },
};

// ─── Project type visual config ────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { emoji: string; label: string }> = {
  neubau:            { emoji: '🏗', label: 'New Build'       },
  anbau:             { emoji: '🔧', label: 'Extension'       },
  umbau:             { emoji: '🔨', label: 'Renovation'      },
  nutzungsaenderung: { emoji: '🔄', label: 'Change of Use'   },
  abbruch:           { emoji: '🏚', label: 'Demolition'      },
};

// ─── Live classification overlay ─────────────────────────────────────────────

interface LiveBadgeProps {
  projectType: ProjectTypeId;
  answers: Answers;
}

function LiveBadge({ projectType, answers }: LiveBadgeProps) {
  const t = useTranslations('assessment');

  const hasHeight = Number(answers.hoehe ?? answers.bestandHoehe ?? 0) > 0;
  const hasUsage  = projectType === 'abbruch' || !!(answers.nutzungsart || answers.neueNutzung);

  const result = useMemo(() => {
    if (!hasHeight || !hasUsage) return null;
    try { return classify(projectType, answers); } catch { return null; }
  }, [projectType, answers, hasHeight, hasUsage]);

  return (
    <AnimatePresence mode="wait">
      {result ? (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.35 }}
          className="flex flex-col gap-2"
        >
          {/* Live pulse label */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[9.5px] font-mono font-bold tracking-[0.22em] text-emerald-400 uppercase">
              {t('step3.liveClassification')}
            </span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {/* GK badge */}
            {(() => {
              const gk = GK_COLOR[result.buildingClass] ?? GK_COLOR.GK3;
              return (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold ${gk.bg} ${gk.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${gk.dot}`} />
                  {result.buildingClass.replace('GK', 'GK ')}
                </div>
              );
            })()}

            {/* Procedure badge */}
            {(() => {
              const pc = PROC_COLOR[result.procedure] ?? PROC_COLOR.vereinfacht;
              return (
                <div className={`flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold ${pc.bg} ${pc.text}`}>
                  {result.procedure === 'kenntnisgabe' && t('classification.kenntnisgabeFull')}
                  {result.procedure === 'vereinfacht'  && t('classification.vereinfachtFull')}
                  {result.procedure === 'normal'       && t('classification.normalFull')}
                </div>
              );
            })()}

            {/* Sonderbau */}
            {result.isSonderbau && (
              <div className="flex items-center px-2.5 py-1 rounded-lg border border-red-500/25 bg-red-500/10 text-[11px] font-mono font-bold text-red-400">
                {t('classification.sonderbauLabel')}
              </div>
            )}
          </div>

          {/* Legal refs */}
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {result.legalRefs.map((ref) => (
              <span key={ref} className="text-[10px] font-mono text-[#3A5070] tracking-wide">
                {ref}
              </span>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.p
          key="hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-[11px] font-mono text-[#3A5070] tracking-wider"
        >
          {t('step3.classificationHint')}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// ─── WebGL Error boundary ─────────────────────────────────────────────────────

class WebGLErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-[#060c18]">
          <p className="text-[11px] font-mono text-[#2A3A50] text-center px-6">
            3D preview unavailable<br />in this browser
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Exported component ────────────────────────────────────────────────────────

interface BuildingPreviewProps {
  projectType: ProjectTypeId;
  answers: Answers;
  isComplete?: boolean;
}

export function BuildingPreview({ projectType, answers, isComplete }: BuildingPreviewProps) {
  const t = useTranslations('assessment');
  const cfg = TYPE_CONFIG[projectType];

  return (
    /* Fills the full right panel — no inner border or rounded box */
    <div className="relative w-full h-full bg-[#060c18]">

      {/* Full-height 3D canvas — wrapped in error boundary for WebGL failures */}
      <div className="absolute inset-0">
        <WebGLErrorBoundary>
          <BuildingScene projectType={projectType} answers={answers} />
        </WebGLErrorBoundary>
      </div>

      {/* ── Top-left: Project type badge ── */}
      <div className="absolute top-5 left-5 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/8"
        >
          <span className="text-lg leading-none">{cfg?.emoji}</span>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-[#4A5568] tracking-widest uppercase">
              {t('step3.stepLabel')}
            </span>
            <span className="text-[11px] font-semibold text-white/80 leading-tight">
              {t(`projectTypes.${projectType}.title` as Parameters<typeof t>[0])}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Top-right: Hint when no input yet ── */}
      <AnimatePresence>
        {Number(answers.hoehe ?? answers.bestandHoehe ?? 0) === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-5 right-5 z-10"
          >
            <p className="text-[10px] font-mono text-[#2A3A50] tracking-wider text-right">
              ← Enter details to<br />see your building
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom: Frosted glass classification panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute bottom-0 inset-x-0 z-10 p-5"
        style={{
          background: 'linear-gradient(to top, rgba(6,12,24,0.95) 0%, rgba(6,12,24,0.7) 60%, transparent 100%)',
        }}
      >
        <div className="max-w-md">
          <LiveBadge projectType={projectType} answers={answers} />
        </div>

        {/* Complete state */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex items-center gap-2 text-[11px] font-mono text-emerald-400/80"
            >
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              All questions answered — ready to generate checklist
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Subtle vignette edges ── */}
      <div
        className="pointer-events-none absolute inset-0 z-5"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(4,8,16,0.5) 100%)',
        }}
      />
    </div>
  );
}
