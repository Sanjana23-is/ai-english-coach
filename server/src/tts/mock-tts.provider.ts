import { ServiceError } from '../services/conversation.service.js';
import type {
  TextToSpeechProvider,
  SynthesisRequest,
  SynthesisResult,
} from './tts-provider.interface.js';

export interface MockTTSOptions {
  simulatedLatencyMs?: number;
  shouldFail?: boolean;
}

/**
 * Generate a valid minimal PCM 16-bit 16kHz mono WAV buffer
 */
export function createMockWavBuffer(durationSeconds = 0.5): Buffer {
  const sampleRate = 16000;
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const dataSize = numSamples * numChannels * bytesPerSample;
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(fileSize, 4);
  buffer.write('WAVE', 8);

  // 'fmt ' sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  buffer.writeUInt16LE(1, 20); // AudioFormat 1 = PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28); // ByteRate
  buffer.writeUInt16LE(numChannels * bytesPerSample, 32); // BlockAlign
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

  // 'data' sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Fill data with gentle low-volume 440Hz tone
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * 440 * t) * 3000; // soft volume
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }

  return buffer;
}

/**
 * MockTextToSpeechProvider
 *
 * Deterministic speech synthesizer for automated tests, CI, and development
 * environments where local Piper is not running.
 */
export class MockTextToSpeechProvider implements TextToSpeechProvider {
  readonly providerName = 'mock-tts';
  private simulatedLatencyMs: number;
  private shouldFail: boolean;

  constructor(options: MockTTSOptions = {}) {
    this.simulatedLatencyMs = options.simulatedLatencyMs || 20;
    this.shouldFail = options.shouldFail || false;
  }

  async checkHealth(): Promise<{ available: boolean; model?: string; error?: string }> {
    if (this.shouldFail) {
      return { available: false, error: 'Simulated TTS mock failure' };
    }
    return { available: true, model: 'mock-piper-lessac' };
  }

  async synthesize(request: SynthesisRequest): Promise<SynthesisResult> {
    if (this.shouldFail) {
      throw new ServiceError(
        'TTS_SERVICE_ERROR',
        'Simulated speech synthesis error in mock provider',
        502,
      );
    }

    const trimmed = (request.text || '').trim();
    if (!trimmed) {
      throw new ServiceError('EMPTY_TEXT', 'Synthesis text cannot be empty', 400);
    }

    if (this.simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
    }

    const estimatedDuration = Math.min(Math.max(trimmed.length * 50, 800), 5000);
    const wavBuffer = createMockWavBuffer(estimatedDuration / 1000);

    return {
      audioBuffer: wavBuffer,
      contentType: 'audio/wav',
      provider: this.providerName,
      model: 'mock-piper-lessac',
      durationMs: estimatedDuration,
    };
  }
}
