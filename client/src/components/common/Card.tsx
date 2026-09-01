import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'interactive' | 'highlight';
  hoverEffect?: boolean;
}

export function Card({
  className,
  variant = 'default',
  hoverEffect = false,
  children,
  ...props
}: CardProps) {
  const baseStyles = 'rounded-2xl border transition-all duration-200';

  const variants = {
    default: 'bg-[#18181b]/50 border-zinc-800/70 text-zinc-200',
    subtle: 'bg-[#141416]/40 border-zinc-800/40 text-zinc-300',
    interactive:
      'bg-[#18181b]/50 border-zinc-800/70 hover:border-zinc-700 hover:bg-[#18181b]/80 text-zinc-200 cursor-pointer shadow-none',
    highlight:
      'bg-gradient-to-b from-amber-950/20 via-[#18181b]/70 to-[#18181b]/70 border-amber-500/25 text-zinc-100',
  };

  const hoverStyle = hoverEffect ? 'hover:translate-y-[-1px] hover:border-zinc-600' : '';

  return (
    <div className={cn(baseStyles, variants[variant], hoverStyle, className)} {...props}>
      {children}
    </div>
  );
}
