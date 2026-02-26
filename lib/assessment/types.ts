// ─── Municipality ──────────────────────────────────────────────────────────

export type FederalState = 'BW' | 'BY';

export interface Municipality {
  id: string;
  name: string;
  landkreis: string;
  zip: string;
  hasBebaungsplan: boolean;
  state: FederalState;
}

// ─── Project Type ──────────────────────────────────────────────────────────

export type ProjectTypeId =
  | 'neubau'
  | 'anbau'
  | 'aufstockung'
  | 'umbau'
  | 'nutzungsaenderung'
  | 'abbruch';

export interface ProjectType {
  id: ProjectTypeId;
  iconName: string;
  legalRef: string;
  accentColor: 'amber' | 'blue';
}

// ─── Questions ─────────────────────────────────────────────────────────────

export type QuestionInputType = 'number' | 'select' | 'boolean';

export type QuestionGroup =
  | 'buildingDetails'
  | 'zoningLegal'
  | 'specialConditions'
  | 'technicalSystems';

export interface QuestionOption {
  value: string;
  labelKey: string;
}

export interface Question {
  id: string;
  inputType: QuestionInputType;
  labelKey: string;
  hintKey?: string;
  legalRef?: string;
  options?: QuestionOption[];
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  group?: QuestionGroup;
  showIf?: (answers: Answers) => boolean;
}

export type Answers = Record<string, string | number | boolean>;

// ─── Classification ────────────────────────────────────────────────────────

export type BuildingClass = 'GK1' | 'GK2' | 'GK3' | 'GK4' | 'GK5';

export type Procedure = 'kenntnisgabe' | 'vereinfacht' | 'normal';

export interface ClassificationResult {
  buildingClass: BuildingClass;
  procedure: Procedure;
  isSonderbau: boolean;
  legalRefs: string[];
}

// ─── Checklist ─────────────────────────────────────────────────────────────

export type ChecklistSectionId =
  | 'A' | 'B' | 'C' | 'D' | 'E'
  | 'F' | 'G' | 'H' | 'I' | 'J';

export type ProcedureApplicability = Procedure | 'all';

/** How critical this document is to the permit process */
export type ItemPriority = 'critical' | 'required' | 'conditional' | 'recommended';

/** Who is responsible for obtaining/preparing this document */
export type ItemProvider =
  | 'owner'       // Bauherr
  | 'architect'   // Architekt / Planer
  | 'structural'  // Tragwerksplaner
  | 'surveyor'    // Vermessungsingenieur
  | 'energy'      // Energieberater
  | 'fire'        // Brandschutzplaner
  | 'geo'         // Geotechniker
  | 'acoustic'    // Schallschutzgutachter
  | 'authority'   // Behörde / Gemeinde
  | 'specialist'; // Fachgutachter (Sonderbau etc.)

export type ItemStatus = 'missing' | 'in_progress' | 'available';

export interface ChecklistItem {
  id: string;
  sectionId: ChecklistSectionId;
  titleKey: string;
  descriptionKey?: string;
  /** Translation key for plain-language explanation of what this document is */
  whatIsThisKey?: string;
  /** Translation key for the single most important pro tip */
  tipsKey?: string;
  legalRef: string;
  /** XBau message identifier per XBau 2.3 spec */
  xbauTag?: string;
  /** XBau specification section reference */
  xbauSection?: string;
  /** ProjektDaten.xlsx row identifier */
  projektDatenId?: string;
  priority: ItemPriority;
  providers: ItemProvider[];
  /** Estimated professional fees or official charges in EUR */
  costRange?: { min: number; max: number };
  /** Realistic time to obtain, in weeks */
  timeWeeks?: { min: number; max: number };
  /** Number of copies typically required by the building authority */
  copies?: number;
  /** Paper size, scale, folding, or format requirements */
  formatRequirements?: string;
  /** IDs of checklist items that should be completed first */
  dependencies?: string[];
  applicableProcedures: ProcedureApplicability[];
  applicableClasses?: BuildingClass[];
  applicableProjectTypes?: ProjectTypeId[];
  /** If set, item only applies to these federal states (omit = applies to all states) */
  applicableStates?: FederalState[];
  sonderbauOnly?: boolean;
  required: boolean;
  /** If set, item is only shown when this answer condition is met */
  showIfAnswer?: { questionId: string; value: string | boolean | number } | ((answers: Answers) => boolean);
}

export interface ChecklistSection {
  id: ChecklistSectionId;
  items: ChecklistItem[];
}

export interface RelevanceReason {
  de: string;
  en: string;
}

export interface ExcludedItem {
  item: ChecklistItem;
  reason: RelevanceReason;
}

export interface GeneratedChecklist {
  sections: ChecklistSection[];
  totalItems: number;
  classification: ClassificationResult;
  municipality: Municipality;
  projectType: ProjectTypeId;
  answers: Answers;
  generatedAt: string;
  excludedItems: ExcludedItem[];
}

// ─── History ───────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  result: GeneratedChecklist;
}

// ─── Wizard ────────────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4;
