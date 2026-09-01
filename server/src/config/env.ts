import dotenv from 'dotenv';
import path from 'path';

// Load .env from workspace root or server directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  database: {
    url:
      process.env.DATABASE_URL ||
      `postgresql://${process.env.POSTGRES_USER || 'englishcoach'}:${
        process.env.POSTGRES_PASSWORD || 'englishcoach_dev_password'
      }@${process.env.POSTGRES_HOST || 'localhost'}:${
        process.env.POSTGRES_PORT || '5434'
      }/${process.env.POSTGRES_DB || 'englishcoach_db'}`,
    user: process.env.POSTGRES_USER || 'englishcoach',
    password: process.env.POSTGRES_PASSWORD || 'englishcoach_dev_password',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5434', 10),
    database: process.env.POSTGRES_DB || 'englishcoach_db',
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || '10', 10),
  },
  devUser: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Sanjana',
    email: 'dev@aienglishcoach.local',
  },
};
