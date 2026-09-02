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

export interface ApiTranscriptionResult {
  transcript: string;
  durationMs?: number;
  provider: string;
  model?: string;
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
  ai?: {
    provider: string;
    model?: string;
    status: string;
    models?: string[];
    error?: string;
  };
}

export interface ApiResponse<T> {
  data: T | null;
  error?: string;
}

async function parseResponse<T>(res: Response): Promise<ApiResponse<T>> {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson?.error?.message) {
        message = errJson.error.message;
      }
    } catch {
      // Fallback to generic status text
    }
    return { data: null, error: message };
  }

  try {
    const data = (await res.json()) as T;
    return { data, error: undefined };
  } catch {
    return { data: null, error: 'Failed to parse response' };
  }
}

/**
 * AI English Coach Backend API Client
 * Clean error mapping and safe fallbacks for UI stability.
 */
export const api = {
  /**
   * Check backend, database, and Ollama health
   */
  async checkHealth(): Promise<ApiResponse<HealthCheckResult>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      return await parseResponse<HealthCheckResult>(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { data: null, error: `Backend service is offline (${msg})` };
    }
  },

  /**
   * Create a new conversation session
   */
  async createSession(params: CreateSessionParams = {}): Promise<ApiResponse<ApiSession>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return await parseResponse<ApiSession>(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { data: null, error: `Could not connect to conversation service (${msg})` };
    }
  },

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<ApiResponse<ApiSession>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
      return await parseResponse<ApiSession>(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { data: null, error: `Could not load session (${msg})` };
    }
  },

  /**
   * Get session transcript utterances
   */
  async getUtterances(sessionId: string): Promise<ApiResponse<ApiUtterance[]>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/utterances`);
      if (!res.ok) {
        return { data: [], error: `Failed to load transcript (${res.status})` };
      }
      const json = (await res.json()) as { utterances?: ApiUtterance[] };
      return { data: json.utterances || [], error: undefined };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { data: [], error: `Could not retrieve transcript (${msg})` };
    }
  },

  /**
   * Execute a conversation turn (user speech/text -> AI response)
   */
  async executeTurn(
    sessionId: string,
    text: string,
    audioDurationMs?: number,
  ): Promise<ApiResponse<ApiTurnResult>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, audioDurationMs }),
      });
      return await parseResponse<ApiTurnResult>(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { data: null, error: `Could not connect to conversation service (${msg})` };
    }
  },

  /**
   * Complete a session
   */
  async completeSession(sessionId: string): Promise<ApiResponse<ApiSession>> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/complete`, {
        method: 'POST',
      });
      return await parseResponse<ApiSession>(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { data: null, error: `Could not complete session (${msg})` };
    }
  },

  /**
   * Transcribe recorded audio with local Whisper
   */
  async transcribeAudio(
    audioBlob: Blob,
    durationMs?: number,
  ): Promise<ApiResponse<ApiTranscriptionResult>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': audioBlob.type || 'audio/webm',
      };
      if (durationMs !== undefined) {
        headers['X-Audio-Duration-Ms'] = Math.round(durationMs).toString();
      }

      const res = await fetch(`${API_BASE_URL}/api/stt/transcribe`, {
        method: 'POST',
        headers,
        body: audioBlob,
      });

      return await parseResponse<ApiTranscriptionResult>(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      return { data: null, error: `Could not connect to speech-to-text service (${msg})` };
    }
  },
};
