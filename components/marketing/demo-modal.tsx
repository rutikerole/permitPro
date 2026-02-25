'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, ArrowRight, MapPin, Building2, ClipboardList, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/modal';

// ─── Content ─────────────────────────────────────────────────────────────────

const SCREENS_DE = [
  {
    step: '01',
    tag: 'Standort wählen',
    title: 'Ihre Gemeinde finden',
    description: 'Starten Sie mit der Suche nach Ihrer Gemeinde in Baden-Württemberg. Alle 1.101 Gemeinden werden unterstützt.',
    icon: MapPin,
    accentColor: '#F59E0B',
    illustration: 'municipality',
  },
  {
    step: '02',
    tag: 'Vorhaben definieren',
    title: 'Projekttyp auswählen',
    description: 'Wählen Sie zwischen Neubau, Anbau, Umbau, Nutzungsänderung oder Abbruch. Jede Auswahl öffnet passende Fragen.',
    icon: Building2,
    accentColor: '#60A5FA',
    illustration: 'projecttype',
  },
  {
    step: '03',
    tag: 'Daten eingeben',
    title: 'Fragen beantworten',
    description: 'Geben Sie Gebäudehöhe, Nutzungsart und weitere Parameter ein. Die Gebäudeklasse (GK 1–5) wird live berechnet.',
    icon: ClipboardList,
    accentColor: '#A78BFA',
    illustration: 'questions',
  },
  {
    step: '04',
    tag: 'Ergebnis erhalten',
    title: 'Checkliste herunterladen',
    description: 'Ihre rechtssichere Baugenehmigungscheckliste mit §§-Verweisen — sofort druckbar und teilbar. Kostenlos.',
    icon: CheckCircle2,
    accentColor: '#34D399',
    illustration: 'checklist',
  },
] as const;

const SCREENS_EN = [
  {
    step: '01',
    tag: 'Select location',
    title: 'Find your municipality',
    description: 'Start by searching for your municipality in Baden-Württemberg. All 1,101 municipalities are supported.',
    icon: MapPin,
    accentColor: '#F59E0B',
    illustration: 'municipality',
  },
  {
    step: '02',
    tag: 'Define project',
    title: 'Choose project type',
    description: 'Choose between new build, extension, renovation, change of use, or demolition. Each selection opens tailored questions.',
    icon: Building2,
    accentColor: '#60A5FA',
    illustration: 'projecttype',
  },
  {
    step: '03',
    tag: 'Enter data',
    title: 'Answer questions',
    description: 'Enter building height, usage type, and other parameters. The building class (GK 1–5) is calculated live as you type.',
    icon: ClipboardList,
    accentColor: '#A78BFA',
    illustration: 'questions',
  },
  {
    step: '04',
    tag: 'Get results',
    title: 'Download checklist',
    description: 'Your legally-sound building permit checklist with §§ references — ready to print and share. Free of charge.',
    icon: CheckCircle2,
    accentColor: '#34D399',
    illustration: 'checklist',
  },
] as const;

// ─── Screen illustrations ─────────────────────────────────────────────────────

function MunicipalityIllustration({ color }: { color: string }) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-xs">
      {/* Search bar */}
      <div className="flex items-center gap-3 bg-[#0F1A2E] rounded-xl px-4 py-3 border border-white/8">
        <div className="w-4 h-4 rounded-sm bg-white/10" />
        <div className="flex-1 h-2 rounded-full bg-white/10" />
      </div>
      {/* Results */}
      {['Stuttgart', 'Karlsruhe', 'Mannheim'].map((city, i) => (
        <motion.div
          key={city}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.1 }}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${i === 0 ? 'border-amber-500/40 bg-amber-500/8' : 'border-white/6 bg-white/[0.02]'}`}
        >
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}20` }}>
            <MapPin size={12} style={{ color }} />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-[12px] font-semibold text-white">{city}</div>
            <div className="text-[10px] text-[#4A6080]">Baden-Württemberg</div>
          </div>
          {i === 0 && <ArrowRight size={12} style={{ color }} className="ml-auto" />}
        </motion.div>
      ))}
    </div>
  );
}

function ProjectTypeIllustration({ color }: { color: string }) {
  const types = [
    { label: 'Neubau', c: '#F59E0B', active: false },
    { label: 'Anbau',  c: '#60A5FA', active: true  },
    { label: 'Umbau',  c: '#A78BFA', active: false  },
  ];
  return (
    <div className="flex flex-col gap-2.5 w-full max-w-xs">
      {types.map(({ label, c, active }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.12 }}
          className="flex items-center gap-4 px-4 py-3.5 rounded-2xl border"
          style={{
            background: active ? `${c}10` : '#0D1526',
            borderColor: active ? `${c}50` : 'rgba(255,255,255,0.06)',
          }}
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${c}20`, border: `1px solid ${c}40` }}>
            <Building2 size={16} style={{ color: c }} />
          </div>
          <span className="text-[13px] font-semibold text-white">{label}</span>
          {active && <ArrowRight size={13} style={{ color: c }} className="ml-auto" />}
        </motion.div>
      ))}
    </div>
  );
}

function QuestionsIllustration({ color }: { color: string }) {
  return (
    <div className="flex flex-col gap-2.5 w-full max-w-xs">
      {/* Answered question */}
      <div className="flex flex-col gap-2 px-4 py-3.5 rounded-xl bg-[#0D1526] border border-white/6">
        <div className="text-[11px] text-[#4A6080]">Gebäudehöhe</div>
        <div className="flex items-center gap-2">
          <div className="h-9 flex-1 bg-elevated rounded-xl border border-emerald-500/30 flex items-center px-3 gap-2">
            <span className="text-[13px] font-mono text-white">6.5</span>
            <span className="text-[11px] text-[#4A6080]">m</span>
          </div>
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
        </div>
      </div>
      {/* Live badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border"
        style={{ background: `${color}10`, borderColor: `${color}30` }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: color }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: color }} />
        </span>
        <span className="text-[11px] font-mono font-bold" style={{ color }}>GK 1 · §50 Kenntnisgabe</span>
      </motion.div>
    </div>
  );
}

function ChecklistIllustration({ color }: { color: string }) {
  const sections = [
    { id: 'A', label: 'Antragsunterlagen', count: 4, done: true  },
    { id: 'B', label: 'Bauzeichnungen',    count: 3, done: true  },
    { id: 'C', label: 'Bautechnische Nachweise', count: 2, done: false },
  ];
  return (
    <div className="flex flex-col gap-2 w-full max-w-xs">
      {sections.map(({ id, label, count, done }, i) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + i * 0.12 }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${done ? 'border-emerald-500/25 bg-emerald-500/5' : 'border-white/6 bg-[#0D1526]'}`}
        >
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[12px] font-mono ${done ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {id}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-white truncate">{label}</span>
            <span className="text-[10px] text-[#4A6080]">{count} items</span>
          </div>
          {done && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
        </motion.div>
      ))}
    </div>
  );
}

const ILLUSTRATIONS = {
  municipality: MunicipalityIllustration,
  projecttype: ProjectTypeIllustration,
  questions: QuestionsIllustration,
  checklist: ChecklistIllustration,
};

// ─── Main component ───────────────────────────────────────────────────────────

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

export function DemoModal({ open, onClose }: DemoModalProps) {
  const locale = useLocale();
  const SCREENS = locale === 'de' ? SCREENS_DE : SCREENS_EN;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setActive((a) => (a + 1) % SCREENS.length), [SCREENS.length]);
  const prev = useCallback(() => setActive((a) => (a - 1 + SCREENS.length) % SCREENS.length), [SCREENS.length]);

  // Auto-advance every 4s unless paused or closed
  useEffect(() => {
    if (!open || paused) return;
    const t = setInterval(next, 4000);
    return () => clearInterval(t);
  }, [open, paused, next]);

  // Reset to screen 0 when reopened
  useEffect(() => { if (open) setActive(0); }, [open]);

  const screen = SCREENS[active];
  const IllComp = ILLUSTRATIONS[screen.illustration];

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div
        className="flex flex-col"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-white/6">
          <p className="text-[9px] font-mono font-bold tracking-[0.28em] text-amber-400 uppercase mb-2">
            {locale === 'de' ? 'So funktioniert es' : 'How it works'}
          </p>
          <h2 className="text-[22px] font-black text-white tracking-tight leading-tight">
            {locale === 'de' ? 'PermitPro in 4 Schritten' : 'PermitPro in 4 steps'}
          </h2>

          {/* Step dots */}
          <div className="flex items-center gap-2 mt-5">
            {SCREENS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Step ${i + 1}`}
                className="transition-all duration-300"
              >
                <div className={`h-1 rounded-full transition-all duration-400 ${
                  i === active ? 'w-8 bg-amber-500' : 'w-4 bg-white/15 hover:bg-white/25'
                }`} />
              </button>
            ))}
          </div>
        </div>

        {/* Screen content */}
        <div className="flex flex-col sm:flex-row gap-0 overflow-hidden">
          {/* Left — text */}
          <div className="flex flex-col justify-center gap-5 px-8 py-8 sm:w-[52%] sm:border-r border-white/6">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="flex flex-col gap-4"
              >
                {/* Step tag */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold tracking-[0.18em] uppercase self-start"
                  style={{ color: screen.accentColor, borderColor: `${screen.accentColor}40`, background: `${screen.accentColor}12` }}
                >
                  <span className="font-black">{screen.step}</span>
                  {screen.tag}
                </div>

                <h3 className="text-[20px] font-black text-white tracking-tight leading-snug">
                  {screen.title}
                </h3>

                <p className="text-[13.5px] text-[#6B7A99] leading-relaxed">
                  {screen.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right — illustration */}
          <div className="flex items-center justify-center sm:flex-1 px-6 py-8 bg-[#080D1A] min-h-[220px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.94, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -8 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="w-full"
              >
                <IllComp color={screen.accentColor} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/6">
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-8 h-8 rounded-full border border-white/8 flex items-center justify-center text-text-muted hover:text-white hover:border-white/20 transition-all duration-150"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={next}
              className="w-8 h-8 rounded-full border border-white/8 flex items-center justify-center text-text-muted hover:text-white hover:border-white/20 transition-all duration-150"
            >
              <ChevronRight size={15} />
            </button>
            <span className="text-[11px] font-mono text-[#2A3A50] ml-2">
              {active + 1} / {SCREENS.length}
            </span>
          </div>

          <Link
            href={`/${locale}/assessment`}
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-[13px] transition-colors duration-150"
          >
            {locale === 'de' ? 'Jetzt starten' : 'Start for free'}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </Modal>
  );
}
