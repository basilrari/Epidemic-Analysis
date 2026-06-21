'use client';

import { useSimStore } from '@/store/simulation-store';
import { Button } from '@/components/ui/button';
import { ComparePanel } from '@/components/compare-panel';
import { InfectionCurveComparison } from '@/components/infection-curve';
import { MetricsRow } from '@/components/metrics-row';
import { CHART_COLORS } from '@/lib/node-colors';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function CompareView() {
  const {
    resultA, resultB, scenarioA, scenarioB, isCompareRunning,
    runComparePair,
  } = useSimStore();

  const curves = [
    ...(resultA ? [{ label: scenarioA.label, infectedCurve: resultA.infectedCurve, color: CHART_COLORS.baseline, dashed: false }] : []),
    ...(resultB ? [{ label: scenarioB.label, infectedCurve: resultB.infectedCurve, color: CHART_COLORS.intervention, dashed: false }] : []),
  ];

  const peakDiff = resultA && resultB && resultA.metrics.peakInfected > 0
    ? ((resultA.metrics.peakInfected - resultB.metrics.peakInfected) / resultA.metrics.peakInfected) * 100
    : null;

  const finalDiff = resultA && resultB && resultA.metrics.finalInfected > 0
    ? ((resultA.metrics.finalInfected - resultB.metrics.finalInfected) / resultA.metrics.finalInfected) * 100
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Compare Scenarios</h2>
          <p className="text-xs text-slate-500 mt-0.5">Run two configurations side-by-side to test topology or intervention effects.</p>
        </div>
        <Button onClick={runComparePair} disabled={isCompareRunning} size="sm">
          {isCompareRunning ? 'Running...' : 'Run Comparison'}
        </Button>
      </div>

      <ComparePanel />

      {resultA && resultB && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {(peakDiff !== null || finalDiff !== null) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {peakDiff !== null && (
                <div className={cn(
                  'rounded-2xl p-4 border text-center',
                  peakDiff > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'glass-panel'
                )}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Peak Infected Difference</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {peakDiff > 0 ? '↓' : '↑'} {Math.abs(peakDiff).toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{scenarioB.label} vs {scenarioA.label}</div>
                </div>
              )}
              {finalDiff !== null && (
                <div className={cn(
                  'rounded-2xl p-4 border text-center',
                  finalDiff > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'glass-panel'
                )}>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Final Infected Difference</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {finalDiff > 0 ? '↓' : '↑'} {Math.abs(finalDiff).toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{scenarioB.label} vs {scenarioA.label}</div>
                </div>
              )}
            </div>
          )}

          <InfectionCurveComparison results={curves} showReduction={false} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <h4 className="text-xs font-medium text-slate-400 mb-2">{scenarioA.label}</h4>
              <MetricsRow metrics={resultA.metrics} />
            </div>
            <div>
              <h4 className="text-xs font-medium text-slate-400 mb-2">{scenarioB.label}</h4>
              <MetricsRow metrics={resultB.metrics} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
