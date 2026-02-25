import type {
  Answers,
  ClassificationResult,
  FederalState,
  GeneratedChecklist,
  ChecklistItem,
  ChecklistSection,
  ChecklistSectionId,
  Municipality,
  ProjectTypeId,
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

function filterItems(
  items: ChecklistItem[],
  result: ClassificationResult,
  projectType: ProjectTypeId,
  answers: Answers,
  state: FederalState,
): ChecklistItem[] {
  return items.filter((item) => {
    if (item.applicableProjectTypes && !item.applicableProjectTypes.includes(projectType)) return false;
    if (item.sonderbauOnly && !result.isSonderbau) return false;
    const procMatch =
      item.applicableProcedures.includes('all') ||
      item.applicableProcedures.includes(result.procedure);
    if (!procMatch) return false;
    if (item.applicableClasses && !item.applicableClasses.includes(result.buildingClass)) return false;
    if (item.applicableStates && !item.applicableStates.includes(state)) return false;
    if (!evaluateShowIfAnswer(item, answers)) return false;
    return true;
  });
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
  const rawItems = filterItems(ALL_CHECKLIST_ITEMS, result, projectType, answers, state);
  // Remap legal references to the correct state law when municipality is in BY
  const applicable = state === 'BY'
    ? rawItems.map((item) => ({ ...item, legalRef: remapLegalRef(item.legalRef, state) }))
    : rawItems;
  const sections = groupIntoSections(applicable);

  return {
    sections,
    totalItems: applicable.length,
    classification: result,
    municipality,
    projectType,
    answers,
    generatedAt: new Date().toISOString(),
  };
}
