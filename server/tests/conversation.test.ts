import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';
import { ConversationService, ServiceError } from '../src/services/conversation.service.js';
import { MockConversationAIProvider } from '../src/ai/mock-conversation.provider.js';

describe('Conversation Backend Lifecycle', () => {
  const service = new ConversationService(new MockConversationAIProvider());
  let testSessionId: string;

  before(async () => {
    // Ensure DB schema is up to date
    await runMigrations();
  });

  after(async () => {
    // Clean up created test session
    if (testSessionId) {
      await pool.query('DELETE FROM conversation_sessions WHERE id = $1;', [testSessionId]);
    }
    await pool.end();
  });

  it('1. should create a new active session with default settings', async () => {
    const session = await service.createSession({
      mode: 'travel',
      learnerLevel: 'Intermediate',
    });

    assert.ok(session.id, 'Session must have an ID');
    assert.equal(session.mode, 'travel');
    assert.equal(session.learnerLevel, 'Intermediate');
    assert.equal(session.status, 'active');
    assert.equal(session.turnCount, 0);
    assert.equal(session.endedAt, null);

    testSessionId = session.id;
  });

  it('2. should retrieve the created session metadata', async () => {
    const session = await service.getSession(testSessionId);

    assert.equal(session.id, testSessionId);
    assert.equal(session.status, 'active');
  });

  it('3. should throw error when retrieving non-existent session', async () => {
    await assert.rejects(
      async () => {
        await service.getSession('00000000-0000-0000-0000-999999999999');
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'SESSION_NOT_FOUND');
        assert.equal(err.statusCode, 404);
        return true;
      },
    );
  });

  it('4. should record an utterance and increment turn count', async () => {
    const utterance = await service.recordUtterance(testSessionId, {
      speaker: 'user',
      text: 'Hello, I just arrived in Barcelona.',
      audioDurationMs: 3200,
    });

    assert.ok(utterance.id);
    assert.equal(utterance.sessionId, testSessionId);
    assert.equal(utterance.speaker, 'user');
    assert.equal(utterance.turnIndex, 1);
    assert.equal(utterance.transcript, 'Hello, I just arrived in Barcelona.');
    assert.equal(utterance.audioDurationMs, 3200);

    const updatedSession = await service.getSession(testSessionId);
    assert.equal(updatedSession.turnCount, 1);
    assert.equal(updatedSession.totalSpeakingTimeMs, 3200);
  });

  it('5. should record subsequent utterances preserving turn ordering', async () => {
    const aiUtterance = await service.recordUtterance(testSessionId, {
      speaker: 'ai',
      text: 'Welcome to Barcelona! How was your flight?',
    });

    assert.equal(aiUtterance.turnIndex, 2);
    assert.equal(aiUtterance.speaker, 'ai');

    const utterances = await service.getUtterances(testSessionId);
    assert.equal(utterances.length, 2);
    assert.equal(utterances[0].turnIndex, 1);
    assert.equal(utterances[1].turnIndex, 2);
    assert.equal(utterances[0].speaker, 'user');
    assert.equal(utterances[1].speaker, 'ai');
  });

  it('6. should orchestrate a full conversation turn (user input -> AI reply)', async () => {
    const turnResult = await service.processTurn(testSessionId, {
      text: 'The flight was smooth and I took a taxi to the hotel.',
      audioDurationMs: 4100,
    });

    assert.ok(turnResult.userUtterance);
    assert.ok(turnResult.aiUtterance);
    assert.equal(turnResult.userUtterance.speaker, 'user');
    assert.equal(turnResult.aiUtterance.speaker, 'ai');
    assert.equal(turnResult.turnIndex, 4);
    assert.ok(turnResult.aiUtterance.transcript.length > 0);

    const utterances = await service.getUtterances(testSessionId);
    assert.equal(utterances.length, 4);
  });

  it('7. should complete the session and set endedAt timestamp', async () => {
    const completedSession = await service.completeSession(testSessionId);

    assert.equal(completedSession.status, 'completed');
    assert.ok(completedSession.endedAt !== null);
  });

  it('8. should reject new utterances on completed session', async () => {
    await assert.rejects(
      async () => {
        await service.recordUtterance(testSessionId, {
          speaker: 'user',
          text: 'Can I say one more thing?',
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'SESSION_INACTIVE');
        assert.equal(err.statusCode, 409);
        return true;
      },
    );
  });

  it('9. should reject conversation turns on completed session', async () => {
    await assert.rejects(
      async () => {
        await service.processTurn(testSessionId, {
          text: 'Are you still there?',
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'SESSION_INACTIVE');
        assert.equal(err.statusCode, 409);
        return true;
      },
    );
  });
});
