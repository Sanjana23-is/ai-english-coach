# System Architecture: AI English Coach

## 1. Architectural Philosophy

The AI English Coach architecture is built around three fundamental tenets:

1. **Zero Marginal Cost & Local First**: Core conversational AI, speech recognition, and synthesis must run using local, open-source models (or on-device inference) to avoid paid cloud API fees and deliver truly unlimited speaking practice.
2. **Clean Monorepo Separation**: Clear physical and logical boundaries between client frontend, backend API orchestration, AI services, database, and system specifications.
3. **Decoupled Execution Pipelines**: Strict separation between real-time conversational streaming (The Friend) and asynchronous, analytical evaluation (The Coach).

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                  │
│   (React + Vite + TypeScript + Tailwind CSS)                            │
│                                                                         │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │ Audio Capture & Player│  │  Chat & Stream  │  │ Feedback / Retry │  │
│  │ (MediaRecorder / Web) │  │  Interface      │  │ Components       │  │
│  └───────────┬───────────┘  └────────┬────────┘  └────────▲─────────┘  │
└──────────────┼───────────────────────┼────────────────────┼─────────────┘
               │ Audio Stream / Chunks │ REST / WebSockets  │ Feedback JSON
               ▼                       ▼                    │
┌───────────────────────────────────────────────────────────┼─────────────┐
│                           BACKEND LAYER                   │             │
│   (Node.js + Express + TypeScript)                        │             │
│                                                           │             │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌────────┴──────────┐  │
│  │ Session Orchestrator  │  │ Turn Coordinator│  │ Coaching Pipeline │  │
│  │ & Audio Dispatcher    │  │ (Friend Engine) │  │ (Coach Engine)    │  │
│  └───────────┬───────────┘  └────────┬────────┘  └────────▲──────────┘  │
└──────────────┼───────────────────────┼────────────────────┼─────────────┘
               │                       │                    │
               ▼                       ▼                    │
┌───────────────────────────────────────────────────────────┼─────────────┐
│                       LOCAL AI INFERENCE LAYER            │             │
│                                                           │             │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌────────┴──────────┐  │
│  │ Speech-to-Text (STT)  │  │ Conversational  │  │ Analytical LLM    │  │
│  │ Local Whisper         │  │ LLM (Ollama)    │  │ (Structured Coach)│  │
│  └───────────────────────┘  └────────┬────────┘  └───────────────────┘  │
│                             ┌────────▼────────┐                         │
│                             │ Text-to-Speech  │                         │
│                             │ Local Piper     │                         │
│                             └─────────────────┘                         │
└─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER                                 │
│   (PostgreSQL - Development Docker Container)                           │
│                                                                         │
│  • Users & Profiles      • Session Transcripts    • Feedback Records    │
│  • Pattern Metrics       • Topic Bank             • Challenge Records   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Subsystem Breakdown

### 3.1 Client Subsystem (`client/`)

- **Technology**: React 19, TypeScript, Vite, Tailwind CSS v4.
- **Audio Capture**: Browser `MediaRecorder` and Web Audio API capture 16kHz PCM audio stream with minimal latency.
- **Voice Playback**: HTML5 Audio / AudioContext player with automatic buffering for smooth synthesized speech.
- **State Management**: Lightweight React state / context tracking conversation state (idle, listening, processing, speaking, reviewing).
- **Communication Protocol**:
  - Audio uploads & standard endpoints via typed REST APIs.
  - Streaming responses (Server-Sent Events or WebSockets) for real-time token and audio streaming.

### 3.2 Backend Subsystem (`server/`)

- **Technology**: Node.js, Express, TypeScript (running via `tsx` in development, compiled to `dist/` with `tsc`).
- **Session Coordinator**: Tracks active conversation state, mode selection, utterance order, and participant turns.
- **Audio Pipeline Router**: Passes incoming audio buffers to the local STT service, receives transcript, and forwards text to the conversational agent.
- **Coaching Worker**: Asynchronously triggered upon session termination. Compiles complete session transcript and audio telemetry, passes to the analytical LLM, and formats structured feedback for the client.

### 3.3 AI Inference Subsystem (`ai/`)

- **LLM Runtime (Local Ollama)**:
  - **Conversational Role**: Fast, quantized models (e.g., Llama 3 8B, Mistral 7B, or Phi-3) tuned with strict conversational system prompts for natural, concise dialogue.
  - **Coaching Role**: Temperature-controlled structured output queries parsing JSON schemas for grammatical, lexical, and fluency markers.
- **Speech-to-Text (Local Whisper)**:
  - Whisper base/small/medium runtimes providing rapid local audio transcription.
- **Text-to-Speech (Local Piper)**:
  - Ultra-fast, lightweight neural text-to-speech engine producing natural spoken audio with sub-second generation latency.
- **Future On-Device / Browser-Native Inference Exploration**:
  - Evaluation of WebGPU / WebAssembly runtimes (e.g., Whisper.cpp via WASM, ONNX Runtime Web, Transformers.js) to allow client-side audio transcription directly in the browser when supported by client hardware.

### 3.4 Database Subsystem (`database/`)

- **Technology**: PostgreSQL 16 (orchestrated via `docker-compose.yml`).
- **Purpose**: Persist user records, session metadata, transcripts, detected pattern histories, learner profiles, and daily challenge records.
- **Migration & Query Layer**: Slated for implementation in Phase 2/3 using a clean TypeScript ORM/query builder (e.g., Prisma or Kysely).

---

## 4. Latency & Performance Strategy

To ensure natural spoken dialogue, the end-to-end voice loop must remain responsive:

1. **Audio Streaming**: Stream audio in short chunks rather than waiting for extended pauses.
2. **Token & Audio Streaming**: Stream LLM tokens to the TTS engine chunk-by-chunk (sentence-by-sentence) so audio playback starts while the rest of the response is still generating.
3. **Model Quantization**: Utilize 4-bit and 8-bit quantized weights (GGUF) within Ollama to fit comfortably within consumer GPU/CPU RAM while maintaining high linguistic precision.
4. **Asynchronous Coaching**: Complex grammatical analysis and pattern evaluation occur strictly _after_ the conversation ends, keeping zero analytical overhead during live speech.

---

## 5. Security & Isolation

- **Zero Cloud Leakage**: Voice recordings and conversation transcripts are processed strictly by the local AI runtime. No data is broadcast to external API aggregators.
- **CORS & Origin Protections**: Strict Origin validation between client (`http://localhost:5173`) and server (`http://localhost:4000`).
- **Environment Isolation**: All ports, database credentials, and service URLs are parameterized through `.env` configurations.
