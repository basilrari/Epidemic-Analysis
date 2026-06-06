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
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none',
          variant === 'primary' && 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20',
          variant === 'secondary' && 'bg-slate-700 hover:bg-slate-600 text-slate-200',
          variant === 'outline' && 'border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-slate-100',
          variant === 'ghost' && 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
          variant === 'danger' && 'bg-red-600 hover:bg-red-500 text-white',
          size === 'sm' && 'text-xs px-3 py-1.5 gap-1.5',
          size === 'md' && 'text-sm px-4 py-2 gap-2',
          size === 'lg' && 'text-base px-6 py-2.5 gap-2',
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
