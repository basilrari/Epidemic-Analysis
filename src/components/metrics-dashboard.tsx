'use client';

import { cn } from '@/lib/utils';
import type { SimulationMetrics } from '@/simulation/types';
import { TrendingDown, Users, Clock, Activity, Zap, DollarSign } from 'lucide-react';

interface MetricsDashboardProps {
  metrics: SimulationMetrics | null;
  baselineMetrics?: SimulationMetrics | null;
  label?: string;
  className?: string;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  subValue,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  trend?: { pct: number; good: boolean };
  color?: string;
}) {
  return (
    <div className="glass-panel rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-[#1a1a24] border border-[#2a2a3a]">
          <Icon className={cn('w-3.5 h-3.5', color || 'text-slate-400')} />
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <div>
        <div className={cn('text-xl font-bold tabular-nums', color || 'text-slate-100')}>
          {value}
        </div>
        {subValue && <div className="text-[10px] text-slate-500 mt-0.5">{subValue}</div>}
      </div>
      {trend && trend.pct > 0 && (
        <div className={cn('text-[10px] flex items-center gap-1', trend.good ? 'text-[#00ff88]' : 'text-red-400')}>
          <TrendingDown className="w-3 h-3" />
          ↓ {trend.pct.toFixed(0)}%
        </div>
      )}
    </div>
  );
}

function calcTrend(current: number, baseline: number) {
  if (!baseline || baseline === 0) return undefined;
  const pct = Math.abs((1 - current / baseline) * 100);
  return { pct, good: current < baseline };
}

export function MetricsDashboard({ metrics, baselineMetrics, className }: MetricsDashboardProps) {
  if (!metrics) {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel rounded-xl p-3 h-24 flex items-center justify-center">
            <span className="text-[10px] text-slate-600">—</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3', className)}>
      <MetricCard
        icon={Users}
        label="Peak Infected"
        value={metrics.peakInfected.toLocaleString()}
        subValue={`Day ${metrics.timeToPeak}`}
        color="text-red-400"
        trend={baselineMetrics ? calcTrend(metrics.peakInfected, baselineMetrics.peakInfected) : undefined}
      />
      <MetricCard
        icon={Activity}
        label="Attack Rate"
        value={`${(metrics.attackRate * 100).toFixed(1)}%`}
        color="text-amber-400"
        trend={baselineMetrics ? calcTrend(metrics.attackRate, baselineMetrics.attackRate) : undefined}
      />
      <MetricCard
        icon={Clock}
        label="Days to Peak"
        value={metrics.timeToPeak.toFixed(1)}
        trend={baselineMetrics ? calcTrend(metrics.timeToPeak, baselineMetrics.timeToPeak) : undefined}
      />
      <MetricCard
        icon={Users}
        label="Total Infected"
        value={metrics.finalInfected.toLocaleString()}
        color="text-orange-400"
        trend={baselineMetrics ? calcTrend(metrics.finalInfected, baselineMetrics.finalInfected) : undefined}
      />
      <MetricCard
        icon={Zap}
        label="R₀ (Baseline)"
        value={metrics.r0.toFixed(2)}
        color="text-blue-400"
        trend={baselineMetrics ? calcTrend(metrics.r0, baselineMetrics.r0) : undefined}
      />
      <MetricCard
        icon={DollarSign}
        label="Cost (Budget Used)"
        value={metrics.interventionCost.toLocaleString()}
        subValue={metrics.interventionBudgetUsed > 0
          ? `of ${Math.round(metrics.interventionCost / Math.max(metrics.interventionBudgetUsed, 0.001)).toLocaleString()}, ${(metrics.interventionBudgetUsed * 100).toFixed(0)}%`
          : 'No intervention'}
        color="text-[#00ff88]"
      />
    </div>
  );
}

export { Legend } from './network-canvas';
