import { config } from '../config/env.js';
import type { TextToSpeechProvider } from './tts-provider.interface.js';
import { MockTextToSpeechProvider, type MockTTSOptions } from './mock-tts.provider.js';
import { PiperTextToSpeechProvider, type PiperTTSOptions } from './piper-tts.provider.js';

export type TTSProviderType = 'piper' | 'mock';

export interface TTSFactoryOptions {
  providerType?: TTSProviderType;
  piperOptions?: PiperTTSOptions;
  mockOptions?: MockTTSOptions;
}

/**
 * Factory function to instantiate the active TextToSpeechProvider
 * based on environment configuration or explicit overrides.
 */
export function createTextToSpeechProvider(options: TTSFactoryOptions = {}): TextToSpeechProvider {
  const providerType = options.providerType || config.tts.provider;

  switch (providerType) {
    case 'piper':
      return new PiperTextToSpeechProvider(options.piperOptions);

    case 'mock':
    default:
      return new MockTextToSpeechProvider(options.mockOptions);
  }
}
