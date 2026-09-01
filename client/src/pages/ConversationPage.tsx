import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mic,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  User,
  ArrowRight,
} from 'lucide-react';
import { Waveform } from '../components/common/Waveform';
import { formatSecondsToTime } from '../lib/formatters';
import { mockSampleSession, mockConversationModes } from '../lib/mockData';
import type { ConversationState, TranscriptMessage } from '../types/conversation';

export function ConversationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') || 'travel';
  const currentMode =
    mockConversationModes.find((m) => m.id === modeParam) || mockConversationModes[0];

  const [conversationState, setConversationState] = useState<ConversationState>('ai_speaking');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(18);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [showTextFallback, setShowTextFallback] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');

  const [messages, setMessages] = useState<TranscriptMessage[]>(
    mockSampleSession.messages.slice(0, 3),
  );

  // Elapsed timer ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate initial AI speaking finishing after 3.5 seconds
  useEffect(() => {
    if (conversationState === 'ai_speaking' && messages.length <= 3) {
      const timeout = setTimeout(() => {
        setConversationState('idle');
      }, 3500);
      return () => clearTimeout(timeout);
    }
  }, [conversationState, messages.length]);

  // Handle user tapping the microphone
  const handleToggleMic = () => {
    if (conversationState === 'idle') {
      // User starts speaking
      setConversationState('user_speaking');
    } else if (conversationState === 'user_speaking') {
      // User stops speaking -> transition to thinking then AI speaking
      setConversationState('ai_thinking');

      const userUtterance: TranscriptMessage = {
        id: `m-${Date.now()}`,
        speaker: 'user',
        text: 'Yes, I took a taxi. The driver was very good and he explained me some nice places to visit near my hotel.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        durationMs: 7800,
      };

      setMessages((prev) => [...prev, userUtterance]);

      setTimeout(() => {
        setConversationState('ai_speaking');
        const aiUtterance: TranscriptMessage = {
          id: `m-${Date.now() + 1}`,
          speaker: 'ai',
          text: 'A friendly taxi driver is always a wonderful welcome to a new city! What kind of places did he mention? Any historic spots or local tapas bars?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiUtterance]);

        setTimeout(() => {
          setConversationState('idle');
        }, 4000);
      }, 1500);
    }
  };

  const handleSendTextMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userUtterance: TranscriptMessage = {
      id: `m-${Date.now()}`,
      speaker: 'user',
      text: textInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userUtterance]);
    setTextInput('');
    setConversationState('ai_thinking');

    setTimeout(() => {
      setConversationState('ai_speaking');
      const aiReply: TranscriptMessage = {
        id: `m-${Date.now() + 1}`,
        speaker: 'ai',
        text: 'That sounds fascinating! Tell me more about what you enjoyed most about that experience.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
      setTimeout(() => setConversationState('idle'), 3500);
    }, 1200);
  };

  const handleEndSession = () => {
    navigate('/session/sess-travel-01/feedback');
  };

  const latestAiMessage = [...messages].reverse().find((m) => m.speaker === 'ai');

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-3xl mx-auto animate-in fade-in duration-300">
      {/* Quiet Top Bar: Scene & Gentle Time */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/40">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-serif text-base sm:text-lg text-zinc-100 font-medium leading-tight">
              {currentMode.name}
            </span>
            <span className="text-xs text-zinc-400">
              The Friend is listening • No interruptions
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                conversationState === 'user_speaking'
                  ? 'bg-amber-400 animate-ping'
                  : conversationState === 'ai_speaking'
                    ? 'bg-sky-400'
                    : 'bg-zinc-600'
              }`}
            />
            <span>{formatSecondsToTime(elapsedSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={handleEndSession}
            className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Finish & Reflect</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* The Emotional Centerpiece: The Living Speaking Space */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10 relative">
        {/* Soft Organic Breathing Glow */}
        <div
          className={`absolute w-80 h-80 rounded-full blur-3xl transition-all duration-1000 pointer-events-none ${
            conversationState === 'user_speaking'
              ? 'bg-amber-500/15 scale-125'
              : conversationState === 'ai_speaking'
                ? 'bg-sky-500/15 scale-110'
                : conversationState === 'ai_thinking'
                  ? 'bg-amber-400/10 scale-100'
                  : 'bg-zinc-800/20 scale-90'
          }`}
        />

        {/* The Companion Aura Presence */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-lg px-4">
          {/* Organic Pulsing Orb */}
          <div
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-700 ${
              conversationState === 'ai_speaking'
                ? 'bg-gradient-to-tr from-sky-500/30 via-indigo-500/20 to-amber-200/20 ring-1 ring-sky-400/30 scale-105 shadow-xl shadow-sky-500/10'
                : conversationState === 'user_speaking'
                  ? 'bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-amber-200/20 ring-1 ring-amber-400/40 scale-105 shadow-xl shadow-amber-500/10'
                  : conversationState === 'ai_thinking'
                    ? 'bg-gradient-to-tr from-amber-400/20 to-zinc-800 ring-1 ring-amber-400/20 animate-pulse'
                    : 'bg-[#18181b]/80 border border-zinc-800/80 animate-breathe'
            }`}
          >
            {conversationState === 'user_speaking' ? (
              <User className="w-10 h-10 text-amber-300" />
            ) : (
              <Sparkles className="w-10 h-10 text-zinc-300" />
            )}
          </div>

          {/* Gentle State Subtitle */}
          <div className="h-6 flex items-center justify-center">
            {conversationState === 'user_speaking' && (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                <Waveform isActive={true} color="amber" barsCount={5} size="sm" />
                <span>Listening to you... take your time</span>
              </div>
            )}
            {conversationState === 'ai_speaking' && (
              <div className="flex items-center gap-2 text-xs font-medium text-sky-300">
                <Waveform isActive={true} color="blue" barsCount={5} size="sm" />
                <span>The Friend is speaking</span>
              </div>
            )}
            {conversationState === 'ai_thinking' && (
              <span className="text-xs text-zinc-400 italic">Formulating thoughts...</span>
            )}
            {conversationState === 'idle' && (
              <span className="text-xs text-zinc-400">
                The floor is yours. Tap the microphone to speak.
              </span>
            )}
          </div>

          {/* Spoken Text (Intimate Editorial Typography) */}
          <div className="w-full min-h-[5rem] flex items-center justify-center">
            {conversationState === 'user_speaking' ? (
              <p className="font-serif text-lg sm:text-xl text-amber-200/90 font-normal italic leading-relaxed">
                "Keep talking freely... pause whenever you need to think."
              </p>
            ) : conversationState === 'ai_speaking' ? (
              <p className="font-serif text-lg sm:text-xl text-zinc-100 font-normal leading-relaxed">
                "{latestAiMessage?.text}"
              </p>
            ) : conversationState === 'ai_thinking' ? (
              <p className="text-xs text-zinc-400">...</p>
            ) : (
              <p className="font-serif text-base sm:text-lg text-zinc-300 font-normal">
                "{latestAiMessage?.text || "Let's begin. Speak whenever you are ready."}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transcript Drawer Toggle (Unobtrusive & Clean) */}
      <div className="border border-zinc-800/60 rounded-2xl bg-[#141416]/50 mb-4 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTranscript((prev) => !prev)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
            <span>Conversation transcript ({messages.length} exchanges)</span>
          </span>
          {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTranscript && (
          <div className="max-h-44 overflow-y-auto p-4 space-y-3 border-t border-zinc-800/40 text-xs text-left">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.speaker === 'user' ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-zinc-400 mb-0.5 font-medium">
                  {msg.speaker === 'user' ? 'You' : 'The Friend'} • {msg.timestamp}
                </span>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.speaker === 'user'
                      ? 'bg-zinc-800 text-zinc-100 rounded-br-none'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Voice Control: Tactile, Inviting, Reassuring */}
      <div className="pt-2 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-6 w-full">
          {/* Mute button */}
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* PRIMARY MIC BUTTON (Human Companion Centerpiece) */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg ${
              conversationState === 'user_speaking'
                ? 'bg-amber-400 text-zinc-950 ring-8 ring-amber-400/20 scale-105'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 ring-2 ring-zinc-700/60 hover:scale-105'
            }`}
            aria-label={conversationState === 'user_speaking' ? 'Finish speaking' : 'Tap to speak'}
          >
            <Mic className="w-8 h-8" />
          </button>

          {/* Text input fallback toggle */}
          <button
            type="button"
            onClick={() => setShowTextFallback((prev) => !prev)}
            className={`p-3 rounded-full border transition-colors cursor-pointer ${
              showTextFallback
                ? 'bg-zinc-800 border-zinc-600 text-zinc-200'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
            aria-label="Toggle text chat fallback"
            title="Text chat fallback"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>

        {/* Text fallback input */}
        {showTextFallback && (
          <form
            onSubmit={handleSendTextMessage}
            className="w-full max-w-md flex items-center gap-2 pt-2 animate-in fade-in duration-150"
          >
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type in English (accessibility fallback)..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        <div className="text-[11px] text-zinc-400 text-center">
          {conversationState === 'user_speaking'
            ? 'Speaking... Tap again when you are done.'
            : 'Tap the mic to reply. No rush, speak at your natural pace.'}
        </div>
      </div>
    </div>
  );
}
