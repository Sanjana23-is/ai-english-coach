import { ServiceError } from '../services/conversation.service.js';
import type {
  SpeechToTextProvider,
  AudioPayload,
  TranscriptionResult,
} from './stt-provider.interface.js';

export interface MockSTTOptions {
  cannedTranscript?: string;
  simulatedLatencyMs?: number;
  shouldFail?: boolean;
}

/**
 * MockSpeechToTextProvider
 *
 * Deterministic speech-to-text provider for automated tests, CI, and development
 * environments where local Whisper is not running.
 */
export class MockSpeechToTextProvider implements SpeechToTextProvider {
  readonly providerName = 'mock-stt';
  private cannedTranscript: string;
  private simulatedLatencyMs: number;
  private shouldFail: boolean;

  constructor(options: MockSTTOptions = {}) {
    this.cannedTranscript =
      options.cannedTranscript ||
      "Hello! I am practicing speaking English today, and I'm really enjoying this conversation.";
    this.simulatedLatencyMs = options.simulatedLatencyMs || 20;
    this.shouldFail = options.shouldFail || false;
  }

  async checkHealth(): Promise<{ available: boolean; model?: string; error?: string }> {
    if (this.shouldFail) {
      return { available: false, error: 'Simulated STT mock failure' };
    }
    return { available: true, model: 'mock-whisper-base' };
  }

  async transcribe(payload: AudioPayload): Promise<TranscriptionResult> {
    if (this.shouldFail) {
      throw new ServiceError(
        'STT_SERVICE_ERROR',
        'Simulated speech recognition error in mock provider',
        502,
      );
    }

    if (!payload.buffer || payload.buffer.length === 0) {
      throw new ServiceError('EMPTY_AUDIO_PAYLOAD', 'Audio payload is empty', 400);
    }

    if (this.simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
    }

    return {
      text: this.cannedTranscript,
      durationMs: payload.durationMs || 3000,
      provider: this.providerName,
      model: 'mock-whisper-base',
      confidence: 0.98,
    };
  }
}
