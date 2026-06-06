/**
 * SIR Simulation Engine
 * Discrete-time SIR model on a graph network.
 */
import type { SimNetwork, SimNode, SimulationConfig, InterventionConfig, SimulationResult, SimulationMetrics } from './types';
import { NodeState } from './types';

export function runSimulation(
  network: SimNetwork,
  config: SimulationConfig,
  intervention: InterventionConfig,
  baselineMetrics?: SimulationMetrics | null
): SimulationResult {
  const { beta, gamma, initialInfected, maxSteps } = config;
  const rng = seedRandom(config.seed);

  // Deep clone nodes
  const nodes: SimNode[] = network.nodes.map(n => ({ ...n, state: NodeState.Susceptible }));

  // Apply intervention
  applyIntervention(nodes, network, intervention, rng);

  // Initial infection from susceptible pool
  const susceptible = nodes.filter(n => n.state === NodeState.Susceptible);
  const shuffled = [...susceptible].sort(() => rng() - 0.5);
  const toInfect = shuffled.slice(0, Math.min(initialInfected, shuffled.length));
  for (const node of toInfect) {
    nodes[node.id].state = NodeState.Infected;
  }

  const infectedCurve: number[] = [];
  const susceptibleCurve: number[] = [];
  const recoveredCurve: number[] = [];

  const { adjacencyList } = network;

  for (let step = 0; step < maxSteps; step++) {
    // Record state
    const counts = countStates(nodes);
    infectedCurve.push(counts.infected);
    susceptibleCurve.push(counts.susceptible);
    recoveredCurve.push(counts.recovered);

    // Early exit if no infected remain
    if (counts.infected === 0) break;

    // Process infections
    const newInfected: Set<number> = new Set();
    const newRecovered: Set<number> = new Set();

    for (const node of nodes) {
      if (node.state === NodeState.Infected) {
        // Try to infect each susceptible neighbor
        const neighbors = adjacencyList.get(node.id) || [];
        for (const nid of neighbors) {
          const neighbor = nodes[nid];
          if (neighbor.state === NodeState.Susceptible && rng() < beta) {
            newInfected.add(nid);
          }
        }
        // Try to recover
        if (rng() < gamma) {
          newRecovered.add(node.id);
        }
      }
    }

    // Apply state changes
    for (const id of newInfected) {
      if (nodes[id].state === NodeState.Susceptible) {
        nodes[id].state = NodeState.Infected;
      }
    }
    for (const id of newRecovered) {
      if (nodes[id].state === NodeState.Infected) {
        nodes[id].state = NodeState.Recovered;
      }
    }
  }

  const metrics = computeMetrics(nodes, infectedCurve, config.seed, baselineMetrics);

  const finalNodeStates = new Map(nodes.map(n => [n.id, n.state]));

  return {
    config,
    intervention,
    networkType: network.type,
    infectedCurve,
    susceptibleCurve,
    recoveredCurve,
    metrics,
    finalNodeStates,
  };
}

function countStates(nodes: SimNode[]) {
  let susceptible = 0, infected = 0, recovered = 0;
  for (const n of nodes) {
    if (n.state === NodeState.Susceptible) susceptible++;
    else if (n.state === NodeState.Infected) infected++;
    else if (n.state === NodeState.Recovered || n.state === NodeState.Vaccinated) recovered++;
  }
  return { susceptible, infected, recovered };
}

function computeMetrics(
  nodes: SimNode[],
  infectedCurve: number[],
  seed: number,
  baselineMetrics?: SimulationMetrics | null
): SimulationMetrics {
  const peakInfected = Math.max(...infectedCurve, 0);
  const timeToPeak = infectedCurve.indexOf(peakInfected);
  const finalInfected = nodes.filter(n => n.state === NodeState.Infected || n.state === NodeState.Recovered || n.state === NodeState.Vaccinated).length;
  const finalSusceptible = nodes.filter(n => n.state === NodeState.Susceptible).length;
  const total = nodes.length;
  const attackRate = total > 0 ? finalInfected / total : 0;
  const epidemicDuration = infectedCurve.length;

  const reductionPercent = baselineMetrics && baselineMetrics.finalInfected > 0
    ? ((baselineMetrics.finalInfected - finalInfected) / baselineMetrics.finalInfected) * 100
    : 0;

  return {
    peakInfected,
    timeToPeak,
    finalInfected,
    finalSusceptible,
    attackRate,
    epidemicDuration,
    reductionPercent,
  };
}

// ---- Interventions ----

function applyIntervention(
  nodes: SimNode[],
  network: SimNetwork,
  intervention: InterventionConfig,
  rng: () => number
): void {
  const { strategy, budget } = intervention;
  if (strategy === 'none' || budget <= 0) return;

  const n = nodes.length;
  const toVaccinate = Math.round(budget * n);

  switch (strategy) {
    case 'random': {
      const shuffled = [...nodes].sort(() => rng() - 0.5);
      for (let i = 0; i < toVaccinate && i < shuffled.length; i++) {
        shuffled[i].state = NodeState.Vaccinated;
      }
      break;
    }
    case 'degree-targeted': {
      const sorted = [...nodes].sort((a, b) => b.degree - a.degree);
      for (let i = 0; i < toVaccinate && i < sorted.length; i++) {
        sorted[i].state = NodeState.Vaccinated;
      }
      break;
    }
    case 'betweenness-targeted': {
      // Approximate betweenness via degree as proxy (faster than full computation for 500+ nodes)
      const betweenness = approximateBetweenness(network);
      const sorted = [...nodes].sort((a, b) => (betweenness.get(b.id) || 0) - (betweenness.get(a.id) || 0));
      for (let i = 0; i < toVaccinate && i < sorted.length; i++) {
        sorted[i].state = NodeState.Vaccinated;
      }
      break;
    }
    case 'edge-cutting': {
      // We don't actually cut edges in the network - we vaccinate based on betweenness (bridge nodes)
      const betweenness = approximateBetweenness(network);
      const sorted = [...nodes].sort((a, b) => (betweenness.get(b.id) || 0) - (betweenness.get(a.id) || 0));
      for (let i = 0; i < toVaccinate && i < sorted.length; i++) {
        sorted[i].state = NodeState.Vaccinated;
      }
      break;
    }
  }
}

/**
 * Approximate betweenness centrality using BFS sampling.
 * Fast enough for 500-1000 node networks.
 */
function approximateBetweenness(network: SimNetwork): Map<number, number> {
  const betweenness = new Map<number, number>();
  const n = network.nodes.length;
  for (let i = 0; i < n; i++) betweenness.set(i, 0);

  // Sample 30% of nodes as sources for efficiency
  const sampleSize = Math.max(10, Math.floor(n * 0.3));
  const sources = network.nodes.slice(0, sampleSize);

  for (const source of sources) {
    // BFS from source
    const stack: number[] = [source.id];
    const pred = new Map<number, number[]>();
    const sigma = new Map<number, number>();
    const dist = new Map<number, number>();
    const delta = new Map<number, number>();

    for (const n of network.nodes) {
      pred.set(n.id, []);
      sigma.set(n.id, 0);
      dist.set(n.id, -1);
      delta.set(n.id, 0);
    }

    sigma.set(source.id, 1);
    dist.set(source.id, 0);
    const queue = [source.id];

    while (queue.length > 0) {
      const v = queue.shift()!;
      stack.push(v);
      const neighbors = network.adjacencyList.get(v) || [];
      for (const w of neighbors) {
        if (dist.get(w)! < 0) {
          dist.set(w, dist.get(v)! + 1);
          queue.push(w);
        }
        if (dist.get(w) === dist.get(v)! + 1) {
          sigma.set(w, sigma.get(w)! + sigma.get(v)!);
          pred.get(w)!.push(v);
        }
      }
    }

    // Accumulate dependencies
    while (stack.length > 0) {
      const w = stack.pop()!;
      for (const v of pred.get(w)!) {
        const contribution = (sigma.get(v)! / sigma.get(w)!) * (1 + delta.get(w)!);
        delta.set(v, delta.get(v)! + contribution);
      }
      if (w !== source.id) {
        betweenness.set(w, (betweenness.get(w) || 0) + delta.get(w)!);
      }
    }
  }

  return betweenness;
}

function seedRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
