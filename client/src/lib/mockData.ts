import type { ConversationMode } from '../types/practice';
import type { LearnerProfile } from '../types/learner';
import type { SessionFeedback } from '../types/feedback';
import type { ConversationSession } from '../types/conversation';
import type { SkillDimension, LongitudinalMetrics, SessionHistoryItem } from '../types/progress';
import type { VoiceOption, UserSettings } from '../types/settings';

export const mockConversationModes: ConversationMode[] = [
  {
    id: 'unstructured',
    name: 'Freeform Conversation',
    slug: 'freeform',
    category: 'everyday',
    shortDescription: 'Open, natural dialogue without preset topics or constraints.',
    fullDescription:
      'Speak about whatever is on your mind today. The Friend will listen attentively, match your flow, and respond naturally without steering you into artificial scenarios.',
    targetSkills: ['Spontaneous Speech', 'Conversational Stamina', 'Everyday Flow'],
    suggestedLevel: 'Intermediate',
    iconName: 'MessageSquare',
    starterPrompt: 'Hey there! How has your day been treating you so far?',
    isUnstructured: true,
  },
  {
    id: 'casual-chat',
    name: 'Casual Chat',
    slug: 'casual-chat',
    category: 'everyday',
    shortDescription: 'Everyday friendly banter, weekend plans, hobbies, and thoughts.',
    fullDescription:
      'Warm, relaxed conversation like catching up with a friend over coffee. Focuses on storytelling, expressing light opinions, and sharing experiences.',
    targetSkills: ['Informal Phrasing', 'Storytelling', 'Question Asking'],
    suggestedLevel: 'Beginner',
    iconName: 'Coffee',
    starterPrompt: 'Good to see you! Have you done anything fun or relaxing recently?',
  },
  {
    id: 'job-interview',
    name: 'Job Interview',
    slug: 'job-interview',
    category: 'professional',
    shortDescription: 'Simulate behavioral and competency interviews with supportive pacing.',
    fullDescription:
      'Practice answering common behavioral interview questions (STAR method), summarizing your professional accomplishments, and navigating challenging workplace scenarios.',
    targetSkills: ['Professional Vocabulary', 'Concise Structure', 'Self-Presentation'],
    suggestedLevel: 'Upper Intermediate',
    iconName: 'Briefcase',
    starterPrompt:
      'Welcome! Thanks for taking the time to speak with me today. To start off, could you tell me a little bit about yourself and your background?',
  },
  {
    id: 'workplace',
    name: 'Workplace & Collaboration',
    slug: 'workplace',
    category: 'professional',
    shortDescription: 'Project syncs, team standups, client updates, and negotiations.',
    fullDescription:
      'Navigate common professional interactions: proposing ideas in meetings, diplomatic disagreement, giving status updates, and requesting clarification gracefully.',
    targetSkills: ['Diplomatic Phrasing', 'Meeting Fluency', 'Clarification Strategies'],
    suggestedLevel: 'Intermediate',
    iconName: 'Building2',
    starterPrompt:
      'Hi! We have a quick 10-minute sync on our quarterly project deliverables. How are things looking from your side?',
  },
  {
    id: 'academic',
    name: 'Academic Discussion',
    slug: 'academic',
    category: 'academic',
    shortDescription: 'Discuss articles, analyze research topics, and debate complex concepts.',
    fullDescription:
      'Elevate your analytical English. Practice citing evidence, comparing hypotheses, articulating abstract logic, and evaluating viewpoints.',
    targetSkills: ['Analytical Vocabulary', 'Complex Syntax', 'Abstract Reasoning'],
    suggestedLevel: 'Advanced',
    iconName: 'GraduationCap',
    starterPrompt:
      "Today let's look at how artificial intelligence might impact human creativity. In your view, will it enhance or diminish original thinking?",
  },
  {
    id: 'travel',
    name: 'Travel & Exploration',
    slug: 'travel',
    category: 'everyday',
    shortDescription: 'Airport navigation, hotel bookings, transit directions, and dining.',
    fullDescription:
      'Simulate authentic travel scenarios where quick, functional communication is essential. Ask for directions, handle unexpected delays, and order local food.',
    targetSkills: ['Functional Inquiries', 'Polite Requests', 'Locational Vocabulary'],
    suggestedLevel: 'Elementary',
    iconName: 'Plane',
    starterPrompt:
      "Excuse me! You've just arrived at the central train station in a new city. How can I help you find your terminal?",
  },
  {
    id: 'daily-life',
    name: 'Daily Life Situations',
    slug: 'daily-life',
    category: 'everyday',
    shortDescription: 'Practical errands: doctor visits, store returns, customer support.',
    fullDescription:
      'Master the essential spoken exchanges of daily survival: describing physical symptoms at a clinic, explaining a return at a shop, or resolving utility issues.',
    targetSkills: ['Practical Precision', 'Describing Problems', 'Clarification'],
    suggestedLevel: 'Elementary',
    iconName: 'ShoppingBag',
    starterPrompt:
      'Hi there! Welcome to Customer Care. I see you brought in an item today—how can I assist you?',
  },
  {
    id: 'roleplay',
    name: 'Creative Roleplay',
    slug: 'roleplay',
    category: 'creative',
    shortDescription: 'Immersive scenarios: advising a friend, resolving a dilemma.',
    fullDescription:
      'Step into creative personas to stretch your improvisational speaking skills. Handle unexpected twists, practice empathy, and express advice persuasively.',
    targetSkills: ['Spontaneous Adaptability', 'Emotional Nuance', 'Persuasive Speech'],
    suggestedLevel: 'Intermediate',
    iconName: 'Theater',
    starterPrompt:
      "I'm really glad we could talk in private. I have a major dilemma with my business partner and I really value your honest perspective...",
  },
  {
    id: 'debate',
    name: 'Friendly Debate',
    slug: 'debate',
    category: 'challenge',
    shortDescription: 'Exchange perspectives on thought-provoking questions respectfully.',
    fullDescription:
      'Test your ability to formulate counter-arguments, concede points graciously, and defend your perspective with coherent justifications.',
    targetSkills: ['Counter-Argumentation', 'Concession Phrases', 'Logical Connectors'],
    suggestedLevel: 'Upper Intermediate',
    iconName: 'Scale',
    starterPrompt:
      'Some people say working remotely 100% of the time is better for everyone, while others argue in-office collaboration is irreplaceable. Which side do you lean toward?',
  },
  {
    id: 'presentation-practice',
    name: 'Presentation Practice',
    slug: 'presentation-practice',
    category: 'professional',
    shortDescription: 'Pitch an idea, practice a conference opening, or deliver a summary.',
    fullDescription:
      'Deliver continuous monologue presentations with signposting language, transitions, and vocal emphasis. Receive feedback on pacing and clarity.',
    targetSkills: ['Signposting Phrasing', 'Monologue Pacing', 'Key Transitions'],
    suggestedLevel: 'Intermediate',
    iconName: 'Presentation',
    starterPrompt:
      "Whenever you're ready, present the opening two minutes of your proposed topic. The floor is entirely yours!",
  },
  {
    id: 'surprise-me',
    name: 'Surprise Me',
    slug: 'surprise-me',
    category: 'creative',
    shortDescription: 'Random unexpected prompt designed to spark quick spontaneous thinking.',
    fullDescription:
      'A surprise question drawn from philosophy, bizarre hypotheticals, or memory recall. The best way to build confidence when you cannot prepare in advance.',
    targetSkills: ['Rapid Retrieval', 'Improvisation', 'Humor & Storytelling'],
    suggestedLevel: 'Intermediate',
    iconName: 'Sparkles',
    starterPrompt:
      'If you could have a one-hour dinner with any historical figure from the last thousand years, who would you choose and why?',
  },
];

export const mockLearnerProfile: LearnerProfile = {
  name: 'Sanjana',
  estimatedLevel: 'Intermediate',
  cefrEquivalent: 'B1',
  totalSpeakingMinutes: 142,
  totalSessionsCompleted: 28,
  currentStreakDays: 4,
  goals: [
    {
      id: 'workplace',
      label: 'Workplace Fluency',
      description: 'Sound natural and confident during meetings and team syncs',
      isSelected: true,
    },
    {
      id: 'spontaneous',
      label: 'Spontaneous Speaking',
      description: 'Reduce pause time when answering unexpected questions',
      isSelected: true,
    },
    {
      id: 'interviews',
      label: 'Job Interviews',
      description: 'Prepare for behavioral interview scenarios',
      isSelected: false,
    },
  ],
  strengths: [
    'Maintains sustained conversation across 6+ turns without freezing',
    'Rich descriptive vocabulary when discussing personal experiences',
    'Effective self-correction when noticing tense slips',
  ],
  activeLearningPriorities: [
    'Past-tense auxiliary verb construction (e.g. using base verb after "didn\'t")',
    'Prepositions of time and place ("in" vs. "at" vs. "on")',
    'Reducing hesitation pauses when shifting narrative topics',
  ],
  patterns: [
    {
      id: 'p-1',
      category: 'grammar',
      title: 'Past Tense Auxiliary ("didn\'t + base form")',
      description: 'Using past tense verb form directly after the negative auxiliary "didn\'t".',
      ruleContext:
        'In English, "did" already carries the past tense. The main verb remains in bare infinitive.',
      state: 'confirmed_weakness',
      occurrencesCount: 5,
      successCount: 2,
      examples: ['"I didn\'t went"', '"I didn\'t knew"', '"I didn\'t saw"'],
      lastObserved: 'Yesterday',
    },
    {
      id: 'p-2',
      category: 'grammar',
      title: 'Preposition of Time: Specific Days ("on Monday")',
      description: 'Using "in" instead of "on" when referring to specific weekdays.',
      ruleContext: 'Use "on" with days and dates; use "in" with months, years, and long periods.',
      state: 'improving',
      occurrencesCount: 3,
      successCount: 7,
      examples: ['"in last Sunday" → "on last Sunday"'],
      lastObserved: '3 days ago',
    },
    {
      id: 'p-3',
      category: 'vocabulary',
      title: 'Collocation: "Make a decision" vs "Do a decision"',
      description: 'Using the verb "do" where the natural English collocation requires "make".',
      ruleContext: 'Decisions, plans, and mistakes take the verb "make".',
      state: 'mastered',
      occurrencesCount: 4,
      successCount: 12,
      examples: ['"I made a decision to start learning"'],
      lastObserved: 'Last week',
    },
    {
      id: 'p-4',
      category: 'grammar',
      title: 'Third-Person Singular Present (-s ending)',
      description: 'Occasional omission of "-s" on third-person present verbs during rapid speech.',
      ruleContext: 'He/she/it takes an -s ending in the present simple (e.g., "she works").',
      state: 'possible_pattern',
      occurrencesCount: 2,
      successCount: 8,
      examples: ['"she work at the company"'],
      lastObserved: '2 days ago',
    },
    {
      id: 'p-5',
      category: 'fluency',
      title: 'Repeated Filler Phrase ("you know what I mean")',
      description: 'Relying on this specific filler phrase when retrieving descriptive adjectives.',
      ruleContext: 'Try taking a comfortable breath instead of a verbal placeholder.',
      state: 'possible_pattern',
      occurrencesCount: 6,
      successCount: 4,
      examples: ['Used 4 times in a single 2-minute response'],
      lastObserved: 'Yesterday',
    },
  ],
  vocabularyCount: 184,
};

export const mockSampleSession: ConversationSession = {
  sessionId: 'sess-travel-01',
  modeId: 'travel',
  modeName: 'Travel & Exploration',
  startedAt: '2026-09-01T18:40:00Z',
  endedAt: '2026-09-01T18:48:30Z',
  durationSeconds: 510,
  state: 'idle',
  messages: [
    {
      id: 'm-1',
      speaker: 'ai',
      text: "Welcome to Barcelona! I'm so glad your flight arrived safely. How was the journey from the airport to the city center?",
      timestamp: '18:40:15',
    },
    {
      id: 'm-2',
      speaker: 'user',
      text: "Thank you! The journey was okay, but I didn't went by the metro because the signs were a bit confusing for me.",
      timestamp: '18:40:48',
      durationMs: 8200,
    },
    {
      id: 'm-3',
      speaker: 'ai',
      text: "That's completely understandable—the metro terminals can definitely feel overwhelming when you first arrive. Did you end up taking a taxi instead, or did you try the airport shuttle bus?",
      timestamp: '18:41:05',
    },
    {
      id: 'm-4',
      speaker: 'user',
      text: 'Yes, I took a taxi. The driver was very good and he explained me some nice places to visit near my hotel.',
      timestamp: '18:41:40',
      durationMs: 9100,
    },
    {
      id: 'm-5',
      speaker: 'ai',
      text: 'A friendly taxi driver is always a wonderful welcome to a new city! What kind of places did he mention? Any historic spots or local tapas bars?',
      timestamp: '18:41:58',
    },
    {
      id: 'm-6',
      speaker: 'user',
      text: 'He said there is an ancient cathedral with narrow streets, and also a beach area where people eat seafood. I made a big decision of my life to come here alone, so I want to explore everything.',
      timestamp: '18:42:35',
      durationMs: 14200,
    },
    {
      id: 'm-7',
      speaker: 'ai',
      text: 'Traveling solo takes real courage, and Barcelona is one of the most rewarding cities in the world to explore on your own! Are you planning to visit the Gothic Quarter first, or are you heading straight to the seaside?',
      timestamp: '18:42:55',
    },
  ],
};

export const mockFeedback: SessionFeedback = {
  sessionId: 'sess-travel-01',
  sessionTitle: 'Travel & Exploration • Barcelona Arrival',
  durationSeconds: 510,
  turnsCount: 7,
  date: 'September 1, 2026',
  strengths: [
    'You maintained great conversational rhythm across 7 turns without hesitation.',
    'Clear, descriptive storytelling when describing the taxi ride and city landmarks.',
    'Natural, courageous self-expression about traveling solo.',
  ],
  topImprovements: [
    {
      id: 'fb-1',
      category: 'grammar',
      categoryLabel: 'Grammar • Past Tense Auxiliary',
      originalText: "I didn't went by the metro",
      improvedText: "I didn't go by the metro",
      explanation:
        'When you use the auxiliary verb "didn\'t" (or "did"), it already carries the past tense. The main verb that follows should remain in its base/infinitive form ("go", not "went").',
      tryAgainPrompt: "I didn't go by the metro",
      priorityScore: 0.95,
    },
    {
      id: 'fb-2',
      category: 'grammar',
      categoryLabel: 'Grammar • Verb Pattern',
      originalText: 'he explained me some nice places',
      improvedText: 'he explained some nice places to me',
      explanation:
        'In English, the verb "explain" doesn\'t take an indirect object directly. You say "explain something to someone", or "told me about some nice places".',
      tryAgainPrompt: 'he explained some nice places to me',
      priorityScore: 0.88,
    },
    {
      id: 'fb-3',
      category: 'naturalness',
      categoryLabel: 'Natural Expression • Collocation',
      originalText: 'I made a big decision of my life',
      improvedText: 'I made a major life decision',
      explanation:
        '"Big decision of my life" is understandable, but native speakers usually use the compound phrase "a major life decision".',
      tryAgainPrompt: 'I made a major life decision to come here alone',
      priorityScore: 0.75,
    },
  ],
  vocabularyUpgrades: [
    {
      original: 'very good',
      frequency: 3,
      context: 'The driver was very good...',
      alternatives: ['welcoming', 'hospitable', 'exceptionally courteous'],
    },
    {
      original: 'nice places',
      frequency: 2,
      context: '...some nice places to visit...',
      alternatives: ['fascinating spots', 'hidden gems', 'historic sights'],
    },
  ],
  fluencySummary: {
    speakingTimePercentage: 62,
    wordsSpoken: 84,
    averageTurnDurationSec: 10.5,
    hesitationNote: 'Smooth conversational flow with minimal intra-sentence hesitation.',
  },
};

export const mockSkillDimensions: SkillDimension[] = [
  {
    id: 'fluency',
    name: 'Speaking Fluency',
    description: 'Rhythm, pause duration, response length, and conversational stamina.',
    currentStatus: 'Developing Steadily',
    recentObservation:
      'Average speaking turns have stretched from 6 words to 18 words over the last 10 sessions.',
  },
  {
    id: 'grammar',
    name: 'Grammatical Accuracy',
    description: 'Tense consistency, auxiliary verbs, prepositions, and clause structure.',
    currentStatus: 'Active Pattern Focus',
    recentObservation:
      'Currently strengthening negative past-tense auxiliary structures ("didn\'t + verb").',
  },
  {
    id: 'vocabulary',
    name: 'Vocabulary Range',
    description: 'Adopting context-specific synonyms and natural idioms over generic descriptors.',
    currentStatus: 'Expanding',
    recentObservation:
      '14 new descriptive adjectives successfully used across spontaneous speech this week.',
  },
  {
    id: 'communication',
    name: 'Communication & Coherence',
    description: 'Storytelling, explaining ideas, asking questions, and maintaining flow.',
    currentStatus: 'Strong Confidence',
    recentObservation:
      'Comfortably sustaining back-and-forth dialogue across 8+ turns without conversational drop-off.',
  },
  {
    id: 'pronunciation',
    name: 'Pronunciation & Phonetics',
    description: 'Phonemic accuracy, syllable stress, and natural sentence intonation.',
    currentStatus: 'Planned Feature',
    recentObservation:
      'Acoustic phoneme analysis using local audio models will be introduced in Phase 6.',
    isUpcoming: true,
  },
];

export const mockLongitudinalMetrics: LongitudinalMetrics = {
  totalSpeakingHours: 2.4,
  sessionsCompleted: 28,
  patternsResolved: 4,
  wordsEncountered: 640,
  fluencyTrendText: 'Your responses are becoming longer and more consistent over time.',
  grammarTrendText: 'Recurring auxiliary slips have dropped by 40% across recent sessions.',
  vocabularyTrendText: 'You are naturally replacing generic adjectives with descriptive synonyms.',
};

export const mockSessionHistory: SessionHistoryItem[] = [
  {
    id: 'sess-travel-01',
    title: 'Barcelona Arrival & First Impressions',
    modeName: 'Travel & Exploration',
    date: 'Yesterday',
    durationMinutes: 8,
    turnsCount: 7,
    highlightCategory: 'Grammar',
    highlightText: "Practiced: didn't + base verb",
  },
  {
    id: 'sess-job-02',
    title: 'Handling Unexpected Team Deadlines',
    modeName: 'Job Interview',
    date: '3 days ago',
    durationMinutes: 12,
    turnsCount: 11,
    highlightCategory: 'Fluency',
    highlightText: 'Sustained 45-second continuous response',
  },
  {
    id: 'sess-casual-03',
    title: 'Weekend Cooking & Family Traditions',
    modeName: 'Casual Chat',
    date: '5 days ago',
    durationMinutes: 10,
    turnsCount: 9,
    highlightCategory: 'Vocabulary',
    highlightText: 'Adopted 3 new culinary adjectives',
  },
];

export const mockVoices: VoiceOption[] = [
  {
    id: 'voice-amy',
    name: 'Amy',
    gender: 'Female',
    accent: 'US English',
    previewText: 'Hi there! It is wonderful to practice speaking with you today.',
  },
  {
    id: 'voice-ryan',
    name: 'Ryan',
    gender: 'Male',
    accent: 'US English',
    previewText: 'Hello! Tell me whatever is on your mind and let us talk freely.',
  },
  {
    id: 'voice-clara',
    name: 'Clara',
    gender: 'Female',
    accent: 'UK English',
    previewText: 'Good day! I am looking forward to our conversation.',
  },
];

export const mockDefaultSettings: UserSettings = {
  preferredLevel: 'Intermediate',
  primaryGoal: 'Workplace & Spontaneous Fluency',
  selectedVoiceId: 'voice-amy',
  speakingRate: 1.0,
  allowTranscriptHistory: true,
  ephemeralMode: false,
  autoPlayAudio: true,
  showLiveCaptions: true,
};
