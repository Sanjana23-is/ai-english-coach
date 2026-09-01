# Product Vision & Specifications: AI English Coach

## 1. Product Overview

**AI English Coach** is a free, privacy-conscious web application designed to help learners worldwide build spoken English fluency and confidence through natural, uninhibited conversations with a local AI companion.

Language learners frequently encounter a significant psychological barrier: **the fear of speaking**. Traditional classroom instruction, oral exams, and conventional language apps place learners under immediate evaluative scrutiny. Learners hesitate because they worry about making grammar mistakes, using inappropriate vocabulary, or being judged.

AI English Coach dismantles this barrier by decoupling the experience into two separate modes of interaction:

1. **The Conversation**: A relaxed, judgment-free space where speaking freely is the only objective.
2. **The Review**: An insightful, post-session coaching analysis that identifies concrete patterns and guides long-term mastery.

---

## 2. The Core Philosophy

> **"Friend during the conversation. Coach after the conversation."**

Real human communication requires flow, rhythm, and confidence. When an instructor or software interrupts a speaker after every grammatical mistake, it destroys conversational flow and triggers anxiety.

AI English Coach adopts a strict pedagogical separation of concerns:

- **During speech**: The AI acts exclusively as an encouraging conversation partner (The Friend). It does not interrupt to correct grammar or vocabulary.
- **After speech**: The AI transitions into an analytical mentor (The Coach). It analyzes the completed session, highlighting strengths, identifying recurring weakness patterns, and offering actionable suggestions.

The overarching objective is to promote spoken fluency through continuous, repetitive practice rather than sterile grammar worksheets.

---

## 3. The Dual Role Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI ENGLISH COACH                         │
├──────────────────────────────┬──────────────────────────────┤
│       1. THE FRIEND          │        2. THE COACH          │
│   (Active during dialogue)   │    (Active post-session)     │
├──────────────────────────────┼──────────────────────────────┤
│ • Natural, warm conversation │ • In-depth linguistic review │
│ • Zero mid-speech interrupts │ • Pattern detection engine   │
│ • Encouraging, low-pressure  │ • Constructive corrections   │
│ • Adapts to user's level     │ • Learner profile updates    │
│ • No grading during speech   │ • Contextual practice prep   │
└──────────────────────────────┴──────────────────────────────┘
```

### 1. The Friend

- **Natural dialogue**: Speaks like a supportive acquaintance, colleague, or friend.
- **Comfortable tempo**: Listens patiently, accommodates pauses, and respects user pace.
- **Zero mid-sentence interruptions**: Never breaks in to point out a misplaced preposition or incorrect verb form.
- **No oral examination feel**: Conversation stays topic-oriented rather than test-oriented.
- **Dignity and empathy**: Never shames or patronizes the user for mistakes or hesitations.

### 2. The Coach

- **Post-session analysis**: Processes the completed session transcript and speech telemetry.
- **Identifies strengths and weaknesses**: Celebrates what the user did well while pinpointing growth areas.
- **Detects recurring patterns**: Differentiates between one-off slips of the tongue and systemic grammar/vocabulary habits.
- **Maintains the learner profile**: Progressively maps the user's linguistic traits over time.
- **Personalizes future sessions**: Prepares tailored practice contexts to address confirmed weaknesses without boring rote drills.

---

## 4. The 10 Product Principles

These 10 principles govern all architectural, design, and algorithmic decisions across AI English Coach:

1. **Friend during conversation, coach after conversation**: Never mix the roles. Interruptions destroy conversational confidence.
2. **Speaking practice comes first**: Active spoken output drives acquisition. Theoretical instruction is secondary.
3. **Do not overwhelm users with corrections**: Focus on 2–4 high-impact, actionable takeaways per session rather than cataloging every minor flaw.
4. **Mistakes are part of learning**: Treat errors as evidence of effort and raw material for progress tracking, never as failures.
5. **Personalization should be evidence-based**: Interventions must stem from verified behavioral patterns recorded in the learner profile, not guesswork.
6. **The system should improve its understanding of the learner over time**: The AI builds deep, longitudinal context across conversations without requiring continuous model retraining.
7. **Do not repeatedly practice mastered weaknesses**: Once a learner demonstrates consistent mastery of a pattern, retire it from priority practice.
8. **Free/unlimited conversation is a major architectural goal**: Eliminate artificial session limits and cost anxieties by relying on local, open-source AI runtimes.
9. **Privacy and user control matter**: Users own their voice recordings, transcripts, and learner profiles, with full transparency and deletion controls.
10. **Build incrementally and validate the core experience before advanced features**: Perfect the core loop (Listen → Respond → Review) before layering on complex gamification or secondary metrics.

---

## 5. The Unlimited & Free Principle

A primary barrier in existing AI language products is commercial monetization: subscription paywalls, coin systems, and strict daily conversation limits driven by expensive commercial API billing (e.g., OpenAI, Anthropic, Gemini).

To achieve unlimited, zero-marginal-cost speaking practice:

- **Local & Open-Source AI First**: The system architecture targets local LLM engines (Ollama), speech recognition (Whisper), and neural voice synthesis (Piper).
- **Zero Commercial API Dependencies for Core Features**: Core conversations and coaching evaluations must never depend on paid third-party API keys.
- **Honest Infrastructure Economics**: The project will not promise unlimited free hosted cloud GPUs that lead to unsustainable infrastructure bills. Instead, it prioritizes local host execution, browser-native/WebAssembly models, and lightweight client-server topologies.
- **Hardware-Aware Design**: The software should scale gracefully across consumer hardware, supporting smaller quantized models (e.g., 3B to 8B parameter models) with snappy response times.

---

## 6. Scope Boundaries: V1 vs. Later Phases

To ensure rigorous validation and maintainable engineering, features are divided into distinct phases:

### Phase 1: Project Foundation (Completed)

- Monorepo structure (`client/`, `server/`, `ai/`, `database/`, `docs/`).
- TypeScript throughout, strict ESLint, Prettier formatting, clean Docker Compose baseline.
- Single source-of-truth architecture and documentation.

### Phase 2: V1 Core Conversation & Feedback Loop (Next Focus)

- Unstructured dialogue and primary conversation modes.
- End-to-end voice loop (Microphone input → STT → Conversation LLM → TTS → Audio playback).
- Fallback text chat.
- Post-session Coach feedback summary (Top grammar and vocabulary suggestions).
- "Try Again" interactive correction mechanism.

### Phase 3: Learner Profile & Pattern Detection Engine

- Persistent learner profile tracking grammar, vocabulary, and fluency metrics.
- Pattern classification state machine (One-time mistake → Possible pattern → Confirmed recurring weakness → Improving → Mastered).
- Multi-session history and evidence tracking.

### Phase 4: Contextual Personalization Engine

- Dynamic topic tailoring based on active weaknesses (e.g., setting up a job interview or vacation story to prompt past-tense usage).
- Adaptive difficulty calibrated to the user's demonstrated proficiency.

### Phase 5: Daily Speaking Challenge & Advanced Telemetry

- Daily prompt with structured preparation time and a 2-minute uninterrupted speaking goal.
- Attempt comparison and longitudinal improvement graphs.
- Non-punitive fluency metrics (pauses, filler words, speech duration).
- Future exploration of local acoustic pronunciation assessment.
