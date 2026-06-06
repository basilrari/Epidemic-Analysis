/**
 * Network generators: Erdos-Renyi, Barabasi-Albert, Watts-Strogatz, Community
 */
import { NodeState } from './types';
import type { SimNetwork, SimNode, SimEdge, NetworkType } from './types';

export function generateNetwork(
  type: NetworkType,
  nodeCount: number,
  avgDegree: number,
  seed: number
): SimNetwork {
  switch (type) {
    case 'erdos-renyi':
      return generateErdosRenyi(nodeCount, avgDegree, seed);
    case 'barabasi-albert':
      return generateBarabasiAlbert(nodeCount, avgDegree, seed);
    case 'watts-strogatz':
      return generateWattsStrogatz(nodeCount, avgDegree, seed);
    case 'community':
      return generateCommunity(nodeCount, avgDegree, seed);
  }
}

// Seeded random (mulberry32)
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildAdjacencyList(n: number, edges: SimEdge[]): Map<number, number[]> {
  const adj = new Map<number, number[]>();
  for (let i = 0; i < n; i++) adj.set(i, []);
  for (const e of edges) {
    adj.get(e.source)!.push(e.target);
    adj.get(e.target)!.push(e.source);
  }
  return adj;
}

function computeDegrees(n: number, adj: Map<number, number[]>): number[] {
  const degs: number[] = [];
  for (let i = 0; i < n; i++) degs.push(adj.get(i)!.length);
  return degs;
}

function makeNodes(n: number, degs: number[]): SimNode[] {
  const nodes: SimNode[] = [];
  for (let i = 0; i < n; i++) {
    nodes.push({ id: i, state: NodeState.Susceptible, degree: degs[i] });
  }
  return nodes;
}

// ---- Erdos-Renyi (G(n,p)) ----
export function generateErdosRenyi(
  n: number,
  avgDegree: number,
  seed: number
): SimNetwork {
  const rng = mulberry32(seed);
  const p = avgDegree / (n - 1);
  const edges: SimEdge[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (rng() < p) edges.push({ source: i, target: j });
    }
  }
  const adj = buildAdjacencyList(n, edges);
  const degs = computeDegrees(n, adj);
  return {
    nodes: makeNodes(n, degs),
    edges,
    adjacencyList: adj,
    type: 'erdos-renyi',
  };
}

// ---- Barabasi-Albert (preferential attachment) ----
export function generateBarabasiAlbert(
  n: number,
  avgDegree: number,
  seed: number
): SimNetwork {
  const rng = mulberry32(seed);
  const m = Math.max(1, Math.round(avgDegree / 2));
  const edges: SimEdge[] = [];

  // Start with a small complete graph
  const m0 = Math.max(m + 1, 3);
  for (let i = 0; i < m0; i++) {
    for (let j = i + 1; j < m0; j++) {
      edges.push({ source: i, target: j });
    }
  }

  const degree = new Array(n).fill(0);
  for (let i = 0; i < m0; i++) degree[i] = m0 - 1;

  // Add remaining nodes with preferential attachment
  for (let i = m0; i < n; i++) {
    const targets = new Set<number>();
    while (targets.size < m) {
      // Roulette wheel selection
      const totalDegree = degree.reduce((a, b) => a + b, 0);
      let r = rng() * totalDegree;
      for (let j = 0; j < i; j++) {
        r -= degree[j];
        if (r <= 0) {
          if (!targets.has(j)) {
            targets.add(j);
            degree[j]++;
            degree[i]++;
            edges.push({ source: i, target: j });
          }
          break;
        }
      }
    }
  }

  const adj = buildAdjacencyList(n, edges);
  const degs = computeDegrees(n, adj);
  return {
    nodes: makeNodes(n, degs),
    edges,
    adjacencyList: adj,
    type: 'barabasi-albert',
  };
}

// ---- Watts-Strogatz (small-world) ----
export function generateWattsStrogatz(
  n: number,
  avgDegree: number,
  seed: number
): SimNetwork {
  const rng = mulberry32(seed);
  const k = Math.max(2, Math.round(avgDegree));
  const beta = 0.15; // rewiring probability
  const edges: SimEdge[] = [];

  // Create ring lattice
  for (let i = 0; i < n; i++) {
    for (let j = 1; j <= k / 2; j++) {
      const target = (i + j) % n;
      edges.push({ source: i, target });
    }
  }

  // Rewire edges with probability beta
  for (let i = 0; i < edges.length; i++) {
    if (rng() < beta) {
      const e = edges[i];
      let newTarget: number;
      do {
        newTarget = Math.floor(rng() * n);
      } while (
        newTarget === e.source ||
        edges.some(
          (other, idx) =>
            idx !== i &&
            ((other.source === e.source && other.target === newTarget) ||
              (other.source === newTarget && other.target === e.source))
        )
      );
      e.target = newTarget;
    }
  }

  const adj = buildAdjacencyList(n, edges);
  const degs = computeDegrees(n, adj);
  return {
    nodes: makeNodes(n, degs),
    edges,
    adjacencyList: adj,
    type: 'watts-strogatz',
  };
}

// ---- Community (stochastic block model with 3 communities) ----
export function generateCommunity(
  n: number,
  avgDegree: number,
  seed: number
): SimNetwork {
  const rng = mulberry32(seed);
  const communities = 3;
  const sizes = [];
  let remaining = n;
  for (let c = 0; c < communities; c++) {
    const size = c < communities - 1
      ? Math.floor(n / communities) + (rng() < 0.5 ? 1 : 0)
      : remaining;
    sizes.push(size);
    remaining -= size;
  }

  const nodeCommunity = new Map<number, number>();
  let start = 0;
  for (let c = 0; c < communities; c++) {
    for (let i = 0; i < sizes[c]; i++) {
      nodeCommunity.set(start + i, c);
    }
    start += sizes[c];
  }

  // High internal edge probability, low cross probability
  const pInternal = (avgDegree * 2) / (n / communities) * 0.8;
  const pCross = pInternal * 0.1;

  const edgesSet = new Set<string>();
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const p = nodeCommunity.get(i) === nodeCommunity.get(j)
        ? pInternal
        : pCross;
      if (rng() < p) {
        edgesSet.add(`${i}-${j}`);
      }
    }
  }

  const edges: SimEdge[] = Array.from(edgesSet).map(s => {
    const [a, b] = s.split('-').map(Number);
    return { source: a, target: b };
  });

  const adj = buildAdjacencyList(n, edges);
  const degs = computeDegrees(n, adj);
  return {
    nodes: makeNodes(n, degs),
    edges,
    adjacencyList: adj,
    type: 'community',
  };
}
