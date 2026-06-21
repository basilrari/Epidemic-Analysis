'use client';

import { useSimStore } from '@/store/simulation-store';
import {
  COMPARE_PRESETS,
  PBL_GRAPH_TYPES,
  PBL_INTERVENTIONS,
  GRAPH_LABELS,
  INTERVENTION_LABELS,
} from '@/lib/education';
import { cn } from '@/lib/utils';
import type { NetworkType, InterventionStrategy } from '@/simulation/types';

export function ComparePanel() {
  const {
    scenarioA, scenarioB,
    setScenarioAConfig, setScenarioBConfig,
    setScenarioAIntervention, setScenarioBIntervention,
    applyComparePreset,
  } = useSimStore();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {COMPARE_PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => applyComparePreset(preset.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0b0f1a] border border-[#1e293b] text-slate-400 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ScenarioCard
          title="Scenario A"
          label={scenarioA.label}
          networkType={scenarioA.config.networkType}
          strategy={scenarioA.intervention.strategy}
          onNetworkChange={v => setScenarioAConfig({ networkType: v })}
          onStrategyChange={v => setScenarioAIntervention({ strategy: v })}
        />
        <ScenarioCard
          title="Scenario B"
          label={scenarioB.label}
          networkType={scenarioB.config.networkType}
          strategy={scenarioB.intervention.strategy}
          onNetworkChange={v => setScenarioBConfig({ networkType: v })}
          onStrategyChange={v => setScenarioBIntervention({ strategy: v })}
        />
      </div>
    </div>
  );
}

function ScenarioCard({
  title,
  label,
  networkType,
  strategy,
  onNetworkChange,
  onStrategyChange,
}: {
  title: string;
  label: string;
  networkType: NetworkType;
  strategy: InterventionStrategy;
  onNetworkChange: (v: NetworkType) => void;
  onStrategyChange: (v: InterventionStrategy) => void;
}) {
  return (
    <div className="glass-panel rounded-2xl p-4 space-y-4">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">{title}</div>
        <div className="text-sm font-medium text-slate-200 mt-0.5">{label}</div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 block">Graph Type</label>
        <div className="flex flex-wrap gap-1.5">
          {PBL_GRAPH_TYPES.map(key => (
            <button
              key={key}
              onClick={() => onNetworkChange(key)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                networkType === key
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#0b0f1a] border-[#1e293b] text-slate-400'
              )}
            >
              {GRAPH_LABELS[key]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 block">Intervention</label>
        <div className="flex flex-wrap gap-1.5">
          {PBL_INTERVENTIONS.map(key => (
            <button
              key={key}
              onClick={() => onStrategyChange(key)}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                strategy === key
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-[#0b0f1a] border-[#1e293b] text-slate-400'
              )}
            >
              {INTERVENTION_LABELS[key]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
