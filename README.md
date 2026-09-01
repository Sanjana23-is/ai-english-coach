# AI English Coach

AI English Coach is a free web application designed to help users improve their spoken English through natural, supportive conversations with a local AI.

---

## Purpose & Vision

Many language learners hesitate to speak because they fear judgment, feel put on the spot, or find traditional language apps overly test-oriented. AI English Coach bridges this gap by offering a private, supportive, and zero-cost environment to practice speaking freely.

The core product principle is to **learn about the user over time** by building a continuous learner profile rather than retraining underlying language models.

---

## Core Concept: The Dual Role

The AI serves two distinct roles designed to balance fluency practice with targeted improvement:

### 1. The Friend

- **Natural, engaging conversation**: Speaks in a warm, encouraging tone.
- **No interruptions**: Listens attentively without stopping the user mid-sentence for grammar corrections.
- **Low-stress environment**: Feels like chatting with a supportive friend rather than taking an oral examination.

### 2. The Coach

- **Post-conversation analysis**: Evaluates grammar, vocabulary, fluency, and pronunciation patterns after speaking sessions.
- **Pattern detection**: Tracks recurring strengths and weaknesses over time.
- **Learner profile maintenance**: Keeps an evolving record of the learner's progress and trouble areas.
- **Personalized practice**: Uses historical insights to subtly guide future conversation topics and speaking exercises.

---

## Long-Term Vision

- **Daily Speaking Challenge**: A daily prompt where the user receives preparation time and speaks for approximately 2 minutes, followed by comprehensive coach feedback integrated into the learner profile.
- **100% Free & Local AI Execution**: Run locally using open-source models without expensive paid cloud APIs.
- **Continuous Learning Loop**: An adaptive memory system that tracks language progress over months of practice.

---

## Current Development Phase

**Phase 1: Project Foundation & Architecture Scaffolding**

We are currently establishing the clean monorepo foundation, development tooling, strict TypeScript configurations, and containerization scaffolding. No application features, database tables, or AI integrations are active in this initial phase.

---

## Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (Dockerized)
- **Local AI (Planned)**:
  - LLM Runtime: [Ollama](https://ollama.ai/)
  - Speech-to-Text (STT): [Whisper](https://github.com/openai/whisper)
  - Text-to-Speech (TTS): [Piper](https://github.com/rhasspy/piper)
- **Infrastructure**: Docker & Docker Compose
- **Tooling**: TypeScript, ESLint, Prettier

---

## Project Structure

```text
ai-english-coach/
├── client/              # Frontend React application (Vite + TypeScript + Tailwind)
├── server/              # Backend REST API (Node.js + Express + TypeScript)
├── ai/                  # Scaffolding and configs for local AI services
├── database/            # Database migration scripts and schema definitions
├── docs/                # Architecture and design documentation
├── docker-compose.yml   # Local service orchestration (PostgreSQL, etc.)
└── package.json         # Monorepo workspaces configuration
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended, v20+ preferred)
- [npm](https://www.npmjs.com/) (v9+)
- [Docker](https://www.docker.com/) and Docker Compose (optional for local database)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ai-english-coach
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```

### Running in Development

Run both frontend and backend concurrently:

```bash
npm run dev
```

Or run services individually:

```bash
# Server only (http://localhost:4000)
npm run dev:server

# Client only (http://localhost:5173)
npm run dev:client
```

### Verification & Quality Checks

```bash
# Run TypeScript checks across all workspaces
npm run typecheck

# Lint all workspaces
npm run lint

# Check formatting
npm run format:check

# Build both client and server
npm run build
```
