import { cn } from '../../lib/utils';

export interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'blue' | 'emerald' | 'amber' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({
  value,
  color = 'blue',
  size = 'md',
  className,
  label,
  showPercent = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    indigo: 'bg-indigo-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-1.5">
          {label && <span>{label}</span>}
          {showPercent && <span>{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-slate-800/80 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colors[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
