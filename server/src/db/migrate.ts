import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('[DB Migrate] Starting database migrations...');

    // 1. Create schema_migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Discover migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('[DB Migrate] No migrations directory found at:', migrationsDir);
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    // 3. Query applied migrations
    const { rows } = await client.query<{ version: string }>(
      'SELECT version FROM schema_migrations;',
    );
    const appliedVersions = new Set(rows.map((r) => r.version));

    // 4. Run pending migrations in transactions
    for (const file of files) {
      if (appliedVersions.has(file)) {
        console.log(`[DB Migrate] Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`[DB Migrate] Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1);', [file]);
        await client.query('COMMIT');
        console.log(`[DB Migrate] Successfully applied: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[DB Migrate] Failed to apply ${file}:`, err);
        throw err;
      }
    }

    console.log('[DB Migrate] All database migrations up to date.');
  } finally {
    client.release();
  }
}

// Allow direct execution via CLI (e.g. npm run db:migrate)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[DB Migrate] Fatal error during migration:', err);
      await pool.end();
      process.exit(1);
    });
}
