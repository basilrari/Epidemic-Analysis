# Epidemic Spreading on Complex Networks

Interactive PBL demonstration of SIR epidemic simulation on graph networks.

## Overview

This tool supports a Problem-Based Learning project exploring three connected questions:

1. **Applications** — When can epidemic spreading on networks be applied? (disease, rumors, malware, marketing)
2. **Topology** — Why do random, scale-free, and community structures spread differently?
3. **Intervention** — How effective are random vs degree-targeted vaccination strategies?

**Hypothesis:** Network topology affects epidemic spreading, and targeted intervention on key nodes can reduce transmission.

## Views

### Main Simulator
- Choose graph type: Random, Scale-Free, or Community
- Choose intervention: None, Random Vaccination, or Degree-Targeted (recommended)
- Adjust node count, β, γ, and initial infected count
- Run simulation and watch time-lapse network animation
- View metrics: Peak Infected, Attack Rate, Reduction %, Time to Peak
- Infection curve comparison (baseline vs intervention)
- Auto-generated key insights tied to PBL hypotheses

### Compare
- Two-scenario side-by-side comparison
- Quick presets: No Intervention vs Degree-Targeted, Random vs Scale-Free, Random vs Targeted
- Overlay infection curves and difference callouts

## Simulation Engine

- Discrete-time SIR model on graph adjacency lists
- Network generators: Erdős–Rényi, Barabási–Albert, Watts–Strogatz, Community (SBM)
- Interventions: random and degree-targeted vaccination (engine supports more)
- Per-step state history for smooth playback animation
- Metrics: peak infected, attack rate, reduction %, time to peak, R₀ estimate

## Tech Stack

- Next.js 16, React 19, TypeScript
- Zustand (state), D3-force (network layout), Recharts (curves)
- Framer Motion (transitions and metric animations)
- Tailwind CSS 4

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000
