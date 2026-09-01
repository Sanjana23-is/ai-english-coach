export type DifficultyLevel =
  'Beginner' | 'Elementary' | 'Intermediate' | 'Upper Intermediate' | 'Advanced';

export type ModeCategory =
  'all' | 'everyday' | 'professional' | 'academic' | 'creative' | 'challenge';

export interface ConversationMode {
  id: string;
  name: string;
  slug: string;
  category: ModeCategory;
  shortDescription: string;
  fullDescription: string;
  targetSkills: string[];
  suggestedLevel: DifficultyLevel;
  iconName: string;
  starterPrompt: string;
  isUnstructured?: boolean;
}
