'use client';

import { useSimStore } from '@/store/simulation-store';
import { NetworkCanvas } from '@/components/network-canvas';
import { ControlsPanel } from '@/components/simulation-controls';
import { InfectionCurve, SIRCurve } from '@/components/infection-curve';
import { MetricsDashboard, Legend } from '@/components/metrics-dashboard';
import { Button } from '@/components/ui/button';
import { BarChart3, GitCompare, Beaker, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

function NavTab({ active, icon: Icon, label, onClick }: { active: boolean; icon: any; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
        active
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

export default function SandboxPage() {
  const {
    view, setView,
    config, intervention, isRunning, simResult, baselineResult,
    runSandbox, resetSandbox,
  } = useSimStore();

  // Handle navigation wrapper
  const content = (() => {
    switch (view) {
      case 'sandbox': return <SandboxView />;
      case 'compare': return <CompareView />;
      case 'study': return <StudyView />;
      default: return <SandboxView />;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Radio className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-100 tracking-tight">Epidemic Simulator</h1>
                <p className="text-[10px] text-slate-500 font-mono">Network SIR Model</p>
              </div>
            </div>
            <nav className="flex gap-1.5">
              <NavTab active={view === 'sandbox'} icon={Beaker} label="Sandbox" onClick={() => setView('sandbox')} />
              <NavTab active={view === 'compare'} icon={GitCompare} label="Compare" onClick={() => setView('compare')} />
              <NavTab active={view === 'study'} icon={BarChart3} label="Study" onClick={() => setView('study')} />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {content}
      </main>
    </div>
  );
}

// ---- Sandbox View ----
function SandboxView() {
  const {
    config, intervention, isRunning, simResult, baselineResult,
    runSandbox, resetSandbox,
    setConfig, setIntervention,
  } = useSimStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
      {/* Left: Controls */}
      <ControlsPanel
        config={config}
        intervention={intervention}
        isRunning={isRunning}
        hasResult={!!simResult}
        onConfigChange={setConfig}
        onInterventionChange={setIntervention}
        onRun={runSandbox}
        onReset={resetSandbox}
        className="lg:sticky lg:top-20"
      />

      {/* Right: Visualization */}
      <div className="space-y-4">
        {/* Network Canvas */}
        <div className="relative">
          <NetworkCanvas result={simResult} />
          {simResult && (
            <div className="absolute bottom-3 left-3">
              <Legend />
            </div>
          )}
        </div>

        {/* Metrics */}
        <MetricsDashboard
          metrics={simResult?.metrics ?? null}
          baselineMetrics={baselineResult?.metrics ?? null}
          label={intervention.strategy === 'none' ? 'Baseline (no intervention)' : `Strategy: ${intervention.strategy}`}
        />

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SIRCurve result={simResult} />
          <InfectionCurve
            results={[
              ...(baselineResult ? [{ label: 'No Intervention', infectedCurve: baselineResult.infectedCurve, color: '#f43f5e' }] : []),
              ...(simResult && intervention.strategy !== 'none'
                ? [{ label: intervention.strategy === 'random' ? 'Random Vaccination'
                    : intervention.strategy === 'degree-targeted' ? 'Degree-Targeted'
                    : intervention.strategy === 'betweenness-targeted' ? 'Betweenness-Targeted'
                    : intervention.strategy === 'edge-cutting' ? 'Edge Cutting'
                    : 'Intervention',
                    infectedCurve: simResult.infectedCurve, color: '#34d399' }]
                : []),
            ]}
          />
        </div>
      </div>
    </div>
  );
}

// ---- Compare View ----
function CompareView() {
  const {
    compareConfigs, compareResults,
    runCompare, addCompareConfig, removeCompareConfig, updateCompareConfig,
  } = useSimStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Strategy Comparison</h2>
          <p className="text-sm text-slate-500 mt-0.5">Compare intervention strategies side-by-side on the same network</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addCompareConfig}>
            + Add Config
          </Button>
          <Button onClick={runCompare} size="sm">
            Run All
          </Button>
        </div>
      </div>

      {/* Config Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {compareConfigs.map((cc, idx) => (
          <div key={idx} className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={cc.label}
                onChange={e => {
                  const updated = [...compareConfigs];
                  updated[idx] = { ...updated[idx], label: e.target.value };
                  useSimStore.setState({ compareConfigs: updated });
                }}
                className="bg-transparent text-sm font-medium text-slate-200 border-b border-transparent hover:border-slate-600 focus:border-emerald-500 outline-none"
              />
              {compareConfigs.length > 2 && (
                <button onClick={() => removeCompareConfig(idx)} className="text-slate-500 hover:text-red-400 text-xs px-1">
                  ✕
                </button>
              )}
            </div>
            <div className="space-y-1.5">
              <select
                value={cc.intervention.strategy}
                onChange={e => updateCompareConfig(idx, 'intervention', { strategy: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
              >
                <option value="none">None</option>
                <option value="random">Random</option>
                <option value="degree-targeted">Degree-Targeted</option>
                <option value="betweenness-targeted">Betweenness-Targeted</option>
                <option value="edge-cutting">Edge Cutting</option>
              </select>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={cc.intervention.budget}
                  onChange={e => updateCompareConfig(idx, 'intervention', { budget: parseFloat(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                  step={0.02}
                  min={0}
                  max={0.3}
                />
                <span className="text-[10px] text-slate-500 self-center">budget</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      {compareResults.some(r => r !== null) && (
        <div className="space-y-4">
          {/* Network Canvases */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {compareResults.map((result, idx) => result ? (
              <div key={idx}>
                <NetworkCanvas result={result} compact label={compareConfigs[idx]?.label} />
              </div>
            ) : null)}
          </div>

          {/* Comparison Chart */}
          <InfectionCurve
            results={compareResults
              .filter((r): r is NonNullable<typeof r> => r !== null)
              .map((r, i) => ({
                label: compareConfigs[i]?.label ?? `Config ${i + 1}`,
                infectedCurve: r.infectedCurve,
                color: '',
              }))}
          />

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {compareResults.map((result, idx) => result ? (
              <MetricsDashboard
                key={idx}
                metrics={result.metrics}
                label={compareConfigs[idx]?.label}
              />
            ) : null)}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Study View ----
function StudyView() {
  const {
    studyConfig, studyResult, isStudyRunning,
    setStudySimConfig, setStudyIntervention, runStudySim,
  } = useSimStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Batch Study</h2>
          <p className="text-sm text-slate-500 mt-0.5">Run multiple trials to get statistically meaningful results</p>
        </div>
        <Button onClick={runStudySim} disabled={isStudyRunning} size="sm">
          {isStudyRunning ? 'Running...' : 'Run Study'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Experiment Config</h3>

          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-slate-400">Label</label>
            <input
              type="text"
              value={studyConfig.label}
              onChange={e => { const s = useSimStore.getState().studyConfig; useSimStore.setState({ studyConfig: { ...s, label: e.target.value } }); }}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400">Network</label>
              <select
                value={studyConfig.simulation.networkType}
                onChange={e => setStudySimConfig({ networkType: e.target.value as any })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
              >
                <option value="erdos-renyi">Random (ER)</option>
                <option value="barabasi-albert">Scale-Free (BA)</option>
                <option value="watts-strogatz">Small-World (WS)</option>
                <option value="community">Community (SBM)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400">Trials</label>
              <input
                type="number"
                value={studyConfig.trials}
                onChange={e => { const s = useSimStore.getState().studyConfig; useSimStore.setState({ studyConfig: { ...s, trials: parseInt(e.target.value) || 10 } }); }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                min={5}
                max={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400">Nodes</label>
              <input
                type="number"
                value={studyConfig.simulation.nodeCount}
                onChange={e => setStudySimConfig({ nodeCount: parseInt(e.target.value) || 200 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400">Avg Degree</label>
              <input
                type="number"
                value={studyConfig.simulation.avgDegree}
                onChange={e => setStudySimConfig({ avgDegree: parseInt(e.target.value) || 4 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400">β (Infection)</label>
              <input
                type="number"
                value={studyConfig.simulation.beta}
                onChange={e => setStudySimConfig({ beta: parseFloat(e.target.value) || 0.06 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                step={0.01}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400">γ (Recovery)</label>
              <input
                type="number"
                value={studyConfig.simulation.gamma}
                onChange={e => setStudySimConfig({ gamma: parseFloat(e.target.value) || 0.04 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                step={0.01}
              />
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-4 space-y-3">
            <h4 className="text-[11px] uppercase tracking-wider text-slate-400">Intervention</h4>
            <select
              value={studyConfig.intervention.strategy}
              onChange={e => setStudyIntervention({ strategy: e.target.value as any })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
            >
              <option value="none">None</option>
              <option value="random">Random Vaccination</option>
              <option value="degree-targeted">Degree-Targeted</option>
              <option value="betweenness-targeted">Betweenness-Targeted</option>
              <option value="edge-cutting">Edge Cutting</option>
            </select>
            <div className="space-y-1.5">
              <label className="text-[11px] uppercase tracking-wider text-slate-400">Budget</label>
              <input
                type="number"
                value={studyConfig.intervention.budget}
                onChange={e => setStudyIntervention({ budget: parseFloat(e.target.value) || 0.1 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
                step={0.05}
                min={0}
                max={0.5}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/80 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wide">Results</h3>
          {!studyResult ? (
            <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
              {isStudyRunning ? (
                <div className="flex flex-col items-center gap-3">
                  <span className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <span>Running {studyConfig.trials} trials...</span>
                </div>
              ) : (
                <span>Configure and run a study to see results</span>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Averages */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-[10px] text-slate-500 uppercase">Peak Infected</div>
                  <div className="text-lg font-bold tabular-nums text-red-400">
                    {studyResult.average.peakInfected.toFixed(1)}
                    <span className="text-xs text-slate-500 ml-1">±{studyResult.stdDev.peakInfected?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-[10px] text-slate-500 uppercase">Attack Rate</div>
                  <div className="text-lg font-bold tabular-nums text-amber-400">
                    {(studyResult.average.attackRate * 100).toFixed(1)}%
                    <span className="text-xs text-slate-500 ml-1">±{(studyResult.stdDev.attackRate! * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-[10px] text-slate-500 uppercase">Final Infected</div>
                  <div className="text-lg font-bold tabular-nums text-emerald-400">
                    {studyResult.average.finalInfected.toFixed(1)}
                    <span className="text-xs text-slate-500 ml-1">±{studyResult.stdDev.finalInfected?.toFixed(1)}</span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-800/50 p-3">
                  <div className="text-[10px] text-slate-500 uppercase">Reduction</div>
                  <div className="text-lg font-bold tabular-nums text-emerald-400">
                    {studyResult.average.reductionPercent.toFixed(1)}%
                    <span className="text-xs text-slate-500 ml-1">±{studyResult.stdDev.reductionPercent?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Trial list */}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {studyResult.metrics.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-800/30">
                    <span className="text-slate-500">Trial {i + 1}</span>
                    <div className="flex gap-3 text-slate-400">
                      <span>peak: {m.peakInfected}</span>
                      <span>final: {m.finalInfected}</span>
                      <span className="text-emerald-400">-{m.reductionPercent.toFixed(0)}%</span>
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
