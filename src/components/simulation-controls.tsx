'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import type { SimulationConfig, InterventionConfig, NetworkType, InterventionStrategy } from '@/simulation/types';
import { Play, RotateCcw, FlaskConical } from 'lucide-react';

interface ControlsPanelProps {
  config: SimulationConfig;
  intervention: InterventionConfig;
  isRunning: boolean;
  isAnimating?: boolean;
  hasResult: boolean;
  onConfigChange: (partial: Partial<SimulationConfig>) => void;
  onInterventionChange: (partial: Partial<InterventionConfig>) => void;
  onRun: () => void;
  onReset: () => void;
  className?: string;
}

const NETWORK_LABELS: Record<NetworkType, string> = {
  'erdos-renyi': 'Random (ER)',
  'barabasi-albert': 'Scale-Free (BA)',
  'watts-strogatz': 'Small-World (WS)',
  'community': 'Community (SBM)',
};

const INTERVENTION_LABELS: Record<InterventionStrategy, string> = {
  'none': 'None',
  'random': 'Random Vaccination',
  'degree-targeted': 'Degree-Targeted',
  'betweenness-targeted': 'Betweenness-Targeted',
  'edge-cutting': 'Edge Cutting',
};

function Knob({ label, value, min, max, step, onChange, unit }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</label>
        <span className="text-xs font-mono tabular-nums text-slate-300">
          {step >= 1 ? value.toFixed(0) : value.toFixed(2)}
          {unit && <span className="text-slate-500 ml-0.5">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer
          bg-slate-700 accent-emerald-500
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-3.5
          [&::-webkit-slider-thumb]:h-3.5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-emerald-400
          [&::-webkit-slider-thumb]:shadow-lg
          [&::-webkit-slider-thumb]:shadow-emerald-500/30
          [&::-webkit-slider-thumb]:transition-transform
          [&::-webkit-slider-thumb]:hover:scale-125"
      />
    </div>
  );
}

export function ControlsPanel({
  config,
  intervention,
  isRunning,
  hasResult,
  onConfigChange,
  onInterventionChange,
  onRun,
  onReset,
  className,
}: ControlsPanelProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Simulation Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Network Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.entries(NETWORK_LABELS) as [NetworkType, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onConfigChange({ networkType: key })}
                className={cn(
                  'px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 border',
                  config.networkType === key
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <Knob
          label="Nodes"
          value={config.nodeCount}
          min={50}
          max={1000}
          step={50}
          onChange={v => onConfigChange({ nodeCount: v })}
        />
        <Knob
          label="Avg Degree"
          value={config.avgDegree}
          min={2}
          max={12}
          step={1}
          onChange={v => onConfigChange({ avgDegree: v })}
        />
        <Knob
          label="Infection Rate (β)"
          value={config.beta}
          min={0.01}
          max={0.2}
          step={0.005}
          onChange={v => onConfigChange({ beta: v })}
        />
        <Knob
          label="Recovery Rate (γ)"
          value={config.gamma}
          min={0.01}
          max={0.15}
          step={0.005}
          onChange={v => onConfigChange({ gamma: v })}
        />
        <Knob
          label="Initial Infected"
          value={config.initialInfected}
          min={1}
          max={20}
          step={1}
          onChange={v => onConfigChange({ initialInfected: v })}
        />

        {/* Divider */}
        <div className="border-t border-slate-700/50 pt-4">
          <label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-2 block">
            Intervention Strategy
          </label>
          <div className="space-y-1.5">
            {(Object.entries(INTERVENTION_LABELS) as [InterventionStrategy, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onInterventionChange({ strategy: key })}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 border text-left',
                  intervention.strategy === key
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {intervention.strategy !== 'none' && (
          <Knob
            label="Intervention Budget"
            value={intervention.budget}
            min={0.02}
            max={0.3}
            step={0.02}
            onChange={v => onInterventionChange({ budget: v })}
            unit="%"
          />
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onRun}
            disabled={isRunning}
            className="flex-1"
            size="lg"
          >
            {isRunning ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4" />
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
      </CardContent>
    </Card>
  );
}
