import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none',
          variant === 'primary' && 'bg-emerald-500 hover:bg-emerald-400 text-[#0b0f1a] font-semibold shadow-lg shadow-emerald-500/20',
          variant === 'secondary' && 'bg-[#111827] hover:bg-[#1e293b] text-slate-200 border border-[#1e293b]',
          variant === 'outline' && 'border border-[#1e293b] hover:border-emerald-500/40 text-slate-300 hover:text-slate-100',
          variant === 'ghost' && 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]/50',
          size === 'sm' && 'text-xs px-3 py-1.5 gap-1.5',
          size === 'md' && 'text-sm px-4 py-2 gap-2',
          size === 'lg' && 'text-sm px-5 py-3 gap-2',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
