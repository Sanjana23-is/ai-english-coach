import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { checkDatabaseConnection, closeDatabasePool } from './db/pool.js';
import { createSessionRouter } from './routes/session.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());

// Health Check Endpoint (Includes database connectivity status)
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbHealth = await checkDatabaseConnection();

  const isHealthy = dbHealth.connected;
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'ai-english-coach-server',
    timestamp: new Date().toISOString(),
    phase: 'core-conversation-backend',
    database: {
      status: dbHealth.connected ? 'connected' : 'disconnected',
      latencyMs: dbHealth.latencyMs,
      ...(dbHealth.error ? { error: dbHealth.error } : {}),
    },
  });
});

// Conversation Sessions API
app.use('/api/sessions', createSessionRouter());

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
const server = app.listen(config.port, () => {
  console.log(`[server]: AI English Coach backend running on port ${config.port}`);
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
