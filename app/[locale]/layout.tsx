import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const canonicalBase = `https://permitpro.de/${locale}`;
  const keywords = locale === 'de'
    ? 'Baugenehmigung, Bauantrag, Checkliste, LBO BW, BayBO, Baurecht, Baden-Württemberg, Bayern, Gebäudeklasse, Bauvoranfrage'
    : 'building permit, planning permission, checklist, LBO BW, BayBO, building regulations, Germany, Baden-Württemberg, Bavaria';

  return {
    title: {
      template: '%s | PermitPro',
      default: t('home.title'),
    },
    description: t('home.description'),
    keywords,
    alternates: {
      canonical: canonicalBase,
      languages: {
        de: '/de',
        en: '/en',
        'x-default': '/de',
      },
    },
    openGraph: {
      type: 'website',
      url: canonicalBase,
      locale: locale === 'de' ? 'de_DE' : 'en_GB',
      siteName: 'PermitPro',
      title: t('home.title'),
      description: t('home.description'),
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home.title'),
      description: t('home.description'),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
