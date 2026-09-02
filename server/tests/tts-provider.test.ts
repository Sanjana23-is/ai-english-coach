import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createServer } from 'node:http';
import { createTextToSpeechProvider } from '../src/tts/tts-factory.js';
import { MockTextToSpeechProvider, createMockWavBuffer } from '../src/tts/mock-tts.provider.js';
import { PiperTextToSpeechProvider } from '../src/tts/piper-tts.provider.js';
import { createTtsRouter } from '../src/routes/tts.routes.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { ServiceError } from '../src/services/conversation.service.js';

describe('Text-to-Speech (TTS) Factory', () => {
  it('1. should create MockTextToSpeechProvider when requested', () => {
    const provider = createTextToSpeechProvider({ providerType: 'mock' });
    assert.ok(provider instanceof MockTextToSpeechProvider);
    assert.equal(provider.providerName, 'mock-tts');
  });

  it('2. should create PiperTextToSpeechProvider when requested', () => {
    const provider = createTextToSpeechProvider({
      providerType: 'piper',
      piperOptions: { baseUrl: 'http://localhost:5001', model: 'en_US-lessac-medium' },
    });
    assert.ok(provider instanceof PiperTextToSpeechProvider);
    assert.equal(provider.providerName, 'piper-local');
  });
});

describe('Mock TTS Provider Behavior', () => {
  it('3. should generate a valid RIFF/WAVE header and audio buffer', async () => {
    const provider = new MockTextToSpeechProvider({ simulatedLatencyMs: 5 });
    const result = await provider.synthesize({
      text: 'Hello! I am speaking with you naturally.',
    });

    assert.equal(result.contentType, 'audio/wav');
    assert.equal(result.provider, 'mock-tts');
    assert.ok(result.audioBuffer.length > 44);

    // Verify standard WAV header
    const header = result.audioBuffer.subarray(0, 12).toString('ascii');
    assert.ok(header.startsWith('RIFF'));
    assert.ok(header.endsWith('WAVE'));
  });

  it('4. should reject empty text with EMPTY_TEXT', async () => {
    const provider = new MockTextToSpeechProvider();

    await assert.rejects(
      async () => {
        await provider.synthesize({ text: '   ' });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'EMPTY_TEXT');
        assert.equal(err.statusCode, 400);
        return true;
      },
    );
  });

  it('5. should report health correctly', async () => {
    const provider = new MockTextToSpeechProvider();
    const health = await provider.checkHealth();
    assert.equal(health.available, true);
    assert.equal(health.model, 'mock-piper-lessac');
  });

  it('6. createMockWavBuffer helper should create correct PCM WAV format', () => {
    const buf = createMockWavBuffer(0.2);
    assert.equal(buf.toString('ascii', 0, 4), 'RIFF');
    assert.equal(buf.toString('ascii', 8, 12), 'WAVE');
    assert.equal(buf.toString('ascii', 12, 16), 'fmt ');
    assert.equal(buf.readUInt16LE(20), 1); // PCM format
    assert.equal(buf.readUInt16LE(22), 1); // 1 channel
    assert.equal(buf.readUInt32LE(24), 16000); // 16kHz
    assert.equal(buf.readUInt16LE(34), 16); // 16 bits per sample
    assert.equal(buf.toString('ascii', 36, 40), 'data');
  });
});

describe('Piper HTTP TTS Provider Error Handling', () => {
  it('7. should return graceful health status when Piper is unreachable', async () => {
    const provider = new PiperTextToSpeechProvider({
      baseUrl: 'http://127.0.0.1:59997', // Closed port
      timeoutMs: 1000,
    });

    const health = await provider.checkHealth();
    assert.equal(health.available, false);
    assert.ok(health.error?.includes('Could not connect to Piper'));
  });

  it('8. should throw TTS_SERVICE_UNAVAILABLE with human guidance when Piper is offline', async () => {
    const provider = new PiperTextToSpeechProvider({
      baseUrl: 'http://127.0.0.1:59997',
      timeoutMs: 1000,
    });

    await assert.rejects(
      async () => {
        await provider.synthesize({
          text: 'This should fail gracefully.',
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'TTS_SERVICE_UNAVAILABLE');
        assert.equal(err.statusCode, 503);
        assert.ok(err.message.includes('Please verify Piper is running on port 5001'));
        return true;
      },
    );
  });

  it('9. should reject empty text before sending network request', async () => {
    const provider = new PiperTextToSpeechProvider({
      baseUrl: 'http://127.0.0.1:59997',
    });

    await assert.rejects(
      async () => {
        await provider.synthesize({ text: '' });
      },
      (err: unknown) => {
        assert.ok(err instanceof ServiceError);
        assert.equal(err.code, 'EMPTY_TEXT');
        assert.equal(err.statusCode, 400);
        return true;
      },
    );
  });

  it('10. should reject HTML responses from Piper and throw TTS_SYNTHESIS_FAILED', async () => {
    // Create transient HTTP server that returns HTML
    const fakeHtmlServer = createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<!doctype html><html><body>Error Page</body></html>');
    });

    await new Promise<void>((resolve) => fakeHtmlServer.listen(0, resolve));
    const address = fakeHtmlServer.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    const provider = new PiperTextToSpeechProvider({
      baseUrl: `http://127.0.0.1:${port}`,
      timeoutMs: 2000,
    });

    try {
      await assert.rejects(
        async () => {
          await provider.synthesize({ text: 'Hello test' });
        },
        (err: unknown) => {
          assert.ok(err instanceof ServiceError);
          assert.equal(err.code, 'TTS_SYNTHESIS_FAILED');
          assert.equal(err.statusCode, 502);
          assert.ok(err.message.includes('HTML page instead of binary audio'));
          return true;
        },
      );
    } finally {
      fakeHtmlServer.close();
    }
  });
});

describe('TTS Route and Content-Type Safety', () => {
  it('11. POST /api/tts/synthesize should return audio/wav Content-Type and binary WAV bytes', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/tts', createTtsRouter(new MockTextToSpeechProvider()));
    app.use(errorHandler);

    const testServer = createServer(app);
    await new Promise<void>((resolve) => testServer.listen(0, resolve));
    const address = testServer.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Testing audio content type safety' }),
      });

      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'audio/wav');
      assert.ok(res.headers.get('content-length') !== null);

      const arrayBuf = await res.arrayBuffer();
      const buf = Buffer.from(arrayBuf);
      assert.equal(buf.subarray(0, 4).toString('ascii'), 'RIFF');
      assert.equal(buf.subarray(8, 12).toString('ascii'), 'WAVE');
    } finally {
      testServer.close();
    }
  });

  it('12. POST /api/tts/synthesize should return JSON error (not HTML) on invalid input', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/tts', createTtsRouter(new MockTextToSpeechProvider()));
    app.use(errorHandler);

    const testServer = createServer(app);
    await new Promise<void>((resolve) => testServer.listen(0, resolve));
    const address = testServer.address();
    const port = typeof address === 'object' && address ? address.port : 0;

    try {
      const res = await fetch(`http://127.0.0.1:${port}/api/tts/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '   ' }),
      });

      assert.equal(res.status, 400);
      assert.ok(res.headers.get('content-type')?.includes('application/json'));

      const json = (await res.json()) as { error: { code: string; message: string } };
      assert.equal(json.error.code, 'EMPTY_TEXT');
    } finally {
      testServer.close();
    }
  });
});
