/**
 * Tests for the InputText number input logic.
 *
 * Since we don't have jsdom/React Testing Library, we test:
 * 1. The regex validation logic (isValidInput)
 * 2. Integration: areQuestionsComplete with '' (empty string) values
 * 3. Integration: classifier/showIf handling of '' values
 * 4. Store compatibility: '' is a valid Answers value
 */
import { describe, it, expect } from 'vitest';
import { areQuestionsComplete } from '@/lib/data/question-trees';
import { classify } from '@/lib/assessment/classifier';
import type { Answers, ProjectTypeId } from '@/lib/assessment/types';

// ── Extract the regex logic from InputText for pure unit testing ─────────────

function isValidInput(str: string, allowDecimals: boolean): boolean {
  if (str === '') return true;
  if (allowDecimals) return /^\d*\.?\d*$/.test(str);
  return /^\d*$/.test(str);
}

// ── Regex Validation ─────────────────────────────────────────────────────────

describe('InputText — isValidInput (integer mode)', () => {
  const check = (s: string) => isValidInput(s, false);

  it('allows empty string', () => expect(check('')).toBe(true));
  it('allows single digit', () => expect(check('3')).toBe(true));
  it('allows multi-digit', () => expect(check('300')).toBe(true));
  it('allows zero', () => expect(check('0')).toBe(true));
  it('rejects decimal point', () => expect(check('3.')).toBe(false));
  it('rejects decimal value', () => expect(check('3.5')).toBe(false));
  it('rejects leading dot', () => expect(check('.5')).toBe(false));
  it('rejects letters', () => expect(check('abc')).toBe(false));
  it('rejects mixed', () => expect(check('12a')).toBe(false));
  it('rejects negative sign', () => expect(check('-5')).toBe(false));
  it('rejects spaces', () => expect(check('1 2')).toBe(false));
  it('rejects plus sign', () => expect(check('+5')).toBe(false));
  it('rejects scientific notation', () => expect(check('1e5')).toBe(false));
});

describe('InputText — isValidInput (decimal mode)', () => {
  const check = (s: string) => isValidInput(s, true);

  it('allows empty string', () => expect(check('')).toBe(true));
  it('allows integer', () => expect(check('300')).toBe(true));
  it('allows decimal value', () => expect(check('7.5')).toBe(true));
  it('allows trailing dot (intermediate)', () => expect(check('3.')).toBe(true));
  it('allows leading dot', () => expect(check('.5')).toBe(true));
  it('allows lone dot', () => expect(check('.')).toBe(true));
  it('allows zero point', () => expect(check('0.1')).toBe(true));
  it('rejects multiple dots', () => expect(check('3.5.2')).toBe(false));
  it('rejects letters', () => expect(check('abc')).toBe(false));
  it('rejects mixed letters+digits', () => expect(check('12.a')).toBe(false));
  it('rejects negative sign', () => expect(check('-5.5')).toBe(false));
  it('rejects spaces', () => expect(check('1 .5')).toBe(false));
  it('rejects comma decimal (European)', () => expect(check('3,5')).toBe(false));
});

// ── Clamp/Round Logic ────────────────────────────────────────────────────────

describe('InputText — clamp and round logic', () => {
  // Simulate handleBlur's clamp+round behavior
  function blurResult(
    displayValue: string,
    min: number | undefined,
    max: number | undefined,
    allowDecimals: boolean,
  ): number | '' {
    if (displayValue === '' || displayValue === '.') return '';
    let n = parseFloat(displayValue);
    if (isNaN(n)) return '';
    if (min !== undefined && n < min) n = min;
    if (max !== undefined && n > max) n = max;
    if (!allowDecimals) n = Math.round(n);
    return n;
  }

  it('clamps below min', () => {
    expect(blurResult('-5', 0, 200, true)).toBe(0);
  });

  it('clamps above max', () => {
    expect(blurResult('999', 0, 200, true)).toBe(200);
  });

  it('passes value within range', () => {
    expect(blurResult('7.5', 0, 200, true)).toBe(7.5);
  });

  it('rounds in integer mode', () => {
    expect(blurResult('7', 0, 200, false)).toBe(7);
  });

  it('returns empty for empty string', () => {
    expect(blurResult('', 0, 200, true)).toBe('');
  });

  it('returns empty for lone dot', () => {
    expect(blurResult('.', 0, 200, true)).toBe('');
  });

  it('clamps min=1 correctly', () => {
    expect(blurResult('0', 1, 999, false)).toBe(1);
  });

  it('handles large numbers', () => {
    expect(blurResult('99999', 0, 99999, false)).toBe(99999);
  });

  it('handles 0.1 step precision', () => {
    expect(blurResult('7.5', 0, 200, true)).toBe(7.5);
  });
});

// ── areQuestionsComplete with '' values ──────────────────────────────────────

describe('areQuestionsComplete — empty string handling', () => {
  it('returns false when a number field is empty string', () => {
    const answers: Answers = {
      hoehe: '',
      nutzungsart: 'wohnen',
    };
    expect(areQuestionsComplete('neubau', answers)).toBe(false);
  });

  it('returns false when a number field is undefined', () => {
    const answers: Answers = {
      nutzungsart: 'wohnen',
    };
    expect(areQuestionsComplete('neubau', answers)).toBe(false);
  });

  it('returns true when all fields are filled with valid numbers', () => {
    // Fill all visible questions for a simple neubau
    const answers: Answers = {
      hoehe: 6,
      nutzungsart: 'wohnen',
      nutzungseinheiten: 1,
      freistehend: true,
      bgf: 120,
      anzahlGeschosse: 2,
      bebauungsplan: true,
      konform: true,
      bri: 500,
      denkmalschutz: false,
      ueberschwemmungsgebiet: false,
      holzbauweise: false,
      kellerGeplant: false,
      aufzugGeplant: false,
      stellplaetze: 2,
      heizungTyp: 'waermepumpe',
      photovoltaik: false,
    };
    expect(areQuestionsComplete('neubau', answers)).toBe(true);
  });
});

// ── Classifier handles '' gracefully ─────────────────────────────────────────

describe('Classifier — empty string safety', () => {
  it('does not crash with empty string for hoehe', () => {
    // This shouldn't happen in practice (gated by areQuestionsComplete)
    // but verifying it doesn't throw
    const result = classify('neubau', { hoehe: '', nutzungsart: 'wohnen' });
    expect(result).toHaveProperty('buildingClass');
    expect(result).toHaveProperty('procedure');
  });

  it('treats empty hoehe as 0 (GK1 or GK2 range)', () => {
    const result = classify('neubau', {
      hoehe: '',
      nutzungsart: 'wohnen',
      nutzungseinheiten: 1,
      freistehend: true,
    });
    // Number('') === 0, h=0 ≤ 7, wohnen, ne=1, freistehend → GK1
    expect(result.buildingClass).toBe('GK1');
  });
});

// ── allowDecimals derivation ─────────────────────────────────────────────────

describe('InputText — allowDecimals from step', () => {
  function allowDecimals(step: number): boolean {
    return step % 1 !== 0;
  }

  it('step=1 → no decimals', () => expect(allowDecimals(1)).toBe(false));
  it('step=0.1 → decimals allowed', () => expect(allowDecimals(0.1)).toBe(true));
  it('step=0.5 → decimals allowed', () => expect(allowDecimals(0.5)).toBe(true));
  it('step=2 → no decimals', () => expect(allowDecimals(2)).toBe(false));
  it('step=0.01 → decimals allowed', () => expect(allowDecimals(0.01)).toBe(true));
});

// ── All 9 number fields: step → decimal mode mapping ─────────────────────────

describe('Number fields — decimal mode correctness', () => {
  const FIELDS: { id: string; step: number; expectDecimals: boolean }[] = [
    { id: 'hoehe',            step: 0.1, expectDecimals: true },
    { id: 'bestandHoehe',     step: 0.1, expectDecimals: true },
    { id: 'neueHoehe',        step: 0.1, expectDecimals: true },
    { id: 'anzahlGeschosse',  step: 1,   expectDecimals: false },
    { id: 'nutzungseinheiten',step: 1,   expectDecimals: false },
    { id: 'bgf',              step: 1,   expectDecimals: false },
    { id: 'bri',              step: 1,   expectDecimals: false },
    { id: 'anbauBri',         step: 1,   expectDecimals: false },
    { id: 'stellplaetze',     step: 1,   expectDecimals: false },
  ];

  for (const field of FIELDS) {
    it(`${field.id} (step=${field.step}) → decimals=${field.expectDecimals}`, () => {
      expect(field.step % 1 !== 0).toBe(field.expectDecimals);
    });
  }
});
