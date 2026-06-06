'use client';

import { useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

interface InfectionCurveProps {
  results: Array<{
    label: string;
    infectedCurve: number[];
    color: string;
  }>;
  className?: string;
}

const COLORS = ['#f43f5e', '#3b82f6', '#34d399', '#fbbf24', '#a78bfa', '#f97316'];

export function InfectionCurve({ results, className }: InfectionCurveProps) {
  // Merge curves into chart data
  const maxLen = Math.max(...results.map(r => r.infectedCurve.length));
  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const point: any = { step: i };
    for (const r of results) {
      point[r.label] = r.infectedCurve[i] ?? 0;
    }
    return point;
  });

  // No custom formatter — use default


  if (results.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Infection Curve</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[250px] text-slate-500 text-sm">
          No simulation data yet
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>Infection Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="step"
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={{ stroke: '#475569' }}
                label={{ value: 'Time Step', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={{ stroke: '#475569' }}
                label={{ value: 'Infected', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
              />
              {results.map((r, i) => (
                <Line
                  key={r.label}
                  type="monotone"
                  dataKey={r.label}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 3 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function SIRCurve({ result, className }: { result: { infectedCurve: number[]; susceptibleCurve: number[]; recoveredCurve: number[] } | null; className?: string }) {
  if (!result) return <InfectionCurve results={[]} className={className} />;

  const maxLen = result.infectedCurve.length;
  const chartData = Array.from({ length: maxLen }, (_, i) => ({
    step: i,
    Susceptible: result.susceptibleCurve[i] ?? 0,
    Infected: result.infectedCurve[i] ?? 0,
    Recovered: result.recoveredCurve[i] ?? 0,
  }));

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle>SIR Compartments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="step" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              <Line type="monotone" dataKey="Susceptible" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Infected" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="Recovered" stroke="#34d399" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
