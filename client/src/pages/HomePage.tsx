import { useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, Sparkles, MessageCircle, Compass } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { mockLearnerProfile, mockSessionHistory, mockConversationModes } from '../lib/mockData';

export function HomePage() {
  const navigate = useNavigate();
  const profile = mockLearnerProfile;
  const recentSessions = mockSessionHistory;
  const casualMode = mockConversationModes.find((m) => m.id === 'casual-chat');

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Warm Personal Greeting */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Intermediate (B1) • 4-day practice streak</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-zinc-100 tracking-tight leading-tight">
          Good to see you, {profile.name}.
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl leading-relaxed">
          You are here to practice speaking, not to be tested. Take your time, make mistakes freely,
          and let's talk.
        </p>
      </div>

      {/* Primary Conversational Centerpiece: What Should I Do Right Now? */}
      <div className="relative rounded-3xl p-6 sm:p-9 bg-gradient-to-b from-[#18181b] to-[#141416] border border-zinc-800/80 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="text-xs text-amber-400/90 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggested for your chat today</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-zinc-100 font-normal leading-snug">
              "Tell me about something unexpected that happened recently."
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Lately, we have been working on past-tense stories. Today's conversation gives you a
              natural opportunity to describe past events without stressful grammar exercises.
            </p>
          </div>

          {/* Prominent, Warm "Start Speaking" Action */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Button
              size="lg"
              variant="primary"
              leftIcon={<Mic className="w-5 h-5" />}
              onClick={() => navigate('/conversation/new')}
              className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold px-8 py-4 text-base rounded-2xl shadow-none hover:scale-[1.02] transition-transform"
            >
              Start Speaking
            </Button>
            <Button
              size="md"
              variant="outline"
              onClick={() => navigate('/practice')}
              className="text-xs text-zinc-400 hover:text-zinc-200 border-zinc-800 rounded-xl"
            >
              Choose another topic
            </Button>
          </div>
        </div>

        {/* Gentle Contextual Focus Note */}
        <div className="pt-5 border-t border-zinc-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="text-zinc-300 font-medium">Active practice focus:</span>
            <span className="text-zinc-400">{profile.activeLearningPriorities[0]}</span>
          </div>
          <span className="text-zinc-400 hidden sm:inline">
            Friend during dialogue • Coach afterward
          </span>
        </div>
      </div>

      {/* Two Subtle Companion Reflections (No Dashboard Jargon) */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Suggested Scenario */}
        <div className="p-6 rounded-2xl bg-[#141416]/60 border border-zinc-800/60 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs font-medium text-zinc-400 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-zinc-400" />
              <span>Alternative scenario</span>
            </div>
            <h3 className="font-serif text-lg font-medium text-zinc-200">
              {casualMode?.name || 'Casual Catch-Up'}
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">{casualMode?.shortDescription}</p>
            <p className="text-xs text-zinc-400 italic pt-1">"{casualMode?.starterPrompt}"</p>
          </div>

          <div className="pt-4 border-t border-zinc-800/40 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Takes ~5–8 minutes</span>
            <button
              type="button"
              onClick={() => navigate(`/conversation/new?mode=${casualMode?.id}`)}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Try this scenario</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Companion Memory Note */}
        <div className="p-6 rounded-2xl bg-[#141416]/60 border border-zinc-800/60 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs font-medium text-zinc-400 flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
              <span>Companion observations</span>
            </div>
            <h3 className="font-serif text-lg font-medium text-zinc-200">
              Your voice is finding its rhythm
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Over your last {profile.totalSessionsCompleted} conversations, your speaking turns
              have become noticeably longer and more consistent. When you need to retrieve a word,
              your pauses are becoming calmer.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-800/40 flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              {profile.totalSpeakingMinutes} minutes spoken so far
            </span>
            <button
              type="button"
              onClick={() => navigate('/progress')}
              className="text-xs text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>View reflections</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity: Presented as Conversational Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-normal text-zinc-200">Recent Conversations</h2>
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            All past talks
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {recentSessions.map((session) => (
            <Card
              key={session.id}
              variant="interactive"
              className="p-5 space-y-2 border-zinc-800/60 bg-[#141416]/50"
              onClick={() => navigate(`/session/${session.id}/feedback`)}
            >
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{session.date}</span>
                <span>{session.durationMinutes} mins</span>
              </div>
              <h3 className="font-serif text-base font-medium text-zinc-200 line-clamp-1">
                {session.title}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-1">{session.modeName}</p>
              <div className="text-xs text-amber-400/90 pt-2 border-t border-zinc-800/40 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="line-clamp-1">{session.highlightText}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
