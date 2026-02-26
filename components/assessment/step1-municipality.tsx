'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { searchMunicipalities, MUNICIPALITIES } from '@/lib/data/municipalities';
import { useAssessmentStore } from '@/store/assessment-store';
import { LiveChecklistPanel } from './live-checklist-panel';
import type { Municipality, FederalState } from '@/lib/assessment/types';

// ─── State config ────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<FederalState, {
  name: string;
  nameDe: string;
  law: string;
  lawRef: string;
  color: string;
  stats: { value: string; label: string; labelDe: string }[];
  legalRefs: { ref: string; desc: string; descDe: string }[];
}> = {
  BW: {
    name: 'Baden-Württemberg',
    nameDe: 'Baden-Württemberg',
    law: 'LBO BW 2026',
    lawRef: 'Stand 18.06.2024',
    color: 'amber',
    stats: [
      { value: '1,101',  label: 'Municipalities',   labelDe: 'Gemeinden'       },
      { value: '35',     label: 'Districts',         labelDe: 'Landkreise'      },
      { value: 'GK 1–5', label: 'Building classes', labelDe: 'Gebäudeklassen'  },
      { value: '2026',   label: 'LBO BW edition',   labelDe: 'LBO BW Fassung'  },
    ],
    legalRefs: [
      { ref: '§2 Abs. 4',  desc: 'Building class definition', descDe: 'Gebäudeklassendefinition' },
      { ref: '§50 LBO BW', desc: 'Notification procedure',    descDe: 'Kenntnisgabeverfahren'    },
      { ref: '§52 LBO BW', desc: 'Simplified procedure',      descDe: 'Vereinfachtes Verfahren'  },
      { ref: '§53 LBO BW', desc: 'Standard procedure',        descDe: 'Genehmigungsverfahren'    },
    ],
  },
  BY: {
    name: 'Bavaria',
    nameDe: 'Bayern',
    law: 'BayBO 2025',
    lawRef: 'Stand 23.12.2025',
    color: 'blue',
    stats: [
      { value: '2,056',  label: 'Municipalities',   labelDe: 'Gemeinden'       },
      { value: '71',     label: 'Districts',         labelDe: 'Landkreise'      },
      { value: 'GK 1–5', label: 'Building classes', labelDe: 'Gebäudeklassen'  },
      { value: '2025',   label: 'BayBO edition',    labelDe: 'BayBO Fassung'   },
    ],
    legalRefs: [
      { ref: 'Art. 2 Abs. 3', desc: 'Building class definition', descDe: 'Gebäudeklassendefinition' },
      { ref: 'Art. 58 BayBO', desc: 'Exemption procedure',       descDe: 'Genehmigungsfreiheit'     },
      { ref: 'Art. 59 BayBO', desc: 'Simplified procedure',      descDe: 'Vereinfachtes Verfahren'  },
      { ref: 'Art. 60 BayBO', desc: 'Standard procedure',        descDe: 'Genehmigungsverfahren'    },
    ],
  },
};

// ─── Info panel (right side) ─────────────────────────────────────────────────

function StateInfoPanel({ state }: { state: FederalState }) {
  const cfg      = STATE_CONFIG[state];
  const locale   = useLocale();
  const de       = locale === 'de';
  const cityNames = MUNICIPALITIES.filter((m) => m.state === state).map((m) => m.name);
  const row1 = [...cityNames.slice(0, 15), ...cityNames.slice(0, 15)];
  const row2 = [...cityNames.slice(15, 30), ...cityNames.slice(15, 30)];

  const accentColor = state === 'BY' ? 'text-blue-400' : 'text-amber-400';
  const accentVia   = state === 'BY' ? 'via-blue-500/30' : 'via-amber-500/30';

  return (
    <div className="relative w-full h-full bg-[#060c18] overflow-hidden flex flex-col justify-between py-12 px-10">
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(6,12,24,0.85) 100%)' }}
      />
      {/* Top accent line */}
      <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${accentVia} to-transparent`} />

      {/* State title */}
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="relative z-10"
      >
        <p className={`text-[10px] font-mono font-bold tracking-[0.3em] ${accentColor} uppercase mb-3`}>
          {de ? 'REGION · DEUTSCHLAND' : 'REGION · GERMANY'}
        </p>
        <h2 className="text-[clamp(28px,3.5vw,48px)] font-black text-white leading-[1.05] tracking-tight">
          {state === 'BW' ? (
            <>Baden-<br /><span className="text-amber-400">Württemberg</span></>
          ) : (
            <span className="text-blue-400">Bayern</span>
          )}
        </h2>
        <p className="mt-3 text-[13px] text-[#4A6080] leading-relaxed max-w-xs">
          {cfg.law} · {cfg.lawRef}
        </p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        key={`stats-${state}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="relative z-10 grid grid-cols-2 gap-4"
      >
        {cfg.stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.07, duration: 0.4 }}
            className="flex flex-col gap-1 p-4 rounded-xl bg-white/[0.03] border border-white/6 backdrop-blur-sm"
          >
            <span className="text-[22px] font-black text-white tracking-tight font-mono">{s.value}</span>
            <span className="text-[11px] text-[#4A6080] font-mono tracking-wider uppercase">{de ? s.labelDe : s.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Legal refs */}
      <motion.div
        key={`refs-${state}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="relative z-10 flex flex-col gap-2"
      >
        <p className="text-[9px] font-mono tracking-[0.25em] text-[#2A3A50] uppercase mb-1">{de ? 'Rechtsgrundlage' : 'Legal framework'}</p>
        <div className="flex flex-wrap gap-2">
          {cfg.legalRefs.map((l) => (
            <div
              key={l.ref}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-white/6 bg-white/[0.02]"
              title={l.desc}
            >
              <span className={`text-[10px] font-mono font-bold ${accentColor}/70`}>{l.ref}</span>
              <span className="text-[9.5px] text-[#2A3A50]">{de ? l.descDe : l.desc}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* City marquee */}
      <div className="relative z-10 overflow-hidden flex flex-col gap-2 mt-2">
        <div
          className="flex gap-2 overflow-hidden"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
        >
          <motion.div
            className="flex gap-2 flex-shrink-0"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          >
            {row1.map((name, i) => (
              <span
                key={`r1-${i}`}
                className="flex-shrink-0 text-[10px] font-mono text-[#1E3A5F] border border-[#0F1D30] rounded-md px-2.5 py-1 whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </motion.div>
        </div>
        <div
          className="flex gap-2 overflow-hidden"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
        >
          <motion.div
            className="flex gap-2 flex-shrink-0"
            animate={{ x: ['-50%', '0%'] }}
            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
          >
            {row2.map((name, i) => (
              <span
                key={`r2-${i}`}
                className="flex-shrink-0 text-[10px] font-mono text-[#1E3A5F] border border-[#0F1D30] rounded-md px-2.5 py-1 whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Step 1 ──────────────────────────────────────────────────────────────

export function Step1Municipality() {
  const t      = useTranslations('assessment.step1');
  const locale = useLocale();
  const de     = locale === 'de';
  const { setMunicipality, history, restoreFromHistory } = useAssessmentStore();

  const [selectedState, setSelectedState] = useState<FederalState>('BW');
  const [query, setQuery]                 = useState('');
  const [results, setResults]             = useState<Municipality[]>([]);
  const [highlighted, setHighlighted]     = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = useCallback(
    (q: string) => {
      const found = searchMunicipalities(q, selectedState, 8);
      setResults(found);
      setHighlighted(0);
    },
    [selectedState],
  );

  useEffect(() => { search(query); }, [query, search]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSelect = (m: Municipality) => setMunicipality(m);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (results.length === 0) return;
    if (e.key === 'ArrowDown')  { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[highlighted]) handleSelect(results[highlighted]); }
  };

  const handleStateChange = (s: FederalState) => {
    setSelectedState(s);
    setQuery('');
  };

  // Top picks for current state
  const TOP_PICKS = MUNICIPALITIES.filter((m) => m.state === selectedState).slice(0, 6);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ══ LEFT: Search panel ══ */}
      <motion.div
        className="flex flex-col w-full lg:w-[52%] xl:w-[50%] flex-shrink-0 bg-[#080d1a] border-r border-white/5 overflow-y-auto"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex-shrink-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <div className="flex flex-col gap-6 sm:gap-8 px-6 py-8 lg:px-10 lg:py-12 flex-1">

          {/* Header */}
          <div className="flex flex-col gap-3">
            <p className="text-[9px] font-mono font-bold tracking-[0.3em] text-amber-400 uppercase">
              {t('stepLabel')}
            </p>
            <h1 className="text-[clamp(26px,3vw,40px)] font-black text-white leading-tight tracking-tight">
              {t('title')}
            </h1>
            <p className="text-[14px] text-[#6B7A99] leading-relaxed max-w-sm">
              {t('subtitle')}
            </p>
          </div>

          {/* ── State selector ── */}
          <div className="flex flex-col gap-3">
            <p className="text-[10px] font-mono font-bold tracking-[0.22em] text-[#2A3A50] uppercase">
              {de ? 'Bundesland' : 'Federal state'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(['BW', 'BY'] as FederalState[]).map((s) => {
                const cfg       = STATE_CONFIG[s];
                const isActive  = selectedState === s;
                const accent    = s === 'BY' ? 'border-blue-500/40 bg-blue-500/10' : 'border-amber-500/40 bg-amber-500/10';
                const inactive  = 'border-white/8 bg-white/[0.02] hover:border-white/15';
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStateChange(s)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                      isActive ? accent : inactive
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-black font-mono ${
                        isActive
                          ? s === 'BY' ? 'bg-blue-500/20 text-blue-300' : 'bg-amber-500/20 text-amber-300'
                          : 'bg-white/5 text-[#4A5568]'
                      }`}
                    >
                      {s}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[13px] font-semibold truncate ${isActive ? 'text-white' : 'text-white/60'}`}>
                        {cfg.name}
                      </span>
                      <span className="text-[10px] text-[#2A3A50] font-mono truncate">{cfg.law}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Search input ── */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3A5070] pointer-events-none"
              />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={query.length > 0}
                aria-haspopup="listbox"
                aria-autocomplete="list"
                aria-controls="municipality-listbox"
                aria-activedescendant={results[highlighted] ? `municipality-option-${highlighted}` : undefined}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('searchPlaceholder')}
                className="w-full h-14 bg-[#0F1A2E] border border-white/8 rounded-2xl pl-12 pr-5 text-[15px] text-white placeholder:text-[#2A3A50] focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/15 transition-all duration-200"
              />
            </div>

            {/* Live results */}
            <AnimatePresence mode="wait">
              {query.length > 0 && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  id="municipality-listbox"
                  role="listbox"
                  aria-label="Municipality search results"
                  className="flex flex-col rounded-2xl border border-white/8 overflow-hidden bg-[#0A1220]"
                >
                  {results.length > 0 ? (
                    results.map((m, i) => (
                      <button
                        key={m.id}
                        id={`municipality-option-${i}`}
                        type="button"
                        role="option"
                        aria-selected={i === highlighted}
                        onMouseDown={() => handleSelect(m)}
                        onMouseEnter={() => setHighlighted(i)}
                        className={`flex items-center gap-4 px-5 py-4 text-left transition-all duration-100 border-b border-white/5 last:border-b-0 cursor-pointer group ${
                          i === highlighted ? 'bg-amber-500/8' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                            i === highlighted ? 'bg-amber-500/20' : 'bg-white/5'
                          }`}
                        >
                          <MapPin
                            size={14}
                            className={i === highlighted ? 'text-amber-400' : 'text-[#3A5070]'}
                          />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-[14px] font-semibold text-white truncate">{m.name}</span>
                          <span className="text-[11.5px] text-[#4A6080] truncate">
                            {m.landkreis}
                            <span className="ml-2 text-[9px] font-mono text-[#2A3A50] uppercase">
                              {m.state}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-mono text-[#2A3A50] border border-white/8 rounded-md px-2 py-0.5">
                            {m.zip}
                          </span>
                          <ArrowRight
                            size={13}
                            className={`transition-opacity ${i === highlighted ? 'opacity-100 text-amber-400' : 'opacity-0'}`}
                          />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-5 text-[13px] text-[#3A5070] text-center">
                      {t('noResults')}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick picks */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-mono font-bold tracking-[0.22em] text-[#2A3A50] uppercase">
              Major municipalities · {STATE_CONFIG[selectedState].name}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {TOP_PICKS.map((m, i) => (
                <motion.button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelect(m)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-white/6 bg-white/[0.02] hover:bg-amber-500/5 hover:border-amber-500/20 text-left transition-all duration-200 group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-amber-500/10 flex items-center justify-center flex-shrink-0 transition-colors">
                    <MapPin size={13} className="text-[#3A5070] group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[13px] font-semibold text-white/80 group-hover:text-white truncate transition-colors">
                      {m.name}
                    </span>
                    <span className="text-[10.5px] text-[#2A3A50] truncate">{m.zip}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Hint */}
          <p className="text-[11.5px] font-mono text-[#2A3A50] tracking-wider">
            {t('availableHint')}
          </p>

          {/* Recent assessments */}
          {history.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-mono font-bold tracking-[0.22em] text-[#2A3A50] uppercase">
                Recent assessments
              </p>
              <div className="flex flex-col gap-2">
                {history.slice(0, 3).map((entry) => (
                  <motion.button
                    key={entry.id}
                    type="button"
                    onClick={() => restoreFromHistory(entry)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-white/6 bg-white/2 hover:bg-amber-500/5 hover:border-amber-500/20 text-left transition-all duration-200 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-amber-500/10 flex items-center justify-center shrink-0 transition-colors">
                      <MapPin size={13} className="text-[#3A5070] group-hover:text-amber-400 transition-colors" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[13px] font-semibold text-white/80 group-hover:text-white truncate transition-colors">
                        {entry.result.municipality.name}
                      </span>
                      <span className="text-[10.5px] text-[#2A3A50] truncate font-mono">
                        {entry.result.projectType} · {entry.result.classification.buildingClass}
                      </span>
                    </div>
                    <ArrowRight
                      size={13}
                      className="text-[#2A3A50] group-hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    />
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ══ RIGHT: Live checklist panel ══ */}
      <LiveChecklistPanel />
    </div>
  );
}
