'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Circle, ChevronRight, Building2, User, HardHat, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GeneratedChecklist, ItemStatus } from '@/lib/assessment/types';

// ── Flow node data ──────────────────────────────────────────────────────────

interface FlowNode {
  id: string;
  code: string;
  titleDe: string;
  titleEn: string;
  from: 'applicant' | 'authority' | 'specialist' | 'neighbor';
  to: 'applicant' | 'authority' | 'specialist' | 'neighbor';
  linkedItemIds?: string[];
  /** Only show if these item IDs are in the checklist */
  conditionalOnItems?: string[];
}

const MAIN_FLOW: FlowNode[] = [
  {
    id: 'submit',
    code: '0200',
    titleDe: 'Bauantrag einreichen',
    titleEn: 'Submit Application',
    from: 'applicant',
    to: 'authority',
    linkedItemIds: ['A1', 'A2', 'B1', 'C1', 'C2', 'C3'],
  },
  {
    id: 'formal-review',
    code: '0201',
    titleDe: 'Formale Prüfung',
    titleEn: 'Formal Review Result',
    from: 'authority',
    to: 'applicant',
  },
  {
    id: 'amendments',
    code: '0202',
    titleDe: 'Nachforderungen / Nachbesserung',
    titleEn: 'Amendments (if needed)',
    from: 'applicant',
    to: 'authority',
  },
  {
    id: 'hearing',
    code: '0203',
    titleDe: 'Anhörung (bei Bedarf)',
    titleEn: 'Hearing (if needed)',
    from: 'authority',
    to: 'applicant',
  },
  {
    id: 'response',
    code: '0204',
    titleDe: 'Stellungnahme',
    titleEn: 'Response',
    from: 'applicant',
    to: 'authority',
  },
  {
    id: 'decision',
    code: '0205',
    titleDe: 'Baugenehmigung / Bescheid',
    titleEn: 'Permit Decision',
    from: 'authority',
    to: 'applicant',
  },
];

const PARALLEL_FLOWS: FlowNode[] = [
  {
    id: 'specialist-request',
    code: '0400',
    titleDe: 'Fachbehörde anfragen',
    titleEn: 'Request Specialist Statement',
    from: 'authority',
    to: 'specialist',
    conditionalOnItems: ['H3', 'H4', 'H5', 'G5', 'G6', 'J2'],
  },
  {
    id: 'specialist-response',
    code: '0405',
    titleDe: 'Fachstellungnahme',
    titleEn: 'Specialist Statement',
    from: 'specialist',
    to: 'authority',
    conditionalOnItems: ['H3', 'H4', 'H5', 'G5', 'G6', 'J2'],
  },
  {
    id: 'neighbor-notify',
    code: '0500',
    titleDe: 'Nachbarbeteiligung',
    titleEn: 'Neighbor Notification',
    from: 'authority',
    to: 'neighbor',
    conditionalOnItems: ['A7'],
  },
  {
    id: 'tech-review',
    code: '0700',
    titleDe: 'Prüfingenieur beauftragen',
    titleEn: 'Commission Checking Engineer',
    from: 'authority',
    to: 'specialist',
    linkedItemIds: ['D1', 'D3', 'F2'],
    conditionalOnItems: ['D3', 'F2'],
  },
  {
    id: 'tech-report',
    code: '0706',
    titleDe: 'Prüfbericht',
    titleEn: 'Review Report',
    from: 'specialist',
    to: 'authority',
    linkedItemIds: ['D3', 'F2'],
    conditionalOnItems: ['D3', 'F2'],
  },
];

const LANE_ICONS = {
  applicant: User,
  authority: Building2,
  specialist: HardHat,
  neighbor: Users,
};

const LANE_LABELS = {
  applicant:  { de: 'Bauherr', en: 'Applicant' },
  authority:  { de: 'Bauaufsicht', en: 'Building Authority' },
  specialist: { de: 'Fachbehörde / Prüfingenieur', en: 'Specialist / Engineer' },
  neighbor:   { de: 'Nachbarn', en: 'Neighbors' },
};

// ── Component ───────────────────────────────────────────────────────────────

interface XBauFlowDiagramProps {
  checklist: GeneratedChecklist;
  itemStatuses: Record<string, ItemStatus>;
  locale: string;
}

export function XBauFlowDiagram({ checklist, itemStatuses, locale }: XBauFlowDiagramProps) {
  const de = locale === 'de';
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Collect all item IDs from the checklist
  const checklistItemIds = new Set(
    checklist.sections.flatMap((s) => s.items.map((i) => i.id)),
  );

  // Filter parallel flows based on whether relevant items are in the checklist
  const visibleParallel = PARALLEL_FLOWS.filter((node) => {
    if (!node.conditionalOnItems) return true;
    return node.conditionalOnItems.some((id) => checklistItemIds.has(id));
  });

  // Determine which lanes are active
  const activeLanes = new Set<string>();
  for (const node of [...MAIN_FLOW, ...visibleParallel]) {
    activeLanes.add(node.from);
    activeLanes.add(node.to);
  }

  // Determine "current step" in the main flow based on linked item completion
  const getNodeStatus = (node: FlowNode): 'done' | 'current' | 'future' => {
    if (!node.linkedItemIds || node.linkedItemIds.length === 0) return 'future';
    const relevant = node.linkedItemIds.filter((id) => checklistItemIds.has(id));
    if (relevant.length === 0) return 'future';
    const allDone = relevant.every((id) => itemStatuses[id] === 'available');
    const someDone = relevant.some((id) => itemStatuses[id] === 'available');
    if (allDone) return 'done';
    if (someDone) return 'current';
    return 'future';
  };

  const renderFlowNode = (node: FlowNode, isParallel = false) => {
    const status = getNodeStatus(node);
    const isSelected = selectedNode === node.id;
    const linkedVisible = (node.linkedItemIds ?? []).filter((id) => checklistItemIds.has(id));

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative rounded-xl border p-3 cursor-pointer transition-all duration-200',
          status === 'done'
            ? 'border-emerald-500/30 bg-emerald-500/5'
            : status === 'current'
              ? 'border-amber-500/30 bg-amber-500/5'
              : 'border-white/8 bg-white/2',
          isSelected && 'ring-1 ring-amber-400/40',
          isParallel && 'ml-6',
        )}
        onClick={() => setSelectedNode(isSelected ? null : node.id)}
      >
        {/* XBau code badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={cn(
            'px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border',
            status === 'done'
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
              : status === 'current'
                ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                : 'text-slate-500 border-white/12 bg-white/4',
          )}>
            XBau {node.code}
          </span>

          {/* Direction indicator */}
          <div className="flex items-center gap-1 text-[9px] text-slate-600">
            <span>{de ? LANE_LABELS[node.from].de : LANE_LABELS[node.from].en}</span>
            <ChevronRight size={9} />
            <span>{de ? LANE_LABELS[node.to].de : LANE_LABELS[node.to].en}</span>
          </div>

          {/* Status icon */}
          <div className="ml-auto">
            {status === 'done' && <CheckCircle2 size={12} className="text-emerald-400" />}
            {status === 'current' && <Clock size={12} className="text-amber-400" />}
            {status === 'future' && <Circle size={10} className="text-slate-600" />}
          </div>
        </div>

        {/* Title */}
        <p className={cn(
          'text-[11px] font-semibold leading-tight',
          status === 'done' ? 'text-emerald-200' : status === 'current' ? 'text-amber-200' : 'text-slate-300',
        )}>
          {de ? node.titleDe : node.titleEn}
        </p>

        {/* Linked items — expanded when selected */}
        {isSelected && linkedVisible.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-2 pt-2 border-t border-white/8"
          >
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
              {de ? 'Verknüpfte Unterlagen' : 'Linked Documents'}
            </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {linkedVisible.map((id) => {
                const s = itemStatuses[id] ?? 'missing';
                return (
                  <span
                    key={id}
                    className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border',
                      s === 'available'
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : s === 'in_progress'
                          ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          : 'text-slate-500 border-white/10 bg-white/3',
                    )}
                  >
                    {id}
                    {s === 'available' && <CheckCircle2 size={8} />}
                    {s === 'in_progress' && <Clock size={8} />}
                  </span>
                );
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-white/8 bg-white/3">
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[13px] font-bold text-white leading-tight">
            {de ? 'XBau-Nachrichtenfluss' : 'XBau Message Flow'}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            {de
              ? 'Digitaler Baugenehmigungsprozess nach XBau-Standard'
              : 'Digital building permit process per XBau standard'}
          </span>
        </div>
      </div>

      {/* Swimlane legend */}
      <div className="flex flex-wrap gap-3 px-1">
        {(['applicant', 'authority', 'specialist', 'neighbor'] as const)
          .filter((lane) => activeLanes.has(lane))
          .map((lane) => {
            const Icon = LANE_ICONS[lane];
            return (
              <div key={lane} className="flex items-center gap-1.5">
                <Icon size={12} className="text-slate-500" />
                <span className="text-[10px] font-mono text-slate-400">
                  {de ? LANE_LABELS[lane].de : LANE_LABELS[lane].en}
                </span>
              </div>
            );
          })}
      </div>

      {/* Main flow */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1 mb-1">
          <div className="h-px flex-1 bg-white/8" />
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
            {de ? 'Hauptverfahren' : 'Main Process'}
          </span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {MAIN_FLOW.map((node, idx) => (
          <div key={node.id}>
            {renderFlowNode(node)}
            {idx < MAIN_FLOW.length - 1 && (
              <div className="flex justify-center py-1">
                <div className="w-px h-3 bg-white/15" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Parallel processes */}
      {visibleParallel.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2 px-1 mb-1">
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
              {de ? 'Parallele Verfahren' : 'Parallel Processes'}
            </span>
            <div className="h-px flex-1 bg-white/8" />
          </div>

          {/* Group parallel flows into pairs */}
          {(() => {
            const pairs: FlowNode[][] = [];
            for (let i = 0; i < visibleParallel.length; i += 2) {
              pairs.push(visibleParallel.slice(i, i + 2));
            }
            return pairs.map((pair, pIdx) => (
              <div key={pIdx} className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/5 bg-white/1">
                {pair.map((node) => renderFlowNode(node, true))}
              </div>
            ));
          })()}
        </div>
      )}

      {/* Footer note */}
      <p className="text-[10px] text-slate-600 italic px-1">
        {de
          ? 'XBau — XML-Standard für die Baugenehmigung · Datenmodell v2.2'
          : 'XBau — XML standard for building permits · Data model v2.2'}
      </p>
    </div>
  );
}
