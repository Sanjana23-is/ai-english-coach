import { useEffect, useState } from 'react';

interface BackendHealth {
  status: string;
  service: string;
  timestamp: string;
  phase: string;
}

export default function App() {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: BackendHealth) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Navigation / Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-blue-500/20">
              EC
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              AI English Coach
            </span>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Phase 1: Foundation
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-16 flex-1 flex flex-col items-center justify-center text-center">
        {/* Hero Title */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Monorepo Scaffold Active
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-100 max-w-2xl leading-tight">
          Master Spoken English with Natural Conversation
        </h1>
        <p className="mt-4 text-lg text-slate-400 max-w-xl">
          A free, privacy-focused English coach powered by local AI. Speak without fear, build
          fluency, and track your progress over time.
        </p>

        {/* Dual Role Architecture Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mt-12 w-full max-w-3xl text-left">
          {/* Friend Role */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm transition-all hover:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-semibold mb-4">
              🤝
            </div>
            <h2 className="text-xl font-semibold text-white">1. The Friend</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Provides relaxed, natural conversation without stressful interruptions or judgment.
              Focuses on building speaking confidence in everyday contexts.
            </p>
          </div>

          {/* Coach Role */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm transition-all hover:border-slate-700">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-semibold mb-4">
              🎯
            </div>
            <h2 className="text-xl font-semibold text-white">2. The Coach</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Analyzes patterns after sessions, identifies recurring grammar and vocabulary habits,
              and maintains a longitudinal learner profile for tailored practice.
            </p>
          </div>
        </div>

        {/* Live Backend Connectivity Card */}
        <div className="mt-10 w-full max-w-md p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-left">
          <div className="flex items-center justify-between font-mono text-slate-400 mb-2">
            <span>Backend Status:</span>
            {loading ? (
              <span className="text-slate-400">Connecting...</span>
            ) : error ? (
              <span className="text-rose-400 font-medium">Offline ({error})</span>
            ) : (
              <span className="text-emerald-400 font-medium">● Connected ({health?.status})</span>
            )}
          </div>
          {health && (
            <div className="font-mono text-slate-500 space-y-1">
              <div>Service: {health.service}</div>
              <div>Phase: {health.phase}</div>
              <div>Timestamp: {health.timestamp}</div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        AI English Coach • Project Foundation Initialized • Open-Source & Local AI Architecture
      </footer>
    </div>
  );
}
