# Database Design & Schemas: AI English Coach

## 1. Database Overview & Technology

The persistence layer for AI English Coach is powered by **PostgreSQL 16**.

- **Execution**: Local containerized instance via `docker-compose.yml` (default host port: `5434` to prevent local macOS postgres collision).
- **Connection**: Connection pooling via `pg.Pool` configured through `DATABASE_URL` or `POSTGRES_*` environment variables.
- **Migrations**: Explicit, idempotent, version-tracked SQL migrations in `server/src/db/migrations/` managed by `server/src/db/migrate.ts` (`schema_migrations` table).
- **Role**: High-integrity relational storage for user profiles, conversation transcripts, speech telemetry, coaching reviews, pattern states, and daily challenges.

---

## 2. Conceptual Entity-Relationship Model

```
┌──────────────┐         1:1          ┌───────────────────┐
│    Users     ├─────────────────────>│  LearnerProfiles  │
└──────┬───────┘                      └─────────┬─────────┘
       │                                        │
       │ 1:N                                    │ 1:N
       ▼                                        ▼
┌──────────────────────┐              ┌───────────────────┐
│ ConversationSessions │              │ PatternOccurrences│
└──────┬───────────────┘              └───────────────────┘
       │
       ├─────────────────┐
       │ 1:N             │ 1:N
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  Utterances  │  │FeedbackItems │
└──────────────┘  └──────┬───────┘
                         │ 1:N
                         ▼
                  ┌──────────────┐
                  │ RetryAttempts│
                  └──────────────┘
```

---

## 3. Core Conceptual Entities

### 3.1 `Users` & `UserPreferences`

- **`id`**: Unique UUID identifier.
- **`created_at`**, **`updated_at`**: Timestamps.
- **`privacy_mode`**: Enumeration (`standard_history`, `ephemeral_private`).
- **`preferred_voice`**: Audio persona selection for Piper TTS.
- **`target_goals`**: Array of user-selected goals (e.g., _Job Interview_, _Travel_, _Casual Conversation_).

### 3.2 `LearnerProfiles`

- **`id`**: UUID.
- **`user_id`**: Foreign key references `Users(id)` on delete cascade.
- **`estimated_level`**: CEFR rank (`A1`, `A2`, `B1`, `B2`, `C1`, `C2`).
- **`total_speaking_seconds`**: Cumulative spoken duration across all sessions.
- **`total_sessions_completed`**: Integer counter.
- **`vocabulary_bank`**: Structured JSON tracking overused phrases, newly acquired words, and natural collocations.

### 3.3 `PatternOccurrences` (Pattern State Machine)

- **`id`**: UUID.
- **`profile_id`**: Foreign key references `LearnerProfiles(id)`.
- **`pattern_category`**: Enumeration (`grammar`, `vocabulary`, `fluency`, `syntax`).
- **`pattern_key`**: Standardized identifier (e.g., `past_tense_auxiliary_did`).
- **`lifecycle_state`**: State machine status:
  - `one_time_mistake`
  - `possible_pattern`
  - `confirmed_weakness`
  - `improving`
  - `mastered`
- **`evidence_count`**: Number of observed violations.
- **`success_count`**: Number of subsequent correct applications.
- **`last_observed_at`**: Timestamp.

### 3.4 `ConversationSessions`

- **`id`**: UUID.
- **`user_id`**: Foreign key references `Users(id)`.
- **`mode`**: Scenario mode (`unstructured`, `job_interview`, `travel`, etc.).
- **`started_at`**, **`ended_at`**: Session duration timestamps.
- **`turn_count`**: Number of completed exchanges.
- **`total_speaking_time_ms`**: Milliseconds of recorded user audio.

### 3.5 `Utterances`

- **`id`**: UUID.
- **`session_id`**: Foreign key references `ConversationSessions(id)` on delete cascade.
- **`speaker`**: `user` | `ai`.
- **`turn_index`**: Sequential ordering within the session.
- **`transcript`**: Text content of the utterance.
- **`audio_duration_ms`**: Total audio length.
- **`pause_duration_ms`**: Measured silence / hesitation within the turn.

### 3.6 `FeedbackItems`

- **`id`**: UUID.
- **`session_id`**: Foreign key references `ConversationSessions(id)`.
- **`category`**: `grammar` | `vocabulary` | `natural_expression` | `fluency`.
- **`original_quote`**: Spoken sentence with issue.
- **`suggested_text`**: Improved target sentence.
- **`explanation`**: Plain-English pedagogical reasoning.
- **`priority_score`**: Float ranking indicating impact for selective presentation.

### 3.7 `RetryAttempts`

- **`id`**: UUID.
- **`feedback_id`**: Foreign key references `FeedbackItems(id)`.
- **`retry_transcript`**: Transcribed speech from the user's retry.
- **`is_resolved`**: Boolean flag indicating whether the correction was successfully executed.

### 3.8 `DailyChallenges` & `ChallengeAttempts`

- **`id`**: UUID.
- **`date`**: Calendar date (YYYY-MM-DD).
- **`topic_title`**, **`prompt_text`**: The challenge scenario.
- **`target_duration_seconds`**: Default ~120 seconds.
- **`ChallengeAttempts`**: Records user attempts, speaking duration, fluency metrics, and attempt comparisons.

---

## 4. Privacy & Data Governance

1. **Cascading Deletions**: Deleting a user account automatically purges all transcripts, feedback items, learner profile data, and retry logs across the entire relational graph.
2. **Ephemeral Sessions**: When private mode is activated, session transcripts and utterances are purged from memory immediately upon review generation, storing only aggregated profile metrics.
3. **Data Portability**: Clean JSON serialization routines will allow users to download their complete linguistic history at any time.

---

## 5. Migration Strategy

- **Phase 1 (Current)**: Development PostgreSQL container running via `docker-compose.yml` with health checks.
- **Phase 2**: Core session, utterance, and feedback tables introduced with type-safe schema migrations.
- **Phase 3**: Learner profile, pattern state machine, and vocabulary bank tables added.
- **Phase 4**: Daily challenge and attempt comparison tables introduced.
