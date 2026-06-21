'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSimStore } from '@/store/simulation-store';
import { AppHeader } from '@/components/app-header';
import { PblIntro } from '@/components/pbl-intro';
import { SimulatorView } from '@/components/simulator-view';
import { CompareView } from '@/components/compare-view';

export default function AppPage() {
  const { view } = useSimStore();

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-5 space-y-5">
        <PblIntro />
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {view === 'simulator' ? <SimulatorView /> : <CompareView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
