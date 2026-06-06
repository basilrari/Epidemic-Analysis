// ---- Node & Network Types ----

export enum NodeState {
  Susceptible = 'S',
  Infected = 'I',
  Recovered = 'R',
  Vaccinated = 'V',
}

export interface SimNode {
  id: number;
  state: NodeState;
  degree: number;
}

export interface SimEdge {
  source: number;
  target: number;
}

export interface SimNetwork {
  nodes: SimNode[];
  edges: SimEdge[];
  adjacencyList: Map<number, number[]>;
  type: NetworkType;
}

export type NetworkType = 'erdos-renyi' | 'barabasi-albert' | 'watts-strogatz' | 'community';

// ---- Simulation Config ----

export interface SimulationConfig {
  networkType: NetworkType;
  nodeCount: number;
  avgDegree: number;
  beta: number;        // infection probability per edge per step
  gamma: number;       // recovery probability per step
  initialInfected: number;
  maxSteps: number;
  seed: number;
}

export type InterventionStrategy = 'none' | 'random' | 'degree-targeted' | 'betweenness-targeted' | 'edge-cutting';

export interface InterventionConfig {
  strategy: InterventionStrategy;
  budget: number; // fraction 0-1 of nodes to vaccinate / edges to cut
}

// ---- Simulation Results ----

export interface SimulationResult {
  config: SimulationConfig;
  intervention: InterventionConfig;
  networkType: NetworkType;
  infectedCurve: number[];   // I(t) per time step
  susceptibleCurve: number[];
  recoveredCurve: number[];
  metrics: SimulationMetrics;
  /** Final node states for visualization */
  finalNodeStates: Map<number, NodeState>;
}

export interface SimulationMetrics {
  peakInfected: number;
  timeToPeak: number;
  finalInfected: number;
  finalSusceptible: number;
  attackRate: number;
  epidemicDuration: number;
  reductionPercent: number; // vs no-intervention baseline
}

// ---- Multi-Trial Study ----

export interface StudyConfig {
  label: string;
  simulation: SimulationConfig;
  intervention: InterventionConfig;
  trials: number;
}

export interface StudyResult {
  config: StudyConfig;
  metrics: SimulationMetrics[];
  average: SimulationMetrics;
  stdDev: Partial<SimulationMetrics>;
}

// ---- Layout (visual) ----

export interface NodeLayout {
  id: number;
  x: number;
  y: number;
  state: NodeState;
  degree: number;
}
