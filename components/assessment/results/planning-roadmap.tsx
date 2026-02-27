'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Circle, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedChecklist, ItemStatus } from '@/lib/assessment/types';

// ── HOAI Phase Data ─────────────────────────────────────────────────────────

interface HOAISubStep {
  titleDe: string;
  titleEn: string;
  linkedItemIds?: string[];
}

interface HOAIPhase {
  id: string;
  titleDe: string;
  titleEn: string;
  descDe: string;
  descEn: string;
  subSteps: HOAISubStep[];
}

const HOAI_PHASES: HOAIPhase[] = [
  {
    id: 'SP0',
    titleDe: 'Projektvorbereitung',
    titleEn: 'Project Preparation',
    descDe: 'Bedarfsplanung, Grundlagen, Planverträge',
    descEn: 'Needs assessment, fundamentals, planner contracts',
    subSteps: [
      { titleDe: 'Bedarfsermittlung', titleEn: 'Needs Assessment' },
      { titleDe: 'Planungsgrundlagen', titleEn: 'Planning Fundamentals' },
      { titleDe: 'Planverträge abschließen', titleEn: 'Planner Contracts' },
      { titleDe: 'Finanzierung klären', titleEn: 'Financing' },
    ],
  },
  {
    id: 'SP1',
    titleDe: 'Grundlagenermittlung',
    titleEn: 'Basic Evaluation',
    descDe: 'Aufgabenklärung, Ortsbesichtigung, Bestandsaufnahme',
    descEn: 'Task clarification, site inspection, inventory',
    subSteps: [
      { titleDe: 'Aufgabe klären', titleEn: 'Clarify Task' },
      { titleDe: 'Ortsbesichtigung', titleEn: 'Site Inspection', linkedItemIds: ['B1', 'D2'] },
      { titleDe: 'Untersuchungsbedarf ermitteln', titleEn: 'Investigation Requirements', linkedItemIds: ['H4', 'H5', 'G5', 'G6', 'H7'] },
      { titleDe: 'Fachplaner auswählen', titleEn: 'Select Specialist Planners' },
      { titleDe: 'Ergebnisse dokumentieren', titleEn: 'Document Results' },
    ],
  },
  {
    id: 'SP2',
    titleDe: 'Vorplanung',
    titleEn: 'Preliminary Design',
    descDe: 'Grundlagenanalyse, Vorentwurf, Kostenschätzung',
    descEn: 'Analysis, preliminary plan, cost estimate',
    subSteps: [
      { titleDe: 'Grundlagen analysieren', titleEn: 'Analyze Fundamentals' },
      { titleDe: 'Vorentwurf erstellen (GK-Klassifizierung)', titleEn: 'Develop Preliminary Plan (GK Classification)' },
      { titleDe: 'Vorabstimmung mit Behörde', titleEn: 'Preliminary Permit Negotiations' },
      { titleDe: 'Kostenschätzung', titleEn: 'Cost Estimate', linkedItemIds: ['C7'] },
      { titleDe: 'Terminplanung', titleEn: 'Schedule' },
    ],
  },
  {
    id: 'SP3',
    titleDe: 'Entwurfsplanung',
    titleEn: 'Design Development',
    descDe: 'Entwurf, Baubeschreibung, Kostenberechnung',
    descEn: 'Design drawings, object description, cost calculation',
    subSteps: [
      { titleDe: 'Entwurf ausarbeiten', titleEn: 'Develop Design', linkedItemIds: ['C1', 'C2', 'C3', 'C4', 'C5'] },
      { titleDe: 'Baubeschreibung erstellen', titleEn: 'Object Description', linkedItemIds: ['A2'] },
      { titleDe: 'Genehmigungsfähigkeit prüfen', titleEn: 'Permit Feasibility Discussions' },
      { titleDe: 'Kostenberechnung', titleEn: 'Cost Calculation', linkedItemIds: ['C7'] },
      { titleDe: 'Ergebnisse dokumentieren', titleEn: 'Document Results' },
    ],
  },
  {
    id: 'SP4',
    titleDe: 'Genehmigungsplanung',
    titleEn: 'Permit Application',
    descDe: 'Unterlagen zusammenstellen, Antrag einreichen',
    descEn: 'Compile documents, submit application',
    subSteps: [
      { titleDe: 'Unterlagen zusammenstellen', titleEn: 'Compile Documents', linkedItemIds: ['C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3'] },
      { titleDe: 'Bauantrag einreichen', titleEn: 'Submit Application', linkedItemIds: ['A1', 'E1', 'E2', 'E3'] },
      { titleDe: 'Behördenanfragen beantworten (XBau 0201/0202)', titleEn: 'Respond to Authority Queries (XBau 0201/0202)' },
      { titleDe: 'Bescheid erhalten (XBau 0205)', titleEn: 'Receive Decision (XBau 0205)' },
    ],
  },
];

// ── Component ───────────────────────────────────────────────────────────────

interface PlanningRoadmapProps {
  checklist: GeneratedChecklist;
  itemStatuses: Record<string, ItemStatus>;
  locale: string;
}

export function PlanningRoadmap({ checklist, itemStatuses, locale }: PlanningRoadmapProps) {
  const de = locale === 'de';
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(['SP0', 'SP1']));

  // Collect all item IDs from the checklist
  const checklistItemIds = new Set(
    checklist.sections.flatMap((s) => s.items.map((i) => i.id)),
  );

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Calculate overall progress
  const allLinkedIds = new Set<string>();
  for (const phase of HOAI_PHASES) {
    for (const step of phase.subSteps) {
      for (const id of step.linkedItemIds ?? []) {
        if (checklistItemIds.has(id)) allLinkedIds.add(id);
      }
    }
  }
  const totalLinked = allLinkedIds.size;
  const totalReady = [...allLinkedIds].filter((id) => itemStatuses[id] === 'available').length;
  const overallPct = totalLinked > 0 ? Math.round((totalReady / totalLinked) * 100) : 0;

  // Find the "current" phase — first phase with incomplete linked items
  let currentPhaseIdx = HOAI_PHASES.length - 1;
  for (let i = 0; i < HOAI_PHASES.length; i++) {
    const phase = HOAI_PHASES[i];
    const phaseIds = new Set<string>();
    for (const step of phase.subSteps) {
      for (const id of step.linkedItemIds ?? []) {
        if (checklistItemIds.has(id)) phaseIds.add(id);
      }
    }
    const ready = [...phaseIds].filter((id) => itemStatuses[id] === 'available').length;
    if (ready < phaseIds.size) {
      currentPhaseIdx = i;
      break;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Overall progress header */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-white/8 bg-white/3">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[13px] font-bold text-white leading-tight">
            {de ? 'Planungsfahrplan' : 'Planning Roadmap'}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {de ? 'HOAI 2021 Leistungsphasen · ' : 'HOAI 2021 Service Phases · '}
            <span className="text-amber-400 font-semibold">
              {de ? `Phase ${currentPhaseIdx}` : `Phase ${currentPhaseIdx}`}
            </span>
            {' — '}
            {overallPct}% {de ? 'der Genehmigungsunterlagen bereit' : 'of permit documents ready'}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-20 h-1.5 rounded-full bg-white/8 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="text-[11px] font-mono text-slate-400">{totalReady}/{totalLinked}</span>
        </div>
      </div>

      {/* Phase cards */}
      {HOAI_PHASES.map((phase, idx) => {
        const isExpanded = expandedPhases.has(phase.id);
        const isCurrent = idx === currentPhaseIdx;
        const isPast = idx < currentPhaseIdx;

        // Phase-level progress
        const phaseItemIds = new Set<string>();
        for (const step of phase.subSteps) {
          for (const id of step.linkedItemIds ?? []) {
            if (checklistItemIds.has(id)) phaseItemIds.add(id);
          }
        }
        const phaseReady = [...phaseItemIds].filter((id) => itemStatuses[id] === 'available').length;
        const phaseTotal = phaseItemIds.size;
        const phasePct = phaseTotal > 0 ? Math.round((phaseReady / phaseTotal) * 100) : (isPast ? 100 : 0);

        return (
          <div key={phase.id} className="relative">
            {/* Timeline connector */}
            {idx < HOAI_PHASES.length - 1 && (
              <div className="absolute left-5 top-full w-px h-4 bg-white/8 z-0" />
            )}

            <motion.div
              className={cn(
                'rounded-xl border overflow-hidden transition-colors duration-200',
                isCurrent
                  ? 'border-amber-500/30 bg-amber-500/5'
                  : isPast
                    ? 'border-emerald-500/20 bg-emerald-500/3'
                    : 'border-white/8 bg-white/2',
              )}
              layout
            >
              {/* Phase header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full flex items-center gap-3 px-4 py-3 group"
              >
                {/* Phase number circle */}
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 text-[12px] font-bold shrink-0',
                    isCurrent
                      ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                      : isPast
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
                        : 'border-white/20 text-slate-500 bg-white/3',
                  )}
                >
                  {isPast ? <CheckCircle2 size={14} /> : idx}
                </div>

                <div className="flex flex-col items-start min-w-0 flex-1">
                  <span className={cn(
                    'text-[12px] font-bold leading-tight',
                    isCurrent ? 'text-amber-300' : isPast ? 'text-emerald-300' : 'text-slate-300',
                  )}>
                    {phase.id} — {de ? phase.titleDe : phase.titleEn}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    {de ? phase.descDe : phase.descEn}
                  </span>
                </div>

                {/* Phase progress */}
                {phaseTotal > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-12 h-1 rounded-full bg-white/8 overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isPast ? 'bg-emerald-500' : 'bg-amber-500',
                        )}
                        style={{ width: `${phasePct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{phasePct}%</span>
                  </div>
                )}

                <ChevronDown
                  size={14}
                  className={cn(
                    'text-slate-600 transition-transform duration-200 shrink-0',
                    isExpanded && 'rotate-180',
                  )}
                />
              </button>

              {/* Expandable sub-steps */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 pt-1 flex flex-col gap-1.5">
                      {phase.subSteps.map((step, sIdx) => {
                        const linkedAvailable = (step.linkedItemIds ?? []).filter((id) => checklistItemIds.has(id));
                        const hasLinked = linkedAvailable.length > 0;
                        const allReady = hasLinked && linkedAvailable.every((id) => itemStatuses[id] === 'available');
                        const someReady = hasLinked && linkedAvailable.some((id) => itemStatuses[id] === 'available');

                        return (
                          <div
                            key={sIdx}
                            className="flex items-start gap-2.5 py-1.5 pl-10"
                          >
                            {/* Status dot */}
                            {allReady ? (
                              <CheckCircle2 size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                            ) : someReady ? (
                              <Clock size={12} className="text-amber-400 mt-0.5 shrink-0" />
                            ) : (
                              <Circle size={12} className="text-slate-600 mt-0.5 shrink-0" />
                            )}

                            <div className="flex flex-col min-w-0 flex-1">
                              <span className={cn(
                                'text-[11px] leading-tight',
                                allReady ? 'text-emerald-300' : 'text-slate-300',
                              )}>
                                {de ? step.titleDe : step.titleEn}
                              </span>

                              {/* Linked item badges */}
                              {hasLinked && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {linkedAvailable.map((id) => {
                                    const status = itemStatuses[id] ?? 'missing';
                                    return (
                                      <span
                                        key={id}
                                        className={cn(
                                          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border',
                                          status === 'available'
                                            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                                            : status === 'in_progress'
                                              ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                                              : 'text-slate-500 border-white/10 bg-white/3',
                                        )}
                                      >
                                        {id}
                                        {status === 'available' && <CheckCircle2 size={8} />}
                                        {status === 'in_progress' && <Clock size={8} />}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        );
      })}

      {/* Footer note */}
      <p className="text-[10px] text-slate-600 italic px-1">
        {de
          ? 'Basierend auf HOAI 2021 Anlage 10 — Leistungsphasen für Gebäude und Innenräume'
          : 'Based on HOAI 2021 Annex 10 — Service phases for buildings and interiors'}
      </p>
    </div>
  );
}
