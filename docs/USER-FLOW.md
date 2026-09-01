# User Flow & Experience: AI English Coach

## 1. Overview

The user experience in AI English Coach is intentionally low-friction, welcoming, and anxiety-free. The interface is organized to maximize speaking time and eliminate the psychological barrier of oral assessment.

---

## 2. Core V1 User Journey

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   1. Welcome    │  ───> │  2. Mode Select │  ───> │   3. Speaking   │
│ & Mic Check     │       │   (or Freeform) │       │   (Voice First) │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
                                                             ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  6. Post-Session│  <─── │   5. Conclude   │  <─── │ 4. AI Response  │
│  Feedback (Coach│       │    Session      │       │   (The Friend)  │
└────────┬────────┘       └─────────────────┘       └─────────────────┘
         │
         ▼
┌─────────────────┐
│  7. Try Again   │
│ (Active Retry)  │
└─────────────────┘
```

### Step 1: Entry & Audio Setup

- The user lands on the clean, distraction-free home interface.
- If first visit, a simple one-click prompt checks microphone access with clear privacy assurances.
- An intuitive visual indicator confirms that audio input is active and ready.

### Step 2: Mode Selection or Instant Start

- The user can click **"Start Conversation"** to begin immediately in unstructured mode.
- Alternatively, the user can select one of the curated scenario modes (e.g., _Job Interview_, _Travel_, _Workplace_, _Casual Chat_).
- The AI opens with a friendly, contextual greeting suited to the chosen scenario.

### Step 3: Speaking (Voice-First Experience)

- The user holds or toggles the microphone button and speaks naturally.
- A subtle, organic wave animation indicates active listening without distracting timer pressure.
- **Zero Interruptions**: The AI will never speak over the user or cut in to correct grammar while the user is talking.
- If preferred, the user can type in the chat input (text fallback).

### Step 4: AI Turn (The Friend)

- When the user finishes speaking, the audio is processed by the local Speech-to-Text engine.
- The AI responds in its **Friend persona**:
  - Response length is balanced (typically 1–3 conversational sentences).
  - Tone is warm, curious, and supportive.
  - Asks a relevant follow-up question or shares an anecdote to keep the user talking.
- The response is voiced via the local Text-to-Speech engine while text appears in sync.

### Step 5: Continuing the Dialogue

- The back-and-forth conversational rhythm continues naturally for as many turns as the user desires.
- No artificial turn counters or time cutoffs are imposed.

### Step 6: Concluding the Session

- When the user is ready, they click **"End Conversation"** (or say goodbye).
- The application transitions smoothly from **Conversation Mode** into **Coaching Mode**.

### Step 7: Post-Session Coaching Review

- The user is presented with a structured, digestible feedback card:
  1. **Celebrated Strengths**: Highlighting conversational stamina, expressive vocabulary, or good narrative flow.
  2. **Top 2–4 Actionable Takeaways**:
     - Specific sentence spoken by the user.
     - Clear, natural alternative.
     - Plain-English explanation of the underlying grammar or vocabulary nuance.
  3. **Naturalness Upgrades**: Alternative idioms or more natural native phrasings.

### Step 8: Interactive "Try Again"

- For any grammar or phrasing feedback item, the user can click **"Try Again"**.
- A focused mini-recorder opens. The user re-speaks the corrected sentence.
- The system verifies the retry, confirms accuracy, and records positive reinforcement.

---

## 3. Daily Speaking Challenge Flow (Later Phase)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Daily Prompt   │  ───> │ Prep Countdown  │  ───> │ Sustained Speech│
│    Revealed     │       │   (60–90 sec)   │       │   (~2 minutes)  │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
                                                             ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Compare Takes   │  <─── │ Profile Update  │  <─── │ Multi-Dimension │
│   & Progress    │       │  & Prioritizer  │       │  Coach Review   │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **Prompt Delivery**: The user opens the daily challenge. A tailored prompt is displayed with 2–3 thought-starter prompts.
2. **Preparation Phase**: A 60-to-90-second preparation countdown allows the user to gather their thoughts without speaking.
3. **Continuous Speech**: The user records their response aiming for approximately 2 minutes of continuous talking.
   - The AI remains completely silent throughout.
   - Progress bar visually indicates approaching the 2-minute milestone.
   - If the user finishes early (e.g., at 45 seconds), they can end voluntarily and receive encouraging validation.
4. **Comprehensive Evaluation**: Fluency, pause duration, vocabulary range, and grammatical consistency are scored.
5. **Profile Integration**: Observations feed directly into the learner profile.
6. **Optional Second Take**: The user may re-record the challenge immediately to compare hesitation frequency and fluency metrics.

---

## 4. Privacy & Data Management Flow

1. **Viewing History**: Users can view past conversation transcripts and feedback summaries in their history log.
2. **Transcript Retention Toggle**: Users can choose between:
   - _Full history_: Saves audio telemetry and transcripts for longitudinal tracking.
   - _Private session_: Deletes transcript immediately upon session exit while retaining anonymized profile metrics.
   - _Ephemeral mode_: Leaves zero stored data on disk.
3. **Data Purge & Export**:
   - One-click export of complete learner profile and transcripts to a JSON bundle.
   - One-click "Reset All Data" that wipes all local database records and profile logs.

---

## 5. Edge Cases & Resilience

- **Microphone Access Denied**: Graceful banner explains how to enable permissions in browser settings, with seamless fallback to text-based interaction.
- **Unintelligible Audio / Heavy Background Noise**: The Friend responds conversationally (_"I didn't quite catch that over the background noise—could you say that again?"_) rather than throwing a technical error.
- **Extended Silence**: If no audio is detected for 15 seconds during a user turn, the interface gently prompts the user without abruptly ending the session.
- **Local AI Daemon Unreachable**: Clear status toast indicates if the local inference engine (e.g., Ollama) is stopped, providing a friendly troubleshooting guide.
