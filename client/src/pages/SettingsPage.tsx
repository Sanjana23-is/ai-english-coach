import { useState } from 'react';
import { Volume2, Shield, Sliders, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { mockVoices, mockDefaultSettings } from '../lib/mockData';

export function SettingsPage() {
  const [settings, setSettings] = useState(mockDefaultSettings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-10 max-w-2xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-amber-400 font-medium mb-1">Preferences & Privacy</div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-zinc-100 tracking-tight">
            Settings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Choose your AI speaking voice, conversational tempo, and local privacy controls.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleSave}
          leftIcon={isSaved ? <CheckCircle2 className="w-4 h-4 text-zinc-950" /> : undefined}
          className="bg-amber-400 hover:bg-amber-300 text-zinc-950 font-medium rounded-xl"
        >
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      </div>

      {/* Local Neural Voices (Piper) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#141416]/70 border border-zinc-800/70 space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-amber-400" />
          <h2 className="font-serif text-xl font-medium text-zinc-200">
            Speaking Voice (Local Piper TTS)
          </h2>
        </div>
        <p className="text-xs text-zinc-400">
          All speech is synthesized directly on your machine with zero cloud API latency or cost.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 pt-1">
          {mockVoices.map((voice) => (
            <button
              key={voice.id}
              type="button"
              onClick={() => setSettings({ ...settings, selectedVoiceId: voice.id })}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                settings.selectedVoiceId === voice.id
                  ? 'bg-[#18181b] border-amber-500/50 ring-1 ring-amber-500/30 text-zinc-100'
                  : 'bg-[#121214]/60 border-zinc-800/80 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">{voice.name}</div>
              <div className="text-[11px] text-zinc-400 mb-2">{voice.accent}</div>
              <div className="font-serif text-[11px] text-zinc-400 italic line-clamp-2">
                "{voice.previewText}"
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Speaking Tempo & Interaction */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#141416]/70 border border-zinc-800/70 space-y-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h2 className="font-serif text-xl font-medium text-zinc-200">Conversational Tempo</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="tempo-slider" className="font-medium text-zinc-200">
                AI Speaking Pace
              </label>
              <span className="text-zinc-400">{settings.speakingRate}x</span>
            </div>
            <input
              id="tempo-slider"
              type="range"
              min="0.8"
              max="1.2"
              step="0.1"
              value={settings.speakingRate}
              onChange={(e) =>
                setSettings({ ...settings, speakingRate: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>0.8x (Gentle)</span>
              <span>1.0x (Natural)</span>
              <span>1.2x (Native Fast)</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40">
            <div>
              <div className="font-medium text-zinc-200">Auto-play voice audio</div>
              <div className="text-[11px] text-zinc-400">
                Play the Friend's voice automatically when response arrives
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoPlayAudio}
              onChange={(e) => setSettings({ ...settings, autoPlayAudio: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Privacy-by-Default Controls */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#141416]/70 border border-zinc-800/70 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h2 className="font-serif text-xl font-medium text-zinc-200">
            Privacy & Local Data Controls
          </h2>
        </div>
        <p className="text-xs text-zinc-400">
          Your audio and transcripts remain completely on your device. We never upload your voice to
          third-party AI providers.
        </p>

        <div className="space-y-4 pt-1 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-zinc-200">Save conversation transcripts</div>
              <div className="text-[11px] text-zinc-400">
                Allows reviewing past chats and identifying recurring linguistic habits
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.allowTranscriptHistory}
              onChange={(e) =>
                setSettings({ ...settings, allowTranscriptHistory: e.target.checked })
              }
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/40">
            <div>
              <div className="font-medium text-zinc-200">Ephemeral private mode</div>
              <div className="text-[11px] text-zinc-400">
                Instantly discard transcripts and audio as soon as you finish your review
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.ephemeralMode}
              onChange={(e) => setSettings({ ...settings, ephemeralMode: e.target.checked })}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800/60 flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => alert('Exporting your learner profile & transcripts as JSON...')}
            className="text-xs rounded-xl"
          >
            Export My Data (JSON)
          </Button>

          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => {
              if (confirm('Permanently wipe all conversation transcripts stored locally?')) {
                alert('Local data cleared.');
              }
            }}
            className="text-xs rounded-xl"
          >
            Clear Local Data
          </Button>
        </div>
      </div>
    </div>
  );
}
