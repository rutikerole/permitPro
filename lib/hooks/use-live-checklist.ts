'use client';

import { useEffect, useRef, useState } from 'react';
import { useAssessmentStore } from '@/store/assessment-store';
import { classify } from '@/lib/assessment/classifier';
import { generateChecklist } from '@/lib/assessment/checklist-gen';
import type { GeneratedChecklist } from '@/lib/assessment/types';

/**
 * Reactively computes a GeneratedChecklist from the current Zustand store state.
 * Debounced by `debounceMs` so typing in number inputs doesn't trigger excessive recomputes.
 * Returns null when municipality or projectType are not yet selected.
 */
export function useLiveChecklist(debounceMs = 200): GeneratedChecklist | null {
  const municipality = useAssessmentStore((s) => s.municipality);
  const projectType  = useAssessmentStore((s) => s.projectType);
  const answers      = useAssessmentStore((s) => s.answers);

  const [checklist, setChecklist] = useState<GeneratedChecklist | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!municipality || !projectType) {
      setChecklist(null);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      try {
        const classification = classify(projectType, answers, municipality);
        const result = generateChecklist(projectType, municipality, classification, answers);
        setChecklist(result);
      } catch {
        // Silently ignore errors during partial/incomplete answer state
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [municipality, projectType, answers, debounceMs]);

  return checklist;
}
