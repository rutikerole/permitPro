import { describe, it, expect } from 'vitest';
import { generateChecklist } from '@/lib/assessment/checklist-gen';
import { classify } from '@/lib/assessment/classifier';
import type { Municipality } from '@/lib/assessment/types';

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

// ── generateChecklist shape tests ─────────────────────────────────────────

describe('generateChecklist — shape', () => {
  it('returns a valid GeneratedChecklist object', () => {
    const classification = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen', nutzungseinheiten: 1, freistehend: true });
    const result = generateChecklist('neubau', STUTTGART, classification);

    expect(result).toHaveProperty('sections');
    expect(result).toHaveProperty('totalItems');
    expect(result).toHaveProperty('classification');
    expect(result).toHaveProperty('municipality');
    expect(result).toHaveProperty('projectType');
    expect(result).toHaveProperty('generatedAt');
    expect(result.totalItems).toBe(result.sections.flatMap((s) => s.items).length);
  });

  it('sections are ordered A → J', () => {
    const classification = classify('neubau', { hoehe: 14, nutzungsart: 'wohnen' });
    const result = generateChecklist('neubau', STUTTGART, classification);

    const sectionIds = result.sections.map((s) => s.id);
    for (let i = 0; i < sectionIds.length - 1; i++) {
      expect(sectionIds[i] < sectionIds[i + 1]).toBe(true);
    }
  });

  it('totalItems equals sum of section items', () => {
    const classification = classify('neubau', { hoehe: 10, nutzungsart: 'wohnen' });
    const result = generateChecklist('neubau', STUTTGART, classification);

    const total = result.sections.reduce((acc, s) => acc + s.items.length, 0);
    expect(result.totalItems).toBe(total);
  });
});

// ── Abbruch filtering ──────────────────────────────────────────────────────

describe('generateChecklist — Abbruch (demolition)', () => {
  it('includes J-section items for abbruch project', () => {
    const classification = classify('abbruch', { bestandHoehe: 7 });
    const result = generateChecklist('abbruch', STUTTGART, classification);

    const ids = allItemIds(result);
    expect(ids.some((id) => id.startsWith('J'))).toBe(true);
  });

  it('excludes items not applicable to abbruch (e.g. B5 — neubau only)', () => {
    const classification = classify('abbruch', { bestandHoehe: 7 });
    const result = generateChecklist('abbruch', STUTTGART, classification);

    const ids = allItemIds(result);
    expect(ids).not.toContain('B5');
  });
});

// ── Sonderbau filtering ────────────────────────────────────────────────────

describe('generateChecklist — Sonderbau', () => {
  it('includes Sonderbau-only items (F5, F6, I1, I2, I3, I4) when isSonderbau', () => {
    const classification = classify('neubau', { hoehe: 4, nutzungsart: 'sonderbau' });
    const result = generateChecklist('neubau', STUTTGART, classification, { nutzungsart: 'sonderbau' });

    const ids = allItemIds(result);
    expect(ids).toContain('I1');
    expect(ids).toContain('I2');
    expect(ids).toContain('F5');
  });

  it('excludes Sonderbau-only items when not Sonderbau', () => {
    const classification = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen' });
    const result = generateChecklist('neubau', STUTTGART, classification);

    const ids = allItemIds(result);
    expect(ids).not.toContain('I1');
    expect(ids).not.toContain('F5');
    expect(ids).not.toContain('F6');
  });
});

// ── State filtering ────────────────────────────────────────────────────────

describe('generateChecklist — BY vs BW state filtering', () => {
  it('includes A1_BY for a BY municipality', () => {
    const classification = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen' }, MUENCHEN);
    const result = generateChecklist('neubau', MUENCHEN, classification);

    const ids = allItemIds(result);
    expect(ids).toContain('A1_BY');
  });

  it('excludes A1_BY for a BW municipality', () => {
    const classification = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen' }, STUTTGART);
    const result = generateChecklist('neubau', STUTTGART, classification);

    const ids = allItemIds(result);
    expect(ids).not.toContain('A1_BY');
  });

  it('includes A4_BY for a BY kenntnisgabe project', () => {
    const answers = { hoehe: 6, nutzungsart: 'wohnen', nutzungseinheiten: 1, freistehend: true, bebauungsplan: true, konform: true, bri: 500 };
    const classification = classify('neubau', answers, MUENCHEN);
    expect(classification.procedure).toBe('kenntnisgabe');
    const result = generateChecklist('neubau', MUENCHEN, classification, answers);

    const ids = allItemIds(result);
    expect(ids).toContain('A4_BY');
    expect(ids).not.toContain('A4'); // BW kenntnisgabe form should be absent for BY
  });
});

// ── BY legal reference remapping ───────────────────────────────────────────

describe('generateChecklist — BY legal ref remapping', () => {
  it('remaps §53 LBO BW → Art. 60 BayBO in item legalRefs for BY', () => {
    const classification = classify('neubau', { hoehe: 14, nutzungsart: 'wohnen' }, MUENCHEN);
    const result = generateChecklist('neubau', MUENCHEN, classification);

    const allRefs = result.sections.flatMap((s) => s.items.map((i) => i.legalRef));
    const hasBayRef = allRefs.some((ref) => ref.includes('BayBO') || ref.includes('BauVorlV BY'));
    expect(hasBayRef).toBe(true);
    // Should not contain raw BW references
    const hasRawBW = allRefs.some((ref) => ref.includes('LBO BW'));
    expect(hasRawBW).toBe(false);
  });

  it('does NOT remap refs for BW municipality', () => {
    const classification = classify('neubau', { hoehe: 14, nutzungsart: 'wohnen' }, STUTTGART);
    const result = generateChecklist('neubau', STUTTGART, classification);

    const allRefs = result.sections.flatMap((s) => s.items.map((i) => i.legalRef));
    const hasLBOBW = allRefs.some((ref) => ref.includes('LBO BW'));
    expect(hasLBOBW).toBe(true);
  });
});

// ── GK-based filtering ─────────────────────────────────────────────────────

describe('generateChecklist — building class filtering', () => {
  it('includes D3 (Prüfingenieur Standsicherheit) only for GK4/5', () => {
    const gk3Result = classify('neubau', { hoehe: 5, nutzungsart: 'gewerbe' });
    const gk3Checklist = generateChecklist('neubau', STUTTGART, gk3Result);
    const gk3Ids = allItemIds(gk3Checklist);
    expect(gk3Ids).not.toContain('D3');

    const gk5Result = classify('neubau', { hoehe: 14, nutzungsart: 'wohnen' });
    const gk5Checklist = generateChecklist('neubau', STUTTGART, gk5Result);
    const gk5Ids = allItemIds(gk5Checklist);
    expect(gk5Ids).toContain('D3');
  });

  it('includes D6 (Bewehrungsplan) only for GK4/5 normal procedure', () => {
    const gk5Result = classify('neubau', { hoehe: 14, nutzungsart: 'wohnen' });
    expect(gk5Result.procedure).toBe('normal');
    const gk5Checklist = generateChecklist('neubau', STUTTGART, gk5Result);
    expect(allItemIds(gk5Checklist)).toContain('D6');

    const gk2Result = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen', nutzungseinheiten: 1, freistehend: false });
    const gk2Checklist = generateChecklist('neubau', STUTTGART, gk2Result);
    expect(allItemIds(gk2Checklist)).not.toContain('D6');
  });
});

// ── showIfAnswer filtering ─────────────────────────────────────────────────

describe('generateChecklist — showIfAnswer conditional items', () => {
  it('includes E4 (PV) when photovoltaik=true', () => {
    const classification = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen' });
    const withPV = generateChecklist('neubau', STUTTGART, classification, { photovoltaik: true });
    expect(allItemIds(withPV)).toContain('E4');

    const withoutPV = generateChecklist('neubau', STUTTGART, classification, { photovoltaik: false });
    expect(allItemIds(withoutPV)).not.toContain('E4');
  });

  it('includes D7 (Holzbaustatik) when holzbauweise=true', () => {
    const classification = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen' });
    const withHolz = generateChecklist('neubau', STUTTGART, classification, { holzbauweise: true });
    expect(allItemIds(withHolz)).toContain('D7');

    const withoutHolz = generateChecklist('neubau', STUTTGART, classification, {});
    expect(allItemIds(withoutHolz)).not.toContain('D7');
  });

  it('includes G7 (chimney) when heizungTyp=gas or holz', () => {
    const classification = classify('neubau', { hoehe: 6, nutzungsart: 'wohnen' });

    const withGas = generateChecklist('neubau', STUTTGART, classification, { heizungTyp: 'gas' });
    expect(allItemIds(withGas)).toContain('G7');

    const withHolz = generateChecklist('neubau', STUTTGART, classification, { heizungTyp: 'holz' });
    expect(allItemIds(withHolz)).toContain('G7');

    const withHeatPump = generateChecklist('neubau', STUTTGART, classification, { heizungTyp: 'waermepumpe' });
    expect(allItemIds(withHeatPump)).not.toContain('G7');
  });
});

// ── Scenario A: Stuttgart GK3 BW ──────────────────────────────────────────

describe('Scenario A — Stuttgart GK3 BW (vereinfacht)', () => {
  const answers = { hoehe: 9, nutzungsart: 'wohnen', nutzungseinheiten: 6 };
  const classification = classify('neubau', answers, STUTTGART);
  const checklist = generateChecklist('neubau', STUTTGART, classification, answers);

  it('classifies as GK4 (h=9 → 7 < 9 ≤ 13)', () => {
    expect(classification.buildingClass).toBe('GK4');
    expect(classification.procedure).toBe('normal');
  });

  it('includes core forms: A1, A2, A3', () => {
    const ids = allItemIds(checklist);
    expect(ids).toContain('A1');
    expect(ids).toContain('A2');
    expect(ids).toContain('A3');
  });

  it('does not include BY-specific items', () => {
    const ids = allItemIds(checklist);
    expect(ids).not.toContain('A1_BY');
    expect(ids).not.toContain('A4_BY');
  });
});

// ── Scenario B: München GK5 BY ─────────────────────────────────────────────

describe('Scenario B — München GK5 BY (normal)', () => {
  const answers = { hoehe: 20, nutzungsart: 'wohnen' };
  const classification = classify('neubau', answers, MUENCHEN);
  const checklist = generateChecklist('neubau', MUENCHEN, classification, answers);

  it('classifies as GK5, normal procedure', () => {
    expect(classification.buildingClass).toBe('GK5');
    expect(classification.procedure).toBe('normal');
    expect(classification.legalRefs).toContain('Art. 60 BayBO');
  });

  it('includes BY-specific application form A1_BY', () => {
    expect(allItemIds(checklist)).toContain('A1_BY');
  });

  it('all legalRefs use BayBO (no LBO BW)', () => {
    const refs = checklist.sections.flatMap((s) => s.items.map((i) => i.legalRef));
    expect(refs.some((r) => r.includes('LBO BW'))).toBe(false);
  });
});
