import { Router, type Request, type Response, type NextFunction } from 'express';
import { createTextToSpeechProvider } from '../tts/tts-factory.js';
import type { TextToSpeechProvider } from '../tts/tts-provider.interface.js';

const MAX_TTS_TEXT_LENGTH = 2000;

export function createTtsRouter(
  ttsProvider: TextToSpeechProvider = createTextToSpeechProvider(),
): Router {
  const router = Router();

  /**
   * POST /api/tts/synthesize
   * Synthesize text into playable speech audio (WAV)
   */
  router.post(
    '/synthesize',
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { text, voice, language } = req.body || {};

        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          res.status(400).json({
            error: {
              code: 'EMPTY_TEXT',
              message: 'Text is required for speech synthesis',
            },
          });
          return;
        }

        if (text.length > MAX_TTS_TEXT_LENGTH) {
          res.status(400).json({
            error: {
              code: 'TEXT_TOO_LONG',
              message: `Synthesis text cannot exceed ${MAX_TTS_TEXT_LENGTH} characters`,
            },
          });
          return;
        }

        const result = await ttsProvider.synthesize({
          text: text.trim(),
          voice,
          language,
        });

        const contentType =
          result.contentType && result.contentType.startsWith('audio/')
            ? result.contentType
            : 'audio/wav';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', result.audioBuffer.length);
        res.setHeader('X-TTS-Provider', result.provider);
        if (result.model) {
          res.setHeader('X-TTS-Model', result.model);
        }

        res.status(200).send(result.audioBuffer);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}
