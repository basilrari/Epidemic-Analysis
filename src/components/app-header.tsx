'use client';

import { useSimStore } from '@/store/simulation-store';
import { cn } from '@/lib/utils';
import { Network, GitCompare } from 'lucide-react';
import type { AppView } from '@/store/simulation-store';

const NAV: { id: AppView; icon: React.ElementType; label: string }[] = [
  { id: 'simulator', icon: Network, label: 'Main Simulator' },
  { id: 'compare', icon: GitCompare, label: 'Compare' },
];

export function AppHeader() {
  const { view, setView } = useSimStore();

  return (
    <header className="border-b border-[#1e293b]/80 bg-[#0b0f1a]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <Network className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-slate-100 truncate">
              Epidemic Spreading on Complex Networks
            </h1>
            <p className="text-[11px] text-slate-500">Interactive PBL Demonstration</p>
          </div>
        </div>

        <nav className="flex rounded-xl bg-[#111827]/80 border border-[#1e293b] p-1 shrink-0">
          {NAV.map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all',
                view === tab.id
                  ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
