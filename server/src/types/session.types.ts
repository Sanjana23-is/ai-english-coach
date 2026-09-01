export type SessionStatus = 'active' | 'completed' | 'abandoned';
export type SpeakerRole = 'user' | 'ai';

export interface ConversationSession {
  id: string;
  userId: string;
  mode: string;
  learnerLevel: string;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  turnCount: number;
  totalSpeakingTimeMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface Utterance {
  id: string;
  sessionId: string;
  speaker: SpeakerRole;
  turnIndex: number;
  transcript: string;
  audioDurationMs: number | null;
  pauseDurationMs: number | null;
  createdAt: string;
}

export interface CreateSessionRequest {
  mode?: string;
  learnerLevel?: string;
  userId?: string;
}

export interface RecordUtteranceRequest {
  speaker: SpeakerRole;
  text: string;
  audioDurationMs?: number;
  pauseDurationMs?: number;
}

export interface ConversationTurnRequest {
  text: string;
  audioDurationMs?: number;
}

export interface ConversationTurnResponse {
  userUtterance: Utterance;
  aiUtterance: Utterance;
  sessionStatus: SessionStatus;
  turnIndex: number;
}
