import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Guard: reject if no API key configured
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Email delivery not configured' },
      { status: 503 },
    );
  }

  // Lazy import — avoids instantiating Resend at build/collect time when env var is absent
  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  let body: {
    to: string;
    pdfBase64: string;
    filename: string;
    locale: string;
    municipalityName: string;
    projectType: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { to, pdfBase64, filename, locale, municipalityName, projectType } = body;

  // Basic email validation
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }
  if (!pdfBase64 || !filename) {
    return NextResponse.json({ error: 'Missing PDF data' }, { status: 400 });
  }

  const de = locale === 'de';

  const subject = de
    ? `Ihr Bauantragscheckliste — ${municipalityName}`
    : `Your building permit checklist — ${municipalityName}`;

  const htmlBody = de
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
        <h2 style="color: #d97706;">PermitPro Checkliste</h2>
        <p>Im Anhang finden Sie Ihre persönliche Bauantrags-Checkliste für <strong>${municipalityName}</strong> (${projectType}).</p>
        <p>Die Checkliste wurde auf Basis der LBO BW / BayBO erstellt und gibt Ihnen einen Überblick über alle einzureichenden Unterlagen.</p>
        <p style="color: #666; font-size: 12px;">
          Dieser Überblick ersetzt keine Rechtsberatung. Wenden Sie sich im Zweifel an Ihre zuständige Baubehörde.
        </p>
        <p style="margin-top: 24px;">Erstellt mit <a href="https://permitpro.de" style="color: #d97706;">PermitPro</a></p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
        <h2 style="color: #d97706;">PermitPro Checklist</h2>
        <p>Attached you will find your personal building permit checklist for <strong>${municipalityName}</strong> (${projectType}).</p>
        <p>The checklist was generated based on LBO BW / BayBO and gives you an overview of all documents that need to be submitted.</p>
        <p style="color: #666; font-size: 12px;">
          This checklist does not replace legal advice. When in doubt, contact your local building authority.
        </p>
        <p style="margin-top: 24px;">Generated with <a href="https://permitpro.de" style="color: #d97706;">PermitPro</a></p>
      </div>
    `;

  try {
    const { error } = await resend.emails.send({
      from: 'PermitPro <noreply@permitpro.de>',
      to: [to],
      subject,
      html: htmlBody,
      attachments: [
        {
          filename,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Email delivery error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
