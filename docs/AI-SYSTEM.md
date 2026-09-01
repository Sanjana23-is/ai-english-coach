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

- **Runtime**: Local [Whisper](https://github.com/openai/whisper) (or `whisper.cpp` optimized for CPU/Metal).
- **Models**:
  - `whisper-base.en` / `whisper-small.en`: High accuracy, sub-second transcription latency for English speech on consumer hardware.
- **Telemetry Extraction**: In addition to text transcripts, timestamped tokens allow extraction of pause lengths and silence durations.

### 3.3 Text-to-Speech (TTS) via Piper

- **Runtime**: Local [Piper](https://github.com/rhasspy/piper).
- **Attributes**: Fast neural speech synthesis capable of generating natural voice audio in real time on standard consumer CPUs without requiring discrete GPU acceleration.
- **Voices**: Curated warm, clear, and natural English voices (US/UK accents).

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
