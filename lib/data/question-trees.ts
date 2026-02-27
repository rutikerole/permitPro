import type { Question, ProjectTypeId, Answers } from '@/lib/assessment/types';

// ─── GROUP: buildingDetails ──────────────────────────────────────────────────

const Q_HOEHE: Question = {
  id: 'hoehe',
  inputType: 'number',
  labelKey: 'assessment.questions.hoehe.label',
  hintKey: 'assessment.questions.hoehe.hint',
  legalRef: '§2 Abs. 4 LBO BW',
  unit: 'm', min: 0, max: 200, step: 0.1,
  group: 'buildingDetails',
};

const Q_BESTAND_HOEHE: Question = {
  id: 'bestandHoehe',
  inputType: 'number',
  labelKey: 'assessment.questions.bestandHoehe.label',
  hintKey: 'assessment.questions.bestandHoehe.hint',
  legalRef: '§2 Abs. 4 LBO BW',
  unit: 'm', min: 0, max: 200, step: 0.1,
  group: 'buildingDetails',
};

const Q_NEUE_HOEHE: Question = {
  id: 'neueHoehe',
  inputType: 'number',
  labelKey: 'assessment.questions.neueHoehe.label',
  hintKey: 'assessment.questions.neueHoehe.hint',
  legalRef: '§2 Abs. 4 LBO BW',
  unit: 'm', min: 0, max: 200, step: 0.1,
  group: 'buildingDetails',
};

const Q_ANZAHL_GESCHOSSE: Question = {
  id: 'anzahlGeschosse',
  inputType: 'number',
  labelKey: 'assessment.questions.anzahlGeschosse.label',
  hintKey: 'assessment.questions.anzahlGeschosse.hint',
  legalRef: '§2 Abs. 4 LBO BW',
  unit: '', min: 1, max: 30, step: 1,
  group: 'buildingDetails',
};

const Q_NUTZUNGSART: Question = {
  id: 'nutzungsart',
  inputType: 'select',
  labelKey: 'assessment.questions.nutzungsart.label',
  legalRef: '§2 Abs. 4 Nr. 1 LBO BW',
  options: [
    { value: 'wohnen',    labelKey: 'assessment.questions.nutzungsart.wohnen'    },
    { value: 'gewerbe',   labelKey: 'assessment.questions.nutzungsart.gewerbe'   },
    { value: 'gemischt',  labelKey: 'assessment.questions.nutzungsart.gemischt'  },
    { value: 'sonderbau', labelKey: 'assessment.questions.nutzungsart.sonderbau' },
  ],
  group: 'buildingDetails',
};

const Q_NEUE_NUTZUNG: Question = {
  id: 'neueNutzung',
  inputType: 'select',
  labelKey: 'assessment.questions.neueNutzung.label',
  legalRef: '§50 Abs. 2 LBO BW',
  options: [
    { value: 'wohnen',    labelKey: 'assessment.questions.nutzungsart.wohnen'    },
    { value: 'gewerbe',   labelKey: 'assessment.questions.nutzungsart.gewerbe'   },
    { value: 'gemischt',  labelKey: 'assessment.questions.nutzungsart.gemischt'  },
    { value: 'sonderbau', labelKey: 'assessment.questions.nutzungsart.sonderbau' },
  ],
  group: 'buildingDetails',
};

const Q_FREISTEHEND: Question = {
  id: 'freistehend',
  inputType: 'boolean',
  labelKey: 'assessment.questions.freistehend.label',
  hintKey: 'assessment.questions.freistehend.hint',
  legalRef: '§2 Abs. 4 Nr. 1 LBO BW',
  group: 'buildingDetails',
  showIf: (a: Answers) => {
    const h = Number(a.hoehe ?? a.bestandHoehe ?? a.neueHoehe ?? 0);
    return h <= 7 && (a.nutzungsart === 'wohnen' || a.neueNutzung === 'wohnen');
  },
};

const Q_NUTZUNGSEINHEITEN: Question = {
  id: 'nutzungseinheiten',
  inputType: 'number',
  labelKey: 'assessment.questions.nutzungseinheiten.label',
  hintKey: 'assessment.questions.nutzungseinheiten.hint',
  legalRef: '§2 Abs. 4 Nr. 1 LBO BW',
  unit: '', min: 1, max: 999, step: 1,
  group: 'buildingDetails',
  showIf: (a: Answers) => {
    const h = Number(a.hoehe ?? a.bestandHoehe ?? a.neueHoehe ?? 0);
    return h <= 7;
  },
};

const Q_BGF: Question = {
  id: 'bgf',
  inputType: 'number',
  labelKey: 'assessment.questions.bgf.label',
  hintKey: 'assessment.questions.bgf.hint',
  legalRef: 'DIN 277',
  unit: 'm\u00b2', min: 1, max: 99999, step: 1,
  group: 'buildingDetails',
};

// ─── GROUP: zoningLegal ──────────────────────────────────────────────────────

const Q_BRI: Question = {
  id: 'bri',
  inputType: 'number',
  labelKey: 'assessment.questions.bri.label',
  hintKey: 'assessment.questions.bri.hint',
  legalRef: '§50 Abs. 1 LBO BW',
  unit: 'm\u00b3', min: 0, max: 99999, step: 1,
  group: 'zoningLegal',
};

const Q_ANBAU_BRI: Question = {
  id: 'anbauBri',
  inputType: 'number',
  labelKey: 'assessment.questions.anbauBri.label',
  hintKey: 'assessment.questions.anbauBri.hint',
  legalRef: '§50 Abs. 1 LBO BW',
  unit: 'm\u00b3', min: 0, max: 9999, step: 1,
  group: 'zoningLegal',
};

const Q_BEBAUUNGSPLAN: Question = {
  id: 'bebauungsplan',
  inputType: 'boolean',
  labelKey: 'assessment.questions.bebauungsplan.label',
  hintKey: 'assessment.questions.bebauungsplan.hint',
  legalRef: '§30 BauGB',
  group: 'zoningLegal',
};

const Q_KONFORM: Question = {
  id: 'konform',
  inputType: 'boolean',
  labelKey: 'assessment.questions.konform.label',
  hintKey: 'assessment.questions.konform.hint',
  legalRef: '§50 Abs. 1 LBO BW',
  group: 'zoningLegal',
  showIf: (a: Answers) => a.bebauungsplan === true,
};

const Q_DENKMALSCHUTZ: Question = {
  id: 'denkmalschutz',
  inputType: 'boolean',
  labelKey: 'assessment.questions.denkmalschutz.label',
  hintKey: 'assessment.questions.denkmalschutz.hint',
  legalRef: '§2 DSchG BW',
  group: 'zoningLegal',
};

const Q_UEBERSCHWEMMUNG: Question = {
  id: 'ueberschwemmungsgebiet',
  inputType: 'boolean',
  labelKey: 'assessment.questions.ueberschwemmungsgebiet.label',
  hintKey: 'assessment.questions.ueberschwemmungsgebiet.hint',
  legalRef: '§78 WHG',
  group: 'zoningLegal',
};

// ─── GROUP: specialConditions ────────────────────────────────────────────────

const Q_HOLZBAU: Question = {
  id: 'holzbauweise',
  inputType: 'boolean',
  labelKey: 'assessment.questions.holzbauweise.label',
  hintKey: 'assessment.questions.holzbauweise.hint',
  legalRef: '§26 Abs. 3 LBO BW',
  group: 'specialConditions',
};

const Q_KELLER: Question = {
  id: 'kellerGeplant',
  inputType: 'boolean',
  labelKey: 'assessment.questions.kellerGeplant.label',
  hintKey: 'assessment.questions.kellerGeplant.hint',
  legalRef: '§9 LBOVVO BW',
  group: 'specialConditions',
};

const Q_AUFZUG: Question = {
  id: 'aufzugGeplant',
  inputType: 'boolean',
  labelKey: 'assessment.questions.aufzugGeplant.label',
  hintKey: 'assessment.questions.aufzugGeplant.hint',
  legalRef: '§39 LBO BW',
  group: 'specialConditions',
  showIf: (a: Answers) => {
    const h = Number(a.hoehe ?? a.bestandHoehe ?? a.neueHoehe ?? 0);
    return h > 7 || Number(a.anzahlGeschosse ?? 0) >= 4;
  },
};

const Q_SCHADSTOFFE: Question = {
  id: 'schadstoffe',
  inputType: 'boolean',
  labelKey: 'assessment.questions.schadstoffe.label',
  hintKey: 'assessment.questions.schadstoffe.hint',
  legalRef: 'TRGS 519',
  group: 'specialConditions',
};

const Q_VIBRATION: Question = {
  id: 'nearVibrationSource',
  inputType: 'boolean',
  labelKey: 'assessment.questions.nearVibrationSource.label',
  hintKey: 'assessment.questions.nearVibrationSource.hint',
  legalRef: 'DIN 4150',
  group: 'specialConditions',
};

const Q_GRUNDSTUECK: Question = {
  id: 'plotSize',
  inputType: 'number',
  labelKey: 'assessment.questions.plotSize.label',
  hintKey: 'assessment.questions.plotSize.hint',
  legalRef: 'DWA-A 138',
  unit: 'm\u00b2', min: 0, max: 99999, step: 1,
  group: 'buildingDetails',
};

// ─── GROUP: technicalSystems ─────────────────────────────────────────────────

const Q_HEIZUNG: Question = {
  id: 'heizungTyp',
  inputType: 'select',
  labelKey: 'assessment.questions.heizungTyp.label',
  hintKey: 'assessment.questions.heizungTyp.hint',
  legalRef: 'GEG 2024',
  options: [
    { value: 'waermepumpe',  labelKey: 'assessment.questions.heizungTyp.waermepumpe'  },
    { value: 'fernwaerme',   labelKey: 'assessment.questions.heizungTyp.fernwaerme'   },
    { value: 'gas',          labelKey: 'assessment.questions.heizungTyp.gas'          },
    { value: 'holz',         labelKey: 'assessment.questions.heizungTyp.holz'         },
    { value: 'sonstige',     labelKey: 'assessment.questions.heizungTyp.sonstige'     },
  ],
  group: 'technicalSystems',
};

const Q_ERNEUERBAR: Question = {
  id: 'erneuerbarEnergie',
  inputType: 'boolean',
  labelKey: 'assessment.questions.erneuerbarEnergie.label',
  hintKey: 'assessment.questions.erneuerbarEnergie.hint',
  legalRef: 'EWärmeG BW',
  group: 'technicalSystems',
  showIf: (a: Answers) => a.heizungTyp === 'gas' || a.heizungTyp === 'sonstige',
};

const Q_FEUERSTAETTE: Question = {
  id: 'hasFireplace',
  inputType: 'boolean',
  labelKey: 'assessment.questions.hasFireplace.label',
  hintKey: 'assessment.questions.hasFireplace.hint',
  legalRef: '1. BImSchV',
  group: 'technicalSystems',
  showIf: (a: Answers) => a.heizungTyp === 'holz',
};

const Q_PHOTOVOLTAIK: Question = {
  id: 'photovoltaik',
  inputType: 'boolean',
  labelKey: 'assessment.questions.photovoltaik.label',
  hintKey: 'assessment.questions.photovoltaik.hint',
  legalRef: 'KlimaSchutzG BW',
  group: 'technicalSystems',
};

const Q_STELLPLAETZE: Question = {
  id: 'stellplaetze',
  inputType: 'number',
  labelKey: 'assessment.questions.stellplaetze.label',
  hintKey: 'assessment.questions.stellplaetze.hint',
  legalRef: '§37 LBO BW',
  unit: '', min: 0, max: 500, step: 1,
  group: 'technicalSystems',
};

// ─── Question trees per project type ──────────────────────────────────────

export const QUESTION_TREES: Record<ProjectTypeId, Question[]> = {
  neubau: [
    Q_HOEHE, Q_ANZAHL_GESCHOSSE, Q_NUTZUNGSART, Q_FREISTEHEND, Q_NUTZUNGSEINHEITEN, Q_BGF, Q_GRUNDSTUECK,
    Q_BRI, Q_BEBAUUNGSPLAN, Q_KONFORM, Q_DENKMALSCHUTZ, Q_UEBERSCHWEMMUNG,
    Q_HOLZBAU, Q_KELLER, Q_AUFZUG, Q_VIBRATION,
    Q_HEIZUNG, Q_ERNEUERBAR, Q_FEUERSTAETTE, Q_PHOTOVOLTAIK, Q_STELLPLAETZE,
  ],
  anbau: [
    Q_BESTAND_HOEHE, Q_ANZAHL_GESCHOSSE, Q_NUTZUNGSART, Q_FREISTEHEND, Q_NUTZUNGSEINHEITEN, Q_BGF,
    Q_ANBAU_BRI, Q_BEBAUUNGSPLAN, Q_KONFORM, Q_DENKMALSCHUTZ, Q_UEBERSCHWEMMUNG,
    Q_HOLZBAU, Q_AUFZUG, Q_VIBRATION,
    Q_HEIZUNG, Q_ERNEUERBAR, Q_FEUERSTAETTE, Q_PHOTOVOLTAIK, Q_STELLPLAETZE,
  ],
  aufstockung: [
    Q_BESTAND_HOEHE, Q_NEUE_HOEHE, Q_ANZAHL_GESCHOSSE, Q_NUTZUNGSART, Q_FREISTEHEND, Q_NUTZUNGSEINHEITEN, Q_BGF,
    Q_ANBAU_BRI, Q_BEBAUUNGSPLAN, Q_KONFORM, Q_DENKMALSCHUTZ,
    Q_HOLZBAU, Q_AUFZUG,
    Q_HEIZUNG, Q_ERNEUERBAR, Q_PHOTOVOLTAIK, Q_STELLPLAETZE,
  ],
  umbau: [
    Q_BESTAND_HOEHE, Q_ANZAHL_GESCHOSSE, Q_NUTZUNGSART, Q_FREISTEHEND, Q_NUTZUNGSEINHEITEN, Q_BGF,
    Q_BEBAUUNGSPLAN, Q_KONFORM, Q_DENKMALSCHUTZ,
    Q_HOLZBAU, Q_SCHADSTOFFE, Q_AUFZUG,
    Q_HEIZUNG, Q_ERNEUERBAR,
  ],
  nutzungsaenderung: [
    Q_NUTZUNGSART, Q_NEUE_NUTZUNG, Q_BESTAND_HOEHE, Q_FREISTEHEND, Q_NUTZUNGSEINHEITEN, Q_BGF,
    Q_BEBAUUNGSPLAN, Q_KONFORM, Q_DENKMALSCHUTZ,
    Q_HEIZUNG, Q_ERNEUERBAR, Q_STELLPLAETZE,
  ],
  abbruch: [
    Q_BESTAND_HOEHE, Q_NUTZUNGSART,
    Q_SCHADSTOFFE,
  ],
};

// ─── Utilities ─────────────────────────────────────────────────────────────

export function getVisibleQuestions(
  projectType: ProjectTypeId,
  answers: Answers,
): Question[] {
  return (QUESTION_TREES[projectType] ?? []).filter(
    (q) => !q.showIf || q.showIf(answers),
  );
}

export function getVisibleQuestionsForGroup(
  projectType: ProjectTypeId,
  answers: Answers,
  group: string,
): Question[] {
  return getVisibleQuestions(projectType, answers).filter((q) => q.group === group);
}

export function areQuestionsComplete(
  projectType: ProjectTypeId,
  answers: Answers,
): boolean {
  const visible = getVisibleQuestions(projectType, answers);
  return visible.every((q) => {
    const val = answers[q.id];
    if (val === undefined || val === null || val === '') return false;
    if (typeof val === 'number' && isNaN(val)) return false;
    return true;
  });
}

export function areGroupQuestionsComplete(
  projectType: ProjectTypeId,
  answers: Answers,
  group: string,
): boolean {
  const groupQs = getVisibleQuestionsForGroup(projectType, answers, group);
  return groupQs.every((q) => {
    const val = answers[q.id];
    if (val === undefined || val === null || val === '') return false;
    if (typeof val === 'number' && isNaN(val)) return false;
    return true;
  });
}
