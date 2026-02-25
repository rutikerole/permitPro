'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Municipality,
  ProjectTypeId,
  Answers,
  GeneratedChecklist,
  HistoryEntry,
  ItemStatus,
  WizardStep,
} from '@/lib/assessment/types';

interface AssessmentState {
  currentStep: WizardStep;
  municipality: Municipality | null;
  projectType: ProjectTypeId | null;
  answers: Answers;
  result: GeneratedChecklist | null;
  /** Legacy — kept for PDF/export read compatibility; use itemStatuses for display */
  checkedItems: Set<string>;
  /** 3-state status: items not present = 'missing' */
  itemStatuses: Record<string, ItemStatus>;
  history: HistoryEntry[];
}

interface AssessmentActions {
  setMunicipality: (municipality: Municipality) => void;
  setProjectType: (id: ProjectTypeId) => void;
  setAnswer: (questionId: string, value: string | number | boolean) => void;
  setResult: (result: GeneratedChecklist) => void;
  /** Cycles item status: missing → in_progress → available → missing */
  cycleItemStatus: (itemId: string) => void;
  /** Legacy toggle kept for backward compat */
  toggleCheckedItem: (itemId: string) => void;
  restoreFromHistory: (entry: HistoryEntry) => void;
  goBack: () => void;
  reset: () => void;
}

const initialState: AssessmentState = {
  currentStep: 1,
  municipality: null,
  projectType: null,
  answers: {},
  result: null,
  checkedItems: new Set<string>(),
  itemStatuses: {},
  history: [],
};

export const useAssessmentStore = create<AssessmentState & AssessmentActions>()(
  persist(
    immer((set) => ({
      ...initialState,

      setMunicipality: (municipality) =>
        set((state) => {
          state.municipality = municipality;
          state.currentStep = 2;
        }),

      setProjectType: (id) =>
        set((state) => {
          state.projectType = id;
          state.answers = {};
          state.currentStep = 3;
        }),

      setAnswer: (questionId, value) =>
        set((state) => {
          state.answers[questionId] = value;
        }),

      cycleItemStatus: (itemId) =>
        set((state) => {
          const current: ItemStatus = state.itemStatuses[itemId] ?? 'missing';
          const next: ItemStatus =
            current === 'missing'     ? 'in_progress' :
            current === 'in_progress' ? 'available'   : 'missing';
          if (next === 'missing') {
            delete state.itemStatuses[itemId];
            state.checkedItems.delete(itemId);
          } else {
            state.itemStatuses[itemId] = next;
            if (next === 'available') state.checkedItems.add(itemId);
            else state.checkedItems.delete(itemId);
          }
        }),

      setResult: (result) =>
        set((state) => {
          state.result = result;
          state.checkedItems = new Set<string>();
          state.itemStatuses = {};
          state.currentStep = 4;
          // Prepend to history, keep last 5
          const entry: HistoryEntry = { id: Date.now().toString(), result };
          state.history = [entry, ...state.history].slice(0, 5);
        }),

      toggleCheckedItem: (itemId) =>
        set((state) => {
          if (state.checkedItems.has(itemId)) {
            state.checkedItems.delete(itemId);
          } else {
            state.checkedItems.add(itemId);
          }
        }),

      restoreFromHistory: (entry) =>
        set((state) => {
          state.municipality  = entry.result.municipality;
          state.projectType   = entry.result.projectType;
          state.result        = entry.result;
          state.checkedItems  = new Set<string>();
          state.itemStatuses  = {};
          state.currentStep   = 4;
        }),

      goBack: () =>
        set((state) => {
          if (state.currentStep > 1) {
            state.currentStep = (state.currentStep - 1) as WizardStep;
          }
        }),

      reset: () =>
        set((state) => {
          state.currentStep = 1;
          state.municipality = null;
          state.projectType = null;
          state.answers = {};
          state.result = null;
          state.checkedItems = new Set<string>();
          state.itemStatuses = {};
          // history is intentionally preserved across resets
        }),
    })),
    {
      name: 'permitpro-assessment',
      version: 3, // bump when checklist item schema changes — clears stale stored results
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentStep:  state.currentStep,
        municipality: state.municipality,
        projectType:  state.projectType,
        answers:      state.answers,
        result:       state.result,
        checkedItems: [...(state.checkedItems ?? [])],
        itemStatuses: state.itemStatuses ?? {},
        history:      state.history,
      }),
      migrate: (_persisted, _version) => {
        // On any version mismatch, drop stored results/history (they use the old schema)
        // but keep municipality, projectType, and answers so the user doesn't lose their progress
        const p = _persisted as Partial<AssessmentState & { checkedItems: string[] }>;
        return {
          currentStep:  p.result ? 1 : (p.currentStep ?? 1),
          municipality: p.municipality ?? null,
          projectType:  p.projectType ?? null,
          answers:      p.answers ?? {},
          result:       null,
          checkedItems: [],
          itemStatuses: {},
          history:      [],
        };
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<AssessmentState & { checkedItems: string[]; itemStatuses: Record<string, ItemStatus> }>;
        return {
          ...current,
          ...p,
          checkedItems: new Set<string>(p?.checkedItems ?? []),
          itemStatuses: p?.itemStatuses ?? {},
          history: p?.history ?? [],
        };
      },
    },
  ),
);
