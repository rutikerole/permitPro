'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

// ─── Isometric Box Coordinates ───────────────────────────────────
// Using a parallelogram projection.
// Axes from the top apex (A):
//   Right-forward  → (+2, +1) per unit  (blue lines)
//   Left-forward   → (-2, +1) per unit  (blue lines)
//   Downward       → (0,  +1) per unit  (walls)
//
// Key vertices of the building box:
const V = {
  A:  { x: 280, y:  52 },  // apex (top-back)
  B:  { x: 462, y: 146 },  // top-right corner
  C:  { x: 280, y: 240 },  // top-front corner
  D:  { x:  98, y: 146 },  // top-left corner
  E:  { x: 462, y: 336 },  // bottom-right corner
  F:  { x: 280, y: 430 },  // bottom-front corner
  G:  { x:  98, y: 336 },  // bottom-left corner
};

// Build SVG polygon point strings
const topFace    = `${V.A.x},${V.A.y} ${V.B.x},${V.B.y} ${V.C.x},${V.C.y} ${V.D.x},${V.D.y}`;
const rightFace  = `${V.B.x},${V.B.y} ${V.E.x},${V.E.y} ${V.F.x},${V.F.y} ${V.C.x},${V.C.y}`;
const leftFace   = `${V.D.x},${V.D.y} ${V.C.x},${V.C.y} ${V.F.x},${V.F.y} ${V.G.x},${V.G.y}`;

// ─── Isometric window/module helper ──────────────────────────────
// Each module on the right face is a parallelogram.
// Right-face column vector (per unit): (-36.4, +18.8)
// Right-face row vector (per unit):    (0, +38.5)
function rightModule(col: number, row: number, wc = 0.72, wr = 0.72) {
  const ox = V.B.x + col * -36.4 + row * 0   + 0.14 * -36.4;
  const oy = V.B.y + col *  18.8 + row * 38.5 + 0.14 *  18.8 + 0.14 * 38.5;
  const tl = `${ox},${oy}`;
  const tr = `${ox + wc * -36.4},${oy + wc * 18.8}`;
  const br = `${ox + wc * -36.4 + wr * 0},${oy + wc * 18.8 + wr * 38.5}`;
  const bl = `${ox + wr * 0},${oy + wr * 38.5}`;
  return `${tl} ${tr} ${br} ${bl}`;
}

// Left-face column vector (per unit): (+36.4, +18.8)
// Left-face row vector (per unit):    (0, +38.5)
function leftModule(col: number, row: number, wc = 0.72, wr = 0.72) {
  const ox = V.D.x + col * 36.4 + row * 0    + 0.14 * 36.4;
  const oy = V.D.y + col * 18.8 + row * 38.5 + 0.14 * 18.8 + 0.14 * 38.5;
  const tl = `${ox},${oy}`;
  const tr = `${ox + wc * 36.4},${oy + wc * 18.8}`;
  const br = `${ox + wc * 36.4 + wr * 0},${oy + wc * 18.8 + wr * 38.5}`;
  const bl = `${ox + wr * 0},${oy + wr * 38.5}`;
  return `${tl} ${tr} ${br} ${bl}`;
}

// Module grids
const rightModules = [
  { pts: rightModule(1, 0), amber: false },
  { pts: rightModule(2, 0), amber: false },
  { pts: rightModule(3, 0), amber: false },
  { pts: rightModule(1, 1), amber: false },
  { pts: rightModule(2, 1), amber: true  }, // highlighted unit
  { pts: rightModule(3, 1), amber: false },
  { pts: rightModule(1, 2), amber: false },
  { pts: rightModule(2, 2), amber: false },
  { pts: rightModule(3, 2), amber: false },
  { pts: rightModule(1, 3), amber: false },
  { pts: rightModule(2, 3), amber: false },
];
const leftModules = [
  { pts: leftModule(1, 0), amber: false },
  { pts: leftModule(2, 0), amber: false },
  { pts: leftModule(3, 0), amber: false },
  { pts: leftModule(1, 1), amber: false },
  { pts: leftModule(2, 1), amber: false },
  { pts: leftModule(3, 1), amber: true },
  { pts: leftModule(1, 2), amber: false },
  { pts: leftModule(2, 2), amber: false },
  { pts: leftModule(1, 3), amber: false },
];

// ─── Framer Motion variants ────────────────────────────────────
const fadeUp   = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
const fadeLeft = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };
const fadeRight= { hidden: { opacity: 0, x:  16 }, show: { opacity: 1, x: 0 } };

export function BuildingDiagram() {
  const t = useTranslations('diagram');

  return (
    <div className="relative w-full h-full min-h-[520px] select-none">
      {/* ─── Outer panel ──────────────────────────────────────── */}
      <div className="absolute inset-0 rounded-2xl bg-[#070D18] border border-[#1A2840] overflow-hidden">
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(circle, #1E3050 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Ambient glow behind building */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-80 h-64 rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(ellipse, #3B82F6, transparent)' }}
          />
        </div>
      </div>

      {/* ─── Main SVG ─────────────────────────────────────────── */}
      <motion.svg
        viewBox="0 0 560 490"
        className="relative w-full h-full"
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.08, delayChildren: 0.3 }}
      >
        {/* ── Building faces ───────────────────────────────────── */}
        <motion.polygon
          points={topFace}
          fill="rgba(59,130,246,0.06)"
          stroke="#1E4A7A"
          strokeWidth="1"
          variants={fadeUp}
          transition={{ duration: 0.5 }}
        />
        <motion.polygon
          points={rightFace}
          fill="rgba(20,50,100,0.38)"
          stroke="#1E4A7A"
          strokeWidth="1"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        <motion.polygon
          points={leftFace}
          fill="rgba(12,35,72,0.38)"
          stroke="#1E4A7A"
          strokeWidth="1"
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.15 }}
        />

        {/* ── Module windows — right face ────────────────────── */}
        {rightModules.map((m, i) => (
          <motion.polygon
            key={`rm-${i}`}
            points={m.pts}
            fill={m.amber ? 'rgba(245,158,11,0.18)' : 'rgba(59,130,246,0.12)'}
            stroke={m.amber ? 'rgba(245,158,11,0.5)' : 'rgba(59,130,246,0.30)'}
            strokeWidth="0.8"
            variants={fadeUp}
            transition={{ duration: 0.3, delay: 0.4 + i * 0.04 }}
          />
        ))}

        {/* ── Module windows — left face ──────────────────────── */}
        {leftModules.map((m, i) => (
          <motion.polygon
            key={`lm-${i}`}
            points={m.pts}
            fill={m.amber ? 'rgba(245,158,11,0.14)' : 'rgba(30,74,122,0.22)'}
            stroke={m.amber ? 'rgba(245,158,11,0.40)' : 'rgba(30,74,122,0.50)'}
            strokeWidth="0.8"
            variants={fadeUp}
            transition={{ duration: 0.3, delay: 0.5 + i * 0.04 }}
          />
        ))}

        {/* ── Amber highlight — top face edges ──────────────── */}
        <motion.polygon
          points={topFace}
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.8"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.6, ease: 'easeInOut' }}
        />

        {/* ── Amber highlight — apex vertical ridge ─────────── */}
        <motion.line
          x1={V.A.x} y1={V.A.y} x2={V.C.x} y2={V.C.y}
          stroke="#F59E0B"
          strokeWidth="2.2"
          strokeDasharray="0"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        />

        {/* ── Corner accent dots ──────────────────────────────── */}
        {[V.B, V.D, V.E, V.F, V.G].map((pt, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={pt.x} cy={pt.y} r={3.5}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="1.5"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.8 }}
            transition={{ type: 'spring', delay: 0.5 + i * 0.08 }}
          />
        ))}

        {/* ── Apex amber dot ──────────────────────────────────── */}
        <motion.circle
          cx={V.A.x} cy={V.A.y} r={5}
          fill="#F59E0B"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 1.5, stiffness: 200 }}
        />

        {/* ── Dimension lines ─────────────────────────────────── */}
        {/* Width arrow — bottom */}
        <line x1={V.G.x} y1={V.G.y + 28} x2={V.F.x} y2={V.F.y + 14}
          stroke="#253447" strokeWidth="0.8" strokeDasharray="4 3" />
        <line x1={V.F.x} y1={V.F.y + 14} x2={V.E.x} y2={V.E.y + 28}
          stroke="#253447" strokeWidth="0.8" strokeDasharray="4 3" />
        <text x={V.F.x} y={V.F.y + 26} textAnchor="middle"
          fill="#4B5563" fontSize="9" fontFamily="JetBrains Mono, monospace">
          12.40 m
        </text>
        {/* Height arrow — right */}
        <line x1={V.B.x + 24} y1={V.B.y} x2={V.E.x + 24} y2={V.E.y}
          stroke="#253447" strokeWidth="0.8" strokeDasharray="4 3" />
        <text x={V.B.x + 34} y={(V.B.y + V.E.y) / 2 + 3}
          fill="#4B5563" fontSize="9" fontFamily="JetBrains Mono, monospace">
          6.80 m
        </text>
      </motion.svg>

      {/* ─── Floating info cards ──────────────────────────────── */}

      {/* GK-CLASS — top right */}
      <motion.div
        className="absolute top-4 right-4 bg-surface border border-line rounded-xl p-3 min-w-[96px] backdrop-blur-sm"
        variants={fadeRight}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.2, duration: 0.4 }}
      >
        <p className="text-[9px] text-text-muted uppercase tracking-[0.15em] font-mono">
          {t('classLabel')}
        </p>
        <p className="text-2xl font-black text-amber-400 leading-none mt-1 tracking-tight">
          {t('classValue')}
        </p>
        <p className="text-[9px] text-text-muted mt-1 font-mono">{t('classNote')}</p>
      </motion.div>

      {/* PROCEDURE — left middle */}
      <motion.div
        className="absolute top-[38%] left-3 bg-surface border border-line rounded-xl p-3 backdrop-blur-sm"
        variants={fadeLeft}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.4, duration: 0.4 }}
      >
        <p className="text-[9px] text-text-muted uppercase tracking-[0.15em] font-mono">
          {t('procedureLabel')}
        </p>
        <p className="text-sm font-bold text-blue-400 mt-1 leading-tight">
          {t('procedureValue')}
        </p>
        <p className="text-[9px] text-text-muted mt-0.5 font-mono">{t('procedureRef')}</p>
      </motion.div>

      {/* ITEMS / SCALE — bottom right */}
      <motion.div
        className="absolute bottom-4 right-4 bg-surface border border-line rounded-xl p-3 min-w-[96px] backdrop-blur-sm"
        variants={fadeRight}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.6, duration: 0.4 }}
      >
        <p className="text-[9px] text-text-muted uppercase tracking-[0.15em] font-mono">
          {t('itemsLabel')}
        </p>
        <p className="text-2xl font-black text-white leading-none mt-1">
          {t('itemsValue')}
        </p>
        <p className="text-[9px] text-emerald-400 mt-1 font-mono">{t('itemsBlockers')}</p>
        <p className="text-[9px] text-text-muted mt-0.5 font-mono">{t('scale')}</p>
      </motion.div>

      {/* North compass — bottom left */}
      <motion.div
        className="absolute bottom-4 left-4 w-9 h-9 rounded-full border-2 border-line-strong bg-elevated flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, type: 'spring' }}
      >
        <span className="text-[11px] font-bold text-text-muted font-mono">N</span>
      </motion.div>
    </div>
  );
}
