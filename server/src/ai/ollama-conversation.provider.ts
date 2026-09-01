import { config } from '../config/env.js';
import { ServiceError } from '../services/conversation.service.js';
import type {
  ConversationAIProvider,
  ConversationContext,
  AIResponse,
} from './conversation-provider.interface.js';
import { buildFriendSystemPrompt } from './prompts/friend-persona.js';

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message?: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  error?: string;
}

export interface OllamaProviderOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

/**
 * OllamaConversationProvider
 *
 * Implements ConversationAIProvider by communicating with the local Ollama HTTP API.
 * Ensures 100% local, private dialogue execution without any cloud APIs.
 */
export class OllamaConversationProvider implements ConversationAIProvider {
  readonly providerName = 'ollama';
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(options: OllamaProviderOptions = {}) {
    this.baseUrl = (options.baseUrl || config.ai.ollama.baseUrl).replace(/\/+$/, '');
    this.model = options.model || config.ai.ollama.model;
    this.timeoutMs = options.timeoutMs || config.ai.ollama.timeoutMs;
  }

  /**
   * Helper to inspect whether local Ollama is running and query installed models
   */
  async checkHealth(): Promise<{
    available: boolean;
    models: string[];
    error?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        return {
          available: false,
          models: [],
          error: `Ollama returned HTTP status ${response.status}`,
        };
      }

      const data = (await response.json()) as { models?: { name: string }[] };
      const models = (data.models || []).map((m) => m.name);
      return {
        available: true,
        models,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      return {
        available: false,
        models: [],
        error: `Could not connect to Ollama at ${this.baseUrl}: ${msg}`,
      };
    }
  }

  /**
   * Generate conversational reply using local Ollama model
   */
  async generateReply(context: ConversationContext): Promise<AIResponse> {
    const systemPrompt = buildFriendSystemPrompt({
      mode: context.mode,
      learnerLevel: context.learnerLevel,
    });

    // Build dialogue messages payload
    const messages: OllamaChatMessage[] = [{ role: 'system', content: systemPrompt }];

    // Append prior conversational turns
    for (const turn of context.recentTurns) {
      messages.push({
        role: turn.speaker === 'user' ? 'user' : 'assistant',
        content: turn.text,
      });
    }

    // Ensure current user utterance is the final message if not already included
    const lastTurn = messages[messages.length - 1];
    if (!lastTurn || lastTurn.content !== context.lastUserUtterance) {
      messages.push({
        role: 'user',
        content: context.lastUserUtterance,
      });
    }

    const payload = {
      model: this.model,
      messages,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      },
    };

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'TimeoutError') {
        throw new ServiceError(
          'AI_TIMEOUT',
          `Local Ollama timed out after ${this.timeoutMs}ms. Check if the model is loaded on your machine.`,
          504,
        );
      }

      throw new ServiceError(
        'AI_SERVICE_UNAVAILABLE',
        `Could not connect to local Ollama at ${this.baseUrl}. Please verify Ollama is running ('ollama serve').`,
        503,
      );
    }

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errorJson = (await response.json()) as { error?: string };
        errorDetail = errorJson.error || '';
      } catch {
        errorDetail = `HTTP ${response.status} ${response.statusText}`;
      }

      if (response.status === 404 || errorDetail.includes('not found')) {
        throw new ServiceError(
          'MODEL_NOT_FOUND',
          `Configured model '${this.model}' was not found in Ollama. Run 'ollama pull ${this.model}' to download it.`,
          502,
        );
      }

      throw new ServiceError('AI_INFERENCE_ERROR', `Ollama returned an error: ${errorDetail}`, 502);
    }

    let data: OllamaChatResponse;
    try {
      data = (await response.json()) as OllamaChatResponse;
    } catch {
      throw new ServiceError('AI_INVALID_RESPONSE', 'Failed to parse Ollama JSON response', 502);
    }

    const replyContent = data.message?.content?.trim();

    if (!replyContent) {
      throw new ServiceError(
        'AI_EMPTY_RESPONSE',
        'Ollama returned an empty conversational response',
        502,
      );
    }

    return {
      replyText: replyContent,
      provider: this.providerName,
      model: data.model || this.model,
      metadata: {
        totalDurationNs: data.total_duration,
        isMock: false,
      },
    };
  }
}
