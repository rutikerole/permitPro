import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

interface LegalSectionProps {
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-3 pb-8 border-b border-line last:border-b-0 last:pb-0">
      <h2 className="font-bold text-[16px] text-white">{title}</h2>
      <div className="flex flex-col gap-2.5 text-[14px] text-text-secondary leading-relaxed">
        {children}
      </div>
    </section>
  );
}

interface LegalPageLayoutProps {
  eyebrow: string;
  title: string;
  backHref: string;
  backLabel: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ eyebrow, title, backHref, backLabel, children }: LegalPageLayoutProps) {
  return (
    <main className="bg-canvas min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 pt-28 pb-24">
        {/* Back link */}
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12px] font-mono text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <ChevronLeft size={13} />
          {backLabel}
        </Link>

        {/* Page header */}
        <div className="mb-12">
          <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-amber-400 uppercase mb-3">
            {eyebrow}
          </p>
          <h1 className="font-black text-[clamp(28px,4vw,40px)] text-white leading-tight tracking-tight">
            {title}
          </h1>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-8">
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}
