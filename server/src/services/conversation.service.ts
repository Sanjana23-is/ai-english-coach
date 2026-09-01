import { pool } from '../db/pool.js';
import { config } from '../config/env.js';
import type {
  ConversationSession,
  Utterance,
  CreateSessionRequest,
  RecordUtteranceRequest,
  ConversationTurnRequest,
  ConversationTurnResponse,
} from '../types/session.types.js';
import type { ConversationAIProvider } from '../ai/conversation-provider.interface.js';
import { MockConversationAIProvider } from '../ai/mock-conversation.provider.js';

export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

interface DbSessionRow {
  id: string;
  user_id: string;
  mode: string;
  learner_level: string;
  status: 'active' | 'completed' | 'abandoned';
  started_at: Date;
  ended_at: Date | null;
  turn_count: number;
  total_speaking_time_ms: number;
  created_at: Date;
  updated_at: Date;
}

interface DbUtteranceRow {
  id: string;
  session_id: string;
  speaker: 'user' | 'ai';
  turn_index: number;
  transcript: string;
  audio_duration_ms: number | null;
  pause_duration_ms: number | null;
  created_at: Date;
}

export class ConversationService {
  constructor(private aiProvider: ConversationAIProvider = new MockConversationAIProvider()) {}

  /**
   * Helper to map DB row to ConversationSession object
   */
  private mapSessionRow(row: DbSessionRow): ConversationSession {
    return {
      id: row.id,
      userId: row.user_id,
      mode: row.mode,
      learnerLevel: row.learner_level,
      status: row.status,
      startedAt: row.started_at.toISOString(),
      endedAt: row.ended_at ? row.ended_at.toISOString() : null,
      turnCount: row.turn_count,
      totalSpeakingTimeMs: row.total_speaking_time_ms,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  /**
   * Helper to map DB row to Utterance object
   */
  private mapUtteranceRow(row: DbUtteranceRow): Utterance {
    return {
      id: row.id,
      sessionId: row.session_id,
      speaker: row.speaker,
      turnIndex: row.turn_index,
      transcript: row.transcript,
      audioDurationMs: row.audio_duration_ms ?? null,
      pauseDurationMs: row.pause_duration_ms ?? null,
      createdAt: row.created_at.toISOString(),
    };
  }

  /**
   * Create a new conversation session
   */
  async createSession(params: CreateSessionRequest = {}): Promise<ConversationSession> {
    const userId = params.userId || config.devUser.id;
    const mode = params.mode || 'freeform';
    const learnerLevel = params.learnerLevel || 'Intermediate';

    const result = await pool.query(
      `INSERT INTO conversation_sessions (user_id, mode, learner_level, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *;`,
      [userId, mode, learnerLevel],
    );

    return this.mapSessionRow(result.rows[0]);
  }

  /**
   * Retrieve session by ID
   */
  async getSession(sessionId: string): Promise<ConversationSession> {
    const result = await pool.query(`SELECT * FROM conversation_sessions WHERE id = $1;`, [
      sessionId,
    ]);

    if (result.rows.length === 0) {
      throw new ServiceError('SESSION_NOT_FOUND', `Session '${sessionId}' not found`, 404);
    }

    return this.mapSessionRow(result.rows[0]);
  }

  /**
   * Retrieve all ordered utterances for a session
   */
  async getUtterances(sessionId: string): Promise<Utterance[]> {
    // Verify session existence
    await this.getSession(sessionId);

    const result = await pool.query(
      `SELECT * FROM utterances WHERE session_id = $1 ORDER BY turn_index ASC;`,
      [sessionId],
    );

    return result.rows.map((r) => this.mapUtteranceRow(r));
  }

  /**
   * Record a single utterance in an active session
   */
  async recordUtterance(sessionId: string, params: RecordUtteranceRequest): Promise<Utterance> {
    const session = await this.getSession(sessionId);

    if (session.status !== 'active') {
      throw new ServiceError(
        'SESSION_INACTIVE',
        `Cannot add utterances to a session with status '${session.status}'`,
        409,
      );
    }

    const nextTurnIndex = session.turnCount + 1;
    const durationMs = params.audioDurationMs || 0;
    const pauseMs = params.pauseDurationMs || 0;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const utteranceRes = await client.query(
        `INSERT INTO utterances (session_id, speaker, turn_index, transcript, audio_duration_ms, pause_duration_ms)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *;`,
        [sessionId, params.speaker, nextTurnIndex, params.text.trim(), durationMs, pauseMs],
      );

      const speakingTimeIncrement = params.speaker === 'user' ? durationMs : 0;

      await client.query(
        `UPDATE conversation_sessions
         SET turn_count = turn_count + 1,
             total_speaking_time_ms = total_speaking_time_ms + $1,
             updated_at = NOW()
         WHERE id = $2;`,
        [speakingTimeIncrement, sessionId],
      );

      await client.query('COMMIT');
      return this.mapUtteranceRow(utteranceRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Process a complete conversational turn:
   * 1. Validate session is active
   * 2. Store user utterance
   * 3. Construct context
   * 4. Call AI provider for response
   * 5. Store AI utterance
   * 6. Return both turns
   */
  async processTurn(
    sessionId: string,
    params: ConversationTurnRequest,
  ): Promise<ConversationTurnResponse> {
    const session = await this.getSession(sessionId);

    if (session.status !== 'active') {
      throw new ServiceError(
        'SESSION_INACTIVE',
        `Cannot execute turn on a session with status '${session.status}'`,
        409,
      );
    }

    // 1. Record User Utterance
    const userUtterance = await this.recordUtterance(sessionId, {
      speaker: 'user',
      text: params.text,
      audioDurationMs: params.audioDurationMs,
    });

    // 2. Fetch recent conversation turns for context
    const allUtterances = await this.getUtterances(sessionId);
    const recentTurns = allUtterances.slice(-6).map((u) => ({
      speaker: u.speaker,
      text: u.transcript,
    }));

    // 3. Generate AI response via provider abstraction
    const aiResponse = await this.aiProvider.generateReply({
      sessionId,
      mode: session.mode,
      learnerLevel: session.learnerLevel,
      recentTurns,
      lastUserUtterance: params.text,
    });

    // 4. Record AI Utterance
    const aiUtterance = await this.recordUtterance(sessionId, {
      speaker: 'ai',
      text: aiResponse.replyText,
    });

    return {
      userUtterance,
      aiUtterance,
      sessionStatus: session.status,
      turnIndex: aiUtterance.turnIndex,
    };
  }

  /**
   * Complete the session, setting ended_at and preventing further turns
   */
  async completeSession(sessionId: string): Promise<ConversationSession> {
    const session = await this.getSession(sessionId);

    if (session.status === 'completed') {
      return session; // Idempotent
    }

    const result = await pool.query(
      `UPDATE conversation_sessions
       SET status = 'completed',
           ended_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *;`,
      [sessionId],
    );

    return this.mapSessionRow(result.rows[0]);
  }
}
