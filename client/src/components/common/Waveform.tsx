import { cn } from '../../lib/utils';

export interface WaveformProps {
  isActive?: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'slate';
  barsCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Waveform({
  isActive = false,
  color = 'blue',
  barsCount = 5,
  className,
  size = 'md',
}: WaveformProps) {
  const heights = [35, 75, 50, 90, 60, 80, 45, 65, 30, 85];

  const colorMap = {
    blue: 'bg-blue-400',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    slate: 'bg-slate-600',
  };

  const containerSizes = {
    sm: 'h-6 gap-1',
    md: 'h-10 gap-1.5',
    lg: 'h-16 gap-2',
  };

  const barWidths = {
    sm: 'w-1',
    md: 'w-1.5',
    lg: 'w-2',
  };

  return (
    <div
      className={cn('flex items-center justify-center', containerSizes[size], className)}
      aria-label={isActive ? 'Audio active' : 'Audio idle'}
    >
      {Array.from({ length: barsCount }).map((_, index) => {
        const heightPct = isActive ? heights[index % heights.length] : 20;
        const animDelay = `${(index * 0.15).toFixed(2)}s`;

        return (
          <span
            key={index}
            className={cn(
              'rounded-full transition-all duration-300',
              barWidths[size],
              colorMap[color],
              isActive && 'animate-pulse',
            )}
            style={{
              height: `${heightPct}%`,
              animationDelay: animDelay,
              animationDuration: '0.8s',
            }}
          />
        );
      })}
    </div>
  );
}
