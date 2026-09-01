import type {
  ConversationAIProvider,
  ConversationContext,
  AIResponse,
} from './conversation-provider.interface.js';

/**
 * MockConversationAIProvider
 *
 * Explicit mock implementation of ConversationAIProvider for development and testing.
 * Provides deterministic, scenario-contextual replies without any external or paid AI APIs.
 */
export class MockConversationAIProvider implements ConversationAIProvider {
  readonly providerName = 'mock-provider';
  private readonly modelName = 'mock-dialogue-v1';

  async generateReply(context: ConversationContext): Promise<AIResponse> {
    const userText = context.lastUserUtterance.toLowerCase();
    const mode = context.mode.toLowerCase();

    let replyText = 'That is really interesting! Tell me a bit more about what you experienced.';

    if (
      mode.includes('travel') ||
      userText.includes('trip') ||
      userText.includes('hotel') ||
      userText.includes('flight')
    ) {
      replyText =
        'Traveling to new places is always exciting! Did you get a chance to try any of the local foods or visit notable landmarks?';
    } else if (
      mode.includes('job') ||
      mode.includes('interview') ||
      userText.includes('work') ||
      userText.includes('project')
    ) {
      replyText =
        'That sounds like a meaningful professional challenge. How did you and your team approach solving that?';
    } else if (userText.includes('hello') || userText.includes('hi') || userText.includes('hey')) {
      replyText = 'Hello! It is wonderful to chat with you today. What is on your mind?';
    } else if (context.recentTurns.length > 4) {
      replyText = 'I love how descriptive your story is. What happened next after that?';
    }

    return {
      replyText,
      provider: this.providerName,
      model: this.modelName,
      metadata: {
        isMock: true,
        contextTurnsCount: context.recentTurns.length,
      },
    };
  }
}
