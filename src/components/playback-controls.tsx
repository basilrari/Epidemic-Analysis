'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSimStore } from '@/store/simulation-store';
import { Play, Pause, Repeat } from 'lucide-react';

interface PlaybackControlsProps {
  maxStep: number;
  className?: string;
}

export function PlaybackControls({ maxStep, className }: PlaybackControlsProps) {
  const {
    currentStep,
    isAnimating,
    animationSpeed,
    loopAnimation,
    setStep,
    setIsAnimating,
    setAnimationSpeed,
    setLoopAnimation,
    tickAnimation,
  } = useSimStore();

  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  useEffect(() => {
    if (!isAnimating || maxStep <= 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const msPerStep = 400 / animationSpeed;

    const frame = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      accumulatorRef.current += delta;

      while (accumulatorRef.current >= msPerStep) {
        tickAnimation();
        accumulatorRef.current -= msPerStep;
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    lastTimeRef.current = 0;
    accumulatorRef.current = 0;
    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isAnimating, animationSpeed, maxStep, tickAnimation]);

  const progress = maxStep > 0 ? (currentStep / maxStep) * 100 : 0;

  return (
    <div className={cn('flex flex-col gap-2 px-4 py-3 border-t border-[#1e293b] bg-[#0b0f1a]/80', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors"
            title={isAnimating ? 'Pause' : 'Play'}
          >
            {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          </button>
          <button
            onClick={() => { setStep(0); setIsAnimating(true); }}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-[#111827] transition-colors"
            title="Restart"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[180px]">
          <span className="text-[10px] text-slate-500">Speed</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.5}
            value={animationSpeed}
            onChange={e => setAnimationSpeed(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-[10px] font-mono text-emerald-400 w-8">{animationSpeed.toFixed(1)}×</span>
        </div>

        <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
          <input
            type="checkbox"
            checked={loopAnimation}
            onChange={e => setLoopAnimation(e.target.checked)}
            className="rounded accent-emerald-500"
          />
          Loop
        </label>

        <span className="text-[10px] font-mono text-slate-500">
          Step {currentStep} / {maxStep}
        </span>
      </div>

      <div
        className="relative h-1.5 rounded-full bg-[#1e293b] cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          setStep(Math.round(pct * maxStep));
        }}
      >
        <div
          className="absolute h-full rounded-full bg-emerald-500 transition-[width] duration-75"
          style={{ width: `${progress}%` }}
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
