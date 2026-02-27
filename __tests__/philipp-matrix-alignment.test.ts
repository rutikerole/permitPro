/**
 * Tests for Philipp's Planning Matrix alignment:
 * - projektDatenId coverage (05.001–05.067)
 * - New assessment questions (hasFireplace, nearVibrationSource, plotSize)
 * - Classifier + checklist generation integration
 */
import { describe, it, expect } from 'vitest';
import { ALL_CHECKLIST_ITEMS } from '@/lib/data/checklist-items';
import { QUESTION_TREES, getVisibleQuestions } from '@/lib/data/question-trees';
import { classify } from '@/lib/assessment/classifier';
import { generateChecklist } from '@/lib/assessment/checklist-gen';
import type { Answers, Municipality } from '@/lib/assessment/types';

// ── projektDatenId mapping ──────────────────────────────────────────────────

describe('projektDatenId — Philipp mapping', () => {
  it('every item has a projektDatenId', () => {
    const missing = ALL_CHECKLIST_ITEMS.filter((item) => !item.projektDatenId);
    expect(missing.map((i) => i.id)).toEqual([]);
  });

  it('every projektDatenId matches pattern 05.0xx', () => {
    for (const item of ALL_CHECKLIST_ITEMS) {
      if (item.projektDatenId) {
        expect(item.projektDatenId).toMatch(/^05\.\d{3}(-BY)?$/);
      }
    }
  });

  it('no duplicate projektDatenIds', () => {
    const seen = new Map<string, string[]>();
    for (const item of ALL_CHECKLIST_ITEMS) {
      if (!item.projektDatenId) continue;
      const list = seen.get(item.projektDatenId) ?? [];
      list.push(item.id);
      seen.set(item.projektDatenId, list);
    }
    for (const [pdId, ids] of seen) {
      expect(ids.length).toBe(1);
    }
  });

  it('covers IDs 05.001 through 05.067 (skip 05.048–05.049)', () => {
    const allPdIds = new Set(
      ALL_CHECKLIST_ITEMS.map((i) => i.projektDatenId).filter(Boolean),
    );
    for (let i = 1; i <= 67; i++) {
      if (i === 48 || i === 49) continue; // Skipped in Philipp's scheme
      const pdId = `05.${String(i).padStart(3, '0')}`;
      expect(allPdIds.has(pdId)).toBe(true);
    }
  });

  it('total items ~67 (plus 2 BY variants)', () => {
    expect(ALL_CHECKLIST_ITEMS.length).toBeGreaterThanOrEqual(67);
    expect(ALL_CHECKLIST_ITEMS.length).toBeLessThanOrEqual(75);
  });
});

// ── xbauTag consistency ─────────────────────────────────────────────────────

describe('xbauTag → projektDatenId consistency', () => {
  it('items with same xbauTag share the same projektDatenId (BY variants)', () => {
    const tagMap = new Map<string, Set<string>>();
    for (const item of ALL_CHECKLIST_ITEMS) {
      if (!item.xbauTag || !item.projektDatenId) continue;
      const set = tagMap.get(item.xbauTag) ?? new Set();
      set.add(item.projektDatenId);
      tagMap.set(item.xbauTag, set);
    }
    for (const [tag, pdIds] of tagMap) {
      if (pdIds.size > 1) {
        // Only acceptable for duplicated tags (e.g., 0200.antrag for A1 and A1_BY)
        expect(pdIds.size).toBeLessThanOrEqual(2);
      }
    }
  });
});

// ── New assessment questions ────────────────────────────────────────────────

describe('New assessment questions', () => {
  it('hasFireplace exists in neubau and anbau question trees', () => {
    const neubauIds = QUESTION_TREES.neubau.map((q) => q.id);
    const anbauIds  = QUESTION_TREES.anbau.map((q) => q.id);
    expect(neubauIds).toContain('hasFireplace');
    expect(anbauIds).toContain('hasFireplace');
  });

  it('nearVibrationSource exists in neubau and anbau question trees', () => {
    const neubauIds = QUESTION_TREES.neubau.map((q) => q.id);
    const anbauIds  = QUESTION_TREES.anbau.map((q) => q.id);
    expect(neubauIds).toContain('nearVibrationSource');
    expect(anbauIds).toContain('nearVibrationSource');
  });

  it('plotSize exists in neubau question tree', () => {
    const neubauIds = QUESTION_TREES.neubau.map((q) => q.id);
    expect(neubauIds).toContain('plotSize');
  });

  it('hasFireplace only visible when heizungTyp is holz', () => {
    const visible1 = getVisibleQuestions('neubau', { heizungTyp: 'waermepumpe' });
    const visible2 = getVisibleQuestions('neubau', { heizungTyp: 'holz' });
    expect(visible1.some((q) => q.id === 'hasFireplace')).toBe(false);
    expect(visible2.some((q) => q.id === 'hasFireplace')).toBe(true);
  });

  it('nearVibrationSource is always visible for neubau', () => {
    const visible = getVisibleQuestions('neubau', {});
    expect(visible.some((q) => q.id === 'nearVibrationSource')).toBe(true);
  });

  it('plotSize is always visible for neubau', () => {
    const visible = getVisibleQuestions('neubau', {});
    expect(visible.some((q) => q.id === 'plotSize')).toBe(true);
  });
});

// ── Classifier + Checklist integration ──────────────────────────────────────

const MOCK_MUNICIPALITY: Municipality = {
  id: 'stuttgart',
  name: 'Stuttgart',
  zip: '70173',
  landkreis: 'Stuttgart',
  state: 'BW',
  hasBebaungsplan: true,
};

describe('GK2 simple residential — conditional items', () => {
  const answers: Answers = {
    hoehe: 6,
    anzahlGeschosse: 2,
    nutzungsart: 'wohnen',
    freistehend: false,
    nutzungseinheiten: 2,
    bgf: 250,
    plotSize: 400,
    bri: 800,
    bebauungsplan: true,
    konform: true,
    denkmalschutz: false,
    ueberschwemmungsgebiet: false,
    holzbauweise: false,
    kellerGeplant: false,
    nearVibrationSource: false,
    heizungTyp: 'waermepumpe',
    photovoltaik: true,
    stellplaetze: 3,
  };

  it('classifies as GK2', () => {
    const result = classify('neubau', answers);
    expect(result.buildingClass).toBe('GK2');
  });

  it('does not include vibration report (H6) when nearVibrationSource=false for GK2', () => {
    const result = classify('neubau', answers);
    const checklist = generateChecklist('neubau', MOCK_MUNICIPALITY, result, answers);
    const ids = checklist.sections.flatMap((s) => s.items.map((i) => i.id));
    expect(ids).not.toContain('H6');
  });

  it('includes vibration report (H6) when nearVibrationSource=true for GK2', () => {
    const answersWithVibration = { ...answers, nearVibrationSource: true };
    const result = classify('neubau', answersWithVibration);
    const checklist = generateChecklist('neubau', MOCK_MUNICIPALITY, result, answersWithVibration);
    const ids = checklist.sections.flatMap((s) => s.items.map((i) => i.id));
    expect(ids).toContain('H6');
  });
});

describe('GK5 Sonderbau — specialist items triggered', () => {
  const answers: Answers = {
    hoehe: 20,
    anzahlGeschosse: 6,
    nutzungsart: 'sonderbau',
    bgf: 5000,
    plotSize: 2000,
    bri: 15000,
    bebauungsplan: true,
    konform: true,
    denkmalschutz: false,
    ueberschwemmungsgebiet: false,
    holzbauweise: false,
    kellerGeplant: true,
    aufzugGeplant: true,
    nearVibrationSource: false,
    heizungTyp: 'fernwaerme',
    photovoltaik: true,
    stellplaetze: 50,
  };

  it('classifies as GK5', () => {
    const result = classify('neubau', answers);
    expect(result.buildingClass).toBe('GK5');
  });

  it('includes Sonderbau-specific items F5, F6, I3, I4', () => {
    const result = classify('neubau', answers);
    const checklist = generateChecklist('neubau', MOCK_MUNICIPALITY, result, answers);
    const ids = checklist.sections.flatMap((s) => s.items.map((i) => i.id));
    // F5 and F6 are fire-related Sonderbau items
    expect(ids).toContain('F5');
    expect(ids).toContain('F6');
    // I3 and I4 are Sonderbau accessibility/escape route items
    expect(ids).toContain('I3');
    expect(ids).toContain('I4');
  });

  it('includes vibration report (H6) for GK5 even without nearVibrationSource', () => {
    const result = classify('neubau', answers);
    const checklist = generateChecklist('neubau', MOCK_MUNICIPALITY, result, answers);
    const ids = checklist.sections.flatMap((s) => s.items.map((i) => i.id));
    // H6 should be included because height > 7 (GK4/5 equivalent)
    expect(ids).toContain('H6');
  });
});

describe('Fireplace trigger — G7 with hasFireplace', () => {
  it('G7 triggered when heizungTyp=holz', () => {
    const answers: Answers = {
      hoehe: 6,
      anzahlGeschosse: 2,
      nutzungsart: 'wohnen',
      freistehend: true,
      nutzungseinheiten: 1,
      bgf: 120,
      plotSize: 500,
      bri: 400,
      bebauungsplan: true,
      konform: true,
      denkmalschutz: false,
      ueberschwemmungsgebiet: false,
      holzbauweise: false,
      kellerGeplant: false,
      nearVibrationSource: false,
      heizungTyp: 'holz',
      hasFireplace: true,
      photovoltaik: false,
      stellplaetze: 1,
    };
    const result = classify('neubau', answers);
    const checklist = generateChecklist('neubau', MOCK_MUNICIPALITY, result, answers);
    const ids = checklist.sections.flatMap((s) => s.items.map((i) => i.id));
    expect(ids).toContain('G7');
  });

  it('G7 triggered when hasFireplace=true even with gas heating', () => {
    const answers: Answers = {
      hoehe: 6,
      anzahlGeschosse: 2,
      nutzungsart: 'wohnen',
      freistehend: true,
      nutzungseinheiten: 1,
      bgf: 120,
      plotSize: 500,
      bri: 400,
      bebauungsplan: true,
      konform: true,
      denkmalschutz: false,
      ueberschwemmungsgebiet: false,
      holzbauweise: false,
      kellerGeplant: false,
      nearVibrationSource: false,
      heizungTyp: 'gas',
      hasFireplace: true,
      erneuerbarEnergie: true,
      photovoltaik: false,
      stellplaetze: 1,
    };
    const result = classify('neubau', answers);
    const checklist = generateChecklist('neubau', MOCK_MUNICIPALITY, result, answers);
    const ids = checklist.sections.flatMap((s) => s.items.map((i) => i.id));
    expect(ids).toContain('G7');
  });
});
