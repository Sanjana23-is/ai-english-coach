import { config } from '../config/env.js';
import type { ConversationAIProvider } from './conversation-provider.interface.js';
import { MockConversationAIProvider } from './mock-conversation.provider.js';
import { OllamaConversationProvider } from './ollama-conversation.provider.js';

export type ProviderType = 'ollama' | 'mock';

export interface ProviderFactoryOptions {
  providerType?: ProviderType;
  ollamaBaseUrl?: string;
  ollamaModel?: string;
  ollamaTimeoutMs?: number;
}

/**
 * Factory function to instantiate the active ConversationAIProvider
 * based on environment configuration or explicit overrides.
 */
export function createConversationAIProvider(
  options: ProviderFactoryOptions = {},
): ConversationAIProvider {
  const providerType = options.providerType || config.ai.provider;

  switch (providerType) {
    case 'ollama':
      return new OllamaConversationProvider({
        baseUrl: options.ollamaBaseUrl,
        model: options.ollamaModel,
        timeoutMs: options.ollamaTimeoutMs,
      });

    case 'mock':
    default:
      return new MockConversationAIProvider();
  }
}
