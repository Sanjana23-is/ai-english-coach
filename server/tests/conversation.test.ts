import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pool } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';
import { ConversationService, ServiceError } from '../src/services/conversation.service.js';
import { MockConversationAIProvider } from '../src/ai/mock-conversation.provider.js';
import {
  isValidUuid,
  validateSessionId,
  validateCreateSession,
} from '../src/middleware/validation.js';
import type { Request, Response } from 'express';

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

  it('10. should accept the seeded development user UUID when creating a session', async () => {
    const devUserId = '00000000-0000-0000-0000-000000000001';
    const session = await service.createSession({
      userId: devUserId,
      mode: 'casual',
      learnerLevel: 'Intermediate',
    });

    assert.ok(session.id);
    assert.equal(session.userId, devUserId);
    assert.equal(session.mode, 'casual');

    // Clean up created session
    await pool.query('DELETE FROM conversation_sessions WHERE id = $1;', [session.id]);
  });
});

describe('UUID and API Input Validation', () => {
  const devUserId = '00000000-0000-0000-0000-000000000001';
  const standardUuid = 'e46e87ff-1dd0-44f0-a6ed-bb70ffb06b00';
  const nilUuid = '00000000-0000-0000-0000-000000000000';

  it('1. should accept canonical UUID formats (including seeded dev user and nil UUID)', () => {
    assert.equal(isValidUuid(devUserId), true);
    assert.equal(isValidUuid(standardUuid), true);
    assert.equal(isValidUuid(nilUuid), true);
    assert.equal(isValidUuid('FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF'), true);
  });

  it('2. should reject malformed or non-UUID strings', () => {
    assert.equal(isValidUuid('not-a-uuid'), false);
    assert.equal(isValidUuid(''), false);
    assert.equal(isValidUuid('00000000-0000-0000-0000-00000000001'), false); // 11 hex chars at end
    assert.equal(isValidUuid('00000000-0000-0000-0000-0000000000001'), false); // 13 hex chars at end
    assert.equal(isValidUuid('00000000000000000000000000000001'), false); // Missing hyphens
    assert.equal(isValidUuid('00000000-0000-0000-0000-00000000000g'), false); // Non-hex 'g'
    assert.equal(isValidUuid(`${devUserId}; DROP TABLE users;`), false);
  });

  interface MockErrorResponse {
    error?: {
      code: string;
      message: string;
    };
  }

  function createMockResponse() {
    let statusCode = 200;
    let body: MockErrorResponse | null = null;

    const res = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: MockErrorResponse) {
        body = data;
        return this;
      },
    } as unknown as Response;

    return {
      res,
      getStatusCode: () => statusCode,
      getBody: () => body,
    };
  }

  it('3. validateCreateSession should accept the seeded development user UUID', () => {
    let nextCalled = false;
    const { res, getStatusCode, getBody } = createMockResponse();

    const req = {
      body: {
        userId: devUserId,
        mode: 'casual',
        learnerLevel: 'Intermediate',
      },
    } as unknown as Request;

    validateCreateSession(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true, 'next() must be called when userId is valid');
    assert.equal(getStatusCode(), 200);
    assert.equal(getBody(), null);
  });

  it('4. validateCreateSession should reject malformed userId with INVALID_ID_FORMAT', () => {
    let nextCalled = false;
    const { res, getStatusCode, getBody } = createMockResponse();

    const req = {
      body: {
        userId: 'not-a-valid-uuid',
      },
    } as unknown as Request;

    validateCreateSession(req, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, false, 'next() must not be called when userId is invalid');
    assert.equal(getStatusCode(), 400);
    assert.equal(getBody()?.error?.code, 'INVALID_ID_FORMAT');
    assert.equal(getBody()?.error?.message, 'userId must be a valid UUID format');
  });

  it('5. validateSessionId should accept valid session UUIDs and reject malformed ones', () => {
    let nextCalled = false;
    const mock1 = createMockResponse();

    const validReq = {
      params: { sessionId: standardUuid },
    } as unknown as Request;

    validateSessionId(validReq, mock1.res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true, 'next() must be called for valid session UUID');

    // Test malformed session ID
    nextCalled = false;
    const mock2 = createMockResponse();
    const invalidReq = {
      params: { sessionId: 'invalid-session-id' },
    } as unknown as Request;

    validateSessionId(invalidReq, mock2.res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, false, 'next() must not be called for invalid session UUID');
    assert.equal(mock2.getStatusCode(), 400);
    assert.equal(mock2.getBody()?.error?.code, 'INVALID_ID_FORMAT');
  });
});
