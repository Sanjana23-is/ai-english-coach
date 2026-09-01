export type ConversationState = 'idle' | 'user_speaking' | 'ai_thinking' | 'ai_speaking';

export type Speaker = 'user' | 'ai';

export interface TranscriptMessage {
  id: string;
  speaker: Speaker;
  text: string;
  timestamp: string;
  durationMs?: number;
  highlightedIssues?: Array<{
    text: string;
    category: string;
  }>;
}

export interface ConversationSession {
  sessionId: string;
  modeId: string;
  modeName: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  messages: TranscriptMessage[];
  state: ConversationState;
}
