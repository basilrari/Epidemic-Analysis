# Epidemic Simulator v2.0 — Features & Capabilities

## Overview

Epidemic Simulator v2.0 is an interactive **network-based SIR epidemic modeling platform** built with Next.js 16, React 19, D3-force, Recharts, and Zustand. It lets you explore how infectious diseases spread across complex network topologies and measure the impact of vaccination interventions.

---

## Application Modes

### 1. Sandbox (Primary Workspace)

The main interactive environment for single-run experiments with live visualization.

- Configure network topology, transmission parameters, and intervention strategy
- Run simulations and compare results against a no-intervention baseline
- Scrub through simulation steps with playback controls
- View network graph, key metrics, and three synchronized charts

### 2. Compare

Side-by-side strategy comparison on identical network parameters.

- Configure 2–N intervention strategies (add/remove configs)
- Run all configurations at once
- View compact network canvases per strategy
- Overlay infection curves and per-strategy metric cards

### 3. Study (Batch Experiments)

Statistical analysis across multiple randomized trials.

- Configure network type, node count, β/γ rates, intervention, and trial count (5–100)
- Runs N independent trials with seeded variation
- Reports mean ± standard deviation for peak infected, attack rate, final infected, and reduction %
- Per-trial breakdown list

---

## Network Topologies

Four synthetic graph generators are available:

| Topology | Model | Characteristics |
|----------|-------|-----------------|
| **Random** | Erdős–Rényi G(n,p) | Uniform random connections |
| **Scale-Free** | Barabási–Albert | Preferential attachment, hub nodes (super-spreaders) |
| **Small-World** | Watts–Strogatz | High clustering, short path lengths |
| **Community** | Stochastic Block Model | Three distinct communities with bridge connections |

**Configurable:** node count (50–300), average degree (1–4)

---

## Simulation Engine

### SIR Model

Discrete-time **Susceptible → Infected → Recovered** dynamics on a graph:

- **β (transmission):** per-edge infection probability each timestep (0.001–0.04)
- **γ (recovery):** per-infected-node recovery probability each timestep (fixed at 0.04 default)
- **Initial infected:** percentage of population (0.1%–5.5%)
- **Max steps:** simulation horizon (10–80 days)
- **Seeded RNG:** reproducible results via mulberry32 PRNG

### Per-Step Recording

The engine records full node-state snapshots at every timestep, enabling:

- Step-by-step network animation
- Live compartment counts (S/I/R/V) in the legend
- Playback scrubbing and speed control (0.5×–5×)

### Network Statistics

Computed for each run:

- Edge count
- Average degree
- Clustering coefficient

### Derived Metrics

| Metric | Description |
|--------|-------------|
| Peak Infected | Maximum simultaneous infected count |
| Attack Rate | Fraction of population ever infected |
| Days to Peak | Timestep of peak infection |
| Total Infected | Final cumulative infected count |
| R₀ Estimate | β × avg degree / γ (homogeneous approximation) |
| Reduction % | Improvement vs no-intervention baseline |
| Intervention Cost | Number of nodes vaccinated |
| Budget Used | Configured vaccination budget fraction |

---

## Intervention Strategies

Five pre-epidemic vaccination strategies:

| Strategy | Method |
|----------|--------|
| **None** | No intervention (baseline) |
| **Random Vaccination** | Random node selection |
| **Degree-Targeted** | Vaccinate highest-degree hubs first |
| **Betweenness-Targeted** | Vaccinate bridge nodes (BFS-sampled betweenness) |
| **Edge Cutting** | Vaccinate high-betweenness nodes (structural bridges) |

**Budget:** 2%–40% of total nodes vaccinated before outbreak begins.

Every intervention run automatically compares against a no-intervention baseline on the same network.

---

## Scenario Presets

One-click configurations for common experiments:

1. **Scale-Free Super-Spreader** — BA network, high β, degree-targeted vaccination
2. **Small-World Clusters** — WS network, moderate spread, random vaccination
3. **Community Outbreak** — SBM network, betweenness-targeted bridges
4. **High-Budget Targeted** — Aggressive 40% degree-targeted campaign

---

## Visualization

### Network Canvas (D3-Force)

- Force-directed layout with charge, link, center, and collision forces
- Color-coded nodes: blue (S), red (I), green (R), orange (V)
- Infected nodes glow red
- Live legend with compartment counts
- Network stats panel (edges, degree, clustering)

### Playback Controls

- Play / pause / step forward / step back / loop
- Speed slider (0.5×–5×)
- Progress bar with click-to-scrub

### Charts (Recharts)

1. **SIR Compartments Over Time** — Stacked area chart (S/I/R) with peak-day marker
2. **Infection Curve Comparison** — Baseline (dashed red) vs intervention (solid green) with reduction badge
3. **Log Scale Comparison** — Logarithmic Y-axis for sustained suppression analysis

### Metrics Dashboard

Six icon cards with baseline trend arrows:

- Peak Infected, Attack Rate, Days to Peak, Total Infected, R₀, Cost/Budget

---

## UI Features

- **Dark neon theme** with glassmorphism panels and `#00ff88` accent
- **Sticky header** with Sandbox / Compare / Study tabs and simulation status indicator
- **Numbered sidebar sections** (Presets → Topology → Parameters → Interventions)
- **Footer bar** with active scenario summary and run timing
- **Responsive layout** — sidebar + main content on desktop, stacked on mobile

---

## What You Can Do

1. **Explore outbreak dynamics** on different network structures
2. **Test vaccination strategies** and quantify reduction in peak infections
3. **Compare hub-targeting vs random** vaccination effectiveness
4. **Animate spread** step-by-step to see how infection propagates through the graph
5. **Run batch studies** for statistically robust comparisons across trials
6. **Compare multiple strategies** simultaneously in Compare mode
7. **Use presets** for quick starts on common epidemic scenarios
8. **Adjust transmission rates** to model slow vs fast-spreading pathogens

---

## Tech Stack

- **Framework:** Next.js 16.2.7 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4, Lucide icons
- **State:** Zustand
- **Graph layout:** D3-force
- **Charts:** Recharts
- **Language:** TypeScript 5

---

## Running Locally

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # production build
```

---

## Future Enhancements (Not Yet Implemented)

- SEIR model with exposed compartment
- Export simulation results (CSV/PNG)
- URL-based state sharing
- Settings panel (γ rate, seed control in UI)
- Documentation panel content
