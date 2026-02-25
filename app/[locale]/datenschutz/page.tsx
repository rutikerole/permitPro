import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LegalPageLayout, LegalSection } from '@/components/layout/legal-page';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return { title: t('datenschutz.title') };
}

export default async function DatenschutzPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isDE = locale === 'de';

  return (
    <LegalPageLayout
      eyebrow={isDE ? 'RECHTLICHES' : 'LEGAL'}
      title={isDE ? 'Datenschutzerklärung' : 'Privacy Policy'}
      backHref={`/${locale}`}
      backLabel={isDE ? 'Zurück zur Startseite' : 'Back to home'}
    >
      {isDE ? (
        <>
          <LegalSection title="1. Verantwortliche Stelle">
            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Website ist die unter
              &bdquo;Impressum&ldquo; genannte Person. Kontakt: kontakt@permitpro.de
            </p>
          </LegalSection>

          <LegalSection title="2. Grundsatz der Datenminimierung">
            <p>
              PermitPro wurde nach dem Prinzip &bdquo;Privacy by Default&ldquo; entwickelt.
              Wir verarbeiten personenbezogene Daten grundsätzlich nur, soweit dies zur
              Bereitstellung einer funktionsfähigen Website erforderlich ist.
            </p>
          </LegalSection>

          <LegalSection title="3. Erhebung und Speicherung von Daten">
            <p>
              PermitPro erhebt und speichert <strong className="text-white">keine</strong> personenbezogenen Daten
              der Nutzer. Alle Eingaben (Gemeindedaten, Projektangaben, Antworten) werden
              ausschließlich lokal in Ihrem Browser verarbeitet und nicht an unsere Server
              übertragen oder gespeichert.
            </p>
            <p>
              Nach dem Schließen des Browsers oder dem Zurücksetzen der Bewertung werden
              alle eingegebenen Daten vollständig gelöscht.
            </p>
          </LegalSection>

          <LegalSection title="4. Cookies">
            <p>
              Diese Website verwendet ausschließlich technisch notwendige Cookies (Session-Cookies),
              die für den Betrieb der Website unbedingt erforderlich sind. Es werden keine
              Analyse-, Marketing- oder Tracking-Cookies eingesetzt.
            </p>
          </LegalSection>

          <LegalSection title="5. Server-Logfiles">
            <p>
              Beim Aufruf unserer Website werden technische Zugriffsdaten (z. B. IP-Adresse,
              Browsertyp, Datum und Uhrzeit des Zugriffs) in sogenannten Server-Logfiles
              automatisch gespeichert. Diese Daten sind nicht bestimmten Personen zuordenbar
              und werden nicht mit anderen Datenquellen zusammengeführt.
            </p>
          </LegalSection>

          <LegalSection title="6. Ihre Rechte nach DSGVO">
            <p>Sie haben das Recht auf:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Auskunft über Ihre bei uns gespeicherten Daten (Art. 15 DSGVO)</li>
              <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
              <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
              <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
            </ul>
            <p>
              Da wir keine personenbezogenen Daten speichern, können diese Rechte in der
              Regel nicht geltend gemacht werden. Bei Fragen wenden Sie sich an:
              kontakt@permitpro.de
            </p>
          </LegalSection>

          <LegalSection title="7. Beschwerderecht">
            <p>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die
              Verarbeitung Ihrer personenbezogenen Daten zu beschweren. In Baden-Württemberg
              ist dies der Landesbeauftragte für den Datenschutz und die Informationsfreiheit.
            </p>
          </LegalSection>

          <LegalSection title="8. Aktualität dieser Erklärung">
            <p>
              Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Februar 2026.
              Durch die Weiterentwicklung unserer Website kann eine Anpassung notwendig werden.
            </p>
          </LegalSection>
        </>
      ) : (
        <>
          <LegalSection title="1. Data controller">
            <p>
              The data controller for this website is the person named in the &ldquo;Legal
              Notice&rdquo;. Contact: contact@permitpro.de
            </p>
          </LegalSection>

          <LegalSection title="2. Principle of data minimisation">
            <p>
              PermitPro was built on the principle of &ldquo;Privacy by Default&rdquo;. We
              process personal data only to the extent necessary to provide a functional
              website.
            </p>
          </LegalSection>

          <LegalSection title="3. Collection and storage of data">
            <p>
              PermitPro does <strong className="text-white">not</strong> collect or store any
              personal data. All inputs (municipality data, project details, answers) are
              processed exclusively locally in your browser and are not transmitted to or
              stored on our servers.
            </p>
            <p>
              When you close your browser or reset the assessment, all entered data is
              completely deleted.
            </p>
          </LegalSection>

          <LegalSection title="4. Cookies">
            <p>
              This website uses only technically necessary cookies (session cookies) that are
              strictly required for the operation of the website. No analytics, marketing or
              tracking cookies are used.
            </p>
          </LegalSection>

          <LegalSection title="5. Server log files">
            <p>
              When you access our website, technical access data (e.g. IP address, browser
              type, date and time of access) is automatically stored in server log files. This
              data cannot be assigned to specific persons and is not merged with other data
              sources.
            </p>
          </LegalSection>

          <LegalSection title="6. Your rights under GDPR">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access your stored data (Art. 15 GDPR)</li>
              <li>Rectification of inaccurate data (Art. 16 GDPR)</li>
              <li>Erasure of your data (Art. 17 GDPR)</li>
              <li>Restriction of processing (Art. 18 GDPR)</li>
              <li>Data portability (Art. 20 GDPR)</li>
              <li>Object to processing (Art. 21 GDPR)</li>
            </ul>
            <p>
              Since we do not store personal data, these rights generally cannot be exercised.
              For questions contact: contact@permitpro.de
            </p>
          </LegalSection>

          <LegalSection title="7. Right to complain">
            <p>
              You have the right to lodge a complaint with a data protection supervisory
              authority regarding the processing of your personal data.
            </p>
          </LegalSection>

          <LegalSection title="8. Validity of this policy">
            <p>
              This privacy policy is currently valid as of February 2026. Updates may be
              necessary as the website evolves.
            </p>
          </LegalSection>
        </>
      )}
    </LegalPageLayout>
  );
}
