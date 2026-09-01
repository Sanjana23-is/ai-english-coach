# Project Roadmap: AI English Coach

## 1. Product Roadmap Overview

The development of AI English Coach is structured into six focused, incremental phases. Each phase validates a distinct layer of the product experience before introducing higher-level pedagogical systems.

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PHASE 1    │ ──> │   PHASE 2    │ ──> │   PHASE 3    │
│  Foundation  │     │   V1 Core    │     │Profile & State│
│ (COMPLETED)  │     │ Conversation │     │   Machine    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   PHASE 6    │ <── │   PHASE 5    │ <── │   PHASE 4    │
│  Advanced    │     │Daily Speaking│     │Personaliz-   │
│  Telemetry   │     │  Challenge   │     │ation Engine  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. Detailed Phase Breakdown

### Phase 1: Foundation & Scaffolding _(Completed)_

- [x] Monorepo architecture setup (`client/`, `server/`, `ai/`, `database/`, `docs/`).
- [x] Strict TypeScript configuration across workspaces.
- [x] ESLint 9 flat configuration and Prettier code styling.
- [x] Docker Compose development PostgreSQL scaffold.
- [x] Baseline Express server with health endpoint (`/api/health`).
- [x] Baseline React + Vite + Tailwind CSS frontend.
- [x] Comprehensive architectural and product specification documentation in `docs/`.

---

### Phase 2: V1 Core Conversation & Feedback Loop _(Immediate Next Milestone)_

**Primary Goal**: Prove the core loop: Enter → Speak → Friend responds → End → Coach reviews → Try Again.

- [ ] **Voice Pipeline**:
  - Browser audio capture via Web Audio API & MediaRecorder.
  - Local STT integration via Whisper (audio-to-text transcription).
  - Local TTS integration via Piper (text-to-speech audio streaming).
  - Audio playback with visual conversational turn indicators.
- [ ] **The Friend Engine**:
  - Ollama integration with conversational prompt template.
  - Unstructured conversation mode + 10 scenario modes (Interview, Travel, Workplace, etc.).
  - Text fallback input and real-time transcript streaming.
  - Zero-interruption conversational rhythm.
- [ ] **The Coach Engine (Basic)**:
  - Post-session transcript analysis pipeline.
  - Identification of top 2–4 high-impact grammar and vocabulary improvements.
  - Plain-English explanations and naturalness upgrades.
- [ ] **"Try Again" Mechanism**:
  - Interactive re-speech interface for targeted sentences.
  - Speech verification and side-by-side comparison with original attempt.
- [ ] **Database Persistence (V1)**:
  - Basic schemas for sessions, utterances, and feedback items in PostgreSQL.

---

### Phase 3: Learner Profile & Pattern Detection Engine

**Primary Goal**: Build continuous memory so the AI learns the user over time without retraining the LLM.

- [ ] **Persistent Learner Profile**:
  - Longitudinal user competency mapping (CEFR baseline, speaking time, total sessions).
  - Vocabulary repository tracking overused words and newly acquired terms.
- [ ] **Pattern Detection State Machine**:
  - Classification engine: _One-time mistake_ → _Possible pattern_ → _Confirmed recurring weakness_ → _Improving_ → _Mastered_.
  - Multi-session evidence tracking to eliminate false positives from single slips.
  - Mastered pattern retirement rule (stop prompting already-mastered concepts).
- [ ] **History & Progress Dashboard**:
  - Session transcript history log with audio replay (where enabled).
  - Observational progress metrics: Speaking time growth, recurring mistake reduction, vocabulary variety.

---

### Phase 4: Contextual Personalization Engine

**Primary Goal**: Steer future conversations toward active learning priorities through natural scenarios.

- [ ] **Contextual Scenario Generator**:
  - Automatic prompt crafting that naturally elicits target grammar (e.g., past-tense storytelling scenarios for learners struggling with past auxiliaries).
  - Elimination of mechanical grammar worksheets in favor of spoken immersion.
- [ ] **Dynamic Difficulty Calibration**:
  - Dynamic adaptation of AI vocabulary and sentence complexity to match learner growth.
- [ ] **Engagement & Fatigue Guards**:
  - Rotation algorithms preventing repetitive focus on the same weakness across consecutive sessions.

---

### Phase 5: Daily Speaking Challenge

**Primary Goal**: Foster daily speaking discipline with structured 2-minute sustained monologue practice.

- [ ] **Daily Challenge Engine**:
  - Daily prompt generator combining personalization, level calibration, and thematic variety.
  - Structured preparation countdown timer (60–90 seconds) with optional brainstorming cues.
- [ ] **Sustained Speech Recorder**:
  - ~2-minute continuous recording interface with zero AI interruptions.
  - Non-judgmental validation for early completion (encouraging shorter attempts without penalty).
- [ ] **Challenge Multi-Dimension Review**:
  - Deep evaluation of narrative structure, fluency rate, and recurring errors.
  - Take-versus-take comparison allowing users to retry and observe immediate fluency gains.

---

### Phase 6: Advanced Telemetry & On-Device Optimization

**Primary Goal**: Deepen acoustic analysis and evaluate pure client-side execution.

- [ ] **Acoustic Fluency Telemetry**:
  - Granular pause detection (>2.5s silences) and filler word frequency tracking (_"um"_, _"uh"_, _"like"_).
  - Speaking rate calculation (Words Per Minute).
- [ ] **Local Pronunciation Research**:
  - Investigation of local acoustic phoneme alignment models for pronunciation feedback.
- [ ] **Browser-Native / Edge Inference Exploration**:
  - Evaluation of WebGPU and WebAssembly models (Whisper.cpp WASM, Transformers.js) for zero-server client execution on capable hardware.
- [ ] **Privacy & Export Suite**:
  - Comprehensive GDPR-style JSON data export and permanent account purge workflows.
