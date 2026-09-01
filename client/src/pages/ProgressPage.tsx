import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { mockSkillDimensions, mockLongitudinalMetrics, mockSessionHistory } from '../lib/mockData';

export function ProgressPage() {
  const navigate = useNavigate();
  const metrics = mockLongitudinalMetrics;
  const skills = mockSkillDimensions;
  const history = mockSessionHistory;

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="text-xs text-amber-400 font-medium mb-1">Speaking Journal</div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-100 tracking-tight">
          How Your Speaking is Evolving
        </h1>
        <p className="text-sm text-zinc-400 mt-1 max-w-xl">
          Observations of your rhythm, vocabulary expansion, and grammatical ease across your
          conversations.
        </p>
      </div>

      {/* Human Narrative Milestones (No Fake Percentages or KPIs) */}
      <div className="grid sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-3xl bg-[#141416]/80 border border-zinc-800/80 space-y-2">
          <div className="text-xs font-medium text-zinc-400">Total Speaking Output</div>
          <div className="font-serif text-2xl sm:text-3xl text-zinc-100 font-medium">
            {metrics.totalSpeakingHours} Hours
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pt-1">{metrics.fluencyTrendText}</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#141416]/80 border border-zinc-800/80 space-y-2">
          <div className="text-xs font-medium text-zinc-400">Conversations Finished</div>
          <div className="font-serif text-2xl sm:text-3xl text-zinc-100 font-medium">
            {metrics.sessionsCompleted} Chats
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pt-1">{metrics.grammarTrendText}</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#141416]/80 border border-zinc-800/80 space-y-2">
          <div className="text-xs font-medium text-zinc-400">Active Vocabulary Bank</div>
          <div className="font-serif text-2xl sm:text-3xl text-zinc-100 font-medium">
            {metrics.wordsEncountered} Words
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed pt-1">
            {metrics.vocabularyTrendText}
          </p>
        </div>
      </div>

      {/* Five Linguistic Skill Dimensions */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-zinc-100">
            Dimensions of Spoken English
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Holistic speaking qualities we observe and nurture during practice.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className={`p-6 rounded-3xl border transition-all ${
                skill.isUpcoming
                  ? 'bg-[#121214]/40 border-dashed border-zinc-800/60 opacity-60'
                  : 'bg-[#141416]/60 border-zinc-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-lg font-medium text-zinc-200">{skill.name}</h3>
                <span className="text-xs text-amber-400/90 font-medium">{skill.currentStatus}</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed mb-3">{skill.description}</p>

              <div className="p-3.5 rounded-2xl bg-[#18181b]/70 border border-zinc-800/70 text-xs text-zinc-300 flex items-start gap-2.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{skill.recentObservation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session History Log */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl font-normal text-zinc-100">Past Conversations</h2>

        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/session/${item.id}/feedback`)}
              className="p-5 rounded-2xl bg-[#141416]/50 border border-zinc-800/60 hover:border-zinc-700 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>{item.date}</span>
                  <span>•</span>
                  <span>{item.modeName}</span>
                  <span>•</span>
                  <span>{item.durationMinutes} mins spoken</span>
                </div>
                <h3 className="font-serif text-base font-medium text-zinc-200">{item.title}</h3>
                <div className="text-xs text-zinc-400">{item.highlightText}</div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium group self-end sm:self-auto">
                <span>View reflections</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
