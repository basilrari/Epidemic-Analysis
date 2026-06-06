import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'muted';
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-slate-700 text-slate-300',
        variant === 'success' && 'bg-emerald-500/15 text-emerald-400',
        variant === 'danger' && 'bg-red-500/15 text-red-400',
        variant === 'warning' && 'bg-amber-500/15 text-amber-400',
        variant === 'info' && 'bg-blue-500/15 text-blue-400',
        variant === 'muted' && 'bg-slate-800 text-slate-500',
        className
      )}
    >
      {children}
    </span>
  );
}
