import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#0B0F1A', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="text-center flex flex-col gap-6 max-w-md">
        {/* 404 eyebrow */}
        <p
          style={{
            fontSize: '10px',
            fontFamily: 'monospace',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: '#F59E0B',
            textTransform: 'uppercase',
          }}
        >
          404 · Nicht gefunden / Not Found
        </p>

        {/* Headline */}
        <h1 style={{ color: '#F9FAFB', fontWeight: 900, fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.1, margin: 0 }}>
          Seite nicht gefunden
          <span style={{ display: 'block', color: '#9CA3AF', fontSize: '0.55em', fontWeight: 400, marginTop: '6px' }}>
            Page not found
          </span>
        </h1>

        {/* Description */}
        <p style={{ color: '#9CA3AF', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>
          Die gesuchte Seite existiert nicht oder wurde verschoben.
          <br />
          <span style={{ fontSize: '13px' }}>The requested page does not exist or has been moved.</span>
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/de"
            style={{
              padding: '10px 20px',
              background: '#F59E0B',
              color: '#030712',
              fontWeight: 700,
              fontSize: '13px',
              borderRadius: '12px',
              textDecoration: 'none',
            }}
          >
            Startseite (DE)
          </Link>
          <Link
            href="/en"
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: '#9CA3AF',
              fontWeight: 600,
              fontSize: '13px',
              borderRadius: '12px',
              border: '1px solid #1E2D42',
              textDecoration: 'none',
            }}
          >
            Homepage (EN)
          </Link>
        </div>

        {/* PermitPro wordmark */}
        <p style={{ color: '#4B5563', fontSize: '12px', fontFamily: 'monospace', marginTop: '16px' }}>
          Permit<span style={{ color: '#F59E0B' }}>Pro</span>
        </p>
      </div>
    </div>
  );
}
