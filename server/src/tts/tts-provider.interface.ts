/**
 * Text-to-Speech (TTS) Provider Interface for AI English Coach.
 *
 * Enforces local-first speech synthesis architecture: zero external cloud APIs.
 */

export interface SynthesisRequest {
  text: string;
  voice?: string;
  language?: string;
  format?: 'wav' | 'mp3' | 'ogg';
}

export interface SynthesisResult {
  audioBuffer: Buffer;
  contentType: string;
  provider: string;
  model?: string;
  durationMs?: number;
}

export interface TextToSpeechProvider {
  readonly providerName: string;
  synthesize(request: SynthesisRequest): Promise<SynthesisResult>;
  checkHealth(): Promise<{ available: boolean; model?: string; error?: string }>;
}
