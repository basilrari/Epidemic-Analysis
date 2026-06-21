'use client';

import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { CHART_COLORS } from '@/lib/node-colors';

interface CurveSeries {
  label: string;
  infectedCurve: number[];
  color: string;
  dashed?: boolean;
}

interface InfectionCurveProps {
  results: CurveSeries[];
  className?: string;
  title?: string;
  showReduction?: boolean;
  baselineCurve?: number[];
}

const CHART_STYLE = {
  grid: '#1a1a24',
  axis: '#475569',
  tick: '#64748b',
  tooltip: { background: '#12121a', border: '1px solid #2a2a3a', borderRadius: '8px', fontSize: '12px' },
};

export function InfectionCurveComparison({
  results,
  baselineCurve,
  className,
  showReduction = true,
}: InfectionCurveProps) {
  const baseline = results.find(r => r.label.toLowerCase().includes('baseline') || r.label.toLowerCase().includes('no intervention'));
  const intervention = results.find(r => r !== baseline);

  const maxLen = Math.max(...results.map(r => r.infectedCurve.length), 0);
  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const point: Record<string, number> = { step: i };
    for (const r of results) {
      point[r.label] = r.infectedCurve[i] ?? 0;
    }
    return point;
  });

  let reductionPct = 0;
  if (baseline && intervention) {
    const baselinePeak = Math.max(...baseline.infectedCurve, 0);
    const interventionPeak = Math.max(...intervention.infectedCurve, 0);
    if (baselinePeak > 0) {
      reductionPct = ((baselinePeak - interventionPeak) / baselinePeak) * 100;
    }
  }

  if (results.length === 0) {
    return (
      <ChartCard title="Infection Curve Comparison" className={className}>
        <EmptyChart />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Infection Curve Comparison" className={className}
      badge={showReduction && reductionPct > 0 ? `${reductionPct.toFixed(0)}% Reduction` : undefined}
    >
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
            <XAxis dataKey="step" stroke={CHART_STYLE.axis} tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} />
            <YAxis stroke={CHART_STYLE.axis} tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} />
            <Tooltip contentStyle={CHART_STYLE.tooltip} labelStyle={{ color: '#94a3b8' }} />
            <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
            {results.map((r, i) => (
              <Line
                key={r.label}
                type="monotone"
                dataKey={r.label}
                stroke={r.color || (i === 0 ? CHART_COLORS.baseline : CHART_COLORS.intervention)}
                strokeWidth={2}
                strokeDasharray={r.dashed ? '6 4' : undefined}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function LogScaleComparison({ results, className }: InfectionCurveProps) {
  const maxLen = Math.max(...results.map(r => r.infectedCurve.length), 0);
  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const point: Record<string, number> = { step: i };
    for (const r of results) {
      point[r.label] = Math.max(r.infectedCurve[i] ?? 0, 0.5);
    }
    return point;
  });

  if (results.length === 0) {
    return (
      <ChartCard title="Log Scale Comparison" className={className}>
        <EmptyChart />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Log Scale Comparison" className={className}
      badge="Sustained Suppression"
    >
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
            <XAxis dataKey="step" stroke={CHART_STYLE.axis} tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} />
            <YAxis scale="log" domain={['auto', 'auto']} stroke={CHART_STYLE.axis} tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} />
            <Tooltip contentStyle={CHART_STYLE.tooltip} labelStyle={{ color: '#94a3b8' }} />
            <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
            {results.map((r, i) => (
              <Line
                key={r.label}
                type="monotone"
                dataKey={r.label}
                stroke={r.color || (i === 0 ? CHART_COLORS.baseline : CHART_COLORS.intervention)}
                strokeWidth={2}
                strokeDasharray={r.dashed ? '6 4' : undefined}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function SIRCurve({ result, className }: {
  result: { infectedCurve: number[]; susceptibleCurve: number[]; recoveredCurve: number[]; metrics?: { timeToPeak: number } } | null;
  className?: string;
}) {
  if (!result) {
    return (
      <ChartCard title="SIR Compartments Over Time" className={className}>
        <EmptyChart />
      </ChartCard>
    );
  }

  const maxLen = result.infectedCurve.length;
  const chartData = Array.from({ length: maxLen }, (_, i) => ({
    step: i,
    Susceptible: result.susceptibleCurve[i] ?? 0,
    Infected: result.infectedCurve[i] ?? 0,
    Recovered: result.recoveredCurve[i] ?? 0,
  }));

  const peakDay = result.metrics?.timeToPeak ?? result.infectedCurve.indexOf(Math.max(...result.infectedCurve));

  return (
    <ChartCard title="SIR Compartments Over Time" className={className}>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
            <XAxis dataKey="step" stroke={CHART_STYLE.axis} tick={{ fill: CHART_STYLE.tick, fontSize: 10 }}
              label={{ value: 'Days', position: 'insideBottom', offset: -2, fill: CHART_STYLE.tick, fontSize: 10 }} />
            <YAxis stroke={CHART_STYLE.axis} tick={{ fill: CHART_STYLE.tick, fontSize: 10 }} />
            <Tooltip contentStyle={CHART_STYLE.tooltip} labelStyle={{ color: '#94a3b8' }} />
            <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }} />
            <ReferenceLine x={peakDay} stroke="#64748b" strokeDasharray="4 4" label={{ value: 'Peak Day', fill: '#64748b', fontSize: 9, position: 'top' }} />
            <Area type="monotone" dataKey="Susceptible" stackId="1" stroke={CHART_COLORS.susceptible} fill={CHART_COLORS.susceptible} fillOpacity={0.65} isAnimationActive={false} />
            <Area type="monotone" dataKey="Infected" stackId="1" stroke={CHART_COLORS.infected} fill={CHART_COLORS.infected} fillOpacity={0.75} isAnimationActive={false} />
            <Area type="monotone" dataKey="Recovered" stackId="1" stroke={CHART_COLORS.recovered} fill={CHART_COLORS.recovered} fillOpacity={0.65} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Legacy export for compare view
export function InfectionCurve({ results, className }: InfectionCurveProps) {
  return (
    <InfectionCurveComparison
      results={results.map((r, i) => ({
        ...r,
        color: r.color || ['#ef4444', '#00ff88', '#3b82f6', '#fbbf24'][i % 4],
      }))}
      className={className}
      showReduction={false}
    />
  );
}

function ChartCard({ title, children, className, badge }: {
  title: string;
  children: React.ReactNode;
  className?: string;
  badge?: string;
}) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between mb-2">
        <CardTitle className="normal-case text-xs text-slate-300">{title}</CardTitle>
        {badge && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00ff88]/15 text-[#00ff88] border border-[#00ff88]/30">
            {badge}
          </span>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-[220px] text-slate-600 text-xs">
      Run a simulation to see charts
    </div>
  );
}
