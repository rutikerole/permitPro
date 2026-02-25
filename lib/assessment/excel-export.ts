/**
 * Excel export — 3 sheets:
 *   1. Projektübersicht  — project summary (municipality, type, classification, Q&A)
 *   2. XBau Tag-Matrix   — ALL items with XBau tag, section, priority, status
 *   3. Checkliste        — only relevant (filtered) items with full metadata
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
  locale: string;
}

export async function downloadChecklistExcel(opts: ExcelExportOptions): Promise<void> {
  const { checklist, itemTitles, translatedAnswers, projectTypeLabel, itemStatuses, locale } = opts;
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

  // ── Sheet 2: XBau Tag-Matrix (ALL items, including NOT_RELEVANT) ──────────

  const relevantIds = new Set(allItems.map((i) => i.id));

  const s2 = wb.addWorksheet('XBau Tag-Matrix', {
    views: [{ showGridLines: false }],
  });
  s2.columns = [
    { key: 'id',       width: 10 },
    { key: 'section',  width: 8  },
    { key: 'relevant', width: 16 },
    { key: 'xbauTag',  width: 32 },
    { key: 'xbauSec',  width: 14 },
    { key: 'projDat',  width: 14 },
    { key: 'priority', width: 16 },
    { key: 'status',   width: 18 },
    { key: 'title',    width: 52 },
    { key: 'legalRef', width: 36 },
  ];

  const h2 = s2.addRow([
    'ID',
    de ? 'Abschnitt' : 'Section',
    de ? 'Relevant'  : 'Relevant',
    'XBau Tag',
    de ? 'XBau-Kap.' : 'XBau Ch.',
    'ProjektDaten',
    de ? 'Priorität' : 'Priority',
    de ? 'Status'    : 'Status',
    de ? 'Titel'     : 'Title',
    de ? 'Rechtsgrundlage' : 'Legal ref.',
  ]);
  applyHeaderStyle(h2, C.headerBg, C.headerFg);

  ALL_CHECKLIST_ITEMS.forEach((item, idx) => {
    const isRelevant = relevantIds.has(item.id);
    const status     = isRelevant ? itemStatuses[item.id] : undefined;
    const relevantStr = isRelevant
      ? (de ? 'Ja' : 'Yes')
      : (de ? 'Nicht relevant' : 'Not relevant');
    const row = s2.addRow([
      item.id,
      item.sectionId,
      relevantStr,
      item.xbauTag      ?? '',
      item.xbauSection  ?? '',
      item.projektDatenId ?? '',
      priorityLabel(item.priority, de),
      isRelevant ? statusLabel(status, de) : '',
      itemTitles[item.id] ?? item.id,
      item.legalRef,
    ]);
    const bg = idx % 2 === 0 ? C.bodyBg : C.altRowBg;
    row.eachCell((cell) => {
      cell.fill = headerFill(bg);
      cell.font = { name: 'Calibri', size: 10, color: hex(isRelevant ? C.white : C.slate) };
      cell.alignment = { vertical: 'middle', wrapText: false };
    });
    // ID bold
    row.getCell(1).font = { bold: true, name: 'Calibri', size: 10, color: hex(isRelevant ? C.amber : C.slate) };
    // Relevant column
    row.getCell(3).font = {
      bold: isRelevant, name: 'Calibri', size: 10,
      color: hex(isRelevant ? C.green : C.slate),
    };
    // XBau tag — highlight if present
    if (item.xbauTag) {
      row.getCell(4).font = { name: 'Calibri', size: 10, color: hex(isRelevant ? C.blue : C.slate) };
    }
    // Status color (col 8)
    if (isRelevant) {
      row.getCell(8).font = { bold: true, name: 'Calibri', size: 10, color: hex(statusColor(status)) };
    }
    row.height = 16;
  });

  s2.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 10 } };
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
