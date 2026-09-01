-- 001_create_core_tables.sql
-- Core conversation backend tables for AI English Coach

-- Enable pgcrypto extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    privacy_mode VARCHAR(50) NOT NULL DEFAULT 'standard_history',
    target_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversation Sessions table
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode VARCHAR(100) NOT NULL DEFAULT 'freeform',
    learner_level VARCHAR(50) NOT NULL DEFAULT 'Intermediate',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    turn_count INTEGER NOT NULL DEFAULT 0,
    total_speaking_time_ms INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Utterances table (individual dialogue turns)
CREATE TABLE IF NOT EXISTS utterances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    speaker VARCHAR(20) NOT NULL CHECK (speaker IN ('user', 'ai')),
    turn_index INTEGER NOT NULL,
    transcript TEXT NOT NULL,
    audio_duration_ms INTEGER,
    pause_duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance and lookup indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON conversation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_utterances_session_id ON utterances(session_id);
CREATE INDEX IF NOT EXISTS idx_utterances_session_turn ON utterances(session_id, turn_index ASC);

-- Seed development user for local development without authentication
INSERT INTO users (id, name, email, privacy_mode)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sanjana', 'dev@aienglishcoach.local', 'standard_history')
ON CONFLICT (id) DO UPDATE SET updated_at = NOW();
