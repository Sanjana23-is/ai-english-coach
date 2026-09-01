import pg from 'pg';
import { config } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.database.url,
  max: config.database.maxPoolSize,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Check if the database connection is healthy
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return {
      connected: true,
      latencyMs: Date.now() - start,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown database error';
    return {
      connected: false,
      error: errorMessage,
    };
  }
}

/**
 * Graceful pool shutdown
 */
export async function closeDatabasePool(): Promise<void> {
  try {
    await pool.end();
    console.log('[DB] Database connection pool closed successfully.');
  } catch (err: unknown) {
    console.error('[DB] Error closing database pool:', err instanceof Error ? err.message : err);
  }
}
