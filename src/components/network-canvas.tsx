'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3Force from 'd3-force';
import type { SimulationResult } from '@/simulation/types';
import { NodeState } from '@/simulation/types';
import { cn } from '@/lib/utils';

interface NetworkCanvasProps {
  result: SimulationResult | null;
  currentStep?: number;
  className?: string;
  label?: string;
  compact?: boolean;
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
    case NodeState.Infected: return '#f43f5e';
    case NodeState.Recovered: return '#34d399';
    case NodeState.Vaccinated: return '#fbbf24';
    default: return '#94a3b8';
  }
}

function getNodeGlow(state: NodeState): string {
  switch (state) {
    case NodeState.Susceptible: return 'rgba(59,130,246,0.15)';
    case NodeState.Infected: return 'rgba(244,63,94,0.35)';
    case NodeState.Recovered: return 'rgba(52,211,153,0.15)';
    case NodeState.Vaccinated: return 'rgba(251,191,36,0.15)';
    default: return 'transparent';
  }
}

export function NetworkCanvas({ result, className, label, compact }: NetworkCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<d3Force.Simulation<VNode, d3Force.SimulationLinkDatum<VNode>> | null>(null);
  const nodesRef = useRef<VNode[]>([]);
  const edgesRef = useRef<VEdge[]>([]);

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
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#020617');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;
    if (nodes.length === 0) {
      ctx.fillStyle = '#334155';
      ctx.font = `${compact ? 11 : 14}px "Roboto Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(compact ? 'Run simulation' : 'Configure & run simulation', w / 2, h / 2);
      return;
    }

    // Edges
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.35)';
    ctx.lineWidth = 0.5;
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

    // Nodes
    for (const node of nodes) {
      const state = result?.finalNodeStates?.get(node.id) ?? NodeState.Susceptible;
      const color = getNodeColor(state);
      const glow = getNodeGlow(state);
      const radius = compact ? Math.min(2 + node.degree * 0.3, 4) : Math.min(3 + node.degree * 0.4, 5);

      if (state === NodeState.Infected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    if (label) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '11px "Roboto Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, 10, 18);
    }
  }, [result, label, compact]);

  // Build force layout when result changes
  useEffect(() => {
    if (!result) return;

    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    // Dynamically import to avoid SSR issues
    import('@/simulation').then(({ generateNetwork }) => {
      const network = generateNetwork(
        result.networkType,
        result.config.nodeCount,
        result.config.avgDegree,
        result.config.seed
      );

      const vnodes: VNode[] = [];
      for (const n of network.nodes) {
        vnodes.push({
          id: n.id,
          x: w / 2 + (Math.random() - 0.5) * w * 0.3,
          y: h / 2 + (Math.random() - 0.5) * h * 0.3,
          vx: 0,
          vy: 0,
          degree: n.degree,
        });
      }

      nodesRef.current = vnodes;
      edgesRef.current = network.edges;

      if (simRef.current) simRef.current.stop();

      const cx = w / 2;
      const cy = h / 2;

      const linkData = network.edges
        .filter((e: any) => e.source < vnodes.length && e.target < vnodes.length)
        .map((e: any) => ({ source: e.source, target: e.target }));

      const simulation = d3Force.forceSimulation<VNode>(vnodes)
        .force('charge', d3Force.forceManyBody<VNode>().strength(d => -(8 + d.degree * 1.5)))
        .force('link', d3Force.forceLink<d3Force.SimulationNodeDatum, d3Force.SimulationLinkDatum<d3Force.SimulationNodeDatum>>(linkData)
          .id((d: any) => d.id)
          .distance(20)
          .strength(0.2))
        .force('center', d3Force.forceCenter(cx, cy))
        .force('collision', d3Force.forceCollide<d3Force.SimulationNodeDatum>().radius(d => 3 + (d as any).degree * 0.3))
        .alpha(0.6)
        .alphaDecay(0.015)
        .on('tick', render);

      simRef.current = simulation;
    });

    return () => {
      if (simRef.current) simRef.current.stop();
    };
  }, [result, render]);

  // Resize observer
  useEffect(() => {
    const observer = new ResizeObserver(() => render());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [render]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full overflow-hidden rounded-xl bg-slate-950',
        compact ? 'min-h-[200px]' : 'min-h-[400px]',
        className
      )}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
