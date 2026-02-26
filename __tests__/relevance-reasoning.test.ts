import { describe, it, expect } from 'vitest';
import { generateChecklist, getInclusionReason } from '@/lib/assessment/checklist-gen';
import { classify } from '@/lib/assessment/classifier';
import type { Municipality, ExcludedItem } from '@/lib/assessment/types';

// ── Fixture municipalities ─────────────────────────────────────────────────

const STUTTGART: Municipality = {
  id: 'stuttgart',
  name: 'Stuttgart',
  landkreis: 'Stuttgart (Stadtkreis)',
  zip: '70173',
  hasBebaungsplan: true,
  state: 'BW',
};

const MUENCHEN: Municipality = {
  id: 'muenchen',
  name: 'München',
  landkreis: 'München (Stadtkreis)',
  zip: '80331',
  hasBebaungsplan: true,
  state: 'BY',
};

// ── Helpers ────────────────────────────────────────────────────────────────

function allItemIds(result: ReturnType<typeof generateChecklist>): string[] {
  return result.sections.flatMap((s) => s.items.map((i) => i.id));
}

function excludedIds(result: ReturnType<typeof generateChecklist>): string[] {
  return result.excludedItems.map((e) => e.item.id);
}

function findExcluded(result: ReturnType<typeof generateChecklist>, id: string): ExcludedItem | undefined {
  return result.excludedItems.find((e) => e.item.id === id);
}

// ══════════════════════════════════════════════════════════════════════════════
// Scenario A — Stuttgart GK2 (vereinfacht), simple neubau
// ══════════════════════════════════════════════════════════════════════════════

describe('Relevance Reasoning — Scenario A: Stuttgart GK2 BW', () => {
  const answers = {
    hoehe: 6, nutzungsart: 'wohnen', nutzungseinheiten: 1, freistehend: false,
  };
  const classification = classify('neubau', answers, STUTTGART);
  const checklist = generateChecklist('neubau', STUTTGART, classification, answers);

  it('classifies as GK2, vereinfacht', () => {
    expect(classification.buildingClass).toBe('GK2');
    expect(classification.procedure).toBe('vereinfacht');
  });

  it('returns excludedItems array', () => {
    expect(Array.isArray(checklist.excludedItems)).toBe(true);
    expect(checklist.excludedItems.length).toBeGreaterThan(0);
  });

  it('included + excluded = total checklist items', () => {
    const includedCount = checklist.totalItems;
    const excludedCount = checklist.excludedItems.length;
    // No item should appear in both
    const includedIds = new Set(allItemIds(checklist));
    const excludedIdSet = new Set(excludedIds(checklist));
    for (const id of includedIds) {
      expect(excludedIdSet.has(id)).toBe(false);
    }
    expect(includedCount + excludedCount).toBeGreaterThan(0);
  });

  // D3 has applicableProcedures: ['normal'] AND applicableClasses: ['GK4','GK5']
  // For vereinfacht procedure, the procedure filter fires FIRST (before building class)
  it('D3 excluded with procedure reason (first failing filter)', () => {
    const d3 = findExcluded(checklist, 'D3');
    expect(d3).toBeDefined();
    expect(d3!.reason.de).toContain('normales Genehmigungsverfahren');
    expect(d3!.reason.de).toContain('vereinfacht');
    expect(d3!.reason.en).toContain('standard permit');
    expect(d3!.reason.en).toContain('simplified');
  });

  // D6 excluded for building class
  it('D6 excluded with building class reason', () => {
    const d6 = findExcluded(checklist, 'D6');
    expect(d6).toBeDefined();
    expect(d6!.reason.de).toContain('GK4');
    expect(d6!.reason.de).toContain('GK2');
  });

  // F5 excluded for sonderbau
  it('F5 excluded with Sonderbau reason', () => {
    const f5 = findExcluded(checklist, 'F5');
    expect(f5).toBeDefined();
    expect(f5!.reason.de).toContain('Sonderbau');
    expect(f5!.reason.en).toContain('special building');
  });

  // I1 excluded for sonderbau
  it('I1 excluded with Sonderbau reason', () => {
    const i1 = findExcluded(checklist, 'I1');
    expect(i1).toBeDefined();
    expect(i1!.reason.de).toContain('Sonderbau');
  });

  // A1_BY excluded for state
  it('A1_BY excluded with state reason', () => {
    const a1by = findExcluded(checklist, 'A1_BY');
    expect(a1by).toBeDefined();
    expect(a1by!.reason.de).toContain('Bayern');
    expect(a1by!.reason.en).toContain('Bavaria');
  });

  // J items excluded for project type
  it('J1 excluded with project type reason (not abbruch)', () => {
    const j1 = findExcluded(checklist, 'J1');
    expect(j1).toBeDefined();
    expect(j1!.reason.de).toContain('Abbruch');
    expect(j1!.reason.de).toContain('Neubau');
    expect(j1!.reason.en).toContain('demolition');
    expect(j1!.reason.en).toContain('new build');
  });

  // A4 excluded for procedure (kenntnisgabe only)
  it('A4 excluded with procedure reason', () => {
    const a4 = findExcluded(checklist, 'A4');
    expect(a4).toBeDefined();
    expect(a4!.reason.de).toContain('Kenntnisgabe');
    expect(a4!.reason.de).toContain('vereinfacht');
    expect(a4!.reason.en).toContain('notification');
    expect(a4!.reason.en).toContain('simplified');
  });

  // Every exclusion reason has both de and en
  it('every excluded item has bilingual reason', () => {
    for (const excluded of checklist.excludedItems) {
      expect(excluded.reason.de).toBeTruthy();
      expect(excluded.reason.en).toBeTruthy();
      expect(typeof excluded.reason.de).toBe('string');
      expect(typeof excluded.reason.en).toBe('string');
      expect(excluded.reason.de.length).toBeGreaterThan(5);
      expect(excluded.reason.en.length).toBeGreaterThan(5);
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Scenario B — München GK5 BY, high-rise neubau
// ══════════════════════════════════════════════════════════════════════════════

describe('Relevance Reasoning — Scenario B: München GK5 BY', () => {
  const answers = {
    hoehe: 20, nutzungsart: 'wohnen',
  };
  const classification = classify('neubau', answers, MUENCHEN);
  const checklist = generateChecklist('neubau', MUENCHEN, classification, answers);

  it('classifies as GK5, normal', () => {
    expect(classification.buildingClass).toBe('GK5');
    expect(classification.procedure).toBe('normal');
  });

  // D3 should be INCLUDED for GK5
  it('D3 included (GK4/5 only → GK5 qualifies)', () => {
    expect(allItemIds(checklist)).toContain('D3');
    expect(excludedIds(checklist)).not.toContain('D3');
  });

  // D6 should be INCLUDED for GK5
  it('D6 included (GK4/5 only → GK5 qualifies)', () => {
    expect(allItemIds(checklist)).toContain('D6');
  });

  // F5 still excluded (sonderbauOnly, not sonderbau)
  it('F5 excluded (sonderbauOnly, not sonderbau)', () => {
    const f5 = findExcluded(checklist, 'F5');
    expect(f5).toBeDefined();
    expect(f5!.reason.en).toContain('special building');
  });

  // A4 excluded (kenntnisgabe only, procedure is normal)
  it('A4 excluded (kenntnisgabe only)', () => {
    const a4 = findExcluded(checklist, 'A4');
    expect(a4).toBeDefined();
    expect(a4!.reason.de).toContain('Kenntnisgabe');
  });

  // A4_BY excluded (kenntnisgabe only, procedure is normal)
  it('A4_BY excluded (kenntnisgabe only)', () => {
    const a4by = findExcluded(checklist, 'A4_BY');
    expect(a4by).toBeDefined();
    expect(a4by!.reason.de).toContain('Kenntnisgabe');
  });

  // A1_BY should be INCLUDED for BY
  it('A1_BY included for BY municipality', () => {
    expect(allItemIds(checklist)).toContain('A1_BY');
  });

  // BW-only items (A4) excluded with state reason is already procedure-excluded
  // so the procedure reason comes first — let's verify that's correct order
  it('A4 excluded by procedure BEFORE state filter', () => {
    const a4 = findExcluded(checklist, 'A4');
    expect(a4).toBeDefined();
    // A4 applicableProcedures is ['kenntnisgabe'], and current is 'normal'
    // This filter (procedure) should trigger before the state filter
    expect(a4!.reason.de).toContain('Kenntnisgabe');
  });

  // Legal refs should all be remapped to BayBO
  it('excluded items also have BY-remapped legal refs', () => {
    const allExcludedRefs = checklist.excludedItems.map((e) => e.item.legalRef);
    const hasRawBW = allExcludedRefs.some((ref) => ref.includes('LBO BW'));
    expect(hasRawBW).toBe(false);
  });

  it('every excluded item has bilingual reason', () => {
    for (const excluded of checklist.excludedItems) {
      expect(excluded.reason.de).toBeTruthy();
      expect(excluded.reason.en).toBeTruthy();
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// Scenario C — Comparison (items in one but not the other)
// ══════════════════════════════════════════════════════════════════════════════

describe('Relevance Reasoning — Scenario C: Comparison', () => {
  const stuttgartAnswers = { hoehe: 6, nutzungsart: 'wohnen', nutzungseinheiten: 1, freistehend: false };
  const stuttgartClass = classify('neubau', stuttgartAnswers, STUTTGART);
  const stuttgartCL = generateChecklist('neubau', STUTTGART, stuttgartClass, stuttgartAnswers);

  const muenchenAnswers = { hoehe: 20, nutzungsart: 'wohnen' };
  const muenchenClass = classify('neubau', muenchenAnswers, MUENCHEN);
  const muenchenCL = generateChecklist('neubau', MUENCHEN, muenchenClass, muenchenAnswers);

  it('D3 excluded for Stuttgart GK2 but included for München GK5', () => {
    expect(excludedIds(stuttgartCL)).toContain('D3');
    expect(allItemIds(muenchenCL)).toContain('D3');
    // D3 has applicableProcedures: ['normal'] — Stuttgart is vereinfacht, so procedure fires first
    const d3 = findExcluded(stuttgartCL, 'D3')!;
    expect(d3.reason.de).toContain('normales Genehmigungsverfahren');
  });

  it('A1_BY excluded for Stuttgart BW but included for München BY', () => {
    expect(excludedIds(stuttgartCL)).toContain('A1_BY');
    expect(allItemIds(muenchenCL)).toContain('A1_BY');
    // Stuttgart reason must mention Bayern
    const a1by = findExcluded(stuttgartCL, 'A1_BY')!;
    expect(a1by.reason.de).toContain('Bayern');
  });

  it('total items differ between scenarios', () => {
    // GK5 should have more items (D3, D6, etc.)
    expect(muenchenCL.totalItems).toBeGreaterThan(stuttgartCL.totalItems);
  });

  it('no item appears in both included and excluded in either scenario', () => {
    const sIncluded = new Set(allItemIds(stuttgartCL));
    const sExcluded = new Set(excludedIds(stuttgartCL));
    for (const id of sIncluded) expect(sExcluded.has(id)).toBe(false);

    const mIncluded = new Set(allItemIds(muenchenCL));
    const mExcluded = new Set(excludedIds(muenchenCL));
    for (const id of mIncluded) expect(mExcluded.has(id)).toBe(false);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// showIfAnswer exclusion reasons
// ══════════════════════════════════════════════════════════════════════════════

describe('Relevance Reasoning — showIfAnswer exclusion reasons', () => {
  const classification = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen' });

  it('D7 excluded with "Keine Holzbauweise" when holzbauweise not true', () => {
    const result = generateChecklist('neubau', STUTTGART, classification, {});
    const d7 = findExcluded(result, 'D7');
    expect(d7).toBeDefined();
    expect(d7!.reason.de).toContain('Holzbau');
    expect(d7!.reason.en).toContain('timber');
  });

  it('G7 excluded with generic answer reason when heizungTyp not gas/holz', () => {
    const result = generateChecklist('neubau', STUTTGART, classification, { heizungTyp: 'waermepumpe' });
    const g7 = findExcluded(result, 'G7');
    expect(g7).toBeDefined();
    // G7 uses a function showIfAnswer, so should get generic reason
    expect(g7!.reason.de).toContain('Projektangaben');
    expect(g7!.reason.en).toContain('project answers');
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// getInclusionReason
// ══════════════════════════════════════════════════════════════════════════════

describe('getInclusionReason', () => {
  it('generates bilingual inclusion reason for a standard item', () => {
    const classification = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen' });
    const items = generateChecklist('neubau', STUTTGART, classification).sections.flatMap((s) => s.items);
    const a1 = items.find((i) => i.id === 'A1');
    expect(a1).toBeDefined();

    const reason = getInclusionReason(a1!, classification, 'neubau', 'BW');
    expect(reason.de).toContain('Neubau');
    expect(reason.en).toContain('new build');
    expect(reason.de).toContain('Erforderlich');
    expect(reason.en).toContain('Required');
  });

  it('includes building class in reason for class-restricted items', () => {
    const classification = classify('neubau', { hoehe: 14, nutzungsart: 'wohnen' });
    const items = generateChecklist('neubau', STUTTGART, classification).sections.flatMap((s) => s.items);
    const d3 = items.find((i) => i.id === 'D3');
    expect(d3).toBeDefined();

    const reason = getInclusionReason(d3!, classification, 'neubau', 'BW');
    expect(reason.de).toContain('GK4');
    expect(reason.en).toContain('GK4');
  });
});
