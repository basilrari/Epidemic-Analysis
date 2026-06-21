'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as d3Force from 'd3-force';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimulationResult } from '@/simulation/types';
import { cn } from '@/lib/utils';
import { PlaybackControls } from './playback-controls';
import {
  getVisualNodeState,
  countPblCompartmentsAtStep,
  getNodeFillColor,
  getNodeGlowColor,
  PBL_LEGEND_ITEMS,
  type VisualNodeState,
} from '@/lib/node-colors';

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

function drawNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  visual: VisualNodeState
) {
  const fill = getNodeFillColor(visual === 'exposed' ? 'infected' : visual);
  const glow = getNodeGlowColor(visual === 'exposed' ? 'exposed' : visual);
  const glowRadius = radius + (visual === 'infected' || visual === 'exposed' ? 6 : 4);

  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  if (visual === 'vaccinated') {
    ctx.beginPath();
    ctx.arc(x, y, radius + 1.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  if (visual === 'infected' || visual === 'exposed') {
    ctx.beginPath();
    ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fill();
  }
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
    gradient.addColorStop(0, '#111827');
    gradient.addColorStop(1, '#0b0f1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    if (nodes.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = `${compact ? 11 : 13}px "Roboto Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(compact ? 'Run simulation' : 'Run a simulation to watch the epidemic spread', w / 2, h / 2);
      return;
    }

    ctx.strokeStyle = 'rgba(100, 116, 139, 0.15)';
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

    const step = stepRef.current;
    for (const node of nodes) {
      const visual = result ? getVisualNodeState(node.id, result, step) : 'susceptible';
      const radius = compact
        ? Math.min(2.5 + node.degree * 0.3, 4)
        : Math.min(3.5 + node.degree * 0.4, 6.5);
      drawNode(ctx, node.x, node.y, radius, visual);
    }

    if (label) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.font = '11px "Roboto Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(label, 10, 18);
    }
  }, [result, label, compact]);

  useEffect(() => {
    if (!result) {
      nodesRef.current = [];
      edgesRef.current = [];
      render();
      return;
    }

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
        .force('collision', d3Force.forceCollide<VNode>().radius(d => 3 + d.degree * 0.3))
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
  const counts = result ? countPblCompartmentsAtStep(result, currentStep) : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result ? 'has-result' : 'empty'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('glass-panel rounded-2xl overflow-hidden flex flex-col', className)}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e293b]">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Network Spread</h3>
            {result && (
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Step {currentStep} / {maxStep}
              </p>
            )}
          </div>
        </div>

        <div className="relative flex flex-1 min-h-0">
          <div
            ref={containerRef}
            className={cn('flex-1 relative', compact ? 'min-h-[200px]' : 'min-h-[420px]')}
          >
            <canvas ref={canvasRef} className="w-full h-full absolute inset-0" />
          </div>

          {result && counts && !compact && (
            <div className="w-36 border-l border-[#1e293b] p-3 flex flex-col gap-3 bg-[#0b0f1a]/70">
              <div className="space-y-2">
                {PBL_LEGEND_ITEMS.map(item => (
                  <div key={item.key} className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                    <span className="font-mono text-slate-300">{counts[item.key]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showPlayback && result && (
          <PlaybackControls maxStep={maxStep} />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
