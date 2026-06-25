# Epidemic Spreading on Complex Networks

Interactive Problem-Based Learning (PBL) demonstration of **SIR epidemic simulation** on synthetic graph networks. Explore how network topology and vaccination strategy affect outbreak size, peak infections, and spread speed.

**Stack:** Next.js 16 · React 19 · TypeScript · Zustand · D3-force · Recharts

---

## Prerequisites

- **Node.js** 18 or newer ([nodejs.org](https://nodejs.org))
- **npm** (comes with Node.js)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/basilrari/Epidemic-Analysis.git
cd Epidemic-Analysis
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production build (optional)

```bash
npm run build
npm start
```

Other scripts:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Create optimized production build |
| `npm start` | Serve production build (run `build` first) |
| `npm run lint` | Run ESLint |

---

## Using the Frontend

The app has two views, switched from the header tabs: **Main Simulator** and **Compare**.

### Main Simulator

Use the left sidebar to configure a scenario, then click **Run Simulation**.

**Graph Type** — choose the network topology (Random, Scale-Free, or Community).

**Intervention** — vaccination applied *before* the outbreak starts (10% of nodes by default): None, Random Vaccination, or Degree-Targeted (recommended).

**Parameters** (sliders):

- **Node Count** — network size (100–500)
- **Infection Rate (β)** — chance of transmission along an edge per step
- **Recovery Rate (γ)** — chance an infected node recovers per step
- **Initial Infected** — how many nodes start infected

**After running**, the right side shows:

- **Network canvas** — colored nodes (susceptible, infected, recovered, vaccinated) with playback controls at the bottom. Use play/pause, the scrubber, or speed controls to step through the epidemic.
- **Metrics** — peak infections, attack rate, reduction % vs no intervention, time to peak.
- **Infection curve** — baseline vs intervention overlay (when intervention is enabled).
- **Key Insights** — auto-generated PBL takeaways based on your run.

Hover dotted labels in the sidebar for short tooltips on each control.

### Compare

Switch to the **Compare** tab to run **two scenarios side-by-side**.

1. Pick a **preset** (e.g. *No Intervention vs Degree-Targeted*, *Random vs Scale-Free*, *Random vs Targeted*), or configure Scenario A and B manually.
2. Click **Run Comparison**.
3. Review overlay infection curves, difference callouts, and metrics for each scenario.

Compare mode keeps epidemic parameters (β, γ, seed, etc.) aligned between scenarios so you isolate the effect of topology or intervention strategy.

---

## Documentation

For technical details — network generation, state transitions, vaccination selection, metrics formulas — see [`Technical_Documentation.pdf`](Technical_Documentation.pdf) in the project root.

---

## Project Layout

```
src/
  simulation/     # SIR engine + network generators (no UI)
  store/          # Zustand global state
  lib/            # Education copy, node colors
  components/     # React UI (canvas, charts, panels)
  app/            # Next.js app shell
```

---

## License

Private project — see repository owner for usage terms.
