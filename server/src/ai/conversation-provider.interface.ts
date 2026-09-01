import type { SpeakerRole } from '../types/session.types.js';

export interface TurnMessage {
  speaker: SpeakerRole;
  text: string;
}

export interface ConversationContext {
  sessionId: string;
  mode: string;
  learnerLevel: string;
  recentTurns: TurnMessage[];
  lastUserUtterance: string;
}

export interface AIResponse {
  replyText: string;
  provider: string;
  model: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationAIProvider {
  readonly providerName: string;
  generateReply(context: ConversationContext): Promise<AIResponse>;
}
