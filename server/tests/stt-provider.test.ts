import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSpeechToTextProvider } from '../src/stt/stt-factory.js';
import { MockSpeechToTextProvider } from '../src/stt/mock-stt.provider.js';
import { WhisperHttpSTTProvider } from '../src/stt/whisper-http-stt.provider.js';
import { ServiceError } from '../src/services/conversation.service.js';

describe('Speech-to-Text (STT) Factory', () => {
  it('1. should create MockSpeechToTextProvider when requested', () => {
    const provider = createSpeechToTextProvider({ providerType: 'mock' });
    assert.ok(provider instanceof MockSpeechToTextProvider);
    assert.equal(provider.providerName, 'mock-stt');
  });

  it('2. should create WhisperHttpSTTProvider when requested', () => {
    const provider = createSpeechToTextProvider({
      providerType: 'whisper',
      whisperOptions: { baseUrl: 'http://localhost:8000', model: 'base.en' },
    });
    assert.ok(provider instanceof WhisperHttpSTTProvider);
    assert.equal(provider.providerName, 'whisper-local');
  });
});

describe('Mock STT Provider Behavior', () => {
  it('3. should return deterministic transcription and duration from audio buffer', async () => {
    const provider = new MockSpeechToTextProvider({
      cannedTranscript: 'I enjoy reading books and practicing English speaking.',
      simulatedLatencyMs: 5,
    });

    const fakeAudioBuffer = Buffer.from('RIFF....WAVEfmt ....data....');
    const result = await provider.transcribe({
      buffer: fakeAudioBuffer,
      mimeType: 'audio/webm',
      durationMs: 4200,
    });

    assert.equal(result.text, 'I enjoy reading books and practicing English speaking.');
    assert.equal(result.durationMs, 4200);
    assert.equal(result.provider, 'mock-stt');
    assert.ok(result.confidence && result.confidence > 0.9);
  });

  it('4. should reject empty audio buffer with EMPTY_AUDIO_PAYLOAD', async () => {
    const provider = new MockSpeechToTextProvider();

    await assert.rejects(
      async () => {
        await provider.transcribe({
          buffer: Buffer.alloc(0),
          mimeType: 'audio/webm',
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'EMPTY_AUDIO_PAYLOAD');
        assert.equal(err.statusCode, 400);
        return true;
      },
    );
  });

  it('5. should report health correctly', async () => {
    const provider = new MockSpeechToTextProvider();
    const health = await provider.checkHealth();
    assert.equal(health.available, true);
    assert.equal(health.model, 'mock-whisper-base');
  });
});

describe('Whisper HTTP STT Provider Error Handling', () => {
  it('6. should return graceful health status when Whisper is unreachable', async () => {
    const provider = new WhisperHttpSTTProvider({
      baseUrl: 'http://127.0.0.1:59998', // Closed port
      timeoutMs: 1000,
    });

    const health = await provider.checkHealth();
    assert.equal(health.available, false);
    assert.ok(health.error?.includes('Could not connect to Whisper'));
  });

  it('7. should throw STT_SERVICE_UNAVAILABLE with human guidance when Whisper is offline', async () => {
    const provider = new WhisperHttpSTTProvider({
      baseUrl: 'http://127.0.0.1:59998',
      timeoutMs: 1000,
    });

    const audioBuffer = Buffer.from('fake-audio-content');

    await assert.rejects(
      async () => {
        await provider.transcribe({
          buffer: audioBuffer,
          mimeType: 'audio/webm',
          durationMs: 2500,
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'STT_SERVICE_UNAVAILABLE');
        assert.equal(err.statusCode, 503);
        assert.ok(err.message.includes('Please verify Whisper is running'));
        return true;
      },
    );
  });

  it('8. should reject empty audio buffer before making network request', async () => {
    const provider = new WhisperHttpSTTProvider({
      baseUrl: 'http://127.0.0.1:59998',
    });

    await assert.rejects(
      async () => {
        await provider.transcribe({
          buffer: Buffer.alloc(0),
          mimeType: 'audio/webm',
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'EMPTY_AUDIO_PAYLOAD');
        assert.equal(err.statusCode, 400);
        return true;
      },
    );
  });
});
