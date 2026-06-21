'use client';

import { useSimStore } from '@/store/simulation-store';
import { NetworkCanvas } from '@/components/network-canvas';
import { ControlsPanel } from '@/components/simulation-controls';
import { SIRCurve, InfectionCurveComparison, LogScaleComparison, InfectionCurve } from '@/components/infection-curve';
import { MetricsDashboard } from '@/components/metrics-dashboard';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { Button } from '@/components/ui/button';
import { formatStrategyLabel } from '@/lib/presets';
import { CHART_COLORS } from '@/lib/node-colors';
import { cn } from '@/lib/utils';
import type { InterventionStrategy } from '@/simulation/types';

export default function AppPage() {
  const { view } = useSimStore();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-5">
        {view === 'sandbox' && <SandboxView />}
        {view === 'compare' && <CompareView />}
        {view === 'study' && <StudyView />}
      </main>
      <AppFooter />
    </div>
  );
}

function SandboxView() {
  const {
    config, intervention, activePresetId, isRunning, simResult, baselineResult, currentStep,
    runSandbox, resetSandbox, setConfig, setIntervention, applyPreset, resetConfig,
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
    }] : []),
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">
      <ControlsPanel
        config={config}
        intervention={intervention}
        activePresetId={activePresetId}
        isRunning={isRunning}
        hasResult={!!simResult}
        onConfigChange={setConfig}
        onInterventionChange={setIntervention}
        onPresetSelect={applyPreset}
        onResetConfig={resetConfig}
        onRun={runSandbox}
        onReset={resetSandbox}
        className="xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto"
      />

      <div className="space-y-4 min-w-0">
        <NetworkCanvas
          result={simResult}
          currentStep={currentStep}
          showPlayback={!!simResult}
        />

        <MetricsDashboard
          metrics={simResult?.metrics ?? null}
          baselineMetrics={baselineResult?.metrics ?? null}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SIRCurve result={simResult ? { ...simResult, metrics: simResult.metrics } : null} />
          <InfectionCurveComparison results={comparisonCurves} showReduction />
          <LogScaleComparison results={comparisonCurves} />
        </div>
      </div>
    </div>
  );
}

function CompareView() {
  const {
    compareConfigs, compareResults,
    runCompare, addCompareConfig, removeCompareConfig, updateCompareConfig,
  } = useSimStore();

  const COLORS = [CHART_COLORS.baseline, CHART_COLORS.intervention, CHART_COLORS.susceptible, '#f59e0b', '#a78bfa', '#9ca3af'];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Strategy Comparison</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare intervention strategies side-by-side on the same network topology
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addCompareConfig}>+ Add Config</Button>
          <Button onClick={runCompare} size="sm">Run All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {compareConfigs.map((cc, idx) => (
          <div key={idx} className="glass-panel rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={cc.label}
                onChange={e => {
                  const updated = [...compareConfigs];
                  updated[idx] = { ...updated[idx], label: e.target.value };
                  useSimStore.setState({ compareConfigs: updated });
                }}
                className="bg-transparent text-sm font-medium text-slate-200 border-b border-transparent hover:border-[#2a2a3a] focus:border-[#00ff88] outline-none"
              />
              {compareConfigs.length > 2 && (
                <button onClick={() => removeCompareConfig(idx)} className="text-slate-500 hover:text-red-400 text-xs">✕</button>
              )}
            </div>
            <select
              value={cc.intervention.strategy}
              onChange={e => updateCompareConfig(idx, 'intervention', { strategy: e.target.value as InterventionStrategy })}
              className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-xs text-slate-300"
            >
              {['none', 'random', 'degree-targeted', 'betweenness-targeted', 'edge-cutting'].map(s => (
                <option key={s} value={s}>{formatStrategyLabel(s as any)}</option>
              ))}
            </select>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={2}
                max={40}
                step={2}
                value={cc.intervention.budget * 100}
                onChange={e => updateCompareConfig(idx, 'intervention', { budget: parseFloat(e.target.value) / 100 })}
                className="flex-1"
                disabled={cc.intervention.strategy === 'none'}
              />
              <span className="text-[10px] font-mono text-slate-500 w-8">
                {(cc.intervention.budget * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {compareResults.some(r => r !== null) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {compareResults.map((result, idx) => result ? (
              <NetworkCanvas key={idx} result={result} compact label={compareConfigs[idx]?.label} />
            ) : null)}
          </div>

          <InfectionCurve
            results={compareResults
              .filter((r): r is NonNullable<typeof r> => r !== null)
              .map((r, i) => ({
                label: compareConfigs[i]?.label ?? `Config ${i + 1}`,
                infectedCurve: r.infectedCurve,
                color: COLORS[i % COLORS.length],
              }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compareResults.map((result, idx) => result ? (
              <div key={idx} className="space-y-2">
                <h4 className="text-xs font-medium text-slate-400">{compareConfigs[idx]?.label}</h4>
                <MetricsDashboard metrics={result.metrics} />
              </div>
            ) : null)}
          </div>
        </div>
      )}
    </div>
  );
}

function StudyView() {
  const {
    studyConfig, studyResult, isStudyRunning,
    setStudySimConfig, setStudyIntervention, runStudySim,
  } = useSimStore();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Batch Study</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Run multiple trials to get statistically meaningful epidemic metrics
          </p>
        </div>
        <Button onClick={runStudySim} disabled={isStudyRunning} size="sm">
          {isStudyRunning ? 'Running...' : 'Run Study'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Experiment Config</h3>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-slate-500">Label</label>
            <input
              type="text"
              value={studyConfig.label}
              onChange={e => {
                const s = useSimStore.getState().studyConfig;
                useSimStore.setState({ studyConfig: { ...s, label: e.target.value } });
              }}
              className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Network">
              <select
                value={studyConfig.simulation.networkType}
                onChange={e => setStudySimConfig({ networkType: e.target.value as any })}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-2 py-2 text-xs text-slate-300"
              >
                <option value="erdos-renyi">Random (ER)</option>
                <option value="barabasi-albert">Scale-Free (BA)</option>
                <option value="watts-strogatz">Small-World (WS)</option>
                <option value="community">Community (SBM)</option>
              </select>
            </Field>
            <Field label="Trials">
              <input
                type="number"
                value={studyConfig.trials}
                onChange={e => {
                  const s = useSimStore.getState().studyConfig;
                  useSimStore.setState({ studyConfig: { ...s, trials: parseInt(e.target.value) || 10 } });
                }}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-2 py-2 text-xs text-slate-300"
                min={5}
                max={100}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nodes">
              <input type="number" value={studyConfig.simulation.nodeCount}
                onChange={e => setStudySimConfig({ nodeCount: parseInt(e.target.value) || 200 })}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-2 py-2 text-xs text-slate-300" />
            </Field>
            <Field label="Avg Degree">
              <input type="number" value={studyConfig.simulation.avgDegree}
                onChange={e => setStudySimConfig({ avgDegree: parseInt(e.target.value) || 4 })}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-2 py-2 text-xs text-slate-300" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="β (Transmission)">
              <input type="number" value={studyConfig.simulation.beta} step={0.01}
                onChange={e => setStudySimConfig({ beta: parseFloat(e.target.value) || 0.04 })}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-2 py-2 text-xs text-slate-300" />
            </Field>
            <Field label="γ (Recovery)">
              <input type="number" value={studyConfig.simulation.gamma} step={0.01}
                onChange={e => setStudySimConfig({ gamma: parseFloat(e.target.value) || 0.04 })}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-2 py-2 text-xs text-slate-300" />
            </Field>
          </div>

          <div className="border-t border-[#2a2a3a] pt-4 space-y-3">
            <h4 className="text-[10px] uppercase tracking-wider text-slate-500">Intervention</h4>
            <select
              value={studyConfig.intervention.strategy}
              onChange={e => setStudyIntervention({ strategy: e.target.value as any })}
              className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-2 py-2 text-xs text-slate-300"
            >
              {['none', 'random', 'degree-targeted', 'betweenness-targeted', 'edge-cutting'].map(s => (
                <option key={s} value={s}>{formatStrategyLabel(s as any)}</option>
              ))}
            </select>
            <Field label="Budget">
              <input type="number" value={studyConfig.intervention.budget} step={0.05}
                onChange={e => setStudyIntervention({ budget: parseFloat(e.target.value) || 0.1 })}
                className="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-lg px-2 py-2 text-xs text-slate-300"
                min={0} max={0.5} />
            </Field>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Results</h3>
          {!studyResult ? (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              {isStudyRunning ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="w-6 h-6 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
                  <span>Running {studyConfig.trials} trials...</span>
                </div>
              ) : (
                <span>Configure and run a study to see results</span>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatBox label="Peak Infected" value={studyResult.average.peakInfected.toFixed(1)}
                  std={studyResult.stdDev.peakInfected?.toFixed(1)} color="text-red-400" />
                <StatBox label="Attack Rate" value={`${(studyResult.average.attackRate * 100).toFixed(1)}%`}
                  std={studyResult.stdDev.attackRate ? `±${(studyResult.stdDev.attackRate * 100).toFixed(1)}%` : undefined} color="text-amber-400" />
                <StatBox label="Final Infected" value={studyResult.average.finalInfected.toFixed(1)}
                  std={studyResult.stdDev.finalInfected?.toFixed(1)} color="text-[#00ff88]" />
                <StatBox label="Reduction" value={`${studyResult.average.reductionPercent.toFixed(1)}%`}
                  std={studyResult.stdDev.reductionPercent?.toFixed(1)} color="text-[#00ff88]" />
              </div>

              <div className="max-h-52 overflow-y-auto space-y-1">
                {studyResult.metrics.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-2 px-3 rounded-lg hover:bg-[#1a1a24]/50 border border-transparent hover:border-[#2a2a3a]">
                    <span className="text-slate-500 font-mono">Trial {i + 1}</span>
                    <div className="flex gap-4 text-slate-400 font-mono text-[10px]">
                      <span>peak: {m.peakInfected}</span>
                      <span>final: {m.finalInfected}</span>
                      <span className="text-[#00ff88]">-{m.reductionPercent.toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-wider text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function StatBox({ label, value, std, color }: { label: string; value: string; std?: string; color: string }) {
  return (
    <div className="rounded-lg bg-[#1a1a24] border border-[#2a2a3a] p-3">
      <div className="text-[10px] text-slate-500 uppercase">{label}</div>
      <div className={cn('text-lg font-bold tabular-nums', color)}>
        {value}
        {std && <span className="text-xs text-slate-500 ml-1">±{std}</span>}
      </div>
    </div>
  );
}
