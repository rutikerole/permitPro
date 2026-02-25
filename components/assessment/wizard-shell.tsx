'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessmentStore } from '@/store/assessment-store';
import { MUNICIPALITIES } from '@/lib/data/municipalities';
import { classify } from '@/lib/assessment/classifier';
import { generateChecklist } from '@/lib/assessment/checklist-gen';
import type { ProjectTypeId, Answers } from '@/lib/assessment/types';
import { StepIndicator } from './step-indicator';
import { Step1Municipality } from './step1-municipality';
import { Step2ProjectType } from './step2-project-type';
import { Step3Questions } from './step3-questions';
import { Step4Results } from './step4-results';

const stepVariants = {
  enter:  { opacity: 0, y: 12, scale: 0.99 },
  center: { opacity: 1, y: 0,  scale: 1    },
  exit:   { opacity: 0, y: -6, scale: 0.99 },
};

export function WizardShell() {
  const { currentStep, setResult } = useAssessmentStore();

  // Decode ?share=<base64> on mount and restore the result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    if (!shareParam) return;
    try {
      const { m, p, a } = JSON.parse(atob(shareParam)) as {
        m: string;
        p: ProjectTypeId;
        a: Answers;
      };
      const muni = MUNICIPALITIES.find((x) => x.id === m);
      if (muni && p) {
        const classification = classify(p, a ?? {}, muni);
        const checklist = generateChecklist(p, muni, classification, a ?? {});
        setResult(checklist);
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // invalid share param — ignore silently
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <StepIndicator />

      {/* Full-width — each step controls its own layout */}
      <div className="flex-1 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.8 }}
            className="h-full"
          >
            {currentStep === 1 && <Step1Municipality />}
            {currentStep === 2 && <Step2ProjectType />}
            {currentStep === 3 && <Step3Questions />}
            {currentStep === 4 && <Step4Results />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
