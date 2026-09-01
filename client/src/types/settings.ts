export interface VoiceOption {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  accent: string;
  previewText: string;
}

export interface UserSettings {
  preferredLevel: string;
  primaryGoal: string;
  selectedVoiceId: string;
  speakingRate: number; // 0.8 to 1.2
  allowTranscriptHistory: boolean;
  ephemeralMode: boolean;
  autoPlayAudio: boolean;
  showLiveCaptions: boolean;
}
