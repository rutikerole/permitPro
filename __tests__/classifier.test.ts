import { describe, it, expect } from 'vitest';
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

// ── Building class tests ───────────────────────────────────────────────────

describe('determineBuildingClass', () => {
  it('returns GK1 for free-standing single-family home ≤7 m', () => {
    const result = classify('neubau', {
      hoehe: 6,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 1,
      freistehend: true,
    });
    expect(result.buildingClass).toBe('GK1');
  });

  it('returns GK2 for attached single-family home ≤7 m', () => {
    const result = classify('neubau', {
      hoehe: 7,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 2,
      freistehend: false,
    });
    expect(result.buildingClass).toBe('GK2');
  });

  it('returns GK3 for >2 Nutzungseinheiten even at low height', () => {
    const result = classify('neubau', {
      hoehe: 5,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 3,
      freistehend: false,
    });
    expect(result.buildingClass).toBe('GK3');
  });

  it('returns GK3 for non-residential at low height', () => {
    const result = classify('neubau', {
      hoehe: 6,
      nutzungsart: 'gewerbe',
    });
    expect(result.buildingClass).toBe('GK3');
  });

  it('returns GK4 for height 7 < h ≤ 13 m', () => {
    const result = classify('neubau', {
      hoehe: 10,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 1,
      freistehend: true,
    });
    expect(result.buildingClass).toBe('GK4');
  });

  it('returns GK5 for height > 13 m', () => {
    const result = classify('neubau', {
      hoehe: 14,
      nutzungsart: 'wohnen',
    });
    expect(result.buildingClass).toBe('GK5');
  });

  it('returns GK5 for Sonderbau regardless of height', () => {
    const result = classify('neubau', {
      hoehe: 4,
      nutzungsart: 'sonderbau',
    });
    expect(result.buildingClass).toBe('GK5');
    expect(result.isSonderbau).toBe(true);
  });

  it('uses neueHoehe for Aufstockung', () => {
    const result = classify('aufstockung', {
      bestandHoehe: 5,
      neueHoehe: 15,
      nutzungsart: 'wohnen',
    });
    expect(result.buildingClass).toBe('GK5');
  });

  it('falls back to bestandHoehe for Aufstockung when neueHoehe absent', () => {
    const result = classify('aufstockung', {
      bestandHoehe: 6,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 1,
      freistehend: true,
    });
    expect(result.buildingClass).toBe('GK1');
  });
});

// ── Procedure tests ────────────────────────────────────────────────────────

describe('determineProcedure', () => {
  it('returns kenntnisgabe for GK1 neubau in B-Plan, konform, BRI ≤1500', () => {
    const result = classify('neubau', {
      hoehe: 6,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 1,
      freistehend: true,
      bebauungsplan: true,
      konform: true,
      bri: 800,
    });
    expect(result.procedure).toBe('kenntnisgabe');
  });

  it('returns vereinfacht for GK1 neubau when BRI > 1500', () => {
    const result = classify('neubau', {
      hoehe: 6,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 1,
      freistehend: true,
      bebauungsplan: true,
      konform: true,
      bri: 2000,
    });
    expect(result.procedure).toBe('vereinfacht');
  });

  it('returns vereinfacht for GK1 neubau without B-Plan', () => {
    const result = classify('neubau', {
      hoehe: 6,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 1,
      freistehend: true,
      bebauungsplan: false,
      konform: true,
      bri: 800,
    });
    expect(result.procedure).toBe('vereinfacht');
  });

  it('returns normal for GK4', () => {
    const result = classify('neubau', {
      hoehe: 10,
      nutzungsart: 'wohnen',
    });
    expect(result.procedure).toBe('normal');
  });

  it('returns normal for GK5', () => {
    const result = classify('neubau', {
      hoehe: 14,
      nutzungsart: 'wohnen',
    });
    expect(result.procedure).toBe('normal');
  });

  it('returns normal for Sonderbau', () => {
    const result = classify('neubau', {
      hoehe: 4,
      nutzungsart: 'sonderbau',
    });
    expect(result.procedure).toBe('normal');
  });

  it('returns vereinfacht for GK3 (no kenntnisgabe eligibility)', () => {
    const result = classify('neubau', {
      hoehe: 5,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 3,
      bebauungsplan: true,
      konform: true,
      bri: 500,
    });
    expect(result.procedure).toBe('vereinfacht');
  });
});

// ── Legal references ────────────────────────────────────────────────────────

describe('getLegalRefs', () => {
  it('includes BW kenntnisgabe ref for BW municipality', () => {
    const result = classify(
      'neubau',
      { hoehe: 6, nutzungsart: 'wohnen', nutzungseinheiten: 1, freistehend: true, bebauungsplan: true, konform: true, bri: 500 },
      STUTTGART,
    );
    expect(result.legalRefs).toContain('§50 LBO BW');
    expect(result.legalRefs).toContain('§2 Abs. 4 LBO BW');
  });

  it('includes BY kenntnisgabe ref (Art. 58) for BY municipality', () => {
    const result = classify(
      'neubau',
      { hoehe: 6, nutzungsart: 'wohnen', nutzungseinheiten: 1, freistehend: true, bebauungsplan: true, konform: true, bri: 500 },
      MUENCHEN,
    );
    expect(result.legalRefs).toContain('Art. 58 BayBO');
    expect(result.legalRefs).toContain('Art. 2 Abs. 3 BayBO');
    expect(result.legalRefs).not.toContain('§50 LBO BW');
  });

  it('includes BY normal procedure ref (Art. 60) for GK5 BY project', () => {
    const result = classify(
      'neubau',
      { hoehe: 15, nutzungsart: 'wohnen' },
      MUENCHEN,
    );
    expect(result.legalRefs).toContain('Art. 60 BayBO');
  });

  it('defaults to BW when municipality is undefined', () => {
    const result = classify('neubau', {
      hoehe: 14,
      nutzungsart: 'wohnen',
    });
    expect(result.legalRefs).toContain('§53 LBO BW');
    expect(result.legalRefs).not.toContain('Art. 60 BayBO');
  });
});

// ── Nutzungsänderung edge case ─────────────────────────────────────────────

describe('classify — Nutzungsänderung', () => {
  it('marks isSonderbau=true when neueNutzung=sonderbau', () => {
    const result = classify('nutzungsaenderung', {
      bestandHoehe: 5,
      neueNutzung: 'sonderbau',
    });
    expect(result.isSonderbau).toBe(true);
    expect(result.buildingClass).toBe('GK5');
    expect(result.procedure).toBe('normal');
  });

  it('uses neueNutzung for class determination', () => {
    const result = classify('nutzungsaenderung', {
      bestandHoehe: 5,
      neueNutzung: 'gewerbe',
    });
    expect(result.buildingClass).toBe('GK3');
  });
});
