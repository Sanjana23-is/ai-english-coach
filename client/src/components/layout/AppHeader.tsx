import { Link, useNavigate } from 'react-router-dom';
import { Mic, Settings } from 'lucide-react';
import { Button } from '../common/Button';

export function AppHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800/60 bg-[#101012]/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Companion identity */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 rounded-xl"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/80 to-amber-200/80 flex items-center justify-center font-serif font-bold text-zinc-950 text-base shadow-sm group-hover:scale-105 transition-transform">
            E
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-medium text-lg tracking-normal text-zinc-100 leading-tight">
              English Coach
            </span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline leading-tight">
              A companion for spoken English
            </span>
          </div>
        </Link>

        {/* Level indicator & Direct speaking trigger */}
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Intermediate (B1)</span>
          </Link>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Mic className="w-3.5 h-3.5" />}
            onClick={() => navigate('/conversation/new')}
            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium shadow-none hover:shadow-none"
          >
            Start Talking
          </Button>

          <Link
            to="/settings"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
