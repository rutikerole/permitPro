import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/layout/navbar';
import { HeroSection } from '@/components/marketing/hero-section';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { KeyBenefits } from '@/components/marketing/key-benefits';
import { SupportedRegions } from '@/components/marketing/supported-regions';
import { WhoIsItFor } from '@/components/marketing/who-is-it-for';
import { TrustSecurity } from '@/components/marketing/trust-security';
import { Faq } from '@/components/marketing/faq';
import { CtaSection } from '@/components/marketing/cta-section';
import { Footer } from '@/components/layout/footer';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    title: { absolute: t('home.title') },
    description: t('home.description'),
    openGraph: {
      title: t('home.title'),
      description: t('home.description'),
      url: `/${locale}`,
    },
  };
}

export default function LandingPage() {
  return (
    <main className="bg-canvas min-h-screen">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <KeyBenefits />
      <SupportedRegions />
      <WhoIsItFor />
      <TrustSecurity />
      <Faq />
      <CtaSection />
      <Footer />
    </main>
  );
}
