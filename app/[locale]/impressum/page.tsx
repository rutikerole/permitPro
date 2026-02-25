import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPageLayout, LegalSection } from '@/components/layout/legal-page';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('impressum.title') };
}

export default async function ImpressumPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isDE = locale === 'de';

  return (
    <LegalPageLayout
      eyebrow={isDE ? 'RECHTLICHES' : 'LEGAL'}
      title={isDE ? 'Impressum' : 'Legal Notice'}
      backHref={`/${locale}`}
      backLabel={isDE ? 'Zurück zur Startseite' : 'Back to home'}
    >
      {isDE ? (
        <>
          <LegalSection title="Angaben gemäß § 5 TMG">
            <div className="space-y-0.5">
              <p className="font-medium text-white">PermitPro – Baurecht-Informationsdienst</p>
              <p>[Vorname Nachname]</p>
              <p>[Straße Hausnummer]</p>
              <p>[PLZ] [Stadt]</p>
              <p>Deutschland</p>
            </div>
          </LegalSection>

          <LegalSection title="Kontakt">
            <p>E-Mail: kontakt@permitpro.de</p>
          </LegalSection>

          <LegalSection title="Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV">
            <p>[Vorname Nachname], Anschrift wie oben</p>
          </LegalSection>

          <LegalSection title="Haftungsausschluss">
            <p>
              Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt und nach bestem
              Wissensstand erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
              Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir
              gemäß § 7 Abs. 1 TMG für eigene Inhalte nach den allgemeinen Gesetzen
              verantwortlich.
            </p>
            <p>
              Die generierten Checklisten stellen keine Rechtsberatung dar und ersetzen nicht
              die Beratung durch einen Rechtsanwalt oder die zuständige Baubehörde.
            </p>
          </LegalSection>

          <LegalSection title="Urheberrecht">
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
              unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung,
              Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
              bedürfen der schriftlichen Zustimmung des jeweiligen Autors.
            </p>
          </LegalSection>

          <LegalSection title="Externe Links">
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
              keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der
              jeweilige Anbieter verantwortlich.
            </p>
          </LegalSection>
        </>
      ) : (
        <>
          <LegalSection title="Information pursuant to § 5 TMG (German Telemedia Act)">
            <div className="space-y-0.5">
              <p className="font-medium text-white">PermitPro – Building Law Information Service</p>
              <p>[First name Last name]</p>
              <p>[Street, No.]</p>
              <p>[Postal Code] [City]</p>
              <p>Germany</p>
            </div>
          </LegalSection>

          <LegalSection title="Contact">
            <p>Email: contact@permitpro.de</p>
          </LegalSection>

          <LegalSection title="Person responsible for editorial content (§ 55 para. 2 RStV)">
            <p>[First name Last name], address as above</p>
          </LegalSection>

          <LegalSection title="Disclaimer">
            <p>
              The contents of this website have been created with the utmost care and to the
              best of our knowledge. However, we cannot assume any liability for the accuracy,
              completeness or topicality of the contents. As a service provider we are
              responsible for our own content on these pages in accordance with § 7 para. 1 TMG.
            </p>
            <p>
              The generated checklists do not constitute legal advice and do not replace
              consultation with a lawyer or the responsible building authority.
            </p>
          </LegalSection>

          <LegalSection title="Copyright">
            <p>
              The content and works on these pages created by the site operator are subject to
              German copyright law. Reproduction, editing, distribution and any kind of
              exploitation outside the limits of copyright law require the written consent of
              the respective author.
            </p>
          </LegalSection>

          <LegalSection title="External links">
            <p>
              Our website contains links to external third-party websites, the contents of which
              we have no influence over. We therefore accept no liability for this external
              content.
            </p>
          </LegalSection>
        </>
      )}
    </LegalPageLayout>
  );
}
