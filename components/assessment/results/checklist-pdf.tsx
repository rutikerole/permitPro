'use client';

import {
  Document, Page, View, Text, StyleSheet, pdf,
} from '@react-pdf/renderer';
import type { GeneratedChecklist, ItemPriority } from '@/lib/assessment/types';

// ── Translated types (pre-translated in the parent, passed to PDF) ─────────────

export interface TranslatedAnswer {
  questionLabel: string;
  answer: string;
}

export interface TranslatedItem {
  id: string;
  title: string;
  legalRef: string;
  xbauTag?: string;
  priority: ItemPriority;
  costRange?: { min: number; max: number };
  timeWeeks?: { min: number; max: number };
  copies?: number;
  formatRequirements?: string;
}

export interface TranslatedSection {
  id: string;
  name: string;
  items: TranslatedItem[];
}

export interface ChecklistPDFData {
  checklist: GeneratedChecklist;
  sections: TranslatedSection[];
  locale: string;
  translatedAnswers: TranslatedAnswer[];
  projectTypeLabel: string;
  specialConditions: string[];
}

// ── Colours ────────────────────────────────────────────────────────────────────

const C = {
  bg:        '#FFFFFF',
  surface:   '#F8F9FA',
  border:    '#E2E8F0',
  text:      '#111827',
  muted:     '#6B7280',
  subtle:    '#9CA3AF',
  amber:     '#D97706',
  amberBg:   '#FFFBEB',
  amberBrd:  '#FDE68A',
  blue:      '#1D4ED8',
  emerald:   '#065F46',
  red:       '#991B1B',
  redBg:     '#FEF2F2',
  slate:     '#374151',
  sectionBg: '#F1F5F9',
};

const PRIORITY_COLOR: Record<ItemPriority, { text: string; bg: string; brd: string }> = {
  critical:    { text: '#991B1B', bg: '#FEF2F2', brd: '#FCA5A5' },
  required:    { text: '#92400E', bg: '#FFFBEB', brd: '#FCD34D' },
  conditional: { text: '#1E40AF', bg: '#EFF6FF', brd: '#93C5FD' },
  recommended: { text: '#374151', bg: '#F9FAFB', brd: '#E5E7EB' },
};

const PRIORITY_LABEL: Record<ItemPriority, { en: string; de: string }> = {
  critical:    { en: 'Critical',    de: 'Kritisch'  },
  required:    { en: 'Required',    de: 'Pflicht'   },
  conditional: { en: 'Conditional', de: 'Bedingt'   },
  recommended: { en: 'Recommended', de: 'Empfohlen' },
};

// ── StyleSheet ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Base page
  page: {
    fontFamily:      'Helvetica',
    backgroundColor: C.bg,
    paddingTop:      32,
    paddingBottom:   48,
    paddingLeft:     40,
    paddingRight:    40,
    fontSize:        10,
    color:           C.text,
  },

  // Cover accent bar
  coverAccent: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height:          4,
    backgroundColor: C.amber,
  },

  // Cover
  coverEyebrow: {
    fontSize:      8,
    fontFamily:    'Helvetica-Bold',
    letterSpacing: 2,
    color:         C.muted,
    marginBottom:  10,
    marginTop:     52,
  },
  coverTitle: {
    fontSize:     26,
    fontFamily:   'Helvetica-Bold',
    color:        C.text,
    lineHeight:   1.2,
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize:     11,
    color:        C.muted,
    marginBottom: 32,
  },

  // Card (used on cover and summary)
  card: {
    backgroundColor: C.surface,
    borderRadius:    6,
    padding:         18,
    marginBottom:    14,
    borderWidth:     1,
    borderColor:     C.border,
    borderStyle:     'solid',
  },
  cardLabel: {
    fontSize:      8,
    fontFamily:    'Helvetica-Bold',
    letterSpacing: 1.5,
    color:         C.subtle,
    marginBottom:  4,
  },
  cardValue: {
    fontSize:   13,
    fontFamily: 'Helvetica-Bold',
    color:      C.text,
  },
  gkText: {
    fontSize:   34,
    fontFamily: 'Helvetica-Bold',
    color:      C.amber,
    lineHeight: 1,
  },
  procBadge: {
    fontSize:          9,
    fontFamily:        'Helvetica-Bold',
    color:             C.amber,
    backgroundColor:   C.amberBg,
    borderWidth:       1,
    borderColor:       C.amberBrd,
    borderStyle:       'solid',
    borderRadius:      4,
    paddingHorizontal: 8,
    paddingVertical:   3,
    alignSelf:         'flex-start',
    marginTop:         4,
  },

  // Shared page header / footer
  pageHeader: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingBottom:     10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
    marginBottom:      16,
  },
  pageHeaderTitle: {
    fontSize:      8,
    fontFamily:    'Helvetica-Bold',
    color:         C.muted,
    letterSpacing: 1,
  },
  pageFooter: {
    position:       'absolute',
    bottom:         18,
    left:           40,
    right:          40,
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  footerText: {
    fontSize: 7.5,
    color:    C.subtle,
  },

  // Summary page blocks
  summaryBlock: {
    marginBottom:  14,
    borderWidth:   1,
    borderColor:   C.border,
    borderStyle:   'solid',
    borderRadius:  5,
    overflow:      'hidden',
  },
  summaryBlockHeader: {
    backgroundColor:   C.sectionBg,
    paddingHorizontal: 10,
    paddingVertical:   7,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  summaryBlockTitle: {
    fontSize:      8,
    fontFamily:    'Helvetica-Bold',
    color:         C.slate,
    letterSpacing: 0.8,
  },
  summaryRow: {
    flexDirection:     'row',
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  summaryRowAlt: {
    flexDirection:     'row',
    paddingHorizontal: 10,
    paddingVertical:   5,
    backgroundColor:   C.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  summaryRowLast: {
    flexDirection:     'row',
    paddingHorizontal: 10,
    paddingVertical:   5,
  },
  summaryRowLastAlt: {
    flexDirection:     'row',
    paddingHorizontal: 10,
    paddingVertical:   5,
    backgroundColor:   C.surface,
  },
  summaryLabel: {
    fontSize:   8.5,
    fontFamily: 'Helvetica-Bold',
    color:      C.slate,
    flex:       1,
    lineHeight: 1.4,
  },
  summaryValue: {
    fontSize:   8.5,
    color:      C.text,
    flex:       2,
    lineHeight: 1.4,
  },
  conditionTag: {
    fontSize:          7.5,
    fontFamily:        'Helvetica-Bold',
    color:             '#92400E',
    backgroundColor:   C.amberBg,
    borderWidth:       0.5,
    borderColor:       C.amberBrd,
    borderStyle:       'solid',
    borderRadius:      3,
    paddingHorizontal: 5,
    paddingVertical:   2,
    marginRight:       5,
    marginBottom:      4,
  },

  // Checklist section cards
  sectionCard: {
    marginBottom: 12,
    borderWidth:  1,
    borderColor:  C.border,
    borderStyle:  'solid',
    borderRadius: 5,
    overflow:     'hidden',
  },
  sectionHeader: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   C.sectionBg,
    paddingHorizontal: 10,
    paddingVertical:   7,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  sectionBadge: {
    width:           20,
    height:          20,
    borderRadius:    3,
    backgroundColor: C.amber,
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     8,
  },
  sectionBadgeText: {
    fontSize:   9,
    fontFamily: 'Helvetica-Bold',
    color:      '#FFFFFF',
  },
  sectionTitle: {
    fontSize:   10,
    fontFamily: 'Helvetica-Bold',
    color:      C.text,
    flex:       1,
  },
  sectionMeta: {
    fontSize:    8,
    color:       C.muted,
    marginLeft:  6,
  },
  itemRow: {
    flexDirection:     'row',
    alignItems:        'flex-start',
    paddingHorizontal: 10,
    paddingVertical:   6,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  checkbox: {
    width:       11,
    height:      11,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderStyle: 'solid',
    borderRadius: 2,
    marginRight: 8,
    marginTop:   1,
    flexShrink:  0,
  },
  itemId: {
    fontSize:   7.5,
    fontFamily: 'Helvetica-Bold',
    color:      C.muted,
    marginRight: 5,
    marginTop:   1.5,
    flexShrink:  0,
  },
  itemContent: { flex: 1 },
  itemTitleRow: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize:   9.5,
    fontFamily: 'Helvetica-Bold',
    color:      C.text,
    flex:       1,
    lineHeight: 1.3,
  },
  priorityPill: {
    fontSize:          6.5,
    fontFamily:        'Helvetica-Bold',
    borderRadius:      3,
    paddingHorizontal: 4,
    paddingVertical:   1.5,
    borderWidth:       0.5,
    borderStyle:       'solid',
    marginLeft:        5,
    marginTop:         1,
    flexShrink:        0,
  },
  itemMeta: {
    flexDirection: 'row',
    marginTop:     2,
    gap:           10,
  },
  legalRef: {
    fontSize:   7.5,
    fontFamily: 'Helvetica-Bold',
    color:      C.blue,
  },
  metaText: {
    fontSize: 7.5,
    color:    C.muted,
  },
  metaGreen: {
    fontSize: 7.5,
    color:    C.emerald,
  },
  fmtNote: {
    fontSize:   7,
    color:      C.subtle,
    fontFamily: 'Helvetica-Oblique',
    marginTop:  1,
  },

  // Next Steps page
  nextStepRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    marginBottom:  9,
  },
  nextStepCircle: {
    width:           20,
    height:          20,
    borderRadius:    10,
    backgroundColor: C.amber,
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     10,
    flexShrink:      0,
    marginTop:       1,
  },
  nextStepNum: {
    fontSize:   8,
    fontFamily: 'Helvetica-Bold',
    color:      '#FFFFFF',
  },
  nextStepTitle: {
    fontSize:   9.5,
    fontFamily: 'Helvetica-Bold',
    color:      C.text,
    lineHeight: 1.3,
  },
  nextStepDesc: {
    fontSize:  7.5,
    color:     C.muted,
    marginTop: 2,
    lineHeight: 1.4,
  },
  costTableHeader: {
    flexDirection:     'row',
    backgroundColor:   C.sectionBg,
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  costTableRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 10,
    paddingVertical:   5,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  costTableRowAlt: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 10,
    paddingVertical:   5,
    backgroundColor:   C.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
  },
  costTableTotalRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 10,
    paddingVertical:   7,
    backgroundColor:   C.amberBg,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  6,
  },
  timelineLabel: {
    fontSize:    8,
    color:       C.slate,
    width:       110,
    flexShrink:  0,
  },
  timelineBar: {
    height:          8,
    borderRadius:    2,
    backgroundColor: C.amberBrd,
    marginRight:     8,
  },
  timelineWeeks: {
    fontSize: 7.5,
    color:    C.muted,
  },

  // Shared
  row: { flexDirection: 'row' },
  disclaimer: {
    fontSize:       7.5,
    color:          C.subtle,
    lineHeight:     1.5,
    marginTop:      8,
    paddingTop:     10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderTopStyle: 'solid',
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtCost(n: number): string {
  return `€${n.toLocaleString('de-DE')}`;
}

function fmtCostRange(r: { min: number; max: number }): string | null {
  if (r.min === 0 && r.max === 0) return null;
  return r.min === r.max ? fmtCost(r.min) : `${fmtCost(r.min)}–${fmtCost(r.max)}`;
}

function fmtTimeRange(r: { min: number; max: number }, de: boolean): string {
  const u = de ? 'Wo.' : 'wks';
  return r.min === r.max ? `${r.min} ${u}` : `${r.min}–${r.max} ${u}`;
}

function localDate(isoString: string, de: boolean): string {
  return new Date(isoString).toLocaleDateString(de ? 'de-DE' : 'en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

// ── Page footer helper ─────────────────────────────────────────────────────────

function PageFooter({ left, date }: { left: string; date: string }) {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.footerText}>{left}</Text>
      <Text
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        style={s.footerText}
      />
      <Text style={s.footerText}>{date}</Text>
    </View>
  );
}

// ── Page 1: Cover ──────────────────────────────────────────────────────────────

function CoverPage({ checklist, sections, locale, projectTypeLabel }: {
  checklist: GeneratedChecklist;
  sections: TranslatedSection[];
  locale: string;
  projectTypeLabel: string;
}) {
  const de   = locale === 'de';
  const date = localDate(checklist.generatedAt, de);
  const { classification, municipality } = checklist;

  const allItems = sections.flatMap((sec) => sec.items);
  const costMin  = allItems.reduce((acc, i) => acc + (i.costRange?.min ?? 0), 0);
  const costMax  = allItems.reduce((acc, i) => acc + (i.costRange?.max ?? 0), 0);
  const maxWeeks = Math.max(0, ...allItems.map((i) => i.timeWeeks?.max ?? 0));

  const procedureRef = classification.legalRefs[classification.legalRefs.length - 1] ?? '';
  const procLabelMap: Record<string, string> = {
    kenntnisgabe: de
      ? `Kenntnisgabeverfahren (${procedureRef})`
      : `Notification Procedure (${procedureRef})`,
    vereinfacht: de
      ? `Vereinfachtes Verfahren (${procedureRef})`
      : `Simplified Procedure (${procedureRef})`,
    normal: de
      ? `Normales Baugenehmigungsverfahren (${procedureRef})`
      : `Standard Permit Procedure (${procedureRef})`,
  };
  const procLabel = procLabelMap[classification.procedure] ?? classification.procedure;

  // Short reference number
  const genDate = new Date(checklist.generatedAt);
  const refNum  = `PP-${genDate.getFullYear()}-${municipality.id.slice(0, 3).toUpperCase()}-${genDate.getTime().toString(36).slice(-4).toUpperCase()}`;

  const stats = [
    { label: de ? 'DOKUMENTE' : 'DOCUMENTS',  value: `${checklist.totalItems}`, sub: '' },
    { label: de ? 'KOSTEN CA.' : 'COST EST.',  value: fmtCost(costMin),         sub: `${de ? 'bis' : 'to'} ${fmtCost(costMax)}` },
    { label: de ? 'VORLAUFZEIT' : 'LEAD TIME', value: `${maxWeeks}`,            sub: de ? 'Wochen max.' : 'weeks max' },
  ];

  return (
    <Page size="A4" style={s.page}>
      <View style={s.coverAccent} />

      <Text style={s.coverEyebrow}>
        PERMITPRO · {de ? 'BAUANTRAG CHECKLISTE' : 'BUILDING PERMIT CHECKLIST'}
      </Text>
      <Text style={s.coverTitle}>{municipality.name}</Text>
      <Text style={s.coverSubtitle}>
        {municipality.zip} · {municipality.landkreis} · {municipality.state ?? 'BW'} · {projectTypeLabel}
      </Text>

      {/* Classification */}
      <View style={s.card}>
        <View style={[s.row, { gap: 16 }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardLabel}>{de ? 'GEBÄUDEKLASSE' : 'BUILDING CLASS'}</Text>
            <Text style={s.gkText}>
              {classification.buildingClass.replace('GK', 'GK ')}
            </Text>
          </View>
          <View style={{ flex: 2 }}>
            <Text style={s.cardLabel}>{de ? 'VERFAHREN' : 'PROCEDURE'}</Text>
            <Text style={s.procBadge}>{procLabel}</Text>
            {classification.isSonderbau && (
              <Text style={[s.metaText, { color: C.red, marginTop: 6 }]}>
                {de ? 'Sonderbau — erhöhte Anforderungen' : 'Special Building — extended requirements'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={[s.row, { gap: 10, marginBottom: 14 }]}>
        {stats.map(({ label, value, sub }) => (
          <View key={label} style={[s.card, { flex: 1, marginBottom: 0 }]}>
            <Text style={s.cardLabel}>{label}</Text>
            <Text style={[s.cardValue, { fontSize: 18 }]}>{value}</Text>
            {sub ? <Text style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{sub}</Text> : null}
          </View>
        ))}
      </View>

      {/* Meta card */}
      <View style={s.card}>
        <View style={[s.row, { gap: 24 }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardLabel}>{de ? 'ERSTELLT AM' : 'GENERATED ON'}</Text>
            <Text style={s.cardValue}>{date}</Text>
            <Text style={{ fontSize: 7.5, color: C.subtle, marginTop: 4 }}>{refNum}</Text>
          </View>
          <View style={{ flex: 2 }}>
            <Text style={s.cardLabel}>{de ? 'RECHTSGRUNDLAGEN' : 'LEGAL REFERENCES'}</Text>
            <Text style={[s.legalRef, { fontSize: 8.5 }]}>
              {classification.legalRefs.join(' · ')}
            </Text>
          </View>
        </View>
      </View>

      {/* Disclaimer */}
      <Text style={s.disclaimer}>
        {de
          ? 'Diese Checkliste dient als Orientierungshilfe und ersetzt keine rechtliche oder fachliche Beratung. Maßgeblich sind stets die Vorschriften der zuständigen unteren Baurechtsbehörde.'
          : 'This checklist is for guidance only and does not constitute legal or professional advice. Always confirm requirements with your local building authority.'}
      </Text>

      <PageFooter left={`${municipality.name} · PermitPro`} date={date} />
    </Page>
  );
}

// ── Page 2: Project Summary ────────────────────────────────────────────────────

function SummaryPage({ checklist, locale, translatedAnswers, projectTypeLabel, specialConditions }: {
  checklist: GeneratedChecklist;
  locale: string;
  translatedAnswers: TranslatedAnswer[];
  projectTypeLabel: string;
  specialConditions: string[];
}) {
  const de   = locale === 'de';
  const date = localDate(checklist.generatedAt, de);
  const { classification, municipality } = checklist;

  const procedureNameMap: Record<string, string> = {
    kenntnisgabe: de ? 'Kenntnisgabeverfahren'               : 'Notification Procedure',
    vereinfacht:  de ? 'Vereinfachtes Verfahren'             : 'Simplified Procedure',
    normal:       de ? 'Normales Baugenehmigungsverfahren'   : 'Standard Permit Procedure',
  };
  const procedureName = procedureNameMap[classification.procedure] ?? classification.procedure;

  // Classification rows
  const classRows = [
    {
      label: de ? 'Projekttyp' : 'Project Type',
      value: projectTypeLabel,
      bold: false,
    },
    {
      label: de ? 'Gemeinde' : 'Municipality',
      value: `${municipality.name}, ${municipality.landkreis} (${municipality.state ?? 'BW'})`,
      bold: false,
    },
    {
      label: de ? 'Gebäudeklasse' : 'Building Class',
      value: classification.buildingClass.replace('GK', 'GK '),
      bold: true,
      color: C.amber,
    },
    {
      label: de ? 'Verfahrensart' : 'Procedure Type',
      value: procedureName,
      bold: false,
    },
    {
      label: de ? 'Rechtsgrundlagen' : 'Legal References',
      value: classification.legalRefs.join(' · '),
      bold: true,
      color: C.blue,
    },
    ...(classification.isSonderbau ? [{
      label: de ? 'Sonderbau' : 'Special Building',
      value: de ? 'Ja — erweiterte Anforderungen gelten' : 'Yes — extended requirements apply',
      bold: true,
      color: C.red,
      redBg: true,
    }] : []),
  ];

  return (
    <Page size="A4" style={s.page}>
      <View style={s.pageHeader} fixed>
        <Text style={s.pageHeaderTitle}>
          {de ? 'PROJEKTZUSAMMENFASSUNG' : 'PROJECT SUMMARY'} — {municipality.name}
        </Text>
        <Text
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          style={s.footerText}
        />
      </View>

      {/* Classification block */}
      <View style={s.summaryBlock}>
        <View style={s.summaryBlockHeader}>
          <Text style={s.summaryBlockTitle}>
            {de ? 'KLASSIFIZIERUNG & VERFAHREN' : 'CLASSIFICATION & PROCEDURE'}
          </Text>
        </View>
        {classRows.map((row, idx) => {
          const isLast = idx === classRows.length - 1;
          const isAlt  = idx % 2 === 1;
          const baseStyle = isLast
            ? (isAlt ? s.summaryRowLastAlt : s.summaryRowLast)
            : (isAlt ? s.summaryRowAlt     : s.summaryRow);
          const rowStyle = row.redBg
            ? [baseStyle, { backgroundColor: '#FEF2F2' }]
            : baseStyle;
          return (
            <View key={row.label} style={rowStyle}>
              <Text style={s.summaryLabel}>{row.label}</Text>
              <Text style={[
                s.summaryValue,
                row.bold  ? { fontFamily: 'Helvetica-Bold' } : {},
                row.color ? { color: row.color }             : {},
                row.bold && row.color === C.amber ? { fontSize: 11 } : {},
              ]}>
                {row.value}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Special conditions */}
      {specialConditions.length > 0 && (
        <View style={[s.summaryBlock, { marginBottom: 14 }]}>
          <View style={s.summaryBlockHeader}>
            <Text style={s.summaryBlockTitle}>
              {de ? 'BESONDERE BEDINGUNGEN' : 'SPECIAL CONDITIONS'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 10 }}>
            {specialConditions.map((cond) => (
              <Text key={cond} style={s.conditionTag}>{cond}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Q&A answers */}
      {translatedAnswers.length > 0 && (
        <View style={s.summaryBlock}>
          <View style={s.summaryBlockHeader}>
            <Text style={s.summaryBlockTitle}>
              {de ? 'IHRE ANGABEN' : 'YOUR ANSWERS'}
            </Text>
          </View>
          {translatedAnswers.map((qa, idx) => {
            const isLast = idx === translatedAnswers.length - 1;
            const isAlt  = idx % 2 === 1;
            const rowStyle = isLast
              ? (isAlt ? s.summaryRowLastAlt : s.summaryRowLast)
              : (isAlt ? s.summaryRowAlt     : s.summaryRow);
            return (
              <View key={idx} style={rowStyle}>
                <Text style={s.summaryLabel}>{qa.questionLabel}</Text>
                <Text style={s.summaryValue}>{qa.answer}</Text>
              </View>
            );
          })}
        </View>
      )}

      <PageFooter left={`${municipality.name} · PermitPro`} date={date} />
    </Page>
  );
}

// ── Page 3+: Checklist ─────────────────────────────────────────────────────────

function ChecklistPages({ sections, checklist, locale }: {
  sections: TranslatedSection[];
  checklist: GeneratedChecklist;
  locale: string;
}) {
  const de   = locale === 'de';
  const date = localDate(checklist.generatedAt, de);
  const { municipality } = checklist;

  return (
    <Page size="A4" style={s.page}>
      <View style={s.pageHeader} fixed>
        <Text style={s.pageHeaderTitle}>
          {de ? 'DOKUMENTENCHECKLISTE' : 'DOCUMENT CHECKLIST'} — {municipality.name}
        </Text>
        <Text
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          style={s.footerText}
        />
      </View>

      {sections.map((section) => {
        const secCostMin = section.items.reduce((acc, i) => acc + (i.costRange?.min ?? 0), 0);
        const secCostMax = section.items.reduce((acc, i) => acc + (i.costRange?.max ?? 0), 0);
        const secCostStr = secCostMin > 0
          ? ` · ${fmtCost(secCostMin)}–${fmtCost(secCostMax)}`
          : '';

        return (
          <View key={section.id} style={s.sectionCard} wrap={false}>
            {/* Section header */}
            <View style={s.sectionHeader}>
              <View style={s.sectionBadge}>
                <Text style={s.sectionBadgeText}>{section.id}</Text>
              </View>
              <Text style={s.sectionTitle}>{section.name}</Text>
              <Text style={s.sectionMeta}>
                {section.items.length} {de ? 'Dok.' : 'docs'}{secCostStr}
              </Text>
            </View>

            {/* Items */}
            {section.items.map((item, idx) => {
              const p    = PRIORITY_COLOR[item.priority] ?? PRIORITY_COLOR.required;
              const pLbl = PRIORITY_LABEL[item.priority]?.[de ? 'de' : 'en'] ?? 'Required';
              const cost = item.costRange ? fmtCostRange(item.costRange) : null;
              const time = item.timeWeeks ? fmtTimeRange(item.timeWeeks, de) : null;
              const isLast = idx === section.items.length - 1;

              return (
                <View
                  key={item.id}
                  style={isLast ? [s.itemRow, { borderBottomWidth: 0 }] : s.itemRow}
                >
                  <View style={s.checkbox} />
                  <Text style={s.itemId}>{item.id}</Text>

                  <View style={s.itemContent}>
                    <View style={s.itemTitleRow}>
                      <Text style={s.itemTitle}>{item.title}</Text>
                      <View style={[s.priorityPill, { backgroundColor: p.bg, borderColor: p.brd }]}>
                        <Text style={{ fontSize: 6.5, color: p.text, fontFamily: 'Helvetica-Bold' }}>
                          {pLbl}
                        </Text>
                      </View>
                    </View>

                    <View style={s.itemMeta}>
                      <Text style={s.legalRef}>{item.legalRef}</Text>
                      {item.xbauTag && (
                        <Text style={[s.metaText, { color: '#6B7280' }]}>XBau:{item.xbauTag}</Text>
                      )}
                      {cost && <Text style={s.metaGreen}>{cost}</Text>}
                      {time && <Text style={s.metaText}>{de ? 'Zeit: ' : 'Time: '}{time}</Text>}
                      {item.copies != null && (
                        <Text style={s.metaText}>{item.copies}× {de ? 'Ausf.' : 'copies'}</Text>
                      )}
                    </View>

                    {item.formatRequirements && (
                      <Text style={s.fmtNote}>{item.formatRequirements}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        );
      })}

      <Text style={s.disclaimer}>
        {de
          ? 'Checkliste generiert mit PermitPro · www.permitpro.de · Alle Angaben ohne Gewähr.'
          : 'Checklist generated with PermitPro · All information without guarantee.'}
      </Text>

      <PageFooter left={`${municipality.name} · PermitPro`} date={date} />
    </Page>
  );
}

// ── Action steps helper ────────────────────────────────────────────────────────

interface ActionStep { title: string; desc: string; }

function buildActionSteps(
  procedure: 'kenntnisgabe' | 'vereinfacht' | 'normal',
  isSonderbau: boolean,
  de: boolean,
): ActionStep[] {
  if (de) {
    const architect: ActionStep = {
      title: 'Bauvorlageberechtigen Architekten beauftragen',
      desc:  'Nur ein bauvorlageberechtiger Architekt darf Bauantragsunterlagen in BW und BY einreichen.',
    };
    const engineer: ActionStep = {
      title: 'Statiker beauftragen',
      desc:  'Standsicherheitsnachweis und statische Berechnungen durch einen anerkannten Tragwerksplaner.',
    };
    const compile: ActionStep = {
      title: 'Bauantragsunterlagen zusammenstellen',
      desc:  'Alle Dokumente dieser Checkliste vollständig und in den geforderten Ausfertigungen.',
    };
    const submit: ActionStep = {
      title: 'Einreichung bei der Baurechtsbehörde',
      desc:  'Unterlagen beim zuständigen Landratsamt / der Gemeinde fristgerecht einreichen.',
    };

    if (procedure === 'kenntnisgabe') {
      return [
        architect,
        compile,
        { title: 'Kenntnisgabe einreichen', desc: 'Keine Genehmigung erforderlich — Kenntnisgabe mindestens 2 Wochen vor Baubeginn einreichen.' },
        { title: 'Baubeginn nach Ablauf der Frist', desc: 'Bau kann nach 4-wöchiger Frist ohne Einwände beginnen.' },
      ];
    }
    if (procedure === 'vereinfacht') {
      return [
        architect, engineer, compile, submit,
        { title: 'Auf Genehmigung warten', desc: 'Bearbeitungszeit ca. 6–8 Wochen. Behörde prüft Vollständigkeit und planungsrechtliche Konformität.' },
        { title: 'Baubeginn nach Genehmigung', desc: 'Erst nach Erhalt des schriftlichen Genehmigungsbescheids mit Bau beginnen.' },
      ];
    }
    // normal
    const steps: ActionStep[] = [
      { title: 'Vorgespräch mit Baurechtsbehörde (empfohlen)', desc: 'Frühzeitig Kontakt aufnehmen — vermeidet spätere Nachforderungen und beschleunigt das Verfahren.' },
      architect, engineer,
    ];
    if (isSonderbau) {
      steps.push({ title: 'Brandschutzsachverständigen beauftragen', desc: 'Bei Sonderbauten ist ein bauaufsichtlich anerkannter Brandschutzsachverständiger erforderlich.' });
    }
    steps.push(
      compile, submit,
      { title: 'Rückfragen der Behörde beantworten', desc: 'Innerhalb der gesetzten Fristen auf Nachforderungen reagieren, um Verzögerungen zu vermeiden.' },
      { title: 'Baugenehmigung abwarten', desc: 'Bearbeitungszeit ca. 3–6 Monate (je nach Gemeinde und Vollständigkeit der Unterlagen).' },
      { title: 'Baubeginn nach Genehmigung', desc: 'Erst nach Erhalt des Genehmigungsbescheids mit Bau beginnen. Bescheid am Bau sichtbar aushängen.' },
    );
    return steps;
  }

  // English
  const architect: ActionStep = {
    title: 'Engage a licensed architect',
    desc:  'Only a qualified architect (Bauvorlageberechtiger) may submit building permit documents in BW and BY.',
  };
  const engineer: ActionStep = {
    title: 'Commission structural engineer',
    desc:  'Structural calculations and stability certificate required from an approved structural engineer.',
  };
  const compile: ActionStep = {
    title: 'Compile application documents',
    desc:  'Prepare all documents in this checklist in the required number of copies.',
  };
  const submit: ActionStep = {
    title: 'Submit to building authority',
    desc:  'Submit to the responsible district office (Landratsamt) or municipality.',
  };

  if (procedure === 'kenntnisgabe') {
    return [
      architect, compile,
      { title: 'File notification', desc: 'No approval required — file the notification at least 2 weeks before construction starts.' },
      { title: 'Begin construction after waiting period', desc: 'Construction may begin after the 4-week notification period without objection.' },
    ];
  }
  if (procedure === 'vereinfacht') {
    return [
      architect, engineer, compile, submit,
      { title: 'Await approval decision', desc: 'Processing time approx. 6–8 weeks. Authority checks completeness and planning compliance.' },
      { title: 'Begin construction after approval', desc: 'Only begin construction once you have received the written approval notice.' },
    ];
  }
  // normal
  const steps: ActionStep[] = [
    { title: 'Pre-application consultation (recommended)', desc: 'Contact the authority early — avoids later requests for additional documents and speeds up the process.' },
    architect, engineer,
  ];
  if (isSonderbau) {
    steps.push({ title: 'Engage fire protection consultant', desc: 'Special buildings require a building-authority-approved fire protection specialist.' });
  }
  steps.push(
    compile, submit,
    { title: 'Respond to authority queries', desc: 'Reply within set deadlines to any requests for additional information to avoid delays.' },
    { title: 'Await full approval', desc: 'Processing time approx. 3–6 months (depending on municipality and completeness of documents).' },
    { title: 'Begin construction after approval', desc: 'Only begin construction once you have received the approval notice. Display it visibly on site.' },
  );
  return steps;
}

// ── Final Page: Next Steps ─────────────────────────────────────────────────────

function NextStepsPage({ sections, checklist, locale }: {
  sections: TranslatedSection[];
  checklist: GeneratedChecklist;
  locale: string;
}) {
  const de   = locale === 'de';
  const date = localDate(checklist.generatedAt, de);
  const { classification, municipality } = checklist;

  const allItems = sections.flatMap((sec) => sec.items);
  const costMin  = allItems.reduce((acc, i) => acc + (i.costRange?.min ?? 0), 0);
  const costMax  = allItems.reduce((acc, i) => acc + (i.costRange?.max ?? 0), 0);
  const maxWeeks = Math.max(0, ...allItems.map((i) => i.timeWeeks?.max ?? 0));

  const steps = buildActionSteps(classification.procedure, classification.isSonderbau, de);

  const costByPriority = (['critical', 'required', 'conditional', 'recommended'] as ItemPriority[])
    .map((p) => {
      const items = allItems.filter((i) => i.priority === p);
      if (items.length === 0) return null;
      return {
        priority: p,
        label:    PRIORITY_LABEL[p][de ? 'de' : 'en'],
        count:    items.length,
        min:      items.reduce((acc, i) => acc + (i.costRange?.min ?? 0), 0),
        max:      items.reduce((acc, i) => acc + (i.costRange?.max ?? 0), 0),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  // Timeline phases — dynamic based on maxWeeks
  const mid = Math.max(4, Math.round(maxWeeks * 0.5));
  const timelinePhases = de ? [
    { label: 'Vorbereitung',         weeks: `1–2`,          barWidth: 18  },
    { label: 'Unterlagen sammeln',   weeks: `2–${mid}`,     barWidth: 50  },
    { label: 'Einreichung & Prüfung', weeks: `${mid}–${maxWeeks}`, barWidth: 80  },
    { label: 'Baubeginn',            weeks: `${maxWeeks}+ Wo.`,  barWidth: 120 },
  ] : [
    { label: 'Preparation',          weeks: `1–2`,          barWidth: 18  },
    { label: 'Document collection',  weeks: `2–${mid}`,     barWidth: 50  },
    { label: 'Submission & review',  weeks: `${mid}–${maxWeeks}`, barWidth: 80  },
    { label: 'Construction start',   weeks: `${maxWeeks}+ wks`, barWidth: 120 },
  ];

  return (
    <Page size="A4" style={s.page}>
      <View style={s.pageHeader} fixed>
        <Text style={s.pageHeaderTitle}>
          {de ? 'NÄCHSTE SCHRITTE' : 'NEXT STEPS'} — {municipality.name}
        </Text>
        <Text
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          style={s.footerText}
        />
      </View>

      {/* Action sequence */}
      <View style={s.summaryBlock}>
        <View style={s.summaryBlockHeader}>
          <Text style={s.summaryBlockTitle}>
            {de ? 'EMPFOHLENE VORGEHENSWEISE' : 'RECOMMENDED ACTION SEQUENCE'}
          </Text>
        </View>
        <View style={{ padding: 12 }}>
          {steps.map((step, idx) => (
            <View key={idx} style={s.nextStepRow}>
              <View style={s.nextStepCircle}>
                <Text style={s.nextStepNum}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.nextStepTitle}>{step.title}</Text>
                <Text style={s.nextStepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Cost breakdown */}
      <View style={[s.summaryBlock, { marginBottom: 14 }]}>
        <View style={s.summaryBlockHeader}>
          <Text style={s.summaryBlockTitle}>
            {de ? 'KOSTENSCHÄTZUNG NACH PRIORITÄT' : 'COST ESTIMATE BY PRIORITY'}
          </Text>
        </View>
        <View style={s.costTableHeader}>
          <Text style={[s.summaryLabel, { flex: 2 }]}>{de ? 'KATEGORIE' : 'CATEGORY'}</Text>
          <Text style={[{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.muted, flex: 1, textAlign: 'right' }]}>
            {de ? 'DOK.' : 'DOCS'}
          </Text>
          <Text style={[{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.muted, flex: 2, textAlign: 'right' }]}>
            {de ? 'KOSTEN (MIN–MAX)' : 'COST (MIN–MAX)'}
          </Text>
        </View>
        {costByPriority.map((row, idx) => {
          const p       = PRIORITY_COLOR[row.priority];
          const rowBase = idx % 2 === 1 ? s.costTableRowAlt : s.costTableRow;
          return (
            <View key={row.priority} style={rowBase}>
              <View style={[s.priorityPill, { flex: 2, backgroundColor: p.bg, borderColor: p.brd, marginLeft: 0, marginTop: 0, alignSelf: 'flex-start' }]}>
                <Text style={{ fontSize: 6.5, color: p.text, fontFamily: 'Helvetica-Bold' }}>
                  {row.label}
                </Text>
              </View>
              <Text style={[s.metaText, { flex: 1, textAlign: 'right' }]}>{row.count}</Text>
              <Text style={[s.metaGreen, { flex: 2, textAlign: 'right' }]}>
                {row.min > 0 || row.max > 0
                  ? `${fmtCost(row.min)}–${fmtCost(row.max)}`
                  : (de ? '— Keine Geb.' : '— No fees')}
              </Text>
            </View>
          );
        })}
        {/* Total */}
        <View style={s.costTableTotalRow}>
          <Text style={[s.summaryLabel, { flex: 2 }]}>{de ? 'GESAMT (CA.)' : 'TOTAL (APPROX.)'}</Text>
          <Text style={[s.metaText, { flex: 1, textAlign: 'right' }]}>{allItems.length}</Text>
          <Text style={[{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.amber, flex: 2, textAlign: 'right' }]}>
            {fmtCost(costMin)}–{fmtCost(costMax)}
          </Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={[s.summaryBlock, { marginBottom: 14 }]}>
        <View style={s.summaryBlockHeader}>
          <Text style={s.summaryBlockTitle}>
            {de ? `ZEITPLAN ÜBERSICHT (Wochen ab Beauftragung)` : `TIMELINE OVERVIEW (weeks from kick-off)`}
          </Text>
        </View>
        <View style={{ padding: 12 }}>
          {timelinePhases.map((phase) => (
            <View key={phase.label} style={s.timelineRow}>
              <Text style={s.timelineLabel}>{phase.label}</Text>
              <View style={[s.timelineBar, { width: phase.barWidth }]} />
              <Text style={s.timelineWeeks}>{de ? 'Woche' : 'Week'} {phase.weeks}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Disclaimer */}
      <Text style={s.disclaimer}>
        {de
          ? 'Diese Checkliste wurde mit PermitPro erstellt (www.permitpro.de). Alle Angaben ohne Gewähr. Keine Rechtsberatung. Maßgeblich sind stets die aktuellen Vorschriften der zuständigen Baurechtsbehörde.'
          : 'This checklist was generated with PermitPro (www.permitpro.de). All information without guarantee. Not legal advice. Always verify with your local building authority.'}
      </Text>

      <PageFooter left="PermitPro · www.permitpro.de" date={date} />
    </Page>
  );
}

// ── Document assembly ──────────────────────────────────────────────────────────

function ChecklistPDFDoc(data: ChecklistPDFData) {
  const { checklist, sections, locale, translatedAnswers, projectTypeLabel, specialConditions } = data;
  const de = locale === 'de';

  return (
    <Document
      title={`${checklist.municipality.name} — ${de ? 'Baugenehmigungscheck' : 'Building Permit Checklist'}`}
      author="PermitPro"
    >
      <CoverPage
        checklist={checklist}
        sections={sections}
        locale={locale}
        projectTypeLabel={projectTypeLabel}
      />
      <SummaryPage
        checklist={checklist}
        locale={locale}
        translatedAnswers={translatedAnswers}
        projectTypeLabel={projectTypeLabel}
        specialConditions={specialConditions}
      />
      <ChecklistPages
        sections={sections}
        checklist={checklist}
        locale={locale}
      />
      <NextStepsPage
        sections={sections}
        checklist={checklist}
        locale={locale}
      />
    </Document>
  );
}

// ── Public export ──────────────────────────────────────────────────────────────

export async function downloadChecklistPDF(data: ChecklistPDFData): Promise<void> {
  const doc  = <ChecklistPDFDoc {...data} />;
  const blob = await pdf(doc).toBlob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `permit-checklist-${data.checklist.municipality.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function getChecklistPDFBase64(data: ChecklistPDFData): Promise<{ base64: string; filename: string }> {
  const doc    = <ChecklistPDFDoc {...data} />;
  const blob   = await pdf(doc).toBlob();
  const buffer = await blob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const filename = `permit-checklist-${data.checklist.municipality.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  return { base64, filename };
}
