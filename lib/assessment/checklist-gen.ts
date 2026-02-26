import type {
  Answers,
  ClassificationResult,
  ExcludedItem,
  FederalState,
  GeneratedChecklist,
  ChecklistItem,
  ChecklistSection,
  ChecklistSectionId,
  Municipality,
  ProjectTypeId,
  RelevanceReason,
} from '@/lib/assessment/types';
import { ALL_CHECKLIST_ITEMS } from '@/lib/data/checklist-items';

const SECTION_ORDER: ChecklistSectionId[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

// ── BY legal-reference substitution ───────────────────────────────────────────
// Ordered from most-specific to least-specific to avoid partial replacements.
const BY_REF_SUBSTITUTIONS: [RegExp, string][] = [
  [/§53 Abs\. 1 LBO BW/g,          'Art. 60 Abs. 1 BayBO'],
  [/§53 Abs\. 2 Nr\. 1 LBO BW/g,   'Art. 60 Abs. 2 Nr. 1 BayBO'],
  [/§52 Abs\. 2 LBO BW/g,          'Art. 59 Abs. 2 BayBO'],
  [/§50 Abs\. 3 LBO BW/g,          'Art. 58 Abs. 3 BayBO'],
  [/§60 Abs\. 3 LBO BW/g,          'Art. 62 Abs. 3 BayBO'],
  [/§53 LBO BW/g,                   'Art. 60 BayBO'],
  [/§52 LBO BW/g,                   'Art. 59 BayBO'],
  [/§50 LBO BW/g,                   'Art. 58 BayBO'],
  [/§60 LBO BW/g,                   'Art. 62 BayBO'],
  [/§58 LBO BW/g,                   'Art. 57 BayBO'],
  [/§65 LBO BW/g,                   'Art. 63 BayBO'],
  [/§38 LBO BW/g,                   'Art. 48 BayBO'],
  [/§39 LBO BW/g,                   'Art. 37 BayBO'],
  [/§36 LBO BW/g,                   'Art. 28 BayBO'],
  [/§35 LBO BW/g,                   'Art. 16 BayBO'],
  [/§37 Abs\. 3 LBO BW/g,           'Art. 47 Abs. 3 BayBO'],
  [/§37 LBO BW/g,                   'Art. 47 BayBO'],
  [/§74 LBO BW/g,                   'Art. 7 BayBO'],
  [/§26 Abs\. 3 LBO BW/g,           'Art. 25 Abs. 3 BayBO'],
  [/§26 LBO BW/g,                   'Art. 25 BayBO'],
  [/§15 LBO BW/g,                   'Art. 14 BayBO'],
  [/§8 LBO BW/g,                    'Art. 14 BayBO'],
  [/§7 LBO BW/g,                    'Art. 66 BayBO'],
  [/§5 LBO BW/g,                    'Art. 6 BayBO'],
  [/§4 LBO BW/g,                    'Art. 4 BayBO'],
  [/§8 Abs\. 1 DSchG BW/g,         'Art. 6 Abs. 1 BayDSchG'],
  [/§8 DSchG BW/g,                  'Art. 6 BayDSchG'],
  [/§9 DSchG BW/g,                  'Art. 7 BayDSchG'],
  [/§2 DSchG BW/g,                  'Art. 1 BayDSchG'],
  [/§3 LBOVVO BW/g,                 '§6 BauVorlV BY'],
  [/§4 LBOVVO BW/g,                 '§4 BauVorlV BY'],
  [/§5 LBOVVO BW/g,                 '§5 BauVorlV BY'],
  [/§8 Abs\. 2 LBOVVO BW/g,        '§8 BauVorlV BY'],
  [/§9 LBOVVO BW/g,                 '§9 BauVorlV BY'],
  [/§10 LBOVVO BW/g,                '§10 BauVorlV BY'],
  [/§11 LBOVVO BW/g,                '§11 BauVorlV BY'],
  [/§12 LBOVVO BW/g,                '§13 BauVorlV BY'],
  [/§13 LBOVVO BW/g,                '§14 BauVorlV BY'],
  [/\bLBOVVO BW\b/g,                'BauVorlV BY'],
  [/\bWG BW\b/g,                    'BayWG'],
  [/\bEWärmeG BW\b/g,               'WärmeEnerG BY'],
];

function remapLegalRef(ref: string, state: FederalState): string {
  if (state !== 'BY') return ref;
  return BY_REF_SUBSTITUTIONS.reduce((r, [pattern, replacement]) => r.replace(pattern, replacement), ref);
}

function evaluateShowIfAnswer(
  item: ChecklistItem,
  answers: Answers,
): boolean {
  if (!item.showIfAnswer) return true;
  if (typeof item.showIfAnswer === 'function') {
    return item.showIfAnswer(answers);
  }
  const { questionId, value } = item.showIfAnswer;
  return answers[questionId] === value;
}

// ── Relevance reason labels ──────────────────────────────────────────────────

const PT_LABEL: Record<ProjectTypeId, { en: string; de: string }> = {
  neubau:            { en: 'new build',         de: 'Neubau'            },
  anbau:             { en: 'extension',         de: 'Anbau'             },
  aufstockung:       { en: 'additional storey', de: 'Aufstockung'       },
  umbau:             { en: 'conversion',        de: 'Umbau'             },
  nutzungsaenderung: { en: 'change of use',     de: 'Nutzungsänderung'  },
  abbruch:           { en: 'demolition',        de: 'Abbruch'           },
};

const PROC_LABEL: Record<string, { en: string; de: string }> = {
  kenntnisgabe: { en: 'notification procedure',  de: 'Kenntnisgabeverfahren'         },
  vereinfacht:  { en: 'simplified procedure',    de: 'vereinfachtes Verfahren'       },
  normal:       { en: 'standard permit procedure', de: 'normales Genehmigungsverfahren' },
};

const STATE_LABEL: Record<FederalState, string> = {
  BW: 'Baden-Württemberg',
  BY: 'Bayern / Bavaria',
};

/**
 * Determines WHY an item is excluded from the checklist.
 * Checks filters in the same order as filterItems; returns reason for the FIRST failing filter.
 */
function getExclusionReason(
  item: ChecklistItem,
  result: ClassificationResult,
  projectType: ProjectTypeId,
  answers: Answers,
  state: FederalState,
): RelevanceReason | null {
  // 1. Project type
  if (item.applicableProjectTypes && !item.applicableProjectTypes.includes(projectType)) {
    const allowed = item.applicableProjectTypes.map((pt) => PT_LABEL[pt]?.de ?? pt).join(', ');
    const allowedEn = item.applicableProjectTypes.map((pt) => PT_LABEL[pt]?.en ?? pt).join(', ');
    return {
      de: `Nur für: ${allowed} — Ihr Projekt ist ein ${PT_LABEL[projectType]?.de ?? projectType}`,
      en: `Only for: ${allowedEn} — your project is a ${PT_LABEL[projectType]?.en ?? projectType}`,
    };
  }

  // 2. Sonderbau only
  if (item.sonderbauOnly && !result.isSonderbau) {
    return {
      de: `Nur für Sonderbauten erforderlich — Ihr Gebäude ist ${result.buildingClass}`,
      en: `Only required for special buildings (Sonderbau) — your building is ${result.buildingClass}`,
    };
  }

  // 3. Procedure
  const procMatch =
    item.applicableProcedures.includes('all') ||
    item.applicableProcedures.includes(result.procedure);
  if (!procMatch) {
    const allowed = item.applicableProcedures
      .filter((p) => p !== 'all')
      .map((p) => PROC_LABEL[p]?.de ?? p)
      .join(', ');
    const allowedEn = item.applicableProcedures
      .filter((p) => p !== 'all')
      .map((p) => PROC_LABEL[p]?.en ?? p)
      .join(', ');
    return {
      de: `Nur für ${allowed} — Ihr Verfahren: ${PROC_LABEL[result.procedure]?.de ?? result.procedure}`,
      en: `Only for ${allowedEn} — your procedure: ${PROC_LABEL[result.procedure]?.en ?? result.procedure}`,
    };
  }

  // 4. Building class
  if (item.applicableClasses && !item.applicableClasses.includes(result.buildingClass)) {
    const allowed = item.applicableClasses.join(', ');
    return {
      de: `Nur für ${allowed} — Ihr Gebäude ist ${result.buildingClass}`,
      en: `Only for ${allowed} — your building is ${result.buildingClass}`,
    };
  }

  // 5. State
  if (item.applicableStates && !item.applicableStates.includes(state)) {
    const allowed = item.applicableStates.map((s) => STATE_LABEL[s] ?? s).join(', ');
    return {
      de: `Nur in ${allowed} — Ihr Standort: ${STATE_LABEL[state] ?? state}`,
      en: `Only in ${allowed} — your location: ${STATE_LABEL[state] ?? state}`,
    };
  }

  // 6. Answer condition
  if (!evaluateShowIfAnswer(item, answers)) {
    // Try to give a more specific reason based on the showIfAnswer config
    if (item.showIfAnswer && typeof item.showIfAnswer !== 'function') {
      const key = item.showIfAnswer.questionId;
      const ANSWER_HINTS: Record<string, { de: string; en: string }> = {
        denkmalschutz:         { de: 'Kein Denkmalschutz angegeben',      en: 'No monument protection indicated'     },
        ueberschwemmungsgebiet:{ de: 'Kein Überschwemmungsgebiet',        en: 'Not in a flood zone'                  },
        holzbauweise:          { de: 'Keine Holzbauweise',                en: 'Not timber construction'              },
        schadstoffe:           { de: 'Keine Schadstoffbelastung',         en: 'No hazardous materials'               },
        kellerGeplant:         { de: 'Kein Keller geplant',              en: 'No basement planned'                  },
        aufzugGeplant:         { de: 'Kein Aufzug geplant',              en: 'No elevator planned'                  },
        abbruchGeplant:        { de: 'Kein Abbruch geplant',             en: 'No demolition planned'                },
        garagen:               { de: 'Keine Garagen/Stellplätze geplant',en: 'No garages/parking planned'           },
      };
      const hint = ANSWER_HINTS[key];
      if (hint) return hint;
    }
    return {
      de: 'Aufgrund Ihrer Projektangaben nicht zutreffend',
      en: 'Not applicable based on your project answers',
    };
  }

  return null; // Item is NOT excluded
}

/**
 * Generates a concise reason WHY an item IS included in the checklist.
 */
export function getInclusionReason(
  item: ChecklistItem,
  result: ClassificationResult,
  projectType: ProjectTypeId,
  state: FederalState,
): RelevanceReason {
  const parts: { de: string[]; en: string[] } = { de: [], en: [] };

  // Procedure
  if (item.applicableProcedures.includes('all')) {
    parts.de.push('alle Verfahren');
    parts.en.push('all procedures');
  } else {
    const procDe = item.applicableProcedures.map((p) => PROC_LABEL[p]?.de ?? p).join(', ');
    const procEn = item.applicableProcedures.map((p) => PROC_LABEL[p]?.en ?? p).join(', ');
    parts.de.push(procDe);
    parts.en.push(procEn);
  }

  // Project type
  if (item.applicableProjectTypes) {
    parts.de.push(PT_LABEL[projectType]?.de ?? projectType);
    parts.en.push(PT_LABEL[projectType]?.en ?? projectType);
  }

  // Sonderbau
  if (item.sonderbauOnly) {
    parts.de.push('Sonderbau');
    parts.en.push('special building');
  }

  // Building class restriction
  if (item.applicableClasses) {
    parts.de.push(item.applicableClasses.join(', '));
    parts.en.push(item.applicableClasses.join(', '));
  }

  return {
    de: `Erforderlich: ${parts.de.join(' · ')}`,
    en: `Required: ${parts.en.join(' · ')}`,
  };
}

function filterItemsWithExclusions(
  items: ChecklistItem[],
  result: ClassificationResult,
  projectType: ProjectTypeId,
  answers: Answers,
  state: FederalState,
): { included: ChecklistItem[]; excluded: ExcludedItem[] } {
  const included: ChecklistItem[] = [];
  const excluded: ExcludedItem[] = [];

  for (const item of items) {
    const reason = getExclusionReason(item, result, projectType, answers, state);
    if (reason) {
      excluded.push({ item, reason });
    } else {
      included.push(item);
    }
  }

  return { included, excluded };
}

function groupIntoSections(items: ChecklistItem[]): ChecklistSection[] {
  const map = new Map<ChecklistSectionId, ChecklistItem[]>();
  for (const item of items) {
    const existing = map.get(item.sectionId) ?? [];
    existing.push(item);
    map.set(item.sectionId, existing);
  }
  return SECTION_ORDER
    .filter((id) => map.has(id))
    .map((id) => ({ id, items: map.get(id)! }));
}

export function generateChecklist(
  projectType: ProjectTypeId,
  municipality: Municipality,
  result: ClassificationResult,
  answers: Answers = {},
): GeneratedChecklist {
  const state = municipality.state ?? 'BW';
  const { included: rawItems, excluded: rawExcluded } =
    filterItemsWithExclusions(ALL_CHECKLIST_ITEMS, result, projectType, answers, state);
  // Remap legal references to the correct state law when municipality is in BY
  const applicable = state === 'BY'
    ? rawItems.map((item) => ({ ...item, legalRef: remapLegalRef(item.legalRef, state) }))
    : rawItems;
  const excludedItems: ExcludedItem[] = state === 'BY'
    ? rawExcluded.map((e) => ({ ...e, item: { ...e.item, legalRef: remapLegalRef(e.item.legalRef, state) } }))
    : rawExcluded;
  const sections = groupIntoSections(applicable);

  return {
    sections,
    totalItems: applicable.length,
    classification: result,
    municipality,
    projectType,
    answers,
    generatedAt: new Date().toISOString(),
    excludedItems,
  };
}
