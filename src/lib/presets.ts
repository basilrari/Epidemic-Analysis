import type { SimulationConfig, InterventionConfig, NetworkType, InterventionStrategy } from '@/simulation/types';

export interface SimulationPreset {
  id: string;
  name: string;
  description: string;
  config: Partial<SimulationConfig>;
  intervention: Partial<InterventionConfig>;
}

export const SIMULATION_PRESETS: SimulationPreset[] = [
  {
    id: 'scale-free-superspreader',
    name: 'Scale-Free Super-Spreader',
    description: 'Barabási–Albert network with high transmission and hub-targeted vaccination',
    config: {
      networkType: 'barabasi-albert',
      nodeCount: 300,
      avgDegree: 4,
      beta: 0.04,
      gamma: 0.04,
      initialInfected: 5,
      maxSteps: 80,
    },
    intervention: { strategy: 'degree-targeted', budget: 0.1 },
  },
  {
    id: 'small-world-clusters',
    name: 'Small-World Clusters',
    description: 'Watts–Strogatz lattice with local clustering and moderate spread',
    config: {
      networkType: 'watts-strogatz',
      nodeCount: 200,
      avgDegree: 4,
      beta: 0.02,
      gamma: 0.05,
      initialInfected: 3,
      maxSteps: 60,
    },
    intervention: { strategy: 'random', budget: 0.08 },
  },
  {
    id: 'community-outbreak',
    name: 'Community Outbreak',
    description: 'Three-community structure with bridge-node intervention',
    config: {
      networkType: 'community',
      nodeCount: 300,
      avgDegree: 4,
      beta: 0.03,
      gamma: 0.04,
      initialInfected: 4,
      maxSteps: 80,
    },
    intervention: { strategy: 'betweenness-targeted', budget: 0.1 },
  },
  {
    id: 'high-budget-targeted',
    name: 'High-Budget Targeted',
    description: 'Aggressive degree-targeted vaccination with 40% budget',
    config: {
      networkType: 'barabasi-albert',
      nodeCount: 300,
      avgDegree: 4,
      beta: 0.035,
      gamma: 0.04,
      initialInfected: 5,
      maxSteps: 80,
    },
    intervention: { strategy: 'degree-targeted', budget: 0.4 },
  },
];

export const NETWORK_LABELS: Record<NetworkType, string> = {
  'erdos-renyi': 'Random',
  'barabasi-albert': 'Scale-Free',
  'watts-strogatz': 'Small-World',
  'community': 'Community',
};

export const INTERVENTION_LABELS: Record<InterventionStrategy, string> = {
  'none': 'None',
  'random': 'Random Vaccination',
  'degree-targeted': 'Degree-Targeted',
  'betweenness-targeted': 'Betweenness-Targeted',
  'edge-cutting': 'Edge Cutting',
};

export function formatStrategyLabel(strategy: InterventionStrategy): string {
  return INTERVENTION_LABELS[strategy];
}

export function formatTopologyLabel(type: NetworkType): string {
  return NETWORK_LABELS[type];
}
