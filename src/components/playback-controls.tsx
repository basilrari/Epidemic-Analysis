'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSimStore } from '@/store/simulation-store';
import { SkipBack, Play, Pause, SkipForward, Repeat } from 'lucide-react';

interface PlaybackControlsProps {
  maxStep: number;
  className?: string;
}

export function PlaybackControls({ maxStep, className }: PlaybackControlsProps) {
  const {
    currentStep,
    isAnimating,
    animationSpeed,
    setStep,
    setIsAnimating,
    setAnimationSpeed,
    tickAnimation,
  } = useSimStore();

  useEffect(() => {
    if (!isAnimating) return;
    const interval = setInterval(() => {
      tickAnimation();
    }, Math.max(50, 400 / animationSpeed));
    return () => clearInterval(interval);
  }, [isAnimating, animationSpeed, tickAnimation]);

  const progress = maxStep > 0 ? (currentStep / maxStep) * 100 : 0;

  return (
    <div className={cn('flex flex-col gap-2 px-4 py-3 border-t border-[#2a2a3a] bg-[#0a0a0f]/80', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setStep(0)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00ff88] hover:bg-[#1a1a24] transition-colors"
            title="Go to start"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => setStep(currentStep - 1)}
            disabled={currentStep <= 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00ff88] hover:bg-[#1a1a24] transition-colors disabled:opacity-30"
            title="Previous step"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="p-2 rounded-lg bg-[#00ff88]/15 text-[#00ff88] hover:bg-[#00ff88]/25 transition-colors neon-glow"
            title={isAnimating ? 'Pause' : 'Play'}
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button
            onClick={() => setStep(currentStep + 1)}
            disabled={currentStep >= maxStep}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00ff88] hover:bg-[#1a1a24] transition-colors disabled:opacity-30"
            title="Next step"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setStep(0); setIsAnimating(true); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00ff88] hover:bg-[#1a1a24] transition-colors"
            title="Loop from start"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
          <span className="text-[10px] text-slate-500 whitespace-nowrap">Speed</span>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={animationSpeed}
            onChange={e => setAnimationSpeed(parseFloat(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer bg-[#2a2a3a]"
          />
          <span className="text-[10px] font-mono text-[#00ff88] w-8">{animationSpeed.toFixed(1)}x</span>
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          Step {currentStep} / {maxStep}
        </span>
      </div>

      <div className="relative h-1.5 rounded-full bg-[#1a1a24] cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setStep(Math.round(pct * maxStep));
        }}
      >
        <div
          className="absolute h-full rounded-full bg-[#00ff88] transition-all"
          style={{ width: `${progress}%`, boxShadow: '0 0 8px rgba(0,255,136,0.5)' }}
        />
        <input
          type="range"
          min={0}
          max={maxStep}
          value={currentStep}
          onChange={e => setStep(parseInt(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
