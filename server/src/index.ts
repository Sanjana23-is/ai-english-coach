import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { checkDatabaseConnection, closeDatabasePool } from './db/pool.js';
import { createSessionRouter } from './routes/session.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { OllamaConversationProvider } from './ai/ollama-conversation.provider.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());

// Health Check Endpoint (Includes DB and AI Provider connectivity status)
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseConnection();

  let aiHealth: {
    provider: string;
    model?: string;
    status: string;
    models?: string[];
    error?: string;
  };

  if (config.ai.provider === 'ollama') {
    const ollamaProvider = new OllamaConversationProvider();
    const ollamaStatus = await ollamaProvider.checkHealth();
    aiHealth = {
      provider: 'ollama',
      model: config.ai.ollama.model,
      status: ollamaStatus.available ? 'connected' : 'unavailable',
      models: ollamaStatus.models,
      ...(ollamaStatus.error ? { error: ollamaStatus.error } : {}),
    };
  } else {
    aiHealth = {
      provider: 'mock',
      status: 'ready',
    };
  }

  const isHealthy = dbHealth.connected;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'ai-english-coach-server',
    timestamp: new Date().toISOString(),
    phase: 'ollama-conversation-ai',
    database: {
      status: dbHealth.connected ? 'connected' : 'disconnected',
      latencyMs: dbHealth.latencyMs,
      ...(dbHealth.error ? { error: dbHealth.error } : {}),
    },
    ai: aiHealth,
  });
});

// Conversation Sessions API
app.use('/api/sessions', createSessionRouter());

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`[server]: AI English Coach backend running on port ${config.port}`);
  console.log(`[server]: Configured AI provider: '${config.ai.provider}'`);
});

// Graceful Shutdown
const handleShutdown = async (signal: string) => {
  console.log(`[server]: Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('[server]: Closed remaining HTTP connections.');
    await closeDatabasePool();
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
