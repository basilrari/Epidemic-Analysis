'use client';

import { useSimStore } from '@/store/simulation-store';
import { cn } from '@/lib/utils';
import { Beaker, GitCompare, BarChart3, Radio, BookOpen, Download, Settings } from 'lucide-react';
import type { AppView } from '@/store/simulation-store';

const TABS: { id: AppView; icon: React.ElementType; label: string }[] = [
  { id: 'sandbox', icon: Beaker, label: 'Sandbox' },
  { id: 'compare', icon: GitCompare, label: 'Compare' },
  { id: 'study', icon: BarChart3, label: 'Study' },
];

export function AppHeader() {
  const { view, setView, simulationStatus } = useSimStore();

  const statusLabel = simulationStatus === 'running'
    ? 'Simulation Running'
    : simulationStatus === 'completed'
    ? 'Simulation Complete'
    : 'Simulation Idle';

  const statusColor = simulationStatus === 'running'
    ? 'bg-amber-400'
    : simulationStatus === 'completed'
    ? 'bg-[#00ff88]'
    : 'bg-slate-500';

  return (
    <header className="border-b border-[#2a2a3a] bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center neon-glow">
              <Radio className="w-4 h-4 text-[#00ff88]" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 tracking-tight">
                Epidemic Simulator <span className="text-[#00ff88]">v2.0</span>
              </h1>
              <p className="text-[10px] text-slate-500">Advanced Network SIR Modeling Platform</p>
            </div>
          </div>

          <nav className="flex gap-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all border-b-2',
                  view === tab.id
                    ? 'text-[#00ff88] border-[#00ff88] bg-[#00ff88]/5'
                    : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-[#1a1a24]/50'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#1a1a24] transition-colors" title="Documentation">
              <BookOpen className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#1a1a24] transition-colors" title="Export">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-[#1a1a24] transition-colors" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-[#2a2a3a]">
              <span className={cn('w-2 h-2 rounded-full', statusColor, simulationStatus === 'running' && 'animate-pulse')} />
              <span className="text-xs text-slate-400">{statusLabel}</span>
            </div>
          </div>
        </div>

        {view === 'sandbox' && (
          <p className="text-xs text-slate-500 pb-3 -mt-1">
            Explore how diseases spread across complex networks and evaluate intervention strategies in real-time.
          </p>
        )}
      </div>
    </header>
  );
}
