import { create } from 'zustand';
import type {
  SimulationConfig,
  InterventionConfig,
  SimulationResult,
  NetworkType,
  InterventionStrategy,
  StudyConfig,
  StudyResult,
} from '@/simulation/types';
import { generateNetwork, runSimulation, runStudy } from '@/simulation';

export type AppView = 'sandbox' | 'compare' | 'study';

interface SimState {
  // View
  view: AppView;
  setView: (v: AppView) => void;

  // Sandbox config
  config: SimulationConfig;
  intervention: InterventionConfig;
  setConfig: (partial: Partial<SimulationConfig>) => void;
  setIntervention: (partial: Partial<InterventionConfig>) => void;

  // Sandbox state
  isRunning: boolean;
  simResult: SimulationResult | null;
  baselineResult: SimulationResult | null;
  currentStep: number;
  isAnimating: boolean;
  animationSpeed: number;

  runSandbox: () => void;
  setStep: (step: number) => void;
  setIsAnimating: (v: boolean) => void;
  setAnimationSpeed: (v: number) => void;
  resetSandbox: () => void;

  // Compare mode
  compareConfigs: { config: SimulationConfig; intervention: InterventionConfig; label: string }[];
  compareResults: (SimulationResult | null)[];
  setCompareConfigs: (configs: { config: SimulationConfig; intervention: InterventionConfig; label: string }[]) => void;
  runCompare: () => void;
  addCompareConfig: () => void;
  removeCompareConfig: (idx: number) => void;
  updateCompareConfig: (idx: number, field: 'config' | 'intervention', partial: any) => void;

  // Study mode
  studyConfig: StudyConfig;
  studyResult: StudyResult | null;
  isStudyRunning: boolean;
  setStudyConfig: (partial: Partial<StudyConfig>) => void;
  setStudySimConfig: (partial: Partial<SimulationConfig>) => void;
  setStudyIntervention: (partial: Partial<InterventionConfig>) => void;
  runStudySim: () => void;
}

const defaultConfig: SimulationConfig = {
  networkType: 'barabasi-albert',
  nodeCount: 300,
  avgDegree: 4,
  beta: 0.06,
  gamma: 0.04,
  initialInfected: 5,
  maxSteps: 80,
  seed: 42,
};

const defaultIntervention: InterventionConfig = {
  strategy: 'degree-targeted',
  budget: 0.1,
};

const defaultStudyConfig: StudyConfig = {
  label: 'Experiment 1',
  simulation: { ...defaultConfig },
  intervention: { ...defaultIntervention, strategy: 'degree-targeted' },
  trials: 20,
};

export const useSimStore = create<SimState>((set, get) => ({
  view: 'sandbox',
  setView: (view) => set({ view }),

  config: { ...defaultConfig },
  intervention: { ...defaultIntervention },
  setConfig: (partial) => set((s) => ({ config: { ...s.config, ...partial } })),
  setIntervention: (partial) => set((s) => ({ intervention: { ...s.intervention, ...partial } })),

  isRunning: false,
  simResult: null,
  baselineResult: null,
  currentStep: 0,
  isAnimating: false,
  animationSpeed: 200,

  runSandbox: () => {
    const { config, intervention } = get();
    set({ isRunning: true, simResult: null, currentStep: 0, isAnimating: false });

    // Run asynchronously
    setTimeout(() => {
      const network = generateNetwork(
        config.networkType,
        config.nodeCount,
        config.avgDegree,
        config.seed
      );
      const baseline = runSimulation(network, config, { strategy: 'none', budget: 0 });
      const result = runSimulation(network, config, intervention, baseline.metrics);

      set({
        isRunning: false,
        simResult: result,
        baselineResult: baseline,
        currentStep: 0,
      });
    }, 50);
  },

  setStep: (step) => set({ currentStep: step }),
  setIsAnimating: (v) => set({ isAnimating: v }),
  setAnimationSpeed: (v) => set({ animationSpeed: v }),
  resetSandbox: () => set({ simResult: null, baselineResult: null, currentStep: 0, isAnimating: false }),

  // Compare mode
  compareConfigs: [
    { config: { ...defaultConfig }, intervention: { ...defaultIntervention, strategy: 'none' }, label: 'No intervention' },
    { config: { ...defaultConfig }, intervention: { ...defaultIntervention, strategy: 'random' }, label: 'Random' },
    { config: { ...defaultConfig }, intervention: { ...defaultIntervention, strategy: 'degree-targeted' }, label: 'Degree-targeted' },
  ],
  compareResults: [null, null, null],
  setCompareConfigs: (configs) => set({ compareConfigs: configs }),
  runCompare: () => {
    const { compareConfigs } = get();
    const results: (SimulationResult | null)[] = [];

    for (const cc of compareConfigs) {
      const network = generateNetwork(
        cc.config.networkType,
        cc.config.nodeCount,
        cc.config.avgDegree,
        cc.config.seed
      );
      const baseline = runSimulation(network, cc.config, { strategy: 'none', budget: 0 });
      const result = runSimulation(network, cc.config, cc.intervention, baseline.metrics);
      results.push(result);
    }

    set({ compareResults: results });
  },
  addCompareConfig: () => {
    const { compareConfigs } = get();
    set({
      compareConfigs: [
        ...compareConfigs,
        {
          config: { ...defaultConfig },
          intervention: { strategy: 'degree-targeted', budget: 0.1 },
          label: `Config ${compareConfigs.length + 1}`,
        },
      ],
      compareResults: [...Array(compareConfigs.length + 1)].fill(null),
    });
  },
  removeCompareConfig: (idx) => {
    const { compareConfigs, compareResults } = get();
    set({
      compareConfigs: compareConfigs.filter((_, i) => i !== idx),
      compareResults: compareResults.filter((_, i) => i !== idx),
    });
  },
  updateCompareConfig: (idx, field, partial) => {
    const { compareConfigs } = get();
    const updated = [...compareConfigs];
    updated[idx] = {
      ...updated[idx],
      [field]: { ...(updated[idx] as any)[field], ...partial },
    };
    set({ compareConfigs: updated });
  },

  // Study mode
  studyConfig: { ...defaultStudyConfig },
  studyResult: null,
  isStudyRunning: false,
  setStudyConfig: (partial) => set((s) => ({ studyConfig: { ...s.studyConfig, ...partial } })),
  setStudySimConfig: (partial) =>
    set((s) => ({ studyConfig: { ...s.studyConfig, simulation: { ...s.studyConfig.simulation, ...partial } } })),
  setStudyIntervention: (partial) =>
    set((s) => ({ studyConfig: { ...s.studyConfig, intervention: { ...s.studyConfig.intervention, ...partial } } })),
  runStudySim: () => {
    const { studyConfig } = get();
    set({ isStudyRunning: true, studyResult: null });

    setTimeout(() => {
      const result = runStudy(studyConfig);
      set({ isStudyRunning: false, studyResult: result });
    }, 50);
  },
}));
