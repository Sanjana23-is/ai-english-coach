import { NavLink } from 'react-router-dom';
import { MessageCircle, Compass, Sparkles, User, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

export function AppNav() {
  const navItems = [
    { label: 'Today', path: '/', icon: MessageCircle },
    { label: 'Practice Scenarios', path: '/practice', icon: Compass },
    { label: 'My Progress', path: '/progress', icon: Sparkles },
    { label: 'Learner Profile', path: '/profile', icon: User },
    { label: 'Preferences', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Navigation Sub-bar */}
      <nav className="hidden sm:block border-b border-zinc-800/40 bg-[#101012]/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-6">
          {navItems.map((item) => {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 py-3 text-xs font-medium border-b-2 transition-all -mb-[1px]',
                    isActive
                      ? 'border-amber-400 text-zinc-100 font-semibold'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700',
                  )
                }
              >
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Fixed Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101012]/95 border-t border-zinc-800/80 backdrop-blur-lg px-3 py-1.5 safe-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[11px] font-medium transition-colors',
                    isActive ? 'text-amber-400 font-semibold' : 'text-zinc-400 hover:text-zinc-200',
                  )
                }
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
