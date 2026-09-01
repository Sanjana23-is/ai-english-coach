const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface CreateSessionParams {
  mode?: string;
  learnerLevel?: string;
  userId?: string;
}

export interface ApiSession {
  id: string;
  userId: string;
  mode: string;
  learnerLevel: string;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  endedAt: string | null;
  turnCount: number;
  totalSpeakingTimeMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUtterance {
  id: string;
  sessionId: string;
  speaker: 'user' | 'ai';
  turnIndex: number;
  transcript: string;
  audioDurationMs: number | null;
  pauseDurationMs: number | null;
  createdAt: string;
}

export interface ApiTurnResult {
  userUtterance: ApiUtterance;
  aiUtterance: ApiUtterance;
  sessionStatus: 'active' | 'completed' | 'abandoned';
  turnIndex: number;
}

export interface HealthCheckResult {
  status: 'ok' | 'degraded';
  service: string;
  timestamp: string;
  phase: string;
  database?: {
    status: 'connected' | 'disconnected';
    latencyMs?: number;
    error?: string;
  };
}

/**
 * AI English Coach Backend API Client
 * Designed with safe error handling to ensure UI stability.
 */
export const api = {
  /**
   * Check backend & database health
   */
  async checkHealth(): Promise<HealthCheckResult | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (!res.ok) return null;
      return (await res.json()) as HealthCheckResult;
    } catch {
      return null;
    }
  },

  /**
   * Create a new conversation session
   */
  async createSession(params: CreateSessionParams = {}): Promise<ApiSession | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) return null;
      return (await res.json()) as ApiSession;
    } catch {
      return null;
    }
  },

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<ApiSession | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
      if (!res.ok) return null;
      return (await res.json()) as ApiSession;
    } catch {
      return null;
    }
  },

  /**
   * Get session transcript utterances
   */
  async getUtterances(sessionId: string): Promise<ApiUtterance[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/utterances`);
      if (!res.ok) return [];
      const data = (await res.json()) as { utterances: ApiUtterance[] };
      return data.utterances || [];
    } catch {
      return [];
    }
  },

  /**
   * Execute a conversation turn (user speech/text -> AI response)
   */
  async executeTurn(
    sessionId: string,
    text: string,
    audioDurationMs?: number,
  ): Promise<ApiTurnResult | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, audioDurationMs }),
      });
      if (!res.ok) return null;
      return (await res.json()) as ApiTurnResult;
    } catch {
      return null;
    }
  },

  /**
   * Complete a session
   */
  async completeSession(sessionId: string): Promise<ApiSession | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/complete`, {
        method: 'POST',
      });
      if (!res.ok) return null;
      return (await res.json()) as ApiSession;
    } catch {
      return null;
    }
  },
};
