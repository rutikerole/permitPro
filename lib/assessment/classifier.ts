import type {
  Answers,
  BuildingClass,
  ClassificationResult,
  FederalState,
  Municipality,
  Procedure,
  ProjectTypeId,
} from '@/lib/assessment/types';

function getHeight(projectType: ProjectTypeId, answers: Answers): number {
  if (projectType === 'neubau') return Number(answers.hoehe ?? 0);
  // For Aufstockung, use neueHoehe (planned height after adding storeys), else bestandHoehe
  if (projectType === 'aufstockung') return Number(answers.neueHoehe ?? answers.bestandHoehe ?? 0);
  return Number(answers.bestandHoehe ?? 0);
}

function isSonderbauCheck(projectType: ProjectTypeId, answers: Answers): boolean {
  if (projectType === 'nutzungsaenderung') {
    return answers.neueNutzung === 'sonderbau';
  }
  return answers.nutzungsart === 'sonderbau';
}

function determineBuildingClass(
  projectType: ProjectTypeId,
  answers: Answers,
): BuildingClass {
  if (isSonderbauCheck(projectType, answers)) return 'GK5';

  const height = getHeight(projectType, answers);

  if (height > 13) return 'GK5';
  if (height > 7)  return 'GK4';

  const nutzungsart =
    projectType === 'nutzungsaenderung'
      ? String(answers.neueNutzung ?? answers.nutzungsart ?? '')
      : String(answers.nutzungsart ?? '');
  if (nutzungsart !== 'wohnen') return 'GK3';

  const ne = Number(answers.nutzungseinheiten ?? 1);
  if (ne > 2) return 'GK3';

  const freistehend = answers.freistehend === true;
  if (freistehend) return 'GK1';
  return 'GK2';
}

function determineProcedure(
  buildingClass: BuildingClass,
  sonderbau: boolean,
  projectType: ProjectTypeId,
  answers: Answers,
): Procedure {
  if (sonderbau) return 'normal';
  if (buildingClass === 'GK4' || buildingClass === 'GK5') return 'normal';

  const gkEligible = buildingClass === 'GK1' || buildingClass === 'GK2';
  const typeEligible = projectType === 'neubau' || projectType === 'anbau' || projectType === 'aufstockung';
  const inBP = answers.bebauungsplan === true;
  const konform = answers.konform === true;
  const bri = Number(answers.bri ?? answers.anbauBri ?? Infinity);

  if (gkEligible && typeEligible && inBP && konform && bri <= 1500) {
    return 'kenntnisgabe';
  }

  return 'vereinfacht';
}

function getLegalRefs(procedure: Procedure, state: FederalState): string[] {
  if (state === 'BY') {
    const refs = ['Art. 2 Abs. 3 BayBO'];
    if (procedure === 'kenntnisgabe') refs.push('Art. 58 BayBO');
    if (procedure === 'vereinfacht')  refs.push('Art. 59 BayBO');
    if (procedure === 'normal')       refs.push('Art. 60 BayBO');
    return refs;
  }
  const refs = ['§2 Abs. 4 LBO BW'];
  if (procedure === 'kenntnisgabe') refs.push('§50 LBO BW');
  if (procedure === 'vereinfacht')  refs.push('§52 LBO BW');
  if (procedure === 'normal')       refs.push('§53 LBO BW');
  return refs;
}

export function classify(
  projectType: ProjectTypeId,
  answers: Answers,
  municipality?: Municipality,
): ClassificationResult {
  const state: FederalState = municipality?.state ?? 'BW';
  const sonderbau = isSonderbauCheck(projectType, answers);
  const buildingClass = determineBuildingClass(projectType, answers);
  const procedure = determineProcedure(buildingClass, sonderbau, projectType, answers);
  const legalRefs = getLegalRefs(procedure, state);

  return {
    buildingClass,
    procedure,
    isSonderbau: sonderbau,
    legalRefs,
  };
}
