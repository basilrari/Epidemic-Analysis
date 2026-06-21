import type { SimulationConfig, InterventionConfig, SimulationResult, NetworkType, InterventionStrategy } from '@/simulation/types';

export const FINAL_HYPOTHESIS =
  'Network topology affects epidemic spreading, and targeted intervention on key nodes can reduce transmission.';

export const INTRO_TEXT =
  'This interactive demonstration explores three connected PBL questions about epidemic spreading on graph networks. ' +
  'We model transmission using an SIR simulation on synthetic networks, then test how topology and vaccination strategy change outbreak size and speed.';

export const PROBLEM_1_TOOLTIP =
  'Real-world spreading can be modeled as graph networks: nodes are entities (people, computers, cities) and edges are connections through which disease, rumors, malware, or trends spread.';

export const PROBLEM_2_TOOLTIP =
  'Different network structures change epidemic speed and reach. Scale-free networks spread faster when hub nodes are infected because they act as super-spreaders.';

export const PROBLEM_3_TOOLTIP =
  'Targeted vaccination of high-degree hub nodes reduces spread more effectively than random vaccination by blocking many transmission paths at once.';

export const PROBLEM_CHIPS = [
  { id: 'p1', label: 'P1 · Applications', tooltip: PROBLEM_1_TOOLTIP },
  { id: 'p2', label: 'P2 · Topology', tooltip: PROBLEM_2_TOOLTIP },
  { id: 'p3', label: 'P3 · Intervention', tooltip: PROBLEM_3_TOOLTIP },
] as const;

export const GRAPH_TYPE_TOOLTIPS: Record<NetworkType, string> = {
  'erdos-renyi': 'Random network: connections are evenly distributed. Spread is usually moderate.',
  'barabasi-albert': 'Scale-free network: a few hub nodes have many connections. Hubs accelerate transmission.',
  'watts-strogatz': 'Small-world network: local clusters with shortcut edges.',
  'community': 'Community network: dense groups with fewer links between groups. Spread is fast inside communities.',
};

export const INTERVENTION_TOOLTIPS: Record<InterventionStrategy, string> = {
  'none': 'Baseline: no vaccination applied before the outbreak begins.',
  'random': 'Random vaccination: a fixed budget of nodes is protected at random.',
  'degree-targeted': 'Degree-targeted: vaccinate the highest-degree hub nodes first (recommended).',
  'betweenness-targeted': 'Target nodes with high betweenness centrality.',
  'edge-cutting': 'Protect bridge nodes between communities.',
};

export const PBL_GRAPH_TYPES: NetworkType[] = ['erdos-renyi', 'barabasi-albert', 'community'];
export const PBL_INTERVENTIONS: InterventionStrategy[] = ['none', 'random', 'degree-targeted'];

export const GRAPH_LABELS: Record<NetworkType, string> = {
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

export interface CompareScenario {
  label: string;
  config: SimulationConfig;
  intervention: InterventionConfig;
}

export interface ComparePreset {
  id: string;
  name: string;
  description: string;
  scenarioA: CompareScenario;
  scenarioB: CompareScenario;
}

const baseConfig: SimulationConfig = {
  networkType: 'barabasi-albert',
  nodeCount: 300,
  avgDegree: 4,
  beta: 0.06,
  gamma: 0.04,
  initialInfected: 5,
  maxSteps: 80,
  seed: 42,
};

export const COMPARE_PRESETS: ComparePreset[] = [
  {
    id: 'intervention-vs-none',
    name: 'No Intervention vs Degree-Targeted',
    description: 'Compare baseline spread with hub-targeted vaccination on a scale-free network.',
    scenarioA: {
      label: 'No Intervention',
      config: { ...baseConfig },
      intervention: { strategy: 'none', budget: 0 },
    },
    scenarioB: {
      label: 'Degree-Targeted',
      config: { ...baseConfig },
      intervention: { strategy: 'degree-targeted', budget: 0.1 },
    },
  },
  {
    id: 'topology-random-vs-scalefree',
    name: 'Random vs Scale-Free Network',
    description: 'Same epidemic parameters, different topology — observe hub effects.',
    scenarioA: {
      label: 'Random Network',
      config: { ...baseConfig, networkType: 'erdos-renyi' },
      intervention: { strategy: 'none', budget: 0 },
    },
    scenarioB: {
      label: 'Scale-Free Network',
      config: { ...baseConfig, networkType: 'barabasi-albert' },
      intervention: { strategy: 'none', budget: 0 },
    },
  },
  {
    id: 'random-vs-targeted',
    name: 'Random vs Degree-Targeted',
    description: 'Same 10% vaccination budget — which strategy works better?',
    scenarioA: {
      label: 'Random Vaccination',
      config: { ...baseConfig },
      intervention: { strategy: 'random', budget: 0.1 },
    },
    scenarioB: {
      label: 'Degree-Targeted',
      config: { ...baseConfig },
      intervention: { strategy: 'degree-targeted', budget: 0.1 },
    },
  },
];

export function generateKeyInsights(
  config: SimulationConfig,
  intervention: InterventionConfig,
  simResult: SimulationResult | null,
  baselineResult: SimulationResult | null
): string[] {
  if (!simResult) return [];

  const insights: string[] = [];
  const reduction = simResult.metrics.reductionPercent;
  const topology = GRAPH_LABELS[config.networkType];

  insights.push(
    `Problem 1: Nodes represent entities and edges represent transmission paths — the same SIR model applies to disease, rumors, and malware spread.`
  );

  if (config.networkType === 'barabasi-albert') {
    insights.push(
      `Problem 2 (Hypothesis 2): On a ${topology} network, hub nodes create many transmission paths. Peak infected reached ${simResult.metrics.peakInfected} nodes.`
    );
  } else if (config.networkType === 'community') {
    insights.push(
      `Problem 2: Community structure can slow global spread because fewer bridge edges connect separate groups.`
    );
  } else {
    insights.push(
      `Problem 2: On a ${topology} network, connections are more evenly distributed, producing different spread dynamics than scale-free hubs.`
    );
  }

  if (intervention.strategy === 'none') {
    insights.push(
      `Problem 3: Run again with Degree-Targeted vaccination to see how protecting hub nodes reduces peak and final infected counts.`
    );
  } else if (intervention.strategy === 'degree-targeted' && reduction > 10) {
    insights.push(
      `Problem 3 (Hypothesis 3): Degree-targeted vaccination reduced final infected by ${reduction.toFixed(0)}% vs no intervention — hub protection blocks many paths early.`
    );
  } else if (intervention.strategy === 'random' && baselineResult) {
    insights.push(
      `Problem 3: Random vaccination achieved ${reduction.toFixed(0)}% reduction. Compare with Degree-Targeted to see the advantage of hub targeting.`
    );
  } else {
    insights.push(
      `Problem 3: Intervention strategy "${INTERVENTION_LABELS[intervention.strategy]}" produced a ${reduction.toFixed(0)}% reduction in final infected population.`
    );
  }

  if (baselineResult && simResult.metrics.peakInfected < baselineResult.metrics.peakInfected) {
    const peakReduction = ((1 - simResult.metrics.peakInfected / baselineResult.metrics.peakInfected) * 100);
    insights.push(
      `Peak infected dropped from ${baselineResult.metrics.peakInfected} to ${simResult.metrics.peakInfected} (↓${peakReduction.toFixed(0)}%), supporting the final hypothesis.`
    );
  }

  return insights.slice(0, 4);
}
