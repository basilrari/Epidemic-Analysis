'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { generateKeyInsights } from '@/lib/education';
import type { SimulationConfig, InterventionConfig, SimulationResult } from '@/simulation/types';
import { Lightbulb } from 'lucide-react';

interface KeyInsightsProps {
  config: SimulationConfig;
  intervention: InterventionConfig;
  simResult: SimulationResult | null;
  baselineResult: SimulationResult | null;
}

export function KeyInsights({ config, intervention, simResult, baselineResult }: KeyInsightsProps) {
  const insights = generateKeyInsights(config, intervention, simResult, baselineResult);

  return (
    <AnimatePresence>
      {insights.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="glass-panel rounded-2xl p-5 border border-emerald-500/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-200">Key Insights</h3>
          </div>
          <ul className="space-y-2">
            {insights.map((text, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="text-sm text-slate-400 leading-relaxed flex gap-2"
              >
                <span className="text-emerald-500 shrink-0">•</span>
                <span>{text}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
