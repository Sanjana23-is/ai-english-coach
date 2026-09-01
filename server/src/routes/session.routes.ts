import { Router } from 'express';
import { ConversationService } from '../services/conversation.service.js';
import {
  validateSessionId,
  validateCreateSession,
  validateRecordUtterance,
  validateTurn,
} from '../middleware/validation.js';

export function createSessionRouter(
  conversationService: ConversationService = new ConversationService(),
): Router {
  const router = Router();

  /**
   * POST /api/sessions
   * Create a new conversation session
   */
  router.post('/', validateCreateSession, async (req, res, next) => {
    try {
      const session = await conversationService.createSession(req.body);
      res.status(201).json(session);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/sessions/:sessionId
   * Retrieve session metadata
   */
  router.get('/:sessionId', validateSessionId, async (req, res, next) => {
    try {
      const session = await conversationService.getSession(req.params.sessionId);
      res.status(200).json(session);
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/sessions/:sessionId/utterances
   * Retrieve ordered conversation transcript
   */
  router.get('/:sessionId/utterances', validateSessionId, async (req, res, next) => {
    try {
      const utterances = await conversationService.getUtterances(req.params.sessionId);
      res.status(200).json({
        sessionId: req.params.sessionId,
        count: utterances.length,
        utterances,
      });
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/sessions/:sessionId/utterances
   * Record a single utterance in an active session
   */
  router.post(
    '/:sessionId/utterances',
    validateSessionId,
    validateRecordUtterance,
    async (req, res, next) => {
      try {
        const utterance = await conversationService.recordUtterance(req.params.sessionId, req.body);
        res.status(201).json(utterance);
      } catch (err) {
        next(err);
      }
    },
  );

  /**
   * POST /api/sessions/:sessionId/turn
   * Execute a full conversation turn (record user text -> mock AI reply -> record AI reply)
   */
  router.post('/:sessionId/turn', validateSessionId, validateTurn, async (req, res, next) => {
    try {
      const result = await conversationService.processTurn(req.params.sessionId, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/sessions/:sessionId/complete
   * Complete the session and prevent further turns
   */
  router.post('/:sessionId/complete', validateSessionId, async (req, res, next) => {
    try {
      const session = await conversationService.completeSession(req.params.sessionId);
      res.status(200).json(session);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
