import { Router, type Request, type Response, type NextFunction } from 'express';
import express from 'express';
import { createSpeechToTextProvider } from '../stt/stt-factory.js';
import type { SpeechToTextProvider } from '../stt/stt-provider.interface.js';

export function createSttRouter(
  sttProvider: SpeechToTextProvider = createSpeechToTextProvider(),
): Router {
  const router = Router();

  // Raw body parser for audio payloads up to 25MB
  const audioBodyParser = express.raw({
    type: ['audio/*', 'video/*', 'application/octet-stream'],
    limit: '25mb',
  });

  /**
   * POST /api/stt/transcribe
   * Transcribe recorded audio buffer into English text
   */
  router.post(
    '/transcribe',
    audioBodyParser,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const audioBuffer = req.body as Buffer;

        if (!audioBuffer || !Buffer.isBuffer(audioBuffer) || audioBuffer.length === 0) {
          res.status(400).json({
            error: {
              code: 'EMPTY_AUDIO_PAYLOAD',
              message: 'No audio data received for transcription',
            },
          });
          return;
        }

        const mimeType = (req.headers['content-type'] as string) || 'audio/webm';
        const durationHeader = req.headers['x-audio-duration-ms'] as string;
        const durationMs = durationHeader ? parseInt(durationHeader, 10) : undefined;

        const result = await sttProvider.transcribe({
          buffer: audioBuffer,
          mimeType,
          durationMs,
        });

        res.status(200).json({
          transcript: result.text,
          durationMs: result.durationMs,
          provider: result.provider,
          model: result.model,
        });
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
