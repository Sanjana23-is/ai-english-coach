export type PatternLifecycleState =
  'one_time_mistake' | 'possible_pattern' | 'confirmed_weakness' | 'improving' | 'mastered';

export interface PatternItem {
  id: string;
  category: 'grammar' | 'vocabulary' | 'fluency';
  title: string;
  description: string;
  ruleContext: string;
  state: PatternLifecycleState;
  occurrencesCount: number;
  successCount: number;
  examples: string[];
  lastObserved: string;
}

export interface LearnerGoal {
  id: string;
  label: string;
  description: string;
  isSelected: boolean;
}

export interface LearnerProfile {
  name: string;
  estimatedLevel: 'Beginner' | 'Elementary' | 'Intermediate' | 'Upper Intermediate' | 'Advanced';
  cefrEquivalent: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  totalSpeakingMinutes: number;
  totalSessionsCompleted: number;
  currentStreakDays: number;
  goals: LearnerGoal[];
  strengths: string[];
  activeLearningPriorities: string[];
  patterns: PatternItem[];
  vocabularyCount: number;
}
