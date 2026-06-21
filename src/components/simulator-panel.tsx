'use client';

import { cn } from '@/lib/utils';
import type { SimulationConfig, InterventionConfig, NetworkType, InterventionStrategy } from '@/simulation/types';
import {
  PBL_GRAPH_TYPES,
  PBL_INTERVENTIONS,
  GRAPH_LABELS,
  INTERVENTION_LABELS,
  GRAPH_TYPE_TOOLTIPS,
  INTERVENTION_TOOLTIPS,
} from '@/lib/education';
import { InfoTooltip } from '@/components/info-tooltip';
import { Button } from '@/components/ui/button';
import { Play, GitBranch, Globe, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface SimulatorPanelProps {
  config: SimulationConfig;
  intervention: InterventionConfig;
  isRunning: boolean;
  onConfigChange: (partial: Partial<SimulationConfig>) => void;
  onInterventionChange: (partial: Partial<InterventionConfig>) => void;
  onRun: () => void;
}

const GRAPH_ICONS: Record<string, React.ElementType> = {
  'erdos-renyi': Globe,
  'barabasi-albert': GitBranch,
  'community': Users,
};

function SliderControl({
  label,
  tooltip,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  tooltip: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const display = format ? format(value) : step < 1 ? value.toFixed(2) : value.toFixed(0);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <InfoTooltip content={tooltip}>
          <label className="text-xs text-slate-400 cursor-help border-b border-dotted border-slate-600">{label}</label>
        </InfoTooltip>
        <span className="text-xs font-mono text-slate-300">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-[#1e293b]"
      />
    </div>
  );
}

export function SimulatorPanel({
  config,
  intervention,
  isRunning,
  onConfigChange,
  onInterventionChange,
  onRun,
}: SimulatorPanelProps) {
  return (
    <aside className="glass-panel rounded-2xl p-4 sm:p-5 space-y-5 xl:sticky xl:top-20">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Graph Type</h2>
        <div className="grid grid-cols-1 gap-2">
          {PBL_GRAPH_TYPES.map(key => {
            const Icon = GRAPH_ICONS[key] ?? Globe;
            return (
              <InfoTooltip key={key} content={GRAPH_TYPE_TOOLTIPS[key]}>
                <button
                  onClick={() => onConfigChange({ networkType: key as NetworkType })}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left',
                    config.networkType === key
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                      : 'bg-[#0b0f1a] border-[#1e293b] text-slate-400 hover:border-slate-600'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {GRAPH_LABELS[key]}
                </button>
              </InfoTooltip>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Intervention</h2>
        <div className="space-y-2">
          {PBL_INTERVENTIONS.map(key => (
            <InfoTooltip key={key} content={INTERVENTION_TOOLTIPS[key]}>
              <button
                onClick={() => onInterventionChange({ strategy: key as InterventionStrategy })}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left',
                  intervention.strategy === key
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                    : 'bg-[#0b0f1a] border-[#1e293b] text-slate-400 hover:border-slate-600'
                )}
              >
                <span>{INTERVENTION_LABELS[key]}</span>
                {key === 'degree-targeted' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Recommended</span>
                )}
              </button>
            </InfoTooltip>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Parameters</h2>
        <SliderControl
          label="Node Count"
          tooltip="Number of nodes in the network (entities in the system)."
          value={config.nodeCount}
          min={100}
          max={500}
          step={50}
          onChange={v => onConfigChange({ nodeCount: v })}
        />
        <SliderControl
          label="Infection Rate (β)"
          tooltip="Probability of transmission along an edge per time step."
          value={config.beta}
          min={0.02}
          max={0.08}
          step={0.005}
          format={v => v.toFixed(3)}
          onChange={v => onConfigChange({ beta: v })}
        />
        <SliderControl
          label="Recovery Rate (γ)"
          tooltip="Probability an infected node recovers per time step."
          value={config.gamma}
          min={0.03}
          max={0.06}
          step={0.005}
          format={v => v.toFixed(3)}
          onChange={v => onConfigChange({ gamma: v })}
        />
        <SliderControl
          label="Initial Infected"
          tooltip="Number of nodes infected at the start of the simulation."
          value={config.initialInfected}
          min={1}
          max={15}
          step={1}
          onChange={v => onConfigChange({ initialInfected: v })}
        />
      </div>

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={onRun}
          disabled={isRunning}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-[#0b0f1a] border-t-transparent rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run Simulation
            </>
          )}
        </Button>
      </motion.div>
    </aside>
  );
}
