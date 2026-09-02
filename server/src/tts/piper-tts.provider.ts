import { config } from '../config/env.js';
import { ServiceError } from '../services/conversation.service.js';
import type {
  TextToSpeechProvider,
  SynthesisRequest,
  SynthesisResult,
} from './tts-provider.interface.js';

export interface PiperTTSOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

/**
 * PiperTextToSpeechProvider
 *
 * Connects to a local Piper neural text-to-speech service (piper.http_server or
 * wyoming-piper HTTP gateway) over HTTP.
 * Keeps synthesized audio 100% on the user's machine without any external telemetry or cloud calls.
 */
export class PiperTextToSpeechProvider implements TextToSpeechProvider {
  readonly providerName = 'piper-local';
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(options: PiperTTSOptions = {}) {
    this.baseUrl = (options.baseUrl || config.tts.piper.baseUrl).replace(/\/+$/, '');
    this.model = options.model || config.tts.piper.model;
    this.timeoutMs = options.timeoutMs || config.tts.piper.timeoutMs;
  }

  /**
   * Health check to detect if local Piper HTTP server is responsive
   */
  async checkHealth(): Promise<{ available: boolean; model?: string; error?: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(2000),
      }).catch(async () => {
        return await fetch(`${this.baseUrl}/`, {
          signal: AbortSignal.timeout(2000),
        });
      });

      if (res.ok || res.status === 404 || res.status === 405) {
        return { available: true, model: this.model };
      }

      return {
        available: false,
        error: `Piper returned HTTP status ${res.status}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      return {
        available: false,
        error: `Could not connect to Piper at ${this.baseUrl}: ${msg}`,
      };
    }
  }

  /**
   * Synthesize text into speech audio buffer
   */
  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    const text = (request.text || '').trim();
    if (!text) {
      throw new ServiceError('EMPTY_TEXT', 'Synthesis text cannot be empty', 400);
    }

    let response: Response;
    try {
      // Piper HTTP server (/synthesize endpoint with JSON body)
      response = await fetch(`${this.baseUrl}/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'audio/wav, audio/*',
        },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      // If /synthesize returned 404 or 405, fallback to root POST with plain text
      if (response.status === 404 || response.status === 405) {
        response = await fetch(`${this.baseUrl}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            Accept: 'audio/wav, audio/*',
          },
          body: text,
          signal: AbortSignal.timeout(this.timeoutMs),
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new ServiceError(
          'TTS_TIMEOUT',
          `Local Piper speech synthesis timed out after ${this.timeoutMs}ms.`,
          504,
        );
      }

      throw new ServiceError(
        'TTS_SERVICE_UNAVAILABLE',
        `Could not connect to local Piper service at ${this.baseUrl}. Please verify Piper is running on port 5001.`,
        503,
      );
    }

    if (!response.ok) {
      let errorDetail = '';
      try {
        errorDetail = await response.text();
      } catch {
        errorDetail = `HTTP ${response.status} ${response.statusText}`;
      }

      throw new ServiceError(
        'TTS_SYNTHESIS_FAILED',
        `Local Piper returned an error: ${errorDetail}`,
        502,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    if (audioBuffer.length === 0) {
      throw new ServiceError('TTS_EMPTY_RESPONSE', 'Piper returned an empty audio response', 502);
    }

    // Guard against receiving an HTML document (e.g. from a web server root or error page)
    const headerPrefix = audioBuffer.subarray(0, 15).toString('ascii').toLowerCase();
    if (
      headerPrefix.includes('<!doctype') ||
      headerPrefix.includes('<html') ||
      headerPrefix.includes('<?xml')
    ) {
      throw new ServiceError(
        'TTS_SYNTHESIS_FAILED',
        'Piper service returned an HTML page instead of binary audio data.',
        502,
      );
    }

    // Verify WAV RIFF magic bytes: if starts with RIFF, force audio/wav
    let contentType = 'audio/wav';
    if (audioBuffer.subarray(0, 4).toString('ascii') === 'RIFF') {
      contentType = 'audio/wav';
    } else {
      const respHeader = response.headers.get('content-type') || '';
      if (respHeader.includes('audio/')) {
        contentType = respHeader;
      }
    }

    return {
      audioBuffer,
      contentType,
      provider: this.providerName,
      model: this.model,
    };
  }
}
