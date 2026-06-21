import { NodeState } from '@/simulation/types';
import type { SimulationResult } from '@/simulation/types';

/**
 * Compartment colors matched to the v2.0 mockup.
 * Exposed is a visual layer for newly-infected nodes (S → I this step).
 */
export const NODE_COLORS = {
  susceptible: '#4d9fff',
  exposed: '#f59e0b',
  infected: '#ef4444',
  recovered: '#22c55e',
  vaccinated: '#9ca3af',
} as const;

export const NODE_GLOW = {
  susceptible: 'rgba(77, 159, 255, 0.35)',
  exposed: 'rgba(245, 158, 11, 0.45)',
  infected: 'rgba(239, 68, 68, 0.55)',
  recovered: 'rgba(34, 197, 94, 0.35)',
  vaccinated: 'rgba(156, 163, 175, 0.25)',
} as const;

export const PBL_LEGEND_ITEMS = [
  { key: 'susceptible' as const, label: 'Susceptible', color: NODE_COLORS.susceptible },
  { key: 'infected' as const, label: 'Infected', color: NODE_COLORS.infected },
  { key: 'recovered' as const, label: 'Recovered', color: NODE_COLORS.recovered },
  { key: 'vaccinated' as const, label: 'Vaccinated', color: NODE_COLORS.vaccinated },
];

export const LEGEND_ITEMS = PBL_LEGEND_ITEMS;

export type VisualNodeState = keyof typeof NODE_COLORS;

export function getHistoryIndex(result: SimulationResult, step: number): number {
  return Math.min(step + 1, result.stateHistory.length - 1);
}

export function getVisualNodeState(
  nodeId: number,
  result: SimulationResult,
  step: number
): VisualNodeState {
  const idx = getHistoryIndex(result, step);
  const snapshot = result.stateHistory[idx];
  if (!snapshot) return 'susceptible';

  const state = snapshot.get(nodeId) ?? NodeState.Susceptible;

  if (state === NodeState.Vaccinated) return 'vaccinated';
  if (state === NodeState.Recovered) return 'recovered';
  if (state === NodeState.Susceptible) return 'susceptible';

  if (state === NodeState.Infected) {
    if (step > 0 && result.stateHistory.length > 1) {
      const prevIdx = Math.max(0, idx - 1);
      const prevState = result.stateHistory[prevIdx]?.get(nodeId);
      if (prevState === NodeState.Susceptible) return 'exposed';
    }
    return 'infected';
  }

  return 'susceptible';
}

export function countCompartmentsAtStep(result: SimulationResult, step: number) {
  const idx = getHistoryIndex(result, step);
  const snapshot = result.stateHistory[idx];
  const prevSnapshot = step > 0 ? result.stateHistory[Math.max(0, idx - 1)] : null;

  const counts = { susceptible: 0, exposed: 0, infected: 0, recovered: 0, vaccinated: 0 };

  if (!snapshot) return counts;

  for (const [id, state] of snapshot) {
    if (state === NodeState.Vaccinated) counts.vaccinated++;
    else if (state === NodeState.Recovered) counts.recovered++;
    else if (state === NodeState.Susceptible) counts.susceptible++;
    else if (state === NodeState.Infected) {
      if (prevSnapshot?.get(id) === NodeState.Susceptible) counts.exposed++;
      else counts.infected++;
    }
  }

  return counts;
}

/** PBL legend counts: merges exposed into infected for display */
export function countPblCompartmentsAtStep(result: SimulationResult, step: number) {
  const full = countCompartmentsAtStep(result, step);
  return {
    susceptible: full.susceptible,
    infected: full.infected + full.exposed,
    recovered: full.recovered,
    vaccinated: full.vaccinated,
  };
}

export function getNodeFillColor(visual: VisualNodeState): string {
  return NODE_COLORS[visual];
}

export function getNodeGlowColor(visual: VisualNodeState): string {
  return NODE_GLOW[visual];
}

/** Chart colors aligned with network node palette */
export const CHART_COLORS = {
  susceptible: NODE_COLORS.susceptible,
  infected: NODE_COLORS.infected,
  recovered: NODE_COLORS.recovered,
  baseline: NODE_COLORS.infected,
  intervention: NODE_COLORS.recovered,
};
