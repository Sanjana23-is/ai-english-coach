import type { Request, Response, NextFunction } from 'express';
import { ServiceError } from '../services/conversation.service.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ServiceError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Handle PostgreSQL foreign key or integrity errors without leaking credentials
  const dbError = err as { code?: string; detail?: string };
  if (dbError.code === '23503') {
    res.status(400).json({
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced entity does not exist',
      },
    });
    return;
  }

  if (dbError.code === '23505') {
    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'Resource already exists',
      },
    });
    return;
  }

  console.error('[API Server] Unhandled internal error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred. Please try again.',
    },
  });
}
