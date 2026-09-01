import { Sparkles, CheckCircle2, RotateCcw, TrendingUp, AlertCircle } from 'lucide-react';
import { mockLearnerProfile } from '../lib/mockData';
import type { PatternLifecycleState } from '../types/learner';

export function ProfilePage() {
  const profile = mockLearnerProfile;

  const getStageLabel = (state: PatternLifecycleState) => {
    switch (state) {
      case 'one_time_mistake':
        return 'One-time slip (Observing)';
      case 'possible_pattern':
        return 'Possible habit';
      case 'confirmed_weakness':
        return 'Active focus area';
      case 'improving':
        return 'Improving steadily';
      case 'mastered':
        return 'Mastered & retired';
    }
  };

  const getStageIcon = (state: PatternLifecycleState) => {
    switch (state) {
      case 'mastered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-amber-300" />;
      case 'confirmed_weakness':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <RotateCcw className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs text-amber-400 font-medium mb-1">Continuous Memory</div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-100 tracking-tight">
            {profile.name}'s Speaking Profile
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            The coach learns your speaking habits across conversations without ever retraining the
            underlying AI model.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-2xl bg-[#141416] border border-zinc-800/80 flex items-center gap-3 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <div className="text-xs font-medium text-zinc-200">
            {profile.estimatedLevel} ({profile.cefrEquivalent})
          </div>
        </div>
      </div>

      {/* Goals & Priorities */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Your Goals */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#141416]/70 border border-zinc-800/70 space-y-4">
          <h2 className="font-serif text-xl font-medium text-zinc-200">Speaking Goals</h2>
          <div className="space-y-3">
            {profile.goals.map((goal) => (
              <div
                key={goal.id}
                className={`p-4 rounded-2xl border transition-colors flex items-start gap-3 ${
                  goal.isSelected
                    ? 'bg-[#18181b] border-amber-500/30 text-zinc-100'
                    : 'bg-[#121214]/60 border-zinc-800/50 text-zinc-400'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    goal.isSelected
                      ? 'border-amber-400 bg-amber-400 text-zinc-950'
                      : 'border-zinc-700'
                  }`}
                >
                  {goal.isSelected && <CheckCircle2 className="w-3 h-3" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">{goal.label}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                    {goal.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What We're Practicing Right Now */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#141416]/70 border border-zinc-800/70 space-y-4">
          <h2 className="font-serif text-xl font-medium text-zinc-200">Active Learning Focus</h2>
          <p className="text-xs text-zinc-400">
            The coach gently weaves scenarios into your conversations to naturally prompt these
            skills.
          </p>

          <div className="space-y-3 pt-1">
            {profile.activeLearningPriorities.map((prio, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#18181b]/70 border border-zinc-800/70 flex items-start gap-3"
              >
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs text-zinc-200 font-medium leading-relaxed">{prio}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5-Stage Pattern State Machine */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-zinc-100">
            How Patterns Evolve Over Time
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            "A single mistake is not a pattern." Repeated slips across sessions confirm a habit;
            repeated accurate usages retire it from practice so you never get bored.
          </p>
        </div>

        {/* Pattern Lifecycle Stages */}
        <div className="space-y-3.5">
          {profile.patterns.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-[#141416]/60 border border-zinc-800/60 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/40">
                <div className="flex items-center gap-2.5">
                  {getStageIcon(item.state)}
                  <h3 className="font-serif text-base font-medium text-zinc-100">{item.title}</h3>
                </div>
                <span className="text-xs text-amber-400/90 font-medium">
                  {getStageLabel(item.state)}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">{item.description}</p>

              <div className="text-xs text-zinc-400 bg-[#18181b]/60 p-3.5 rounded-2xl border border-zinc-800/60 leading-relaxed">
                <span className="text-zinc-200 font-medium">Linguistic context: </span>
                {item.ruleContext}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-zinc-400">
                <span>
                  Observed: <strong className="text-zinc-200">{item.occurrencesCount}</strong> •
                  Correctly spoken:{' '}
                  <strong className="text-emerald-400">{item.successCount}</strong>
                </span>
                <span>Last observed: {item.lastObserved}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
