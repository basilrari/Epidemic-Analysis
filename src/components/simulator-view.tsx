'use client';

import { useSimStore } from '@/store/simulation-store';
import { SimulatorPanel } from '@/components/simulator-panel';
import { NetworkCanvas } from '@/components/network-canvas';
import { MetricsRow } from '@/components/metrics-row';
import { InfectionCurveComparison } from '@/components/infection-curve';
import { KeyInsights } from '@/components/key-insights';
import { CHART_COLORS } from '@/lib/node-colors';

export function SimulatorView() {
  const {
    config, intervention, isRunning, simResult, baselineResult, currentStep,
    runSimulator, setConfig, setIntervention,
  } = useSimStore();

  const comparisonCurves = [
    ...(baselineResult ? [{
      label: 'Baseline (No Intervention)',
      infectedCurve: baselineResult.infectedCurve,
      color: CHART_COLORS.baseline,
      dashed: true,
    }] : []),
    ...(simResult && intervention.strategy !== 'none' ? [{
      label: 'With Intervention',
      infectedCurve: simResult.infectedCurve,
      color: CHART_COLORS.intervention,
      dashed: false,
    }] : simResult ? [{
      label: 'Simulation',
      infectedCurve: simResult.infectedCurve,
      color: CHART_COLORS.infected,
      dashed: false,
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-5">
        <SimulatorPanel
          config={config}
          intervention={intervention}
          isRunning={isRunning}
          onConfigChange={setConfig}
          onInterventionChange={setIntervention}
          onRun={runSimulator}
        />

        <NetworkCanvas
          result={simResult}
          currentStep={currentStep}
          showPlayback={!!simResult}
        />
      </div>

      <MetricsRow
        metrics={simResult?.metrics ?? null}
        baselineMetrics={baselineResult?.metrics ?? null}
        hasIntervention={intervention.strategy !== 'none'}
      />

      <InfectionCurveComparison results={comparisonCurves} showReduction={intervention.strategy !== 'none'} />

      <KeyInsights
        config={config}
        intervention={intervention}
        simResult={simResult}
        baselineResult={baselineResult}
      />
    </div>
  );
}
