import type { Request, Response, NextFunction } from 'express';

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id: string): boolean {
  return typeof id === 'string' && UUID_REGEX.test(id);
}

const ALLOWED_SPEAKERS = ['user', 'ai'];
const MAX_TEXT_LENGTH = 2000;

export function validateSessionId(req: Request, res: Response, next: NextFunction): void {
  const { sessionId } = req.params;
  if (!sessionId || !isValidUuid(sessionId)) {
    res.status(400).json({
      error: {
        code: 'INVALID_ID_FORMAT',
        message: `Session ID '${sessionId}' is not a valid UUID`,
      },
    });
    return;
  }
  next();
}

export function validateCreateSession(req: Request, res: Response, next: NextFunction): void {
  const { mode, learnerLevel, userId } = req.body || {};

  if (userId && !isValidUuid(userId)) {
    res.status(400).json({
      error: {
        code: 'INVALID_ID_FORMAT',
        message: 'userId must be a valid UUID format',
      },
    });
    return;
  }

  if (mode && (typeof mode !== 'string' || mode.trim().length === 0 || mode.length > 100)) {
    res.status(400).json({
      error: {
        code: 'INVALID_MODE',
        message: 'mode must be a non-empty string under 100 characters',
      },
    });
    return;
  }

  if (
    learnerLevel &&
    (typeof learnerLevel !== 'string' ||
      learnerLevel.trim().length === 0 ||
      learnerLevel.length > 50)
  ) {
    res.status(400).json({
      error: {
        code: 'INVALID_LEARNER_LEVEL',
        message: 'learnerLevel must be a non-empty string under 50 characters',
      },
    });
    return;
  }

  next();
}

export function validateRecordUtterance(req: Request, res: Response, next: NextFunction): void {
  const { speaker, text, audioDurationMs, pauseDurationMs } = req.body || {};

  if (!speaker || !ALLOWED_SPEAKERS.includes(speaker)) {
    res.status(400).json({
      error: {
        code: 'INVALID_SPEAKER',
        message: `speaker must be one of: ${ALLOWED_SPEAKERS.join(', ')}`,
      },
    });
    return;
  }

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({
      error: {
        code: 'EMPTY_TEXT',
        message: 'Utterance text cannot be empty',
      },
    });
    return;
  }

  if (text.length > MAX_TEXT_LENGTH) {
    res.status(400).json({
      error: {
        code: 'TEXT_TOO_LONG',
        message: `Utterance text cannot exceed ${MAX_TEXT_LENGTH} characters`,
      },
    });
    return;
  }

  if (
    audioDurationMs !== undefined &&
    (typeof audioDurationMs !== 'number' || audioDurationMs < 0)
  ) {
    res.status(400).json({
      error: {
        code: 'INVALID_DURATION',
        message: 'audioDurationMs must be a non-negative number',
      },
    });
    return;
  }

  if (
    pauseDurationMs !== undefined &&
    (typeof pauseDurationMs !== 'number' || pauseDurationMs < 0)
  ) {
    res.status(400).json({
      error: {
        code: 'INVALID_DURATION',
        message: 'pauseDurationMs must be a non-negative number',
      },
    });
    return;
  }

  next();
}

export function validateTurn(req: Request, res: Response, next: NextFunction): void {
  const { text, audioDurationMs } = req.body || {};

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    res.status(400).json({
      error: {
        code: 'EMPTY_TEXT',
        message: 'Turn text cannot be empty',
      },
    });
    return;
  }

  if (text.length > MAX_TEXT_LENGTH) {
    res.status(400).json({
      error: {
        code: 'TEXT_TOO_LONG',
        message: `Turn text cannot exceed ${MAX_TEXT_LENGTH} characters`,
      },
    });
    return;
  }

  if (
    audioDurationMs !== undefined &&
    (typeof audioDurationMs !== 'number' || audioDurationMs < 0)
  ) {
    res.status(400).json({
      error: {
        code: 'INVALID_DURATION',
        message: 'audioDurationMs must be a non-negative number',
      },
    });
    return;
  }

  next();
}
