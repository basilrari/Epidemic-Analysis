'use client';

import { cn } from '@/lib/utils';
import type { SimulationConfig, InterventionConfig, NetworkType, InterventionStrategy } from '@/simulation/types';
import {
  SIMULATION_PRESETS,
  NETWORK_LABELS,
  INTERVENTION_LABELS,
} from '@/lib/presets';
import { Button } from './ui/button';
import {
  Play, RotateCcw, Network, LayoutGrid,
  GitBranch, Globe, Users, Scissors,
} from 'lucide-react';

interface ControlsPanelProps {
  config: SimulationConfig;
  intervention: InterventionConfig;
  activePresetId: string | null;
  isRunning: boolean;
  hasResult: boolean;
  onConfigChange: (partial: Partial<SimulationConfig>) => void;
  onInterventionChange: (partial: Partial<InterventionConfig>) => void;
  onPresetSelect: (presetId: string) => void;
  onResetConfig: () => void;
  onRun: () => void;
  onReset: () => void;
  className?: string;
}

const TOPOLOGY_ICONS: Record<NetworkType, React.ReactNode> = {
  'erdos-renyi': <Globe className="w-4 h-4" />,
  'barabasi-albert': <GitBranch className="w-4 h-4" />,
  'watts-strogatz': <Network className="w-4 h-4" />,
  'community': <Users className="w-4 h-4" />,
};

const STRATEGY_ICONS: Record<InterventionStrategy, React.ReactNode> = {
  'none': <span className="w-4 h-4 flex items-center justify-center text-xs">—</span>,
  'random': <LayoutGrid className="w-4 h-4" />,
  'degree-targeted': <GitBranch className="w-4 h-4" />,
  'betweenness-targeted': <Network className="w-4 h-4" />,
  'edge-cutting': <Scissors className="w-4 h-4" />,
};

function SectionHeader({ number, title, action }: { number: number; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#00ff88]/15 text-[#00ff88] text-[10px] font-bold">
          {number}
        </span>
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{title}</span>
      </div>
      {action}
    </div>
  );
}

function Knob({ label, value, min, max, step, onChange, unit, format }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
  format?: (v: number) => string;
}) {
  const display = format
    ? format(value)
    : step >= 1 ? value.toFixed(0) : value < 0.01 ? value.toFixed(3) : value.toFixed(2);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-slate-400">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={e => onChange(parseFloat(e.target.value) || min)}
            className="w-14 bg-[#1a1a24] border border-[#2a2a3a] rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-300 text-right"
          />
          {unit && <span className="text-[10px] text-slate-500">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 rounded-full appearance-none cursor-pointer bg-[#2a2a3a]
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3
          [&::-webkit-slider-thumb]:h-3
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-[#00ff88]
          [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(0,255,136,0.5)]"
      />
      <div className="flex justify-between text-[9px] text-slate-600 font-mono">
        <span>{format ? format(min) : min}</span>
        <span>{format ? format(max) : max}</span>
      </div>
    </div>
  );
}

export function ControlsPanel({
  config,
  intervention,
  activePresetId,
  isRunning,
  hasResult,
  onConfigChange,
  onInterventionChange,
  onPresetSelect,
  onResetConfig,
  onRun,
  onReset,
  className,
}: ControlsPanelProps) {
  const initialInfectedPct = (config.initialInfected / config.nodeCount) * 100;

  return (
    <aside className={cn('flex flex-col gap-4', className)}>
      {/* 1. Presets */}
      <div className="glass-panel rounded-xl p-4">
        <SectionHeader number={1} title="Presets" />
        <div className="grid grid-cols-1 gap-1.5">
          {SIMULATION_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => onPresetSelect(preset.id)}
              className={cn(
                'px-3 py-2.5 rounded-lg text-left text-xs font-medium transition-all border',
                activePresetId === preset.id
                  ? 'bg-[#00ff88]/10 border-[#00ff88]/50 text-[#00ff88] neon-glow'
                  : 'bg-[#1a1a24] border-[#2a2a3a] text-slate-400 hover:border-[#00ff88]/30 hover:text-slate-300'
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Network Topology */}
      <div className="glass-panel rounded-xl p-4">
        <SectionHeader number={2} title="Network Topology" />
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.entries(NETWORK_LABELS) as [NetworkType, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onConfigChange({ networkType: key })}
              className={cn(
                'flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg text-xs font-medium transition-all border',
                config.networkType === key
                  ? 'bg-[#00ff88]/10 border-[#00ff88]/50 text-[#00ff88]'
                  : 'bg-[#1a1a24] border-[#2a2a3a] text-slate-400 hover:border-[#00ff88]/30'
              )}
            >
              {TOPOLOGY_ICONS[key]}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Parameters */}
      <div className="glass-panel rounded-xl p-4">
        <SectionHeader
          number={3}
          title="Parameters"
          action={
            <button onClick={onResetConfig} className="text-[10px] text-slate-500 hover:text-[#00ff88] transition-colors">
              Reset
            </button>
          }
        />
        <div className="space-y-3">
          <Knob label="Node Count" value={config.nodeCount} min={50} max={300} step={10}
            onChange={v => onConfigChange({ nodeCount: v })} />
          <Knob label="Avg Degree" value={config.avgDegree} min={1} max={4} step={1}
            onChange={v => onConfigChange({ avgDegree: v })} />
          <Knob label="Beta (Transmission)" value={config.beta} min={0.001} max={0.04} step={0.001}
            onChange={v => onConfigChange({ beta: v })} />
          <Knob
            label="Initial Infected (%)"
            value={initialInfectedPct}
            min={0.1}
            max={5.5}
            step={0.1}
            unit="%"
            format={v => v.toFixed(1)}
            onChange={v => onConfigChange({ initialInfected: Math.max(1, Math.round((v / 100) * config.nodeCount)) })}
          />
          <Knob label="Max Steps" value={config.maxSteps} min={10} max={80} step={5}
            onChange={v => onConfigChange({ maxSteps: v })} />
        </div>
      </div>

      {/* 4. Intervention Strategy */}
      <div className="glass-panel rounded-xl p-4">
        <SectionHeader number={4} title="Intervention Strategy" />
        <div className="space-y-1.5">
          {(Object.entries(INTERVENTION_LABELS) as [InterventionStrategy, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onInterventionChange({ strategy: key })}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border text-left',
                intervention.strategy === key
                  ? 'bg-[#00ff88]/10 border-[#00ff88]/50 text-[#00ff88] neon-glow'
                  : 'bg-[#1a1a24] border-[#2a2a3a] text-slate-400 hover:border-[#00ff88]/30'
              )}
            >
              {STRATEGY_ICONS[key]}
              {label}
            </button>
          ))}
        </div>

        {intervention.strategy !== 'none' && (
          <div className="mt-3 pt-3 border-t border-[#2a2a3a]">
            <Knob
              label="Vaccination Budget"
              value={intervention.budget * 100}
              min={2}
              max={40}
              step={2}
              unit="%"
              format={v => `${v.toFixed(0)}`}
              onChange={v => onInterventionChange({ budget: v / 100 })}
            />
          </div>
        )}
      </div>

      {/* Run Button */}
      <div className="flex gap-2">
        <Button
          onClick={onRun}
          disabled={isRunning}
          className="flex-1 text-sm"
          size="lg"
        >
          {isRunning ? (
            <>
              <span className="w-4 h-4 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              Run Simulation
            </>
          )}
        </Button>
        {hasResult && (
          <Button variant="outline" onClick={onReset} size="lg">
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>
      <p className="text-[10px] text-slate-600 text-center">Start New Simulation</p>
    </aside>
  );
}
