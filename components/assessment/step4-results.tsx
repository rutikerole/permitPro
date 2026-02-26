'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Download, RotateCcw, CheckCircle2, PartyPopper, Share2, Check, Loader2, Search, X, Mail, TableProperties, EyeOff, ChevronDown } from 'lucide-react';
import { useAssessmentStore } from '@/store/assessment-store';
import { ChecklistSection } from './results/checklist-section';
import { ChecklistOverview } from './results/checklist-overview';
import { PrintHeader } from './results/print-header';
import { Button } from '@/components/ui/button';
import { BuildingPreview } from './building-preview';
// ── Lazy-load the PDF renderer (~500 KB) only when the user clicks Download ──
import { getVisibleQuestions } from '@/lib/data/question-trees';
import { getInclusionReason } from '@/lib/assessment/checklist-gen';
import type { ProjectTypeId, RelevanceReason } from '@/lib/assessment/types';

// Section name translations (for PDF — react-pdf can't use hooks)
const SECTION_NAMES_EN: Record<string, string> = {
  A: 'Forms & Declarations',
  B: 'Site Plan & Planning Docs',
  C: 'Architectural Drawings',
  D: 'Structural Engineering',
  E: 'Energy & Sustainability',
  F: 'Fire Safety',
  G: 'Technical Services',
  H: 'Acoustics & Special Reports',
  I: 'Special Structures',
  J: 'Demolition',
};
const SECTION_NAMES_DE: Record<string, string> = {
  A: 'Antragsformulare & Erklärungen',
  B: 'Amtlicher Lageplan & Planungsunterlagen',
  C: 'Bauzeichnungen',
  D: 'Statik & Tragwerksplanung',
  E: 'Energie & Nachhaltigkeit',
  F: 'Brandschutz',
  G: 'Haustechnik & TGA',
  H: 'Akustik & Sondergutachten',
  I: 'Sonderbauten',
  J: 'Abbruch',
};

// ── Color tokens ───────────────────────────────────────────────────────────────

const GK_COLOR: Record<string, { text: string }> = {
  GK1: { text: 'text-emerald-400' },
  GK2: { text: 'text-emerald-400' },
  GK3: { text: 'text-amber-400'   },
  GK4: { text: 'text-orange-400'  },
  GK5: { text: 'text-red-400'     },
};

const PROC_COLOR: Record<string, { bg: string; text: string }> = {
  kenntnisgabe: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400' },
  vereinfacht:  { bg: 'bg-amber-500/10 border-amber-500/20',     text: 'text-amber-400'   },
  normal:       { bg: 'bg-red-500/10 border-red-500/20',         text: 'text-red-400'     },
};

// ── Excluded Items Section ───────────────────────────────────────────────────

import type { ExcludedItem } from '@/lib/assessment/types';
import { cn } from '@/lib/utils';

function ExcludedItemsSection({ excludedItems, locale }: {
  excludedItems: ExcludedItem[];
  locale: string;
}) {
  const t  = useTranslations('assessment.step4');
  const tRoot = useTranslations();
  const de = locale === 'de';
  const [open, setOpen] = useState(false);

  // Group by section
  const grouped = excludedItems.reduce<Record<string, ExcludedItem[]>>((acc, ei) => {
    const sec = ei.item.sectionId;
    (acc[sec] ??= []).push(ei);
    return acc;
  }, {});

  return (
    <div className="print:hidden">
      {/* Header — clickable toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-white/6 bg-white/2 hover:bg-white/4 transition-all duration-150 group"
      >
        <EyeOff size={14} className="text-slate-600 shrink-0" />
        <div className="flex flex-col items-start min-w-0">
          <span className="text-[12px] font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
            {t('excludedTitle')}
          </span>
          <span className="text-[10px] text-slate-600">
            {excludedItems.length} {t('excludedCount')} — {t('excludedSubtitle')}
          </span>
        </div>
        <div className="ml-auto shrink-0">
          <ChevronDown
            size={14}
            className={cn(
              'text-slate-600 transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </div>
      </button>

      {/* Expandable content */}
      <div
        style={{
          maxHeight: open ? `${excludedItems.length * 60 + 200}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
        }}
      >
        <div className="mt-2 flex flex-col gap-2">
          {Object.entries(grouped).map(([sectionId, items]) => (
            <div key={sectionId} className="rounded-lg border border-white/5 overflow-hidden">
              {/* Section header */}
              <div className="px-3 py-1.5 bg-white/2 border-b border-white/5">
                <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                  {de ? (SECTION_NAMES_DE[sectionId] ?? sectionId) : (SECTION_NAMES_EN[sectionId] ?? sectionId)}
                </span>
              </div>
              {/* Items */}
              {items.map((ei) => (
                <div
                  key={ei.item.id}
                  className="flex items-start gap-3 px-3 py-2.5 border-b border-white/3 last:border-b-0"
                >
                  {/* Strikethrough indicator */}
                  <span className="shrink-0 w-5 h-5 mt-0.5 rounded border-2 border-slate-700/50 flex items-center justify-center">
                    <X size={9} className="text-slate-700" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-slate-700 shrink-0">
                        {ei.item.id}
                      </span>
                      <span className="text-[12px] text-slate-600 line-through">
                        {tRoot(ei.item.titleKey as Parameters<typeof tRoot>[0])}
                      </span>
                    </div>
                    {/* Reason */}
                    <p className="text-[10px] text-amber-500/70 mt-0.5 leading-relaxed">
                      {de ? ei.reason.de : ei.reason.en}
                    </p>
                    {/* Legal ref */}
                    <span className="text-[9px] font-mono text-slate-700 mt-0.5 inline-block">
                      {ei.item.legalRef}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export function Step4Results() {
  const t      = useTranslations('assessment.step4');
  const tA     = useTranslations('assessment');
  const tRoot  = useTranslations();          // root namespace — for item titles in PDF
  const locale = useLocale();

  const { result, answers, projectType, itemStatuses, cycleItemStatus, reset } =
    useAssessmentStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [xlsxLoading, setXlsxLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sent' | 'error'>('idle');
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'required' | 'conditional' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleDownloadPDF = async () => {
    if (!result || pdfLoading) return;
    setPdfLoading(true);
    try {
      const de      = locale === 'de';
      const nameMap = de ? SECTION_NAMES_DE : SECTION_NAMES_EN;

      // Pre-translate checklist sections
      const sections = result.sections.map((section) => ({
        id:    section.id,
        name:  nameMap[section.id] ?? `Section ${section.id}`,
        items: section.items.map((item) => ({
          id:                 item.id,
          title:              tRoot(item.titleKey as Parameters<typeof tRoot>[0]),
          legalRef:           item.legalRef,
          xbauTag:            item.xbauTag,
          priority:           item.priority,
          costRange:          item.costRange,
          timeWeeks:          item.timeWeeks,
          copies:             item.copies,
          formatRequirements: item.formatRequirements,
        })),
      }));

      // Project type label
      const PROJECT_TYPE_LABELS: Record<string, { en: string; de: string }> = {
        neubau:            { en: 'New Build',               de: 'Neubau'            },
        anbau:             { en: 'Extension',               de: 'Anbau'             },
        aufstockung:       { en: 'Additional Storey',       de: 'Aufstockung'       },
        umbau:             { en: 'Conversion',              de: 'Umbau / Sanierung' },
        nutzungsaenderung: { en: 'Change of Use',           de: 'Nutzungsänderung'  },
        abbruch:           { en: 'Demolition',              de: 'Abbruch'           },
      };
      const projectTypeLabel =
        PROJECT_TYPE_LABELS[projectType ?? '']?.[de ? 'de' : 'en'] ?? (projectType ?? '');

      // Pre-translate Q&A answers for the Project Summary page
      const visibleQs = getVisibleQuestions(projectType ?? 'neubau', answers);
      const translatedAnswers = visibleQs
        .map((q) => {
          const raw = answers[q.id];
          if (raw === undefined || raw === null || raw === '') return null;
          const label = tRoot(q.labelKey as Parameters<typeof tRoot>[0]);
          let answer = '';
          if (q.inputType === 'boolean') {
            answer = raw === true ? (de ? 'Ja' : 'Yes') : (de ? 'Nein' : 'No');
          } else if (q.inputType === 'select' && q.options) {
            const opt = q.options.find((o) => o.value === raw);
            answer = opt ? tRoot(opt.labelKey as Parameters<typeof tRoot>[0]) : String(raw);
          } else {
            const num = Number(raw);
            answer = isNaN(num) ? String(raw) : `${num}${q.unit ? ` ${q.unit}` : ''}`;
          }
          return { questionLabel: label, answer };
        })
        .filter((a): a is { questionLabel: string; answer: string } => a !== null);

      // Detect special conditions flagged in answers
      const specialConditions: string[] = [];
      if (result.classification.isSonderbau)
        specialConditions.push(de ? 'Sonderbau' : 'Special Building');
      if (answers.denkmalschutz === true)
        specialConditions.push(de ? 'Denkmalschutz' : 'Monument Protection');
      if (answers.ueberschwemmungsgebiet === true)
        specialConditions.push(de ? 'Überschwemmungsgebiet' : 'Flood Zone');
      if (answers.holzbauweise === true)
        specialConditions.push(de ? 'Holzbauweise' : 'Timber Construction');
      if (answers.schadstoffe === true)
        specialConditions.push(de ? 'Schadstoffbelastung' : 'Hazardous Materials');
      if (answers.kellerGeplant === true)
        specialConditions.push(de ? 'Keller geplant' : 'Basement Planned');
      if (answers.aufzugGeplant === true)
        specialConditions.push(de ? 'Aufzug geplant' : 'Elevator Planned');

      // Translate excluded items for PDF
      const translatedExcluded = (result.excludedItems ?? []).map((ei) => ({
        id:        ei.item.id,
        title:     tRoot(ei.item.titleKey as Parameters<typeof tRoot>[0]),
        legalRef:  ei.item.legalRef,
        sectionId: ei.item.sectionId,
        reason:    de ? ei.reason.de : ei.reason.en,
      }));

      const { downloadChecklistPDF } = await import('./results/checklist-pdf');
      await downloadChecklistPDF({
        checklist: result,
        sections,
        locale,
        translatedAnswers,
        projectTypeLabel,
        specialConditions,
        excludedItems: translatedExcluded,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!result || xlsxLoading) return;
    setXlsxLoading(true);
    try {
      const de      = locale === 'de';
      const nameMap = de ? SECTION_NAMES_DE : SECTION_NAMES_EN;
      void nameMap; // used above for PDF; Excel uses itemTitles
      const itemTitles: Record<string, string> = {};
      result.sections.flatMap((s) => s.items).forEach((item) => {
        itemTitles[item.id] = tRoot(item.titleKey as Parameters<typeof tRoot>[0]);
      });

      const PROJECT_TYPE_LABELS: Record<string, { en: string; de: string }> = {
        neubau:            { en: 'New Build',               de: 'Neubau'            },
        anbau:             { en: 'Extension',               de: 'Anbau'             },
        aufstockung:       { en: 'Additional Storey',       de: 'Aufstockung'       },
        umbau:             { en: 'Conversion',              de: 'Umbau / Sanierung' },
        nutzungsaenderung: { en: 'Change of Use',           de: 'Nutzungsänderung'  },
        abbruch:           { en: 'Demolition',              de: 'Abbruch'           },
      };
      const projectTypeLabel =
        PROJECT_TYPE_LABELS[projectType ?? '']?.[de ? 'de' : 'en'] ?? (projectType ?? '');

      const visibleQs = getVisibleQuestions(projectType ?? 'neubau', answers);
      const translatedAnswers = visibleQs
        .map((q) => {
          const raw = answers[q.id];
          if (raw === undefined || raw === null || raw === '') return null;
          const label = tRoot(q.labelKey as Parameters<typeof tRoot>[0]);
          let answer = '';
          if (q.inputType === 'boolean') {
            answer = raw === true ? (de ? 'Ja' : 'Yes') : (de ? 'Nein' : 'No');
          } else if (q.inputType === 'select' && q.options) {
            const opt = q.options.find((o) => o.value === raw);
            answer = opt ? tRoot(opt.labelKey as Parameters<typeof tRoot>[0]) : String(raw);
          } else {
            const num = Number(raw);
            answer = isNaN(num) ? String(raw) : `${num}${q.unit ? ` ${q.unit}` : ''}`;
          }
          return { questionLabel: label, answer };
        })
        .filter((a): a is { questionLabel: string; answer: string } => a !== null);

      // Build locale-specific relevance reasons for Excel
      const excelReasons: Record<string, string> = {};
      for (const [id, reason] of Object.entries(inclusionReasons)) {
        excelReasons[id] = de ? reason.de : reason.en;
      }

      const { downloadChecklistExcel } = await import('@/lib/assessment/excel-export');
      await downloadChecklistExcel({
        checklist: result,
        itemTitles,
        translatedAnswers,
        projectTypeLabel,
        itemStatuses,
        relevanceReasons: excelReasons,
        locale,
      });
    } catch (err) {
      console.error('Excel generation failed:', err);
    } finally {
      setXlsxLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!result || emailSending || !emailAddress) return;
    setEmailSending(true);
    setEmailStatus('idle');
    try {
      const de      = locale === 'de';
      const nameMap = de ? SECTION_NAMES_DE : SECTION_NAMES_EN;
      const sections = result.sections.map((section) => ({
        id:    section.id,
        name:  nameMap[section.id] ?? `Section ${section.id}`,
        items: section.items.map((item) => ({
          id:                 item.id,
          title:              tRoot(item.titleKey as Parameters<typeof tRoot>[0]),
          legalRef:           item.legalRef,
          xbauTag:            item.xbauTag,
          priority:           item.priority,
          costRange:          item.costRange,
          timeWeeks:          item.timeWeeks,
          copies:             item.copies,
          formatRequirements: item.formatRequirements,
        })),
      }));
      const PROJECT_TYPE_LABELS: Record<string, { en: string; de: string }> = {
        neubau:            { en: 'New Build',         de: 'Neubau'            },
        anbau:             { en: 'Extension',         de: 'Anbau'             },
        aufstockung:       { en: 'Additional Storey', de: 'Aufstockung'       },
        umbau:             { en: 'Conversion',        de: 'Umbau / Sanierung' },
        nutzungsaenderung: { en: 'Change of Use',     de: 'Nutzungsänderung'  },
        abbruch:           { en: 'Demolition',        de: 'Abbruch'           },
      };
      const projectTypeLabel =
        PROJECT_TYPE_LABELS[projectType ?? '']?.[de ? 'de' : 'en'] ?? (projectType ?? '');

      const visibleQs = getVisibleQuestions(projectType ?? 'neubau', answers);
      const translatedAnswers = visibleQs
        .map((q) => {
          const raw = answers[q.id];
          if (raw === undefined || raw === null || raw === '') return null;
          const label = tRoot(q.labelKey as Parameters<typeof tRoot>[0]);
          let answer = '';
          if (q.inputType === 'boolean') {
            answer = raw === true ? (de ? 'Ja' : 'Yes') : (de ? 'Nein' : 'No');
          } else if (q.inputType === 'select' && q.options) {
            const opt = q.options.find((o) => o.value === raw);
            answer = opt ? tRoot(opt.labelKey as Parameters<typeof tRoot>[0]) : String(raw);
          } else {
            const num = Number(raw);
            answer = isNaN(num) ? String(raw) : `${num}${q.unit ? ` ${q.unit}` : ''}`;
          }
          return { questionLabel: label, answer };
        })
        .filter((a): a is { questionLabel: string; answer: string } => a !== null);

      const specialConditions: string[] = [];
      if (result.classification.isSonderbau)
        specialConditions.push(de ? 'Sonderbau' : 'Special Building');

      // Translate excluded items for email PDF
      const emailExcluded = (result.excludedItems ?? []).map((ei) => ({
        id:        ei.item.id,
        title:     tRoot(ei.item.titleKey as Parameters<typeof tRoot>[0]),
        legalRef:  ei.item.legalRef,
        sectionId: ei.item.sectionId,
        reason:    de ? ei.reason.de : ei.reason.en,
      }));

      const { getChecklistPDFBase64 } = await import('./results/checklist-pdf');
      const { base64, filename } = await getChecklistPDFBase64({
        checklist: result, sections, locale, translatedAnswers, projectTypeLabel, specialConditions,
        excludedItems: emailExcluded,
      });

      const res = await fetch('/api/send-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailAddress,
          pdfBase64: base64,
          filename,
          locale,
          municipalityName: result.municipality.name,
          projectType: projectTypeLabel,
        }),
      });

      if (res.ok) {
        setEmailStatus('sent');
        setTimeout(() => { setShowEmailModal(false); setEmailStatus('idle'); setEmailAddress(''); }, 2500);
      } else {
        setEmailStatus('error');
      }
    } catch {
      setEmailStatus('error');
    } finally {
      setEmailSending(false);
    }
  };

  const handleShare = () => {
    if (!result) return;
    const payload = { m: result.municipality.id, p: result.projectType, a: answers };
    const encoded = btoa(JSON.stringify(payload));
    const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;

    const writeToClipboard = (text: string): Promise<void> => {
      if (navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      // Fallback for HTTP contexts
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(textarea);
      return Promise.resolve();
    };

    writeToClipboard(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!result) return null;

  const totalChecked = Object.values(itemStatuses).filter((s) => s === 'available').length;
  const totalItems   = result.totalItems;
  const allDone      = totalChecked === totalItems;

  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB';
  const date       = new Date(result.generatedAt).toLocaleDateString(dateLocale, {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const projectTypeTitle = tA(
    `projectTypes.${result.projectType}.title` as Parameters<typeof tA>[0],
  );

  const gk   = GK_COLOR[result.classification.buildingClass]  ?? GK_COLOR.GK3;
  const proc = PROC_COLOR[result.classification.procedure]    ?? PROC_COLOR.vereinfacht;

  // ── Filter + search ──────────────────────────────────────────────────────────
  const qLower = searchQuery.toLowerCase().trim();

  const filteredSections = result.sections
    .map((section) => {
      const filteredItems = section.items.filter((item) => {
        // Priority/completion filter
        if (filterMode === 'completed' && itemStatuses[item.id] !== 'available') return false;
        if (filterMode === 'critical'  && item.priority !== 'critical') return false;
        if (filterMode === 'required'  && item.priority !== 'required') return false;
        if (filterMode === 'conditional' && item.priority !== 'conditional') return false;
        // Search filter — searches ID, legal ref, and translated title
        if (qLower) {
          const title    = tRoot(item.titleKey as Parameters<typeof tRoot>[0]);
          const haystack = [item.id, item.legalRef, title].join(' ').toLowerCase();
          if (!haystack.includes(qLower)) return false;
        }
        return true;
      });
      return { ...section, items: filteredItems };
    })
    .filter((s) => s.items.length > 0);

  const isFiltered = filterMode !== 'all' || qLower.length > 0;

  // ── Inclusion reasons map — WHY each item is relevant ──────────────────────
  const inclusionReasons = useMemo<Record<string, RelevanceReason>>(() => {
    if (!result) return {};
    const state = result.municipality.state ?? 'BW';
    const map: Record<string, RelevanceReason> = {};
    for (const section of result.sections) {
      for (const item of section.items) {
        map[item.id] = getInclusionReason(item, result.classification, result.projectType as ProjectTypeId, state);
      }
    }
    return map;
  }, [result]);

  // ── Stats for classification bar ─────────────────────────────────────────────
  const allResultItems = result.sections.flatMap((s) => s.items);
  const barCostMin  = allResultItems.reduce((acc, i) => acc + (i.costRange?.min ?? 0), 0);
  const barCostMax  = allResultItems.reduce((acc, i) => acc + (i.costRange?.max ?? 0), 0);
  const barMaxWeeks = Math.max(0, ...allResultItems.map((i) => i.timeWeeks?.max ?? 0));
  const fmtBarCost  = (n: number) =>
    n >= 1_000_000 ? `€${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `€${Math.round(n / 1_000)}K`
    : `€${n}`;
  const progressPct = totalItems > 0 ? (totalChecked / totalItems) * 100 : 0;
  const procName = result.classification.procedure === 'kenntnisgabe'
    ? tA('classification.kenntnisgabeFull')
    : result.classification.procedure === 'vereinfacht'
    ? tA('classification.vereinfachtFull')
    : tA('classification.normalFull');

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#080d1a]">

      <motion.div
        className="flex flex-col w-3/5 overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {/* Top accent line */}
        <div className="shrink-0 h-px bg-linear-to-r from-transparent via-amber-500/30 to-transparent" />

        {/* ── Classification summary bar ── */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-b border-white/5 print:hidden flex items-center gap-3 sm:gap-5 flex-wrap">
          {/* GK class */}
          <span className={`font-black text-[28px] sm:text-[34px] leading-none tracking-tight shrink-0 ${gk.text}`}>
            {result.classification.buildingClass.replace('GK', 'GK\u202F')}
          </span>

          {/* Procedure + Sonderbau badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold ${proc.bg} ${proc.text}`}>
              {procName}
            </span>
            {result.classification.isSonderbau && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-red-500/25 bg-red-500/10 text-[11px] font-mono font-bold text-red-400">
                {tA('classification.sonderbauLabel')}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-white/8 shrink-0" />

          {/* Municipality + project + law */}
          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-semibold text-white leading-tight truncate">
              {result.municipality.name} · {projectTypeTitle}
            </span>
            <span className="text-[10px] font-mono text-slate-500 mt-0.5">
              {result.municipality.state === 'BY' ? 'BayBO 2025' : 'LBO BW 2026'} · {date}
            </span>
          </div>

          {/* Spacer */}
          <div className="flex-1 hidden md:block" />

          {/* Stats */}
          <div className="hidden sm:flex items-center gap-4 shrink-0">
            <span className="flex flex-col items-end">
              <span className="text-[11px] font-mono text-slate-300">{totalItems}</span>
              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">{locale === 'de' ? 'Dok.' : 'docs'}</span>
            </span>
            {barCostMax > 0 && (
              <span className="flex flex-col items-end">
                <span className="text-[11px] font-mono text-emerald-400/80">{fmtBarCost(barCostMin)}–{fmtBarCost(barCostMax)}</span>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">{locale === 'de' ? 'Kosten' : 'cost'}</span>
              </span>
            )}
            {barMaxWeeks > 0 && (
              <span className="flex flex-col items-end">
                <span className="text-[11px] font-mono text-amber-400/80">{barMaxWeeks}</span>
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wide">{locale === 'de' ? 'Wo. max' : 'wks max'}</span>
              </span>
            )}
          </div>

          {/* Progress pill */}
          <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
            <div
              className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(progressPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${totalChecked} of ${totalItems} items available`}
            >
              <motion.div
                className={`h-full rounded-full transition-colors duration-500 ${allDone ? 'bg-emerald-500' : 'bg-linear-to-r from-amber-500 to-amber-400'}`}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              {totalChecked}/{totalItems}
              <AnimatePresence>
                {allDone && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
        </div>

        {/* Print header (screen-hidden) */}
        <PrintHeader checklist={result} />

        {/* ── Filter + Search bar ── */}
        <div className="shrink-0 px-4 py-2.5 sm:px-6 border-b border-white/5 print:hidden flex flex-col gap-2">
          {/* Search input */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-8 pr-8 py-1.5 rounded-lg bg-white/4 border border-white/8 text-[12px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/40 focus:bg-white/6 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={11} />
              </button>
            )}
          </div>
          {/* Filter chips */}
          <div className="flex gap-1.5 flex-wrap">
            {(
              [
                { id: 'all',         label: t('filterAll'),         color: 'text-slate-300 border-white/12 bg-white/4' },
                { id: 'critical',    label: t('filterCritical'),    color: 'text-red-300   border-red-500/30 bg-red-500/10' },
                { id: 'required',    label: t('filterRequired'),    color: 'text-amber-300 border-amber-500/30 bg-amber-500/10' },
                { id: 'conditional', label: t('filterConditional'), color: 'text-blue-300  border-blue-500/30 bg-blue-500/10' },
                { id: 'completed',   label: t('filterCompleted'),   color: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' },
              ] as const
            ).map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => setFilterMode(id)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all duration-150 ${
                  filterMode === id
                    ? color + ' opacity-100 ring-1 ring-white/20'
                    : 'text-slate-500 border-white/8 bg-transparent hover:border-white/15 hover:text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable sections ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5 flex flex-col gap-3 scrollbar-thin">

          {/* Overview stats dashboard — only when not filtered */}
          {!isFiltered && <ChecklistOverview checklist={result} itemStatuses={itemStatuses} />}

          {/* All-done celebration banner */}
          <AnimatePresence>
            {allDone && !isFiltered && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.94, y: -12 }}
                animate={{ opacity: 1, scale: 1,    y: 0   }}
                exit={{ opacity: 0, scale: 0.94, y: -6 }}
                transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                className="relative flex items-center gap-3 px-5 py-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 ring-1 ring-emerald-500/20 overflow-hidden print:hidden"
              >
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-400/6 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1.6, delay: 0.3, ease: 'easeInOut' }}
                />
                <motion.div
                  initial={{ rotate: -15, scale: 0.6 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.15 }}
                >
                  <PartyPopper size={20} className="text-emerald-400 shrink-0" />
                </motion.div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-bold text-emerald-300 leading-tight">{t('allDoneTitle')}</span>
                  <span className="text-[11px] text-emerald-400/60 truncate mt-0.5">{t('allDoneSubtitle')}</span>
                </div>
                <motion.div
                  className="ml-auto shrink-0"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: 0.25 }}
                >
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BY state disclaimer */}
          {result.municipality.state === 'BY' && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl border border-orange-500/30 bg-orange-500/8 print:hidden">
              <span className="text-orange-400 shrink-0 text-[14px] mt-0.5">⚠</span>
              <p className="text-[11px] text-orange-200/70 leading-relaxed">
                {locale === 'de'
                  ? 'Bayern (BayBO 2025): Die Klassifizierung und das Verfahren basieren auf BayBO-Vorschriften. Die Unterlagenliste enthält aktuell noch LBO BW-Referenzen – BY-spezifische Inhalte folgen in Kürze.'
                  : 'Bavaria (BayBO 2025): Classification and procedure are based on BayBO rules. Checklist content currently references LBO BW — BY-specific items are coming soon.'}
              </p>
            </div>
          )}

          {/* Filtered sections — aria-live announces count changes to screen readers */}
          <div aria-live="polite" aria-atomic="false" className="contents">
            {filteredSections.length > 0 ? (
              filteredSections.map((section) => (
                <ChecklistSection
                  key={section.id}
                  section={section}
                  itemStatuses={itemStatuses}
                  onCycle={cycleItemStatus}
                  delay={0}
                  inclusionReasons={inclusionReasons}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search size={28} className="text-slate-700 mb-3" />
                <p className="text-[13px] font-semibold text-slate-500">{t('noItemsFound')}</p>
                <p className="text-[11px] text-slate-600 mt-1">{t('noItemsHint')}</p>
              </div>
            )}
          </div>

          {/* ── Excluded Items Section ── */}
          {!isFiltered && result.excludedItems.length > 0 && (
            <ExcludedItemsSection
              excludedItems={result.excludedItems}
              locale={locale}
            />
          )}
        </div>

        {/* ── Disclaimer ── */}
        <p className="shrink-0 px-5 sm:px-7 pt-2.5 pb-0 text-[11px] text-amber-400/40 italic leading-relaxed print:hidden">
          {t('disclaimer')}
        </p>

        {/* ══ BOTTOM ACTION BAR ══ */}
        <div className="shrink-0 border-t border-white/8 bg-[#060c18]/95 backdrop-blur-sm print:hidden">

          {/* ── Desktop layout (sm+) ── */}
          <div className="hidden sm:flex items-center gap-2.5 px-5 sm:px-7 py-3.5">

            {/* PRIMARY — Download PDF */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="gap-2 px-5 font-semibold"
            >
              {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {pdfLoading ? t('generatingPdf') : t('printButton')}
            </Button>

            {/* SECONDARY — Export Excel */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadExcel}
              disabled={xlsxLoading}
              className="gap-2 border border-white/12 hover:border-white/25"
              title={locale === 'de' ? 'Als Excel exportieren' : 'Export as Excel'}
            >
              {xlsxLoading ? <Loader2 size={13} className="animate-spin" /> : <TableProperties size={13} />}
              <span className="text-[12px]">{locale === 'de' ? 'Excel' : 'Excel'}</span>
            </Button>

            {/* Push icon-only buttons right */}
            <div className="flex-1" />

            {/* ICON — Share (with "Copied!" feedback) */}
            <button
              onClick={handleShare}
              title={locale === 'de' ? 'Link kopieren' : 'Copy link'}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-150 text-[12px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span key="c" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.12 }} className="flex items-center gap-1.5 text-emerald-400">
                    <Check size={13} />{t('copied')}
                  </motion.span>
                ) : (
                  <motion.span key="s" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={{ duration: 0.12 }} className="flex items-center gap-1.5">
                    <Share2 size={13} />{t('share')}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* ICON — Email */}
            <button
              onClick={() => { setShowEmailModal(true); setEmailStatus('idle'); }}
              title={locale === 'de' ? 'Per E-Mail senden' : 'Send by email'}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
            >
              <Mail size={14} />
            </button>

            {/* Separator */}
            <div className="w-px h-5 bg-white/10 mx-1" />

            {/* New assessment */}
            <AnimatePresence mode="wait">
              {showResetConfirm ? (
                <motion.div key="confirm" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">{t('resetConfirm')}</span>
                  <Button variant="ghost" size="sm" onClick={() => { setShowResetConfirm(false); reset(); }} className="text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-400/50">
                    {t('resetYes')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
                    {t('resetNo')}
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all duration-150 text-[12px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/30"
                  >
                    <RotateCcw size={12} />
                    {t('resetButton')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Mobile layout (< sm) ── */}
          <div className="sm:hidden px-4 pt-3 pb-safe-or-4 pb-4 flex flex-col gap-2.5">
            {/* PDF — full width primary */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="w-full gap-2 font-semibold justify-center"
            >
              {pdfLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {pdfLoading ? t('generatingPdf') : t('printButton')}
            </Button>
            {/* Row: Excel · Share · Email · New assessment */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadExcel}
                disabled={xlsxLoading}
                className="gap-1.5 flex-1 border border-white/10 justify-center"
              >
                {xlsxLoading ? <Loader2 size={12} className="animate-spin" /> : <TableProperties size={12} />}
                <span className="text-[11px]">Excel</span>
              </Button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              </button>
              <button
                onClick={() => { setShowEmailModal(true); setEmailStatus('idle'); }}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                <Mail size={14} />
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors ml-auto"
                title={t('resetButton')}
              >
                <RotateCcw size={13} />
              </button>
            </div>
            {/* Reset confirm (mobile) */}
            <AnimatePresence>
              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 flex-1">{t('resetConfirm')}</span>
                    <Button variant="ghost" size="sm" onClick={() => { setShowResetConfirm(false); reset(); }} className="text-red-400 hover:text-red-300 border-red-500/30">
                      {t('resetYes')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(false)}>
                      {t('resetNo')}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ══════════════ RIGHT PANEL — 3D preview ══════════════ */}
      <motion.div
        className="hidden lg:flex w-2/5 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        {projectType && (
          <div className="absolute inset-0">
            <BuildingPreview
              projectType={projectType as ProjectTypeId}
              answers={answers}
            />
          </div>
        )}

        {/* Classification overlay — bottom gradient panel */}
        <div
          className="absolute bottom-0 inset-x-0 z-10 p-8"
          style={{
            background:
              'linear-gradient(to top, rgba(6,12,24,0.98) 0%, rgba(6,12,24,0.82) 55%, transparent 100%)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <p className="text-[10px] font-mono tracking-[0.3em] text-[#3A5070] uppercase mb-3">
              {t('classificationLabel')}
            </p>

            {/* Giant GK + procedure */}
            <div className="flex items-end gap-6 mb-4">
              <span
                className={`font-black leading-none tracking-tight ${gk.text}`}
                style={{ fontSize: 'clamp(56px, 7vw, 88px)' }}
              >
                {result.classification.buildingClass.replace('GK', 'GK ')}
              </span>

              <div className="flex flex-col gap-1.5 pb-2">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-lg border text-[12px] font-mono font-bold ${proc.bg} ${proc.text}`}
                >
                  {result.classification.procedure === 'kenntnisgabe' && tA('classification.kenntnisgabeFull')}
                  {result.classification.procedure === 'vereinfacht'  && tA('classification.vereinfachtFull')}
                  {result.classification.procedure === 'normal'       && tA('classification.normalFull')}
                </div>

                {result.classification.isSonderbau && (
                  <div className="inline-flex items-center px-3 py-1 rounded-lg border border-red-500/25 bg-red-500/10 text-[12px] font-mono font-bold text-red-400">
                    {tA('classification.sonderbauLabel')}
                  </div>
                )}
              </div>
            </div>

            {/* Legal refs */}
            <div className="flex flex-wrap gap-2.5 mb-3">
              {result.classification.legalRefs.map((ref) => (
                <span key={ref} className="text-[11px] font-mono text-[#3A5070] tracking-wide">
                  {ref}
                </span>
              ))}
            </div>

            {/* Municipality / project meta */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-[#4A5A70]">
                {result.municipality.name} · {result.municipality.zip}
              </span>
              <span className="text-[#2A3A50]">·</span>
              <span className="text-[11px] font-mono text-[#4A5A70]">
                {projectTypeTitle}
              </span>
              <span className="text-[#2A3A50]">·</span>
              <span className="text-[11px] font-mono text-[#3A4A60]">
                {date}
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ══════════════ EMAIL MODAL ══════════════ */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            key="email-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowEmailModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 6 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className="w-full max-w-sm bg-[#0d1526] border border-white/10 rounded-2xl shadow-2xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold text-white">
                  {locale === 'de' ? 'Checkliste per E-Mail' : 'Send checklist by email'}
                </h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-[12px] text-slate-400 mb-4 leading-relaxed">
                {locale === 'de'
                  ? 'Die Checkliste wird als PDF an Ihre E-Mail-Adresse gesendet.'
                  : 'The checklist will be sent as a PDF to your email address.'}
              </p>

              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendEmail(); }}
                placeholder={locale === 'de' ? 'ihre@email.de' : 'your@email.com'}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors mb-3"
                disabled={emailSending || emailStatus === 'sent'}
              />

              {emailStatus === 'error' && (
                <p className="text-[11px] text-red-400 mb-3">
                  {locale === 'de'
                    ? 'E-Mail konnte nicht gesendet werden. Bitte versuchen Sie es erneut.'
                    : 'Failed to send email. Please try again.'}
                </p>
              )}

              {emailStatus === 'sent' && (
                <p className="text-[11px] text-emerald-400 mb-3 flex items-center gap-1.5">
                  <Check size={12} />
                  {locale === 'de' ? 'E-Mail gesendet!' : 'Email sent!'}
                </p>
              )}

              <Button
                variant="primary"
                size="sm"
                onClick={handleSendEmail}
                disabled={emailSending || !emailAddress || emailStatus === 'sent'}
                className="w-full gap-2"
              >
                {emailSending
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Mail size={13} />}
                {emailSending
                  ? (locale === 'de' ? 'Sende…' : 'Sending…')
                  : (locale === 'de' ? 'Senden' : 'Send')}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}
