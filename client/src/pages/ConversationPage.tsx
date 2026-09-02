import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
  RotateCcw,
  AlertCircle,
  Square,
  CheckCircle2,
} from 'lucide-react';
import { Waveform } from '../components/common/Waveform';
import { formatSecondsToTime } from '../lib/formatters';
import { mockConversationModes } from '../lib/mockData';
import { api, type ApiSession } from '../lib/api';
import type { TranscriptMessage } from '../types/conversation';

type ConversationFlowState =
  | 'idle'
  | 'requesting_mic'
  | 'recording'
  | 'transcribing'
  | 'transcript_ready'
  | 'ai_thinking'
  | 'ai_speaking';

export function ConversationPage() {
  const navigate = useNavigate();
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const [searchParams] = useSearchParams();

  const modeParam = searchParams.get('mode') || 'casual';
  const levelParam = searchParams.get('level') || 'Intermediate';

  const currentMode =
    mockConversationModes.find((m) => m.id === modeParam) || mockConversationModes[0];

  // Core session state
  const [activeSession, setActiveSession] = useState<ApiSession | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Turn orchestration & conversation states
  const [flowState, setFlowState] = useState<ConversationFlowState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [showTextFallback, setShowTextFallback] = useState<boolean>(true);
  const [textInput, setTextInput] = useState<string>('');
  const [isSubmittingTurn, setIsSubmittingTurn] = useState<boolean>(false);
  const [turnError, setTurnError] = useState<string | null>(null);
  const [lastFailedText, setLastFailedText] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Recording audio state
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const textInputRef = useRef<HTMLInputElement>(null);

  // Initialize or load real conversation session
  const initSession = useCallback(async () => {
    setIsLoadingSession(true);
    setSessionError(null);

    // If route has an existing UUID session ID (not 'new')
    if (routeSessionId && routeSessionId !== 'new') {
      const existing = await api.getSession(routeSessionId);
      if (existing.data) {
        setActiveSession(existing.data);

        // Load existing transcript utterances from PostgreSQL
        const transcriptRes = await api.getUtterances(routeSessionId);
        if (transcriptRes.data && transcriptRes.data.length > 0) {
          const loadedMessages: TranscriptMessage[] = transcriptRes.data.map((u) => ({
            id: u.id,
            speaker: u.speaker,
            text: u.transcript,
            timestamp: new Date(u.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            durationMs: u.audioDurationMs || undefined,
          }));
          setMessages(loadedMessages);
        } else {
          // New session without prior utterances: welcome with mode starter prompt
          setMessages([
            {
              id: `starter-${Date.now()}`,
              speaker: 'ai',
              text:
                currentMode.starterPrompt ||
                "Hello! It's great to speak with you today. What would you like to talk about?",
              timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ]);
        }
        setIsLoadingSession(false);
        return;
      }
    }

    // Otherwise create a real conversation session via POST /api/sessions
    const createRes = await api.createSession({
      mode: currentMode.id,
      learnerLevel: levelParam,
    });

    if (createRes.data) {
      setActiveSession(createRes.data);
      // Replace URL quietly with real UUID so state is bookmarkable/refreshable
      navigate(`/conversation/${createRes.data.id}?mode=${currentMode.id}&level=${levelParam}`, {
        replace: true,
      });

      // Opening greeting tailored to selected mode
      setMessages([
        {
          id: `starter-${Date.now()}`,
          speaker: 'ai',
          text:
            currentMode.starterPrompt ||
            "Hello! It's great to speak with you today. What would you like to talk about?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setSessionError(
        createRes.error ||
          'Could not start conversation session. Please verify backend service is running.',
      );
    }

    setIsLoadingSession(false);
  }, [routeSessionId, currentMode.id, currentMode.starterPrompt, levelParam, navigate]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  // Overall session elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clean up any active recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle user submitting text utterance to The Friend
  const handleSendTextMessage = async (e?: React.FormEvent, retryText?: string) => {
    if (e) e.preventDefault();

    const textToSend = (retryText || textInput).trim();
    const sessionId = activeSession?.id || routeSessionId;

    if (!textToSend || !sessionId || isSubmittingTurn) return;

    setTurnError(null);
    setLastFailedText(null);
    setStatusMessage(null);
    setIsSubmittingTurn(true);

    // If not retrying an already appended utterance, append user utterance now
    if (!retryText) {
      const userUtterance: TranscriptMessage = {
        id: `user-${Date.now()}`,
        speaker: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, userUtterance]);
      setTextInput('');
    }

    // Enter thinking state
    setFlowState('ai_thinking');

    // Send to POST /api/sessions/:sessionId/turn
    const turnRes = await api.executeTurn(sessionId, textToSend);

    if (turnRes.data) {
      const aiReply = turnRes.data.aiUtterance;
      const aiUtterance: TranscriptMessage = {
        id: aiReply.id,
        speaker: 'ai',
        text: aiReply.transcript,
        timestamp: new Date(aiReply.createdAt).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      setMessages((prev) => [...prev, aiUtterance]);
      setFlowState('ai_speaking');

      // Natural cadence: speak for 3-4.5s then return to idle
      const readDuration = Math.min(Math.max(aiReply.transcript.length * 35, 2500), 4500);
      setTimeout(() => {
        setFlowState('idle');
      }, readDuration);
    } else {
      // Graceful error state with retry option
      setFlowState('idle');
      setLastFailedText(textToSend);
      setTurnError(
        turnRes.error ||
          'The Friend could not respond right now. Please check if Ollama is running and try again.',
      );
    }

    setIsSubmittingTurn(false);
  };

  // Start browser audio recording via MediaRecorder API
  const startRecording = async () => {
    if (flowState === 'recording' || flowState === 'transcribing' || flowState === 'ai_thinking') {
      return;
    }

    setTurnError(null);
    setStatusMessage(null);
    setFlowState('requesting_mic');

    try {
      // Request microphone access only on user click
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Select supported audio MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/wav',
      ];
      const selectedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || '';

      const recorder = new MediaRecorder(
        stream,
        selectedMime ? { mimeType: selectedMime } : undefined,
      );
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop media tracks
        stream.getTracks().forEach((track) => track.stop());
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });

        if (audioBlob.size === 0) {
          setFlowState('idle');
          setTurnError('Audio recording was empty. Please try speaking again.');
          return;
        }

        // Transcribe via local Whisper backend
        setFlowState('transcribing');
        const durationMs = recordingSeconds * 1000;

        const transcribeRes = await api.transcribeAudio(audioBlob, durationMs);

        if (transcribeRes.data && transcribeRes.data.transcript) {
          const transcribedText = transcribeRes.data.transcript.trim();
          setTextInput(transcribedText);
          setShowTextFallback(true);
          setFlowState('transcript_ready');
          setStatusMessage('Transcription ready. Review or edit below, then send to The Friend.');
          setTimeout(() => {
            textInputRef.current?.focus();
          }, 150);
        } else {
          setFlowState('idle');
          setTurnError(
            transcribeRes.error ||
              'Local Whisper service is not running. You can type your response in English below.',
          );
        }
      };

      recorder.start(250);
      setRecordingSeconds(0);
      setFlowState('recording');

      // Ticker for recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      setFlowState('idle');
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setTurnError(
          'Microphone permission was denied. You can continue speaking by typing below.',
        );
      } else if (err instanceof DOMException && err.name === 'NotFoundError') {
        setTurnError('No microphone detected on your device. You can type your messages below.');
      } else {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setTurnError(`Could not access microphone (${msg}). You can type below.`);
      }
    }
  };

  // Stop active browser audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Handle clicking the primary Mic button
  const handleToggleMic = () => {
    if (flowState === 'recording') {
      stopRecording();
    } else if (flowState === 'idle' || flowState === 'transcript_ready') {
      startRecording();
    }
  };

  // End session & navigate to review
  const handleEndSession = async () => {
    // If currently recording, stop recorder first
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    const sessionId = activeSession?.id || routeSessionId;
    if (sessionId && sessionId !== 'new') {
      await api.completeSession(sessionId);
      navigate(`/session/${sessionId}/feedback`);
    } else {
      navigate('/practice');
    }
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
              {activeSession ? 'Connected to local AI' : 'Connecting to local AI'} • Level:{' '}
              {levelParam}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full transition-colors ${
                flowState === 'recording'
                  ? 'bg-rose-500 animate-ping'
                  : flowState === 'ai_speaking'
                    ? 'bg-sky-400'
                    : flowState === 'ai_thinking' || flowState === 'transcribing'
                      ? 'bg-amber-300 animate-pulse'
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

      {/* Session Initialization Failure Banner */}
      {sessionError && (
        <div className="mt-3 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{sessionError}</span>
          </div>
          <button
            type="button"
            onClick={() => initSession()}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded-xl font-medium text-amber-200 transition-colors cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* The Emotional Centerpiece: The Living Speaking Space */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-10 relative">
        {/* Soft Organic Breathing Glow */}
        <div
          className={`absolute w-80 h-80 rounded-full blur-3xl transition-all duration-1000 pointer-events-none ${
            flowState === 'recording'
              ? 'bg-amber-500/20 scale-125'
              : flowState === 'ai_speaking'
                ? 'bg-sky-500/15 scale-110'
                : flowState === 'ai_thinking' || flowState === 'transcribing'
                  ? 'bg-amber-400/15 scale-100'
                  : 'bg-zinc-800/20 scale-90'
          }`}
        />

        {/* The Companion Aura Presence */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-lg px-4">
          {/* Organic Pulsing Orb */}
          <div
            className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-700 ${
              flowState === 'recording'
                ? 'bg-gradient-to-tr from-amber-500/30 via-orange-500/20 to-amber-200/20 ring-2 ring-amber-400/60 scale-110 shadow-xl shadow-amber-500/20 animate-pulse'
                : flowState === 'ai_speaking'
                  ? 'bg-gradient-to-tr from-sky-500/30 via-indigo-500/20 to-amber-200/20 ring-1 ring-sky-400/30 scale-105 shadow-xl shadow-sky-500/10'
                  : flowState === 'ai_thinking' || flowState === 'transcribing'
                    ? 'bg-gradient-to-tr from-amber-400/20 to-zinc-800 ring-1 ring-amber-400/20 animate-pulse'
                    : 'bg-[#18181b]/80 border border-zinc-800/80 animate-breathe'
            }`}
          >
            {flowState === 'recording' ? (
              <User className="w-10 h-10 text-amber-300" />
            ) : (
              <Sparkles className="w-10 h-10 text-zinc-300" />
            )}
          </div>

          {/* Gentle State Subtitle */}
          <div className="h-6 flex items-center justify-center">
            {isLoadingSession ? (
              <span className="text-xs text-zinc-400 italic">
                Starting session with The Friend...
              </span>
            ) : flowState === 'requesting_mic' ? (
              <span className="text-xs text-amber-300/90 italic">
                Requesting microphone access...
              </span>
            ) : flowState === 'recording' ? (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
                <Waveform isActive={true} color="amber" barsCount={5} size="sm" />
                <span>Recording speech ({recordingSeconds}s)... Tap mic to stop</span>
              </div>
            ) : flowState === 'transcribing' ? (
              <div className="flex items-center gap-2 text-xs text-amber-300/90 italic">
                <Waveform isActive={true} color="amber" barsCount={5} size="sm" />
                <span>Transcribing with local Whisper...</span>
              </div>
            ) : flowState === 'transcript_ready' ? (
              <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Transcript ready for review</span>
              </div>
            ) : flowState === 'ai_thinking' ? (
              <div className="flex items-center gap-2 text-xs text-amber-300/90 italic">
                <Waveform isActive={true} color="amber" barsCount={5} size="sm" />
                <span>The Friend is thinking...</span>
              </div>
            ) : flowState === 'ai_speaking' ? (
              <div className="flex items-center gap-2 text-xs font-medium text-sky-300">
                <Waveform isActive={true} color="blue" barsCount={5} size="sm" />
                <span>The Friend is speaking</span>
              </div>
            ) : (
              <span className="text-xs text-zinc-400">
                The floor is yours. Tap mic to speak or type below.
              </span>
            )}
          </div>

          {/* Spoken Text (Editorial Typography) */}
          <div className="w-full min-h-[5rem] flex items-center justify-center">
            {flowState === 'recording' ? (
              <p className="font-serif text-lg sm:text-xl text-amber-200/90 font-normal italic leading-relaxed">
                "Keep talking freely... tap the mic when you're done."
              </p>
            ) : flowState === 'transcribing' ? (
              <p className="font-serif text-base sm:text-lg text-zinc-400 italic">
                Listening closely to your words...
              </p>
            ) : flowState === 'ai_thinking' ? (
              <p className="font-serif text-base sm:text-lg text-zinc-400 italic">
                Formulating thoughts...
              </p>
            ) : flowState === 'ai_speaking' ? (
              <p className="font-serif text-lg sm:text-xl text-zinc-100 font-normal leading-relaxed">
                "{latestAiMessage?.text}"
              </p>
            ) : (
              <p className="font-serif text-base sm:text-lg text-zinc-300 font-normal">
                "{latestAiMessage?.text || "Let's begin. Speak whenever you are ready."}"
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transcript Drawer Toggle */}
      <div className="border border-zinc-800/60 rounded-2xl bg-[#141416]/50 mb-3 overflow-hidden">
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
          <div className="max-h-48 overflow-y-auto p-4 space-y-3 border-t border-zinc-800/40 text-xs text-left">
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

      {/* Turn or Transcription Error State with Retry Button */}
      {turnError && (
        <div className="mb-3 p-3 rounded-2xl bg-rose-950/40 border border-rose-800/50 flex items-center justify-between gap-3 text-xs text-rose-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 overflow-hidden">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">{turnError}</span>
          </div>
          {lastFailedText && (
            <button
              type="button"
              onClick={() => handleSendTextMessage(undefined, lastFailedText)}
              className="px-3 py-1 bg-rose-800/40 hover:bg-rose-800/70 border border-rose-700/60 rounded-xl font-medium text-rose-100 text-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Informational Status Message */}
      {statusMessage && (
        <div className="mb-2 text-center text-xs text-emerald-400/90 animate-in fade-in duration-150">
          {statusMessage}
        </div>
      )}

      {/* Bottom Voice & Text Controls */}
      <div className="pt-1 flex flex-col items-center gap-3">
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
            disabled={flowState === 'transcribing' || flowState === 'ai_thinking'}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg disabled:opacity-50 ${
              flowState === 'recording'
                ? 'bg-rose-500 hover:bg-rose-600 text-white ring-8 ring-rose-500/20 scale-105'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 ring-2 ring-zinc-700/60 hover:scale-105'
            }`}
            aria-label={flowState === 'recording' ? 'Stop recording' : 'Tap to speak'}
            title={flowState === 'recording' ? 'Stop recording' : 'Tap to speak with Whisper STT'}
          >
            {flowState === 'recording' ? (
              <Square className="w-7 h-7 fill-current" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
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

        {/* Text fallback & review input */}
        {showTextFallback && (
          <form
            onSubmit={handleSendTextMessage}
            className="w-full max-w-md flex items-center gap-2 pt-1 animate-in fade-in duration-150"
          >
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              disabled={
                isSubmittingTurn || flowState === 'recording' || flowState === 'transcribing'
              }
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                flowState === 'transcript_ready'
                  ? 'Review/edit transcript and press Enter...'
                  : 'Type your response in English (or tap mic to speak)...'
              }
              className={`flex-1 bg-zinc-900 border rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-400 disabled:opacity-50 transition-colors ${
                flowState === 'transcript_ready'
                  ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                  : 'border-zinc-800'
              }`}
            />
            <button
              type="submit"
              disabled={
                isSubmittingTurn ||
                !textInput.trim() ||
                flowState === 'recording' ||
                flowState === 'transcribing'
              }
              className="bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-400 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center"
              title="Send to The Friend"
            >
              {isSubmittingTurn ? (
                <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        )}

        <div className="text-[11px] text-zinc-400 text-center">
          {flowState === 'recording'
            ? 'Speaking... Tap the button again when finished.'
            : flowState === 'transcribing'
              ? 'Transcribing audio with local Whisper...'
              : flowState === 'transcript_ready'
                ? 'Check your words above. You can edit them before sending.'
                : flowState === 'ai_thinking'
                  ? 'The Friend is processing your message...'
                  : 'Tap the mic to speak or type above. Practice at your natural pace.'}
        </div>
      </div>
    </div>
  );
}
