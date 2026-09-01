import { cn } from '../../lib/utils';

export interface StatusPillProps {
  status: 'online' | 'speaking' | 'listening' | 'idle' | 'warning';
  label?: string;
  className?: string;
}

export function StatusPill({ status, label, className }: StatusPillProps) {
  const configs = {
    online: {
      dot: 'bg-emerald-400 animate-pulse',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      defaultLabel: 'Ready to Speak',
    },
    speaking: {
      dot: 'bg-blue-400 animate-pulse',
      text: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      defaultLabel: 'AI Speaking',
    },
    listening: {
      dot: 'bg-emerald-400 animate-ping',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      defaultLabel: 'Listening...',
    },
    idle: {
      dot: 'bg-slate-400',
      text: 'text-slate-400',
      bg: 'bg-slate-800/60 border-slate-700/60',
      defaultLabel: 'Idle',
    },
    warning: {
      dot: 'bg-amber-400',
      text: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      defaultLabel: 'Attention',
    },
  };

  const current = configs[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium',
        current.bg,
        current.text,
        className,
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', current.dot)} />
      <span>{label || current.defaultLabel}</span>
    </span>
  );
}
