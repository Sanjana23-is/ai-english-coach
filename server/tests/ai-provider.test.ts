import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildFriendSystemPrompt } from '../src/ai/prompts/friend-persona.js';
import { createConversationAIProvider } from '../src/ai/provider-factory.js';
import { MockConversationAIProvider } from '../src/ai/mock-conversation.provider.js';
import { OllamaConversationProvider } from '../src/ai/ollama-conversation.provider.js';
import { ServiceError } from '../src/services/conversation.service.js';

describe('Friend Persona System Prompt Builder', () => {
  it('1. should establish core Friend rules (no grammar correction, concise)', () => {
    const prompt = buildFriendSystemPrompt({
      mode: 'casual',
      learnerLevel: 'Intermediate',
    });

    assert.ok(prompt.includes('YOU ARE A FRIEND, NOT A TEACHER OR GRAMMAR COACH'));
    assert.ok(prompt.includes('Never correct the user'));
    assert.ok(
      prompt.includes('Keep your responses concise: 1 to 2 natural conversational sentences'),
    );
  });

  it('2. should adapt guidance for Beginner level', () => {
    const prompt = buildFriendSystemPrompt({
      mode: 'casual',
      learnerLevel: 'Beginner',
    });

    assert.ok(prompt.includes('Target: Beginner (A1/A2)'));
    assert.ok(prompt.includes('Use simple, high-frequency everyday words'));
    assert.ok(prompt.includes('Keep sentences short and clear'));
  });

  it('3. should adapt guidance for Advanced level', () => {
    const prompt = buildFriendSystemPrompt({
      mode: 'casual',
      learnerLevel: 'Advanced',
    });

    assert.ok(prompt.includes('Target: Advanced (C1/C2)'));
    assert.ok(prompt.includes('Speak with full native nuance, rich vocabulary'));
  });

  it('4. should adapt guidance for Job Interview scenario', () => {
    const prompt = buildFriendSystemPrompt({
      mode: 'job-interview',
      learnerLevel: 'Intermediate',
    });

    assert.ok(prompt.includes('Job Interview Practice'));
    assert.ok(prompt.includes('Act as a professional, encouraging interviewer'));
  });

  it('5. should adapt guidance for Travel scenario', () => {
    const prompt = buildFriendSystemPrompt({
      mode: 'travel',
      learnerLevel: 'Intermediate',
    });

    assert.ok(prompt.includes('Travel & Navigation'));
    assert.ok(prompt.includes('itineraries, local food, culture'));
  });

  it('6. should adapt guidance for Friendly Debate scenario', () => {
    const prompt = buildFriendSystemPrompt({
      mode: 'debate',
      learnerLevel: 'Upper Intermediate',
    });

    assert.ok(prompt.includes('Friendly Debate & Critical Thinking'));
    assert.ok(prompt.includes('Respectfully offer an interesting counter-perspective'));
  });
});

describe('AI Provider Factory', () => {
  it('7. should create MockConversationAIProvider when requested', () => {
    const provider = createConversationAIProvider({ providerType: 'mock' });
    assert.ok(provider instanceof MockConversationAIProvider);
    assert.equal(provider.providerName, 'mock-provider');
  });

  it('8. should create OllamaConversationProvider when requested', () => {
    const provider = createConversationAIProvider({
      providerType: 'ollama',
      ollamaModel: 'llama3.2:1b',
    });
    assert.ok(provider instanceof OllamaConversationProvider);
    assert.equal(provider.providerName, 'ollama');
  });
});

describe('Ollama Provider Error Handling & Health', () => {
  it('9. should return graceful health status when Ollama is unreachable', async () => {
    const provider = new OllamaConversationProvider({
      baseUrl: 'http://127.0.0.1:59999', // Non-existent port
      timeoutMs: 1000,
    });

    const health = await provider.checkHealth();
    assert.equal(health.available, false);
    assert.deepEqual(health.models, []);
    assert.ok(health.error?.includes('Could not connect to Ollama'));
  });

  it('10. should throw AI_SERVICE_UNAVAILABLE on generateReply when Ollama is offline', async () => {
    const provider = new OllamaConversationProvider({
      baseUrl: 'http://127.0.0.1:59999',
      timeoutMs: 1000,
    });

    await assert.rejects(
      async () => {
        await provider.generateReply({
          sessionId: 'test-session-id',
          mode: 'travel',
          learnerLevel: 'Intermediate',
          recentTurns: [],
          lastUserUtterance: 'Hello there!',
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'AI_SERVICE_UNAVAILABLE');
        assert.equal(err.statusCode, 503);
        return true;
      },
    );
  });
});
