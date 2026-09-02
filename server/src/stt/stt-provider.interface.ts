/**
 * Speech-to-Text (STT) Provider Interface for AI English Coach.
 *
 * Enforces local-first transcription architecture: zero external cloud APIs.
 */

export interface AudioPayload {
  buffer: Buffer;
  mimeType: string;
  filename?: string;
  durationMs?: number;
}

export interface TranscriptionResult {
  text: string;
  durationMs?: number;
  provider: string;
  model?: string;
  confidence?: number;
}

export interface SpeechToTextProvider {
  readonly providerName: string;
  transcribe(payload: AudioPayload): Promise<TranscriptionResult>;
  checkHealth(): Promise<{ available: boolean; model?: string; error?: string }>;
}
