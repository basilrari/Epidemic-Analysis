'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function InfoTooltip({ content, children, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 sm:w-64 px-3 py-2 rounded-lg text-[11px] leading-relaxed text-slate-200 bg-[#0b0f1a] border border-[#1e293b] shadow-xl pointer-events-none"
        >
          <HelpCircle className="w-3 h-3 text-emerald-400 inline mr-1 -mt-0.5" />
          {content}
        </span>
      )}
    </span>
  );
}
