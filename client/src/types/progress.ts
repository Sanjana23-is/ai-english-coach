export interface SkillDimension {
  id: string;
  name: string;
  description: string;
  currentStatus: string;
  recentObservation: string;
  isUpcoming?: boolean;
}

export interface SessionHistoryItem {
  id: string;
  title: string;
  modeName: string;
  date: string;
  durationMinutes: number;
  turnsCount: number;
  highlightCategory: string;
  highlightText: string;
}

export interface LongitudinalMetrics {
  totalSpeakingHours: number;
  sessionsCompleted: number;
  patternsResolved: number;
  wordsEncountered: number;
  fluencyTrendText: string;
  grammarTrendText: string;
  vocabularyTrendText: string;
}
