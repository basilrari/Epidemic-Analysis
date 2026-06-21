'use client';

import { INTRO_TEXT, PROBLEM_CHIPS } from '@/lib/education';
import { InfoTooltip } from '@/components/info-tooltip';

export function PblIntro() {
  return (
    <section className="rounded-2xl border border-[#1e293b] bg-[#111827]/60 px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">{INTRO_TEXT}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {PROBLEM_CHIPS.map(chip => (
          <InfoTooltip key={chip.id} content={chip.tooltip}>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0b0f1a] border border-[#1e293b] text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400/90 transition-colors cursor-help">
              {chip.label}
            </span>
          </InfoTooltip>
        ))}
      </div>
    </section>
  );
}
