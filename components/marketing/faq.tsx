'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Plus, Minus } from 'lucide-react';

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

function FaqItem({ question, answer, isOpen, onToggle, index }: FaqItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' as const }}
      className={`border rounded-xl overflow-hidden transition-colors duration-200 ${
        isOpen ? 'border-blue-500/30 bg-surface' : 'border-line bg-surface/50 hover:border-line-strong'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left cursor-pointer group"
        aria-expanded={isOpen}
      >
        <span className="flex items-start gap-3 flex-1">
          <span className="font-mono text-[10px] font-bold text-amber-400/60 tracking-widest mt-0.5 flex-shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={`font-semibold text-[15px] leading-snug transition-colors duration-200 ${
            isOpen ? 'text-white' : 'text-text-secondary group-hover:text-white'
          }`}>
            {question}
          </span>
        </span>
        <div className={`flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 ${
          isOpen
            ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
            : 'bg-elevated border-line text-text-muted'
        }`}>
          {isOpen ? <Minus size={13} /> : <Plus size={13} />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' as const }}
          >
            <div className="px-6 pb-5 pt-0">
              <div className="pl-7 border-t border-line pt-4">
                <p className="text-[13.5px] text-text-secondary leading-relaxed">{answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function Faq() {
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }));

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  const leftItems = items.slice(0, 5);
  const rightItems = items.slice(5);

  return (
    <section id="faq" className="relative py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-px opacity-20"
          style={{ background: 'linear-gradient(to right, transparent, #253447, transparent)' }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: 'easeOut' as const }}
        >
          <p className="text-[10px] font-mono font-semibold tracking-[0.2em] text-amber-400 uppercase mb-4">
            {t('eyebrow')}
          </p>
          <h2 className="font-black text-[clamp(32px,4.5vw,52px)] leading-[1.05] tracking-tight text-white">
            {t('title')}{' '}
            <span className="text-amber-400">{t('titleHighlight')}</span>
          </h2>
          <p className="mt-5 text-[16px] text-text-secondary max-w-[520px] mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Two-column FAQ layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-3">
            {leftItems.map((item, i) => (
              <FaqItem
                key={i}
                index={i}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === i}
                onToggle={() => toggle(i)}
              />
            ))}
          </div>
          {/* Right column */}
          <div className="flex flex-col gap-3">
            {rightItems.map((item, i) => (
              <FaqItem
                key={i + 5}
                index={i + 5}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === i + 5}
                onToggle={() => toggle(i + 5)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
