import { config } from '../config/env.js';
import type { SpeechToTextProvider } from './stt-provider.interface.js';
import { MockSpeechToTextProvider, type MockSTTOptions } from './mock-stt.provider.js';
import { WhisperHttpSTTProvider, type WhisperSTTOptions } from './whisper-http-stt.provider.js';

export type STTProviderType = 'whisper' | 'mock';

export interface STTFactoryOptions {
  providerType?: STTProviderType;
  whisperOptions?: WhisperSTTOptions;
  mockOptions?: MockSTTOptions;
}

/**
 * Factory function to instantiate the active SpeechToTextProvider
 * based on environment configuration or explicit overrides.
 */
export function createSpeechToTextProvider(options: STTFactoryOptions = {}): SpeechToTextProvider {
  const providerType = options.providerType || config.stt.provider;

  switch (providerType) {
    case 'whisper':
      return new WhisperHttpSTTProvider(options.whisperOptions);

    case 'mock':
    default:
      return new MockSpeechToTextProvider(options.mockOptions);
  }
}
