'use client';

import { useSimStore } from '@/store/simulation-store';
import { SIMULATION_PRESETS, formatStrategyLabel, formatTopologyLabel } from '@/lib/presets';

export function AppFooter() {
  const {
    view,
    config,
    intervention,
    activePresetId,
    lastRunDuration,
    simulationStatus,
  } = useSimStore();

  const preset = SIMULATION_PRESETS.find(p => p.id === activePresetId);

  const scenarioSummary = view === 'sandbox'
    ? [
        preset ? `Scenario: ${preset.name}` : null,
        `Topology: ${formatTopologyLabel(config.networkType)}`,
        `Strategy: ${formatStrategyLabel(intervention.strategy)}`,
        intervention.strategy !== 'none' ? `Budget: ${(intervention.budget * 100).toFixed(0)}%` : null,
      ].filter(Boolean).join(' | ')
    : view === 'compare'
    ? 'Strategy Comparison Mode'
    : 'Batch Study Mode';

  const statusText = simulationStatus === 'completed' && lastRunDuration
    ? `Simulation completed • ${lastRunDuration.toFixed(1)}s`
    : simulationStatus === 'running'
    ? 'Simulation in progress...'
    : 'Ready to simulate';

  return (
    <footer className="border-t border-[#2a2a3a] bg-[#0a0a0f]/90 backdrop-blur-md mt-auto">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <p className="text-[10px] text-slate-500 font-mono truncate max-w-[70%]">
          {scenarioSummary}
        </p>
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${simulationStatus === 'completed' ? 'bg-[#00ff88]' : simulationStatus === 'running' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-[10px] text-slate-500">{statusText}</span>
        </div>
      </div>
    </footer>
  );
}
