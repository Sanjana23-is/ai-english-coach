export type FeedbackCategory =
  'grammar' | 'vocabulary' | 'naturalness' | 'fluency' | 'communication';

export interface FeedbackItem {
  id: string;
  category: FeedbackCategory;
  categoryLabel: string;
  originalText: string;
  improvedText: string;
  explanation: string;
  tryAgainPrompt: string;
  priorityScore: number;
}

export interface VocabularyUpgrade {
  original: string;
  frequency: number;
  context: string;
  alternatives: string[];
}

export interface SessionFeedback {
  sessionId: string;
  sessionTitle: string;
  durationSeconds: number;
  turnsCount: number;
  date: string;
  strengths: string[];
  topImprovements: FeedbackItem[];
  vocabularyUpgrades: VocabularyUpgrade[];
  fluencySummary: {
    speakingTimePercentage: number;
    wordsSpoken: number;
    averageTurnDurationSec: number;
    hesitationNote: string;
  };
}

export interface RetryAttempt {
  feedbackId: string;
  originalText: string;
  improvedText: string;
  userSpokeText: string;
  isMatch: boolean;
  timestamp: string;
}
