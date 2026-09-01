import { useState } from 'react';
import { Mic, CheckCircle2, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Waveform } from '../common/Waveform';
import type { FeedbackItem } from '../../types/feedback';

export interface TryAgainModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FeedbackItem | null;
}

type RetryState = 'idle' | 'recording' | 'analyzing' | 'success';

export function TryAgainModal({ isOpen, onClose, item }: TryAgainModalProps) {
  const [retryState, setRetryState] = useState<RetryState>('idle');

  if (!item) return null;

  const handleStartRecording = () => {
    setRetryState('recording');
    setTimeout(() => {
      setRetryState('analyzing');
      setTimeout(() => {
        setRetryState('success');
      }, 1000);
    }, 2200);
  };

  const handleReset = () => {
    setRetryState('idle');
  };

  const handleClose = () => {
    setRetryState('idle');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Try Saying It"
      description="Practice speaking the sentence out loud to reinforce natural muscle memory."
      maxWidth="lg"
    >
      <div className="space-y-6 pt-2">
        {/* Comparison Box */}
        <div className="space-y-3">
          {/* What you said */}
          <div className="p-3.5 rounded-2xl bg-[#121214] border border-zinc-800/80">
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
              What you said:
            </div>
            <p className="font-serif text-sm text-zinc-400 line-through decoration-zinc-600">
              "{item.originalText}"
            </p>
          </div>

          {/* Target */}
          <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-500/25">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-amber-300/90 uppercase tracking-wider">
                Natural target:
              </span>
              <button
                type="button"
                className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                title="Hear sample"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear</span>
              </button>
            </div>
            <p className="font-serif text-base font-medium text-amber-200">"{item.improvedText}"</p>
          </div>

          {/* Explanation */}
          <div className="text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/60 leading-relaxed">
            <span className="text-zinc-300 font-medium">Why: </span>
            {item.explanation}
          </div>
        </div>

        {/* Re-speech Stage */}
        <div className="p-6 rounded-3xl bg-[#141416] border border-zinc-800/80 flex flex-col items-center justify-center text-center">
          {retryState === 'idle' && (
            <>
              <button
                type="button"
                onClick={handleStartRecording}
                className="w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer mb-3"
                aria-label="Start speaking retry"
              >
                <Mic className="w-7 h-7" />
              </button>
              <div className="text-sm font-medium text-zinc-200">Tap to record your attempt</div>
              <p className="text-xs text-zinc-400 mt-1">
                Say the target sentence out loud at your comfortable speaking pace.
              </p>
            </>
          )}

          {retryState === 'recording' && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center animate-pulse mb-3">
                <Mic className="w-7 h-7" />
              </div>
              <Waveform isActive={true} color="amber" size="md" className="my-2" />
              <div className="text-sm font-semibold text-amber-300">Listening to you...</div>
              <p className="font-serif text-xs text-zinc-300 mt-1 italic">
                "{item.tryAgainPrompt}"
              </p>
            </>
          )}

          {retryState === 'analyzing' && (
            <div className="py-4 flex flex-col items-center">
              <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-3" />
              <div className="text-xs text-zinc-400">Comparing with target phrasing...</div>
            </div>
          )}

          {retryState === 'success' && (
            <div className="space-y-3 w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-100 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Sounded natural and fluent!</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  You said:{' '}
                  <span className="font-serif text-emerald-300 font-medium">
                    "{item.improvedText}"
                  </span>
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<RotateCcw className="w-3 h-3" />}
                  onClick={handleReset}
                >
                  Try Once More
                </Button>
                <Button size="sm" variant="primary" onClick={handleClose}>
                  Done & Continue
                </Button>
              </div>
            </div>
          )}
        </div>

        {retryState !== 'success' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
