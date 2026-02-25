import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PermitPro — Building Permit Checklist';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isDE = locale === 'de';

  const headline = isDE
    ? 'Ihre Baugenehmigung,\nvereinfacht.'
    : 'Your building permit,\nsimplified.';

  const subtitle = isDE
    ? 'Kostenlose Checkliste · LBO BW & BayBO · ~15 Minuten'
    : 'Free checklist · LBO BW & BayBO · ~15 minutes';

  const badges = ['GK 1–5', 'LBO BW 2026', 'BayBO 2025', isDE ? 'Kostenlos' : 'Free'];

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0B0F1A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px 100px',
          position: 'relative',
        }}
      >
        {/* Top amber accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: '#F59E0B',
            display: 'flex',
          }}
        />

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '56px' }}>
          <span
            style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#F9FAFB',
              letterSpacing: '-1px',
              display: 'flex',
            }}
          >
            Permit
            <span style={{ color: '#F59E0B' }}>Pro</span>
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '68px',
            fontWeight: 900,
            color: '#F9FAFB',
            lineHeight: 1.08,
            letterSpacing: '-2px',
            marginBottom: '32px',
            whiteSpace: 'pre-wrap',
            display: 'flex',
          }}
        >
          {headline}
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: '26px', color: '#9CA3AF', fontWeight: 400, display: 'flex' }}>
          {subtitle}
        </div>

        {/* Bottom badges */}
        <div style={{ display: 'flex', gap: '16px', marginTop: 'auto' }}>
          {badges.map((b) => (
            <div
              key={b}
              style={{
                padding: '10px 20px',
                background: '#0F1623',
                border: '1px solid #1E2D42',
                borderRadius: '10px',
                fontSize: '18px',
                color: '#F59E0B',
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
