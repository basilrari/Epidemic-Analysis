'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3Force from 'd3-force';
import type { SimulationResult } from '@/simulation/types';
import { NodeState } from '@/simulation/types';
import { countStatesAtStep } from '@/simulation/sir';
import { cn } from '@/lib/utils';
import { PlaybackControls } from './playback-controls';

interface NetworkCanvasProps {
  result: SimulationResult | null;
  currentStep?: number;
  className?: string;
  label?: string;
  compact?: boolean;
  showPlayback?: boolean;
}

interface VNode {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  degree: number;
}

interface VEdge {
  source: number;
  target: number;
}

function getNodeColor(state: NodeState): string {
  switch (state) {
    case NodeState.Susceptible: return '#3b82f6';
    case NodeState.Infected: return '#ef4444';
    case NodeState.Recovered: return '#00ff88';
    case NodeState.Vaccinated: return '#f97316';
    default: return '#94a3b8';
  }
}

function getNodeGlow(state: NodeState): string {
  switch (state) {
    case NodeState.Infected: return 'rgba(239,68,68,0.4)';
    case NodeState.Recovered: return 'rgba(0,255,136,0.2)';
    default: return 'rgba(59,130,246,0.1)';
  }
}

function getNodeStatesAtStep(result: SimulationResult, step: number): Map<number, NodeState> {
  if (result.stateHistory.length > 0) {
    const idx = Math.min(step + 1, result.stateHistory.length - 1);
    return result.stateHistory[idx] ?? result.finalNodeStates;
  }
  return result.finalNodeStates;
}

export function NetworkCanvas({
  result,
  currentStep = 0,
  className,
  label,
  compact,
  showPlayback = false,
}: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<d3Force.Simulation<VNode, d3Force.SimulationLinkDatum<VNode>> | null>(null);
  const nodesRef = useRef<VNode[]>([]);
  const edgesRef = useRef<VEdge[]>([]);
  const stepRef = useRef(currentStep);

  stepRef.current = currentStep;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    gradient.addColorStop(0, '#12121a');
    gradient.addColorStop(1, '#0a0a0f');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    if (nodes.length === 0) {
      ctx.fillStyle = '#475569';
      ctx.font = `${compact ? 11 : 13}px "Roboto Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(compact ? 'Run simulation' : 'Configure parameters and run simulation', w / 2, h / 2);
      return;
    }

    const nodeStates = result ? getNodeStatesAtStep(result, stepRef.current) : new Map();

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.25)';
    ctx.lineWidth = 0.4;
    for (const e of edges) {
      const s = nodes[e.source];
      const t = nodes[e.target];
      if (s && t) {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.stroke();
      }
    }

    for (const node of nodes) {
      const state = nodeStates.get(node.id) ?? NodeState.Susceptible;
      const color = getNodeColor(state);
      const glow = getNodeGlow(state);
      const radius = compact ? Math.min(2 + node.degree * 0.25, 3.5) : Math.min(2.5 + node.degree * 0.35, 5);

      if (state === NodeState.Infected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    if (label) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.font = '11px "Roboto Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, 10, 18);
    }
  }, [result, label, compact]);

  useEffect(() => {
    if (!result) return;

    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    import('@/simulation').then(({ generateNetwork }) => {
      const network = generateNetwork(
        result.networkType,
        result.config.nodeCount,
        result.config.avgDegree,
        result.config.seed
      );

      const vnodes: VNode[] = network.nodes.map(n => ({
        id: n.id,
        x: w / 2 + (Math.random() - 0.5) * w * 0.3,
        y: h / 2 + (Math.random() - 0.5) * h * 0.3,
        vx: 0,
        vy: 0,
        degree: n.degree,
      }));

      nodesRef.current = vnodes;
      edgesRef.current = network.edges;

      if (simRef.current) simRef.current.stop();

      const linkData = network.edges
        .filter(e => e.source < vnodes.length && e.target < vnodes.length)
        .map(e => ({ source: e.source, target: e.target }));

      const simulation = d3Force.forceSimulation<VNode>(vnodes)
        .force('charge', d3Force.forceManyBody<VNode>().strength(d => -(6 + d.degree * 1.2)))
        .force('link', d3Force.forceLink<VNode, d3Force.SimulationLinkDatum<VNode>>(linkData)
          .id(d => d.id)
          .distance(18)
          .strength(0.15))
        .force('center', d3Force.forceCenter(w / 2, h / 2))
        .force('collision', d3Force.forceCollide<VNode>().radius(d => 2.5 + d.degree * 0.25))
        .alpha(0.6)
        .alphaDecay(0.02)
        .on('tick', render);

      simRef.current = simulation;
    });

    return () => {
      if (simRef.current) simRef.current.stop();
    };
  }, [result, render]);

  useEffect(() => {
    render();
  }, [currentStep, render]);

  useEffect(() => {
    const observer = new ResizeObserver(() => render());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [render]);

  const maxStep = result ? result.infectedCurve.length - 1 : 0;
  const counts = result
    ? countStatesAtStep(result.stateHistory, Math.min(currentStep + 1, result.stateHistory.length - 1))
    : null;

  return (
    <div className={cn('glass-panel rounded-xl overflow-hidden flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Network Topology & Spread</h3>
          {result && (
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Step {currentStep} / {maxStep} • Day {currentStep}
            </p>
          )}
        </div>
      </div>

      <div className="relative flex flex-1 min-h-0">
        <div
          ref={containerRef}
          className={cn('flex-1 relative', compact ? 'min-h-[200px]' : 'min-h-[380px]')}
        >
          <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />
        </div>

        {/* Legend sidebar */}
        {result && counts && !compact && (
          <div className="w-36 border-l border-[#2a2a3a] p-3 flex flex-col gap-3 bg-[#0a0a0f]/60">
            <div className="space-y-2">
              {[
                { label: 'Susceptible', color: 'bg-blue-500', count: counts.susceptible },
                { label: 'Infected', color: 'bg-red-500', count: counts.infected },
                { label: 'Recovered', color: 'bg-[#00ff88]', count: counts.recovered },
                { label: 'Vaccinated', color: 'bg-orange-500', count: counts.vaccinated },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className={cn('w-2 h-2 rounded-full', item.color)} />
                    {item.label}
                  </span>
                  <span className="font-mono text-slate-300">{item.count}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#2a2a3a] pt-2 space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Edges</span>
                <span className="font-mono text-slate-400">{result.networkStats.edges}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Avg. Degree</span>
                <span className="font-mono text-slate-400">{result.networkStats.avgDegree.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Clustering</span>
                <span className="font-mono text-slate-400">{result.networkStats.clustering.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {showPlayback && result && (
        <PlaybackControls maxStep={maxStep} />
      )}
    </div>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
      {[
        { label: 'Susceptible', color: 'bg-blue-500' },
        { label: 'Infected', color: 'bg-red-500' },
        { label: 'Recovered', color: 'bg-[#00ff88]' },
        { label: 'Vaccinated', color: 'bg-orange-500' },
      ].map(item => (
        <span key={item.label} className="flex items-center gap-1">
          <span className={cn('w-2 h-2 rounded-full', item.color)} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
