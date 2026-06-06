'use client';

import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import type { SimulationMetrics } from '@/simulation/types';

interface MetricsDashboardProps {
  metrics: SimulationMetrics | null;
  baselineMetrics?: SimulationMetrics | null;
  label?: string;
  className?: string;
}

function MetricCard({
  label,
  value,
  unit,
  trend,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  trend?: { direction: 'up' | 'down'; label: string; good: boolean };
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('text-lg font-bold tabular-nums', color || 'text-slate-100')}>
          {value}
        </span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {trend && (
        <div className={cn(
          'text-[10px] mt-0.5',
          trend.good ? 'text-emerald-400' : 'text-red-400'
        )}>
          {trend.direction === 'down' ? '↓' : '↑'} {trend.label}
        </div>
      )}
    </div>
  );
}

export function MetricsDashboard({ metrics, baselineMetrics, label, className }: MetricsDashboardProps) {
  if (!metrics) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="text-center text-sm text-slate-500">
            {label ? `${label} — no data` : 'No simulation data'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const reductionColor = metrics.reductionPercent > 30
    ? 'text-emerald-400'
    : metrics.reductionPercent > 10
    ? 'text-amber-400'
    : 'text-red-400';

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2', className)}>
      <MetricCard
        label="Peak Infected"
        value={metrics.peakInfected.toFixed(0)}
        unit="nodes"
        color="text-red-400"
        trend={baselineMetrics ? {
          direction: 'down',
          label: `${((1 - metrics.peakInfected / baselineMetrics.peakInfected) * 100).toFixed(0)}% vs baseline`,
          good: true,
        } : undefined}
      />
      <MetricCard
        label="Time to Peak"
        value={metrics.timeToPeak.toFixed(0)}
        unit="steps"
      />
      <MetricCard
        label="Final Infected"
        value={metrics.finalInfected.toFixed(0)}
        unit={`(${(metrics.attackRate * 100).toFixed(0)}%)`}
        color="text-amber-400"
        trend={baselineMetrics ? {
          direction: 'down',
          label: `${((1 - metrics.finalInfected / baselineMetrics.finalInfected) * 100).toFixed(0)}% vs baseline`,
          good: true,
        } : undefined}
      />
      <MetricCard
        label="Attack Rate"
        value={(metrics.attackRate * 100).toFixed(1)}
        unit="%"
      />
      <MetricCard
        label="Duration"
        value={metrics.epidemicDuration.toFixed(0)}
        unit="steps"
      />
      <MetricCard
        label="Reduction"
        value={metrics.reductionPercent > 0 ? metrics.reductionPercent.toFixed(1) : '—'}
        unit="%"
        color={reductionColor}
      />
    </div>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs text-slate-400">
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
        Susceptible
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
        Infected
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        Recovered
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        Vaccinated
      </span>
    </div>
  );
}
