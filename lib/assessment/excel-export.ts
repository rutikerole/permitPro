/**
 * Excel export — 5 sheets:
 *   1. Projektübersicht  — project summary (municipality, type, classification, Q&A)
 *   2. XBau Tag-Matrix   — ALL items with Philipp's column layout (PD-ID, status workflow)
 *   3. Checkliste        — only relevant (filtered) items with full metadata
 *   4. Planungsfahrplan  — HOAI phases with linked items and progress
 *   5. ProjektDaten      — Item ID → ProjektDaten ID mapping
 */
import ExcelJS from 'exceljs';
import type { GeneratedChecklist, ItemStatus } from './types';
import { ALL_CHECKLIST_ITEMS } from '@/lib/data/checklist-items';

// ── Palette ──────────────────────────────────────────────────────────────────

const C = {
  headerBg:    '0F1623',   // dark navy
  headerFg:    'F59E0B',   // amber
  subHeaderBg: '1A2332',
  subHeaderFg: 'CBD5E1',
  amber:       'F59E0B',
  green:       '10B981',
  blue:        '60A5FA',
  red:         'F87171',
  slate:       '94A3B8',
  white:       'FFFFFF',
  bodyBg:      '0D1526',
  altRowBg:    '111827',
  borderColor: '1E2D42',
};

function hex(color: string): ExcelJS.Color {
  return { argb: 'FF' + color } as ExcelJS.Color;
}

function headerFill(color: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: hex(color) };
}

function applyHeaderStyle(
  row: ExcelJS.Row,
  bg: string = C.headerBg,
  fg: string = C.headerFg,
) {
  row.eachCell((cell) => {
    cell.fill  = headerFill(bg);
    cell.font  = { bold: true, color: hex(fg), name: 'Calibri', size: 10 };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      bottom: { style: 'thin', color: hex(C.borderColor) },
    };
  });
  row.height = 28;
}

function statusColor(status: ItemStatus | undefined): string {
  if (status === 'available')   return C.green;
  if (status === 'in_progress') return C.amber;
  return C.red;
}

function statusLabel(status: ItemStatus | undefined, de: boolean): string {
  if (status === 'available')   return de ? 'Vorhanden'     : 'Available';
  if (status === 'in_progress') return de ? 'In Bearbeitung': 'In Progress';
  return de ? 'Fehlt' : 'Missing';
}

function priorityLabel(p: string, de: boolean): string {
  const map: Record<string, { de: string; en: string }> = {
    critical:    { de: 'Kritisch',  en: 'Critical'    },
    required:    { de: 'Pflicht',   en: 'Required'    },
    conditional: { de: 'Bedingt',  en: 'Conditional' },
    recommended: { de: 'Empfohlen', en: 'Recommended' },
  };
  return map[p]?.[de ? 'de' : 'en'] ?? p;
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface ExcelExportOptions {
  checklist: GeneratedChecklist;
  /** Pre-translated item titles: Record<itemId, translatedTitle> */
  itemTitles: Record<string, string>;
  /** Pre-translated Q&A pairs for sheet 1 */
  translatedAnswers: { questionLabel: string; answer: string }[];
  /** Human-readable project type label */
  projectTypeLabel: string;
  /** 3-state status map from the store */
  itemStatuses: Record<string, ItemStatus>;
  /** Pre-computed relevance reasons: Record<itemId, reason string> */
  relevanceReasons?: Record<string, string>;
  locale: string;
}

export async function downloadChecklistExcel(opts: ExcelExportOptions): Promise<void> {
  const { checklist, itemTitles, translatedAnswers, projectTypeLabel, itemStatuses, relevanceReasons, locale } = opts;
  const de = locale === 'de';

  const wb = new ExcelJS.Workbook();
  wb.creator  = 'PermitPro';
  wb.created  = new Date();
  wb.modified = new Date();

  const allItems = checklist.sections.flatMap((s) => s.items);

  // ── Sheet 1: Projektübersicht ───────────────────────────────────────────────

  const s1 = wb.addWorksheet(de ? 'Projektübersicht' : 'Project Overview', {
    views: [{ showGridLines: false }],
  });
  s1.columns = [
    { key: 'label',  width: 28 },
    { key: 'value',  width: 42 },
  ];

  const addKV = (label: string, value: string | number) => {
    const row = s1.addRow([label, value]);
    row.getCell(1).font  = { bold: true,  color: hex(C.slate),  name: 'Calibri', size: 10 };
    row.getCell(2).font  = { bold: false, color: hex(C.white),  name: 'Calibri', size: 10 };
    row.getCell(1).fill  = headerFill(C.bodyBg);
    row.getCell(2).fill  = headerFill(C.bodyBg);
    row.getCell(1).alignment = { vertical: 'middle' };
    row.getCell(2).alignment = { vertical: 'middle', wrapText: true };
    row.height = 18;
  };

  // Title header
  const titleRow = s1.addRow([de ? 'PermitPro – Projektübersicht' : 'PermitPro – Project Overview', '']);
  s1.mergeCells(`A${titleRow.number}:B${titleRow.number}`);
  titleRow.getCell(1).font      = { bold: true, color: hex(C.amber), name: 'Calibri', size: 14 };
  titleRow.getCell(1).fill      = headerFill(C.headerBg);
  titleRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
  titleRow.height = 36;

  s1.addRow([]);

  addKV(de ? 'Gemeinde'          : 'Municipality',     checklist.municipality.name);
  addKV(de ? 'PLZ'               : 'Postal code',      checklist.municipality.zip);
  addKV(de ? 'Landkreis'         : 'District',         checklist.municipality.landkreis);
  addKV(de ? 'Bundesland'        : 'Federal state',    checklist.municipality.state === 'BY' ? 'Bayern' : 'Baden-Württemberg');
  addKV(de ? 'Projekttyp'        : 'Project type',     projectTypeLabel);
  addKV(de ? 'Gebäudeklasse'     : 'Building class',   checklist.classification.buildingClass);
  addKV(de ? 'Verfahren'         : 'Procedure',        checklist.classification.procedure);
  addKV(de ? 'Sonderbau'         : 'Special structure',checklist.classification.isSonderbau ? (de ? 'Ja' : 'Yes') : (de ? 'Nein' : 'No'));
  addKV(de ? 'Gesamte Dokumente' : 'Total documents',  checklist.totalItems);
  addKV(de ? 'Vorhanden'         : 'Available',        Object.values(itemStatuses).filter((v) => v === 'available').length);
  addKV(de ? 'In Bearbeitung'    : 'In Progress',      Object.values(itemStatuses).filter((v) => v === 'in_progress').length);
  addKV(de ? 'Generiert am'      : 'Generated at',     new Date(checklist.generatedAt).toLocaleDateString(de ? 'de-DE' : 'en-GB'));

  s1.addRow([]);

  if (translatedAnswers.length > 0) {
    const qaHeader = s1.addRow([de ? 'Projektfragen & Antworten' : 'Project Q&A', '']);
    s1.mergeCells(`A${qaHeader.number}:B${qaHeader.number}`);
    qaHeader.getCell(1).font  = { bold: true, color: hex(C.amber), name: 'Calibri', size: 11 };
    qaHeader.getCell(1).fill  = headerFill(C.subHeaderBg);
    qaHeader.height = 22;

    for (const { questionLabel, answer } of translatedAnswers) {
      addKV(questionLabel, answer);
    }
  }

  // ── Sheet 2: XBau Tag-Matrix (Philipp's column layout) ─────────────────

  const relevantIds = new Set(allItems.map((i) => i.id));

  const s2 = wb.addWorksheet('XBau Tag-Matrix', {
    views: [{ showGridLines: false }],
  });
  s2.columns = [
    { key: 'pdId',      width: 12 },  // A — PD-ID
    { key: 'id',        width: 10 },  // B — ID
    { key: 'section',   width: 10 },  // C — Abschnitt
    { key: 'xbauTag',   width: 28 },  // D — XBau Tag
    { key: 'title',     width: 48 },  // E — Titel
    { key: 'relevant',  width: 16 },  // F — Relevant
    { key: 'reason',    width: 44 },  // G — Begründung
    { key: 'status',    width: 16 },  // H — Vorhanden
    { key: 'checked',   width: 12 },  // I — Geprüft
    { key: 'submitted', width: 14 },  // J — Eingereicht
    { key: 'approved',  width: 14 },  // K — Genehmigt
    { key: 'legalRef',  width: 34 },  // L — Rechtsgrundlage
    { key: 'provider',  width: 22 },  // M — Verantwortlich
  ];

  const h2 = s2.addRow([
    'PD-ID',
    'ID',
    de ? 'Abschnitt' : 'Section',
    'XBau Tag',
    de ? 'Titel' : 'Title',
    de ? 'Relevant' : 'Relevant',
    de ? 'Begründung' : 'Reason',
    de ? 'Vorhanden' : 'Available',
    de ? 'Geprüft' : 'Checked',
    de ? 'Eingereicht' : 'Submitted',
    de ? 'Genehmigt' : 'Approved',
    de ? 'Rechtsgrundlage' : 'Legal ref.',
    de ? 'Verantwortlich' : 'Provider',
  ]);
  applyHeaderStyle(h2, C.headerBg, C.headerFg);

  // Build exclusion reason map from checklist.excludedItems
  const excludedReasonMap = new Map<string, string>();
  if (checklist.excludedItems) {
    for (const ei of checklist.excludedItems) {
      excludedReasonMap.set(ei.item.id, de ? ei.reason.de : ei.reason.en);
    }
  }

  ALL_CHECKLIST_ITEMS.forEach((item, idx) => {
    const isRelevant = relevantIds.has(item.id);
    const status     = isRelevant ? itemStatuses[item.id] : undefined;
    const relevantStr = isRelevant
      ? (de ? 'Ja' : 'Yes')
      : (de ? 'Nicht relevant' : 'Not relevant');
    const reasonStr = isRelevant
      ? (relevanceReasons?.[item.id] ?? '')
      : (excludedReasonMap.get(item.id) ?? '');
    const row = s2.addRow([
      item.projektDatenId ?? '',
      item.id,
      item.sectionId,
      item.xbauTag ?? '',
      itemTitles[item.id] ?? item.id,
      relevantStr,
      reasonStr,
      isRelevant ? statusLabel(status, de) : '',
      '',  // Geprüft — placeholder
      '',  // Eingereicht — placeholder
      '',  // Genehmigt — placeholder
      item.legalRef,
      item.providers.join(', '),
    ]);
    const bg = idx % 2 === 0 ? C.bodyBg : C.altRowBg;
    row.eachCell((cell) => {
      cell.fill = headerFill(bg);
      cell.font = { name: 'Calibri', size: 10, color: hex(isRelevant ? C.white : C.slate) };
      cell.alignment = { vertical: 'middle', wrapText: false };
    });
    // PD-ID bold amber
    row.getCell(1).font = { bold: true, name: 'Calibri', size: 10, color: hex(isRelevant ? C.blue : C.slate) };
    // ID bold
    row.getCell(2).font = { bold: true, name: 'Calibri', size: 10, color: hex(isRelevant ? C.amber : C.slate) };
    // Relevant column (F)
    row.getCell(6).font = {
      bold: isRelevant, name: 'Calibri', size: 10,
      color: hex(isRelevant ? C.green : C.slate),
    };
    // Reason column (G) — amber for included, slate for excluded
    row.getCell(7).font = {
      name: 'Calibri', size: 9, italic: true,
      color: hex(isRelevant ? C.amber : C.slate),
    };
    row.getCell(7).alignment = { vertical: 'middle', wrapText: true };
    // Status color (H)
    if (isRelevant) {
      row.getCell(8).font = { bold: true, name: 'Calibri', size: 10, color: hex(statusColor(status)) };
    }
    row.height = 16;
  });

  s2.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 13 } };
  s2.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, showGridLines: false }];

  // ── Sheet 3: Checkliste (nur relevante) ────────────────────────────────────

  const s3 = wb.addWorksheet(de ? 'Checkliste' : 'Checklist', {
    views: [{ showGridLines: false }],
  });
  s3.columns = [
    { key: 'id',       width: 10 },
    { key: 'section',  width: 8  },
    { key: 'priority', width: 16 },
    { key: 'status',   width: 18 },
    { key: 'title',    width: 52 },
    { key: 'legalRef', width: 36 },
    { key: 'xbauTag',  width: 28 },
    { key: 'cost',     width: 18 },
    { key: 'weeks',    width: 12 },
    { key: 'copies',   width: 10 },
    { key: 'provider', width: 22 },
  ];

  const h3 = s3.addRow([
    'ID',
    de ? 'Abschnitt' : 'Section',
    de ? 'Priorität' : 'Priority',
    de ? 'Status'    : 'Status',
    de ? 'Titel'     : 'Title',
    de ? 'Rechtsgrundlage' : 'Legal ref.',
    'XBau Tag',
    de ? 'Kosten (€)' : 'Cost (€)',
    de ? 'Wochen'     : 'Weeks',
    de ? 'Kopien'     : 'Copies',
    de ? 'Verantwortlich' : 'Provider',
  ]);
  applyHeaderStyle(h3, C.headerBg, C.headerFg);

  allItems.forEach((item, idx) => {
    const status = itemStatuses[item.id];
    const costStr = item.costRange
      ? item.costRange.min === item.costRange.max
        ? `€${item.costRange.min}`
        : `€${item.costRange.min}–€${item.costRange.max}`
      : '';
    const weeksStr = item.timeWeeks
      ? item.timeWeeks.min === item.timeWeeks.max
        ? `${item.timeWeeks.min}`
        : `${item.timeWeeks.min}–${item.timeWeeks.max}`
      : '';

    const row = s3.addRow([
      item.id,
      item.sectionId,
      priorityLabel(item.priority, de),
      statusLabel(status, de),
      itemTitles[item.id] ?? item.titleKey,
      item.legalRef,
      item.xbauTag ?? '',
      costStr,
      weeksStr,
      item.copies ?? '',
      item.providers.join(', '),
    ]);
    const bg = idx % 2 === 0 ? C.bodyBg : C.altRowBg;
    row.eachCell((cell) => {
      cell.fill = headerFill(bg);
      cell.font = { name: 'Calibri', size: 10, color: hex(C.white) };
      cell.alignment = { vertical: 'middle', wrapText: false };
    });
    // ID
    row.getCell(1).font = { bold: true, name: 'Calibri', size: 10, color: hex(C.amber) };
    // Status
    row.getCell(4).font = { bold: true, name: 'Calibri', size: 10, color: hex(statusColor(status)) };
    // XBau tag
    if (item.xbauTag) {
      row.getCell(7).font = { name: 'Calibri', size: 10, color: hex(C.blue) };
    }
    row.height = 16;
  });

  s3.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 11 } };
  s3.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, showGridLines: false }];

  // ── Sheet 4: Planungsfahrplan (HOAI phases) ────────────────────────────────

  const s4 = wb.addWorksheet(de ? 'Planungsfahrplan' : 'Planning Roadmap', {
    views: [{ showGridLines: false }],
  });
  s4.columns = [
    { key: 'phase',    width: 12 },
    { key: 'title',    width: 32 },
    { key: 'step',     width: 40 },
    { key: 'linked',   width: 28 },
    { key: 'status',   width: 16 },
  ];

  const h4 = s4.addRow([
    de ? 'Phase' : 'Phase',
    de ? 'Titel' : 'Title',
    de ? 'Arbeitsschritt' : 'Work Step',
    de ? 'Verknüpfte Dokumente' : 'Linked Documents',
    de ? 'Status' : 'Status',
  ]);
  applyHeaderStyle(h4);

  const hoaiPhases = [
    { id: 'SP 0', titleDe: 'Projektvorbereitung', titleEn: 'Project Preparation',
      steps: [
        { de: 'Bedarfsermittlung', en: 'Needs Assessment', ids: [] },
        { de: 'Planungsgrundlagen', en: 'Planning Fundamentals', ids: [] },
        { de: 'Planverträge abschließen', en: 'Planner Contracts', ids: [] },
        { de: 'Finanzierung klären', en: 'Financing', ids: [] },
      ] },
    { id: 'SP 1', titleDe: 'Grundlagenermittlung', titleEn: 'Basic Evaluation',
      steps: [
        { de: 'Aufgabe klären', en: 'Clarify Task', ids: [] },
        { de: 'Ortsbesichtigung', en: 'Site Inspection', ids: ['B1', 'D2'] },
        { de: 'Untersuchungsbedarf', en: 'Investigation Requirements', ids: ['H4', 'H5', 'G5', 'G6', 'H7'] },
        { de: 'Fachplaner auswählen', en: 'Select Specialists', ids: [] },
      ] },
    { id: 'SP 2', titleDe: 'Vorplanung', titleEn: 'Preliminary Design',
      steps: [
        { de: 'Grundlagen analysieren', en: 'Analyze Fundamentals', ids: [] },
        { de: 'Vorentwurf (GK)', en: 'Preliminary Plan (GK)', ids: [] },
        { de: 'Vorabstimmung Behörde', en: 'Pre-Negotiations', ids: [] },
        { de: 'Kostenschätzung', en: 'Cost Estimate', ids: ['C7'] },
      ] },
    { id: 'SP 3', titleDe: 'Entwurfsplanung', titleEn: 'Design Development',
      steps: [
        { de: 'Entwurf ausarbeiten', en: 'Develop Design', ids: ['C1', 'C2', 'C3', 'C4', 'C5'] },
        { de: 'Baubeschreibung', en: 'Object Description', ids: ['A2'] },
        { de: 'Kostenberechnung', en: 'Cost Calculation', ids: ['C7'] },
      ] },
    { id: 'SP 4', titleDe: 'Genehmigungsplanung', titleEn: 'Permit Application',
      steps: [
        { de: 'Unterlagen zusammenstellen', en: 'Compile Documents', ids: ['C1', 'C2', 'C3', 'D1', 'D2', 'D3'] },
        { de: 'Bauantrag einreichen', en: 'Submit Application', ids: ['A1', 'E1', 'E2', 'E3'] },
        { de: 'Behördenanfragen (0201/0202)', en: 'Authority Queries (0201/0202)', ids: [] },
        { de: 'Bescheid erhalten (0205)', en: 'Receive Decision (0205)', ids: [] },
      ] },
  ];

  for (const phase of hoaiPhases) {
    for (const step of phase.steps) {
      const linkedRelevant = step.ids.filter((id) => relevantIds.has(id));
      const linkedStr = linkedRelevant.join(', ');
      const allDone = linkedRelevant.length > 0 && linkedRelevant.every((id) => itemStatuses[id] === 'available');
      const someDone = linkedRelevant.some((id) => itemStatuses[id] === 'available');
      const statusStr = linkedRelevant.length === 0
        ? '—'
        : allDone ? (de ? 'Fertig' : 'Done') : someDone ? (de ? 'Teilweise' : 'Partial') : (de ? 'Offen' : 'Open');

      const row = s4.addRow([
        phase.id,
        de ? phase.titleDe : phase.titleEn,
        de ? step.de : step.en,
        linkedStr,
        statusStr,
      ]);
      row.eachCell((cell) => {
        cell.fill = headerFill(C.bodyBg);
        cell.font = { name: 'Calibri', size: 10, color: hex(C.white) };
        cell.alignment = { vertical: 'middle' };
      });
      row.getCell(1).font = { bold: true, name: 'Calibri', size: 10, color: hex(C.amber) };
      if (allDone) {
        row.getCell(5).font = { bold: true, name: 'Calibri', size: 10, color: hex(C.green) };
      } else if (someDone) {
        row.getCell(5).font = { bold: true, name: 'Calibri', size: 10, color: hex(C.amber) };
      }
      row.height = 16;
    }
  }

  s4.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, showGridLines: false }];

  // ── Sheet 5: ProjektDaten Mapping ─────────────────────────────────────────

  const s5 = wb.addWorksheet(de ? 'ProjektDaten' : 'ProjectData Mapping', {
    views: [{ showGridLines: false }],
  });
  s5.columns = [
    { key: 'itemId',   width: 12 },
    { key: 'pdId',     width: 14 },
    { key: 'xbauTag',  width: 28 },
    { key: 'title',    width: 48 },
  ];

  const h5 = s5.addRow([
    'Item ID',
    'ProjektDaten-ID',
    'XBau Tag',
    de ? 'Titel' : 'Title',
  ]);
  applyHeaderStyle(h5);

  ALL_CHECKLIST_ITEMS.forEach((item, idx) => {
    const row = s5.addRow([
      item.id,
      item.projektDatenId ?? '',
      item.xbauTag ?? '',
      itemTitles[item.id] ?? item.id,
    ]);
    const bg = idx % 2 === 0 ? C.bodyBg : C.altRowBg;
    row.eachCell((cell) => {
      cell.fill = headerFill(bg);
      cell.font = { name: 'Calibri', size: 10, color: hex(C.white) };
      cell.alignment = { vertical: 'middle' };
    });
    row.getCell(1).font = { bold: true, name: 'Calibri', size: 10, color: hex(C.amber) };
    row.getCell(2).font = { bold: true, name: 'Calibri', size: 10, color: hex(C.blue) };
    row.height = 16;
  });

  s5.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, showGridLines: false }];

  // ── Trigger download ───────────────────────────────────────────────────────

  const muni = checklist.municipality.name.replace(/\s+/g, '_');
  const date = new Date(checklist.generatedAt)
    .toISOString().slice(0, 10).replace(/-/g, '');
  const filename = `PermitPro_${muni}_${checklist.projectType}_${date}.xlsx`;

  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
