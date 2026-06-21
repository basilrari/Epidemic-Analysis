'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { SimulationMetrics } from '@/simulation/types';
import { TrendingDown, Users, Activity, Clock } from 'lucide-react';

interface MetricsRowProps {
  metrics: SimulationMetrics | null;
  baselineMetrics?: SimulationMetrics | null;
  hasIntervention?: boolean;
}

function AnimatedNumber({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const end = value;
    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(start + (end - start) * eased);
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString()}</>;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  highlight,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  suffix?: string;
  highlight?: boolean;
  trend?: number;
  color?: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl p-4 border',
        highlight
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : 'glass-panel'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', color || 'text-slate-500')} />
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <div className={cn('text-2xl font-bold tabular-nums', highlight ? 'text-emerald-400' : color || 'text-slate-100')}>
        {value}
        {suffix && <span className="text-sm font-normal text-slate-500 ml-1">{suffix}</span>}
      </div>
      {trend !== undefined && trend > 0 && (
        <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
          <TrendingDown className="w-3 h-3" />
          ↓ {trend.toFixed(0)}% vs baseline
        </div>
      )}
    </motion.div>
  );
}

export function MetricsRow({ metrics, baselineMetrics, hasIntervention }: MetricsRowProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-panel rounded-2xl p-4 h-24 flex items-center justify-center">
            <span className="text-xs text-slate-600">Run simulation</span>
          </div>
        ))}
      </div>
    );
  }

  const peakTrend = baselineMetrics && baselineMetrics.peakInfected > 0
    ? (1 - metrics.peakInfected / baselineMetrics.peakInfected) * 100
    : undefined;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <MetricCard
        icon={Users}
        label="Peak Infected"
        value={<AnimatedNumber value={metrics.peakInfected} />}
        color="text-red-400"
        trend={hasIntervention ? peakTrend : undefined}
      />
      <MetricCard
        icon={Activity}
        label="Attack Rate"
        value={<AnimatedNumber value={metrics.attackRate * 100} decimals={1} />}
        suffix="%"
        color="text-amber-400"
      />
      <MetricCard
        icon={TrendingDown}
        label="Reduction"
        value={hasIntervention && metrics.reductionPercent > 0
          ? <AnimatedNumber value={metrics.reductionPercent} decimals={1} />
          : '—'}
        suffix={hasIntervention && metrics.reductionPercent > 0 ? '%' : undefined}
        highlight={hasIntervention && metrics.reductionPercent > 10}
      />
      <MetricCard
        icon={Clock}
        label="Time to Peak"
        value={<AnimatedNumber value={metrics.timeToPeak} />}
        suffix="steps"
      />
    </div>
  );
}
