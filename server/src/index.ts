import express, { type Request, type Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'ai-english-coach-server',
    timestamp: new Date().toISOString(),
    phase: 'foundation',
  });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`[server]: AI English Coach backend running on port ${PORT}`);
});

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  console.log(`[server]: Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[server]: Closed out remaining connections.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
