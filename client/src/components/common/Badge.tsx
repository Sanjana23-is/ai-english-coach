import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose' | 'slate' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'slate',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  const base = 'inline-flex items-center font-medium rounded-full transition-colors';

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 leading-4',
    md: 'text-xs px-3 py-1 leading-4',
  };

  const variants = {
    amber: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-300 border border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-300 border border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
    slate: 'bg-zinc-800/80 text-zinc-300 border border-zinc-700/60',
    outline: 'bg-transparent text-zinc-400 border border-zinc-800',
  };

  return (
    <span className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </span>
  );
}
