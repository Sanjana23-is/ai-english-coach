import { config } from '../config/env.js';
import { ServiceError } from '../services/conversation.service.js';
import type {
  SpeechToTextProvider,
  AudioPayload,
  TranscriptionResult,
} from './stt-provider.interface.js';

export interface WhisperSTTOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

/**
 * WhisperHttpSTTProvider
 *
 * Connects to a local Whisper transcription server (whisper.cpp server,
 * faster-whisper-server, or local Python whisper HTTP microservice) via standard HTTP.
 * Keeps audio 100% on the user's machine without any external telemetry or cloud calls.
 */
export class WhisperHttpSTTProvider implements SpeechToTextProvider {
  readonly providerName = 'whisper-local';
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(options: WhisperSTTOptions = {}) {
    this.baseUrl = (options.baseUrl || config.stt.whisper.baseUrl).replace(/\/+$/, '');
    this.model = options.model || config.stt.whisper.model;
    this.timeoutMs = options.timeoutMs || config.stt.whisper.timeoutMs;
  }

  /**
   * Health check to detect if local Whisper HTTP server is responsive
   */
  async checkHealth(): Promise<{ available: boolean; model?: string; error?: string }> {
    try {
      // Check health or root endpoint with short timeout
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
        error: `Whisper returned status ${res.status}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      return {
        available: false,
        error: `Could not connect to Whisper at ${this.baseUrl}: ${msg}`,
      };
    }
  }

  /**
   * Transcribe recorded audio using local Whisper
   */
  async transcribe(payload: AudioPayload): Promise<TranscriptionResult> {
    if (!payload.buffer || payload.buffer.length === 0) {
      throw new ServiceError('EMPTY_AUDIO_PAYLOAD', 'Audio payload is empty', 400);
    }

    const filename = payload.filename || 'recording.webm';
    const mimeType = payload.mimeType || 'audio/webm';

    // Construct standard multipart/form-data payload
    const formData = new FormData();
    const audioBlob = new Blob([new Uint8Array(payload.buffer)], { type: mimeType });
    formData.append('file', audioBlob, filename);
    formData.append('model', this.model);
    formData.append('language', 'en');
    formData.append('response_format', 'json');

    // Try standard endpoint /v1/audio/transcriptions, then fallback to /inference
    const targetUrl = `${this.baseUrl}/v1/audio/transcriptions`;

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(this.timeoutMs),
      });

      // If /v1/audio/transcriptions returns 404, try whisper.cpp's /inference endpoint
      if (response.status === 404) {
        response = await fetch(`${this.baseUrl}/inference`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(this.timeoutMs),
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new ServiceError(
          'STT_TIMEOUT',
          `Local Whisper transcription timed out after ${this.timeoutMs}ms.`,
          504,
        );
      }

      throw new ServiceError(
        'STT_SERVICE_UNAVAILABLE',
        `Could not connect to local Whisper service at ${this.baseUrl}. Please verify Whisper is running on port 8000.`,
        503,
      );
    }

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorJson = (await response.json()) as { error?: { message?: string } | string };
        if (typeof errorJson.error === 'string') {
          errorDetail = errorJson.error;
        } else if (errorJson.error?.message) {
          errorDetail = errorJson.error.message;
        }
      } catch {
        errorDetail = `HTTP ${response.status} ${response.statusText}`;
      }

      throw new ServiceError(
        'STT_INFERENCE_ERROR',
        `Local Whisper returned an error: ${errorDetail}`,
        502,
      );
    }

    let data: { text?: string };
    try {
      data = (await response.json()) as { text?: string };
    } catch {
      throw new ServiceError(
        'STT_INVALID_RESPONSE',
        'Failed to parse Whisper transcription response',
        502,
      );
    }

    const transcript = (data.text || '').trim();

    return {
      text: transcript,
      durationMs: payload.durationMs,
      provider: this.providerName,
      model: this.model,
    };
  }
}
