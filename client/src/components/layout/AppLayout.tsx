import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppNav } from './AppNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#101012] text-zinc-200 flex flex-col antialiased selection:bg-amber-400 selection:text-zinc-950 pb-16 sm:pb-0">
      <AppHeader />
      <AppNav />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}
