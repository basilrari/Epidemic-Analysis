import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00ff88]/50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none',
          variant === 'primary' && 'bg-[#00ff88] hover:bg-[#00e67a] text-[#0a0a0f] font-semibold neon-glow-strong',
          variant === 'secondary' && 'bg-[#1a1a24] hover:bg-[#2a2a3a] text-slate-200 border border-[#2a2a3a]',
          variant === 'outline' && 'border border-[#2a2a3a] hover:border-[#00ff88]/40 text-slate-300 hover:text-slate-100',
          variant === 'ghost' && 'text-slate-400 hover:text-slate-200 hover:bg-[#1a1a24]/50',
          variant === 'danger' && 'bg-red-600 hover:bg-red-500 text-white',
          size === 'sm' && 'text-xs px-3 py-1.5 gap-1.5',
          size === 'md' && 'text-sm px-4 py-2 gap-2',
          size === 'lg' && 'text-base px-6 py-3 gap-2',
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
