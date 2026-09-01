import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCcw, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../components/common/Button';
import { TryAgainModal } from '../components/feedback/TryAgainModal';
import { mockFeedback, mockSampleSession } from '../lib/mockData';
import type { FeedbackItem } from '../types/feedback';

export function FeedbackPage() {
  const navigate = useNavigate();
  const feedback = mockFeedback;
  const session = mockSampleSession;

  const [selectedRetryItem, setSelectedRetryItem] = useState<FeedbackItem | null>(null);
  const [showFullTranscript, setShowFullTranscript] = useState<boolean>(false);

  return (
    <div className="space-y-10 max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Friendly Transition Header: Friend -> Coach */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Post-Conversation Reflection • The Coach</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-100 tracking-tight">
          Reflections from our chat
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
          "Friend during the conversation. Coach after the conversation." Here are a few supportive
          insights to help you build natural fluency.
        </p>
      </div>

      {/* Gentle Conversational Summary (No SaaS Metric Boxes) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#141416]/80 border border-zinc-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-400 border-b border-zinc-800/60 pb-3">
          <span>{feedback.sessionTitle}</span>
          <span>~8 minutes • 7 conversational turns</span>
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-lg font-medium text-zinc-200">What went well today</h2>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            You maintained steady rhythm across all 7 turns and spoke for over 60% of the session
            time. You described your journey from the airport with great storytelling details,
            especially when talking about traveling solo.
          </p>
        </div>
        <ul className="space-y-2 pt-1">
          {feedback.strengths.map((str, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{str}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Top 2–4 Actionable Takeaways */}
      <div className="space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-normal text-zinc-100">
            A few gentle adjustments
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Focusing on just 2–3 high-impact habits so you never feel overwhelmed.
          </p>
        </div>

        <div className="space-y-4">
          {feedback.topImprovements.map((item, index) => (
            <div
              key={item.id}
              className="p-6 rounded-3xl bg-[#18181b]/50 border border-zinc-800/70 space-y-4"
            >
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-medium text-amber-400/90">
                  Observation #{index + 1} •{' '}
                  {item.category === 'grammar' ? 'Grammar habit' : 'Natural phrasing'}
                </span>
                <span className="text-[11px] text-zinc-400">Priority practice</span>
              </div>

              {/* Spoken vs Target */}
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-[#121214]/80 border border-zinc-800/80">
                  <div className="text-[11px] text-zinc-400 uppercase font-medium mb-1">
                    What you said:
                  </div>
                  <p className="font-serif text-sm text-zinc-300 line-through decoration-zinc-500">
                    "{item.originalText}"
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/25">
                  <div className="text-[11px] text-amber-300/90 uppercase font-semibold mb-1">
                    More natural / Accurate:
                  </div>
                  <p className="font-serif text-sm text-amber-200 font-medium">
                    "{item.improvedText}"
                  </p>
                </div>
              </div>

              {/* Explanation & Practice Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <p className="text-xs text-zinc-400 leading-relaxed max-w-lg">
                  <span className="text-zinc-300 font-medium">Why: </span>
                  {item.explanation}
                </p>

                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedRetryItem(item)}
                  className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-medium whitespace-nowrap shrink-0 rounded-xl"
                >
                  Try Saying It
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vocabulary Expansion */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#141416]/60 border border-zinc-800/60 space-y-4">
        <div>
          <h2 className="font-serif text-xl font-medium text-zinc-200">Vocabulary variety</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Alternative descriptive words to gradually swap for everyday generic adjectives.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {feedback.vocabularyUpgrades.map((vocab, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#18181b]/60 border border-zinc-800/80 space-y-2 text-xs"
            >
              <div className="text-zinc-400">
                You used <strong className="text-zinc-200">"{vocab.original}"</strong> (
                {vocab.frequency} times)
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {vocab.alternatives.map((alt) => (
                  <span
                    key={alt}
                    className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700/80 text-amber-200 font-medium"
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Transcript (Collapsible) */}
      <div className="border border-zinc-800/60 rounded-2xl bg-[#141416]/40 p-5">
        <button
          type="button"
          onClick={() => setShowFullTranscript((prev) => !prev)}
          className="w-full flex items-center justify-between text-left cursor-pointer"
        >
          <div>
            <h3 className="font-serif text-base font-medium text-zinc-200">
              Read the full conversation
            </h3>
            <p className="text-xs text-zinc-400">
              Review all {session.messages.length} conversational turns at your own pace.
            </p>
          </div>
          {showFullTranscript ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </button>

        {showFullTranscript && (
          <div className="mt-4 pt-4 border-t border-zinc-800/60 space-y-3 max-h-80 overflow-y-auto">
            {session.messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                  msg.speaker === 'user'
                    ? 'bg-[#18181b] border border-zinc-800 ml-6'
                    : 'bg-[#141416] border border-zinc-800/60 mr-6'
                }`}
              >
                <div className="text-[10px] text-zinc-400 uppercase font-semibold mb-1 flex items-center justify-between">
                  <span>{msg.speaker === 'user' ? 'You' : 'The Friend'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className="font-serif text-sm text-zinc-200">{msg.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Next Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/60">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/practice')}
          className="w-full sm:w-auto text-xs"
        >
          Explore Other Scenarios
        </Button>

        <Button
          size="md"
          variant="primary"
          onClick={() => navigate('/')}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="w-full sm:w-auto text-xs"
        >
          Return to Today
        </Button>
      </div>

      {/* Try Again Modal */}
      <TryAgainModal
        isOpen={Boolean(selectedRetryItem)}
        onClose={() => setSelectedRetryItem(null)}
        item={selectedRetryItem}
      />
    </div>
  );
}
