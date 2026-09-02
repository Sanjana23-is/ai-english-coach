# AI System & Models: AI English Coach

## 1. AI Vision & Non-Retraining Philosophy

The core AI principle of AI English Coach is:

> **"The AI learns the user over time, rather than retraining the underlying LLM after every conversation."**

Fine-tuning or retraining foundation models after individual conversations is computationally impractical, unstable, and prone to catastrophic forgetting. Instead, AI English Coach treats the open-source LLM as an **intelligent, static reasoning engine** that operates upon a **dynamically evolving, structured Learner Profile**.

```
Conversation Transcript
         │
         ▼
Coaching Analytical LLM ───> Extracts Linguistic Evidence
                                         │
                                         ▼
                               Updates Structured Learner Profile
                                         │
                                         ▼
                               Informs Context Prompt for Future Sessions
```

---

## 2. Dual Persona Design

The system employs two completely distinct operational personas with different system prompts, temperatures, and response schemas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          DUAL AI PERSONAS                              │
├───────────────────────────────────┬────────────────────────────────────┤
│         1. THE FRIEND             │            2. THE COACH            │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Execution: Real-time during chat│ • Execution: Asynchronous post-chat│
│ • Temperature: 0.7 (Warm, natural)│ • Temperature: 0.2 (Deterministic) │
│ • Format: Conversational dialogue │ • Format: Strict JSON schema       │
│ • Focus: Flow, rapport, encouragement • Focus: Analysis, patterns, growth │
│ • Interruption policy: NEVER      │ • Feedback policy: Selective (top) │
└───────────────────────────────────┴────────────────────────────────────┘
```

### 2.1 Persona 1: The Friend (Live Dialogue)

- **Role**: Conversational companion, active listener, supportive peer.
- **Behavior Guidelines**:
  - Keep turns concise (typically 1 to 3 sentences) to encourage the user to do 70%+ of the talking.
  - Never correct grammar, vocabulary, or pronunciation during the conversation.
  - Never say _"That is incorrect"_ or _"Remember to use past tense"_.
  - Ask natural, open-ended follow-up questions tied to the user's statements.
  - Dynamically match the user's estimated CEFR level (simplifying vocabulary for beginners, using natural idioms for advanced speakers).
  - Adopt scenario-specific context when a structured mode (e.g., _Job Interview_, _Travel_) is selected.

### 2.2 Persona 2: The Coach (Post-Session Evaluation)

- **Role**: Linguistic analyst, diagnostic mentor, progress tracker.
- **Behavior Guidelines**:
  - Parse the complete conversation transcript and audio telemetry.
  - Evaluate grammar, vocabulary richness, sentence structure, and conversational flow.
  - Identify strengths first to provide genuine psychological safety and encouragement.
  - Select only the top 2–4 highest-impact growth areas per session.
  - Produce strict, typed JSON containing exact spoken quotes, recommended corrections, plain-language explanations, and categorization tags.

---

## 3. Local Model Stack

To maintain zero API cost and guarantee total user privacy, the architecture uses open-source models:

### 3.1 Large Language Models (LLM) via Ollama

- **Runtime**: [Ollama](https://ollama.ai/) serving local quantized models via its native HTTP API (`/api/chat`).
- **Provider Abstraction**: Implemented via `ConversationAIProvider` interface with a pluggable provider factory (`createConversationAIProvider`).
  - **`OllamaConversationProvider`**: Connects to local Ollama instance with timeout enforcement, clean error mapping, and level/mode-specific Friend persona system prompt injection.
  - **`MockConversationAIProvider`**: Deterministic, zero-dependency offline mock for automated CI testing and local environments without Ollama.
- **Configuration Parameters**:
  - `CONVERSATION_AI_PROVIDER`: `ollama` or `mock`
  - `OLLAMA_BASE_URL`: Base HTTP URL (default: `http://localhost:11434`)
  - `OLLAMA_MODEL`: Target model (default: `llama3.2:1b`, configurable)
  - `OLLAMA_TIMEOUT_MS`: Inference timeout in ms (default: `30000`)
- **Recommended Local Models**:
  - **Llama 3.2 (1B / 3B Instruct)**: Lightweight conversational instruct models with fast token generation on Apple Silicon / consumer CPUs.
  - **Qwen 2.5 (1.5B / 3B / 7B)**: Strong multilingual conversational reasoning.
  - **Llama 3 (8B Instruct)**: High-precision grammatical analysis for the Coach persona.

### 3.2 Speech-to-Text (STT) via Whisper

- **Runtime**: Local [Whisper](https://github.com/openai/whisper) server or [whisper.cpp](https://github.com/ggerganov/whisper.cpp) server serving quantized models via HTTP.
- **Provider Abstraction**: Implemented via `SpeechToTextProvider` interface with a provider factory (`createSpeechToTextProvider`).
  - **`WhisperHttpSTTProvider`**: Connects to local Whisper HTTP instance (`POST /v1/audio/transcriptions` or `/inference`) with timeout enforcement, clean error mapping, and raw buffer audio transport.
  - **`MockSpeechToTextProvider`**: Deterministic offline mock for automated CI testing and local environments without Whisper running.
- **API Endpoint**: `POST /api/stt/transcribe` accepting raw audio buffers (`audio/webm`, `audio/mp4`, `audio/wav`).
- **Configuration Parameters**:
  - `STT_PROVIDER`: `whisper` or `mock`
  - `WHISPER_BASE_URL`: Base HTTP URL (default: `http://localhost:8000`)
  - `WHISPER_MODEL`: Target model (default: `base.en`, configurable)
  - `WHISPER_TIMEOUT_MS`: Inference timeout in ms (default: `30000`)
- **Recommended Local Whisper Setup (When User is Ready)**:
  - **Option A (whisper.cpp server - Apple Silicon / Metal accelerated)**:
    ```bash
    # Install whisper-cpp via Homebrew
    brew install whisper-cpp

    # Run the whisper.cpp HTTP server on port 8000 with base.en model
    whisper-cpp-server --model ~/.whisper/ggml-base.en.bin --port 8000
    ```
  - **Option B (faster-whisper-server via Python / pip)**:
    ```bash
    pip install faster-whisper-server
    faster-whisper-server --port 8000 --model base.en
    ```
- **Privacy & Storage**: Audio recorded via the browser `MediaRecorder` is processed entirely on the local machine. No raw audio files are stored permanently in PostgreSQL or written to cloud disks.

### 3.3 Text-to-Speech (TTS) via Piper

- **Runtime**: Local [Piper](https://github.com/rhasspy/piper) neural text-to-speech HTTP server.
- **Provider Abstraction**: Implemented via `TextToSpeechProvider` interface with a provider factory (`createTextToSpeechProvider`).
  - **`PiperTextToSpeechProvider`**: Connects to local Piper HTTP instance (`POST /` or `GET /?text=...`) returning standard WAV audio streams with timeout enforcement and clean error mapping.
  - **`MockTextToSpeechProvider`**: Deterministic offline mock generating valid RIFF/WAVE PCM audio for automated CI testing and offline development.
- **API Endpoint**: `POST /api/tts/synthesize` accepting `{ "text": "..." }` and streaming binary WAV audio (`Content-Type: audio/wav`).
- **Configuration Parameters**:
  - `TTS_PROVIDER`: `piper` or `mock`
  - `PIPER_BASE_URL`: Base HTTP URL (default: `http://localhost:5001`)
  - `PIPER_MODEL`: Target voice model (default: `en_US-lessac-medium`, configurable)
  - `PIPER_TIMEOUT_MS`: Inference timeout in ms (default: `30000`)
- **Frontend Playback & Caching**:
  - Conversational responses from Ollama trigger background speech synthesis.
  - In-memory `audioCacheRef` caches object URLs per utterance within the active browser session, preventing redundant synthesis when the user replays or pauses audio.
  - The speaker button toggles play/stop/resume seamlessly.
  - Autoplay restrictions or Piper unavailability do not block or interrupt the text conversation.
- **Recommended Local Piper Setup (When User is Ready)**:
  - **Option A (Python Piper HTTP Server)**:
    ```bash
    # Install piper-tts via pip
    pip install piper-tts

    # Download voice model and start the HTTP server on port 5001
    python3 -m piper.http_server --model en_US-lessac-medium --port 5001
    ```
  - **Option B (Wyoming Piper Docker / Microservice)**:
    ```bash
    docker run -it -p 5001:5000 rhasspy/wyoming-piper --voice en_US-lessac-medium
    ```
- **Privacy & Storage**: Synthesized audio is streamed directly to the browser and held temporarily in memory. No audio files are written to disk or PostgreSQL.

### 3.4 Future Research: Browser-Native / Hybrid Models

- Investigation of browser-native WebAssembly / WebGPU models (e.g., `Transformers.js`, `WebLLM`, `whisper.wasm`) to enable pure client-side transcription and inference on high-end hardware without requiring a local server daemon.

---

## 4. Analytical Extraction Pipeline

Post-session analysis follows a structured four-stage evaluation pipeline:

```
[Full Session Transcript + Telemetry]
                  │
                  ▼
         [Stage 1: Strength Scan]
(Identify fluent passages, rich vocabulary, good narrative turns)
                  │
                  ▼
        [Stage 2: Error Identification]
(Extract grammatical slips, unnatural collocations, repetitive phrasing)
                  │
                  ▼
         [Stage 3: Pattern Filtering]
(Cross-reference with Learner Profile to separate one-off slips from recurring habits)
                  │
                  ▼
       [Stage 4: JSON Synthesis]
(Select top 2–4 actionable takeaways and generate "Try Again" targets)
```

### Extraction Schema (Concept)

```json
{
  "strengths": [
    "Sustained 6 conversational turns without hesitation",
    "Effective use of descriptive adjectives ('fascinating', 'complex')"
  ],
  "feedbackItems": [
    {
      "category": "grammar",
      "subCategory": "past_tense_auxiliary",
      "userSpoke": "I didn't went there yesterday.",
      "suggested": "I didn't go there yesterday.",
      "explanation": "When using 'didn't', the following verb remains in its base form.",
      "tryAgainPrompt": "I didn't go there yesterday.",
      "priorityScore": 0.85
    }
  ],
  "vocabularyUpgrades": [
    {
      "originalWord": "very good",
      "frequency": 4,
      "suggestedAlternatives": ["impressive", "remarkable", "outstanding"]
    }
  ]
}
```

---

## 5. Guardrails & Quality Controls

- **Low False-Positive Threshold**: The coaching engine is instructed never to hallucinate errors on colloquial expressions or regional variants that are standard in native spoken English.
- **Tone Safety**: Corrections must always maintain supportive, constructive phrasing.
- **Fail-Safe Processing**: If transcription confidence is low or background noise obscures meaning, the model flags the segment as ambiguous rather than penalizing the user.
