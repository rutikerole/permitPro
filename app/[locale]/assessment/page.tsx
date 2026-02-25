import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WizardShell } from '@/components/assessment/wizard-shell';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: t('assessment.title'),
    description: t('assessment.description'),
    openGraph: {
      title: t('assessment.title'),
      description: t('assessment.description'),
      url: `/${locale}/assessment`,
    },
  };
}

export default function AssessmentPage() {
  return (
    <main className="bg-canvas min-h-screen">
      <WizardShell />
    </main>
  );
}
