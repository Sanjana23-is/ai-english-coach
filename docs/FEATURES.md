# Features Specification: AI English Coach

## 1. Feature Matrix Overview

| Feature Area                 | Description                                                  | Target Phase | Status    |
| ---------------------------- | ------------------------------------------------------------ | ------------ | --------- |
| **Unstructured Chat**        | Freeform dialogue without predefined constraints             | V1           | Specified |
| **Structured Modes**         | 10 thematic scenario modes (Interview, Travel, etc.)         | V1           | Specified |
| **Voice-First Loop**         | Mic capture → STT → LLM → TTS → Audio playback               | V1           | Specified |
| **Text Fallback Chat**       | Keyboard input and text display for accessibility            | V1           | Specified |
| **Post-Session Feedback**    | Coach review highlighting top 2–4 actionable points          | V1           | Specified |
| **"Try Again" Retry**        | Interactive re-speech of corrected sentences                 | V1           | Specified |
| **Learner Profile**          | Persistent tracking of habits, strengths, and weaknesses     | Phase 2+     | Planned   |
| **Pattern Detection**        | State machine distinguishing slips from habits               | Phase 2+     | Planned   |
| **Personalization Engine**   | Contextual topic steering based on profile priorities        | Phase 3+     | Planned   |
| **Daily Speaking Challenge** | Daily topic prompt with prep time and ~2-min speech          | Phase 4+     | Planned   |
| **Pronunciation Telemetry**  | Acoustic phoneme assessment via local models                 | Future       | Research  |
| **Privacy Data Manager**     | Full transcript export, deletion, and local storage controls | V1 / Phase 2 | Specified |

---

## 2. Conversation System

### 2.1 Overview & Behavior

The conversation engine creates a realistic, low-stress speaking environment. The AI acts as **The Friend**:

- Listens without interrupting the user mid-sentence.
- Responds conversationally in 1–3 concise sentences to keep the floor open for the user.
- Employs open-ended follow-up questions to invite further speaking.
- Automatically adjusts sentence complexity and vocabulary to the user's inferred competency level.

### 2.2 Conversation Modes

Users can jump into immediate freeform chat or pick a guided context:

1. **Casual Chat**: Everyday friendly banter, hobbies, weekend plans, movies, and casual thoughts.
2. **Job Interview**: Behavioral, competency, and background questions simulating real-world job interviews.
3. **Workplace**: Professional collaboration, project syncs, client communications, and negotiation scenarios.
4. **Academic**: Discussing research, university seminars, academic papers, and analytical debates.
5. **Travel**: Booking accommodations, asking for transit directions, dining out, and navigating customs.
6. **Daily Life**: Practical errands, doctor visits, ordering coffee, returning items to a store, resolving utility issues.
7. **Roleplay**: Creative situational scenarios (e.g., advising a friend on a dilemma, resolving an office misunderstanding).
8. **Debate**: Exploring two sides of a controversial topic, challenging assumptions respectfully.
9. **Presentation Practice**: Pitching an idea, presenting a project summary, or practicing an opening speech.
10. **Surprise Me**: System-selected random prompt from any category with an engaging opening hook.
11. **Unstructured Mode (Default)**: Immediate open dialogue without any predefined theme or scenario frame.

---

## 3. English Analysis Engine

The analysis engine evaluates spoken output **after** the conversation completes. It examines five core linguistic dimensions:

```
┌─────────────────────────────────────────────────────────────┐
│                   ENGLISH ANALYSIS ENGINE                   │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ 1. Grammar   │ 2. Vocabulary│ 3. Fluency   │ 4. Comm.       │
├──────────────┼──────────────┼──────────────┼────────────────┤
│ • Tenses     │ • Range      │ • Duration   │ • Idea clarity │
│ • Articles   │ • Repetition │ • Pause freq │ • Storytelling │
│ • Preposition│ • Naturalness│ • Fillers    │ • Circumlocut. │
│ • Agreement  │ • Upgrades   │ • Flow rate  │ • Turn-taking  │
└──────────────┴──────────────┴──────────────┴────────────────┘
        (5. Pronunciation — Deferred to Future Phases)
```

### 3.1 Grammar Analysis

- **Verb Tenses & Consistency**: Inspects tense shifts (e.g., past narrative switching improperly to present).
- **Articles & Quantifiers**: Correct placement of _a_, _an_, _the_, and zero article.
- **Prepositions**: Common prepositional mismatches (e.g., _"interested for"_ vs. _"interested in"_).
- **Subject-Verb Agreement**: Singular/plural alignment (e.g., _"she have"_ vs. _"she has"_).
- **Word Order & Syntax**: Natural English clause structure (S-V-O) and indirect question order.

### 3.2 Vocabulary Analysis

- **Range & Repetition**: Tracks overused generic adjectives and adverbs (e.g., relying excessively on _"very good"_ or _"nice"_).
- **Natural Phrasing (Collocations)**: Distinguishes between grammatically possible phrases and natural native idioms (e.g., _"make a decision"_ vs. _"do a decision"_).
- **Vocabulary Upgrades**: Recommends 1–2 elevated or context-appropriate synonyms based on the conversation topic.

### 3.3 Fluency Telemetry

- **Speech Duration & Response Length**: Measures spoken word count per turn and overall session duration.
- **Hesitation & Pauses**: Identifies prolonged silences (>2.5 seconds) within sentences indicating word retrieval friction.
- **Filler Word Usage**: Observes frequencies of _"um"_, _"uh"_, _"like"_, and repetitive stalling phrases.
- **Self-Corrections**: Recognizes positive learner self-monitoring (e.g., _"I went—I mean, I will go"_).

### 3.4 Communication & Coherence

- **Circumlocution**: Ability to explain an idea when the exact vocabulary word is missing.
- **Storytelling & Structure**: Logical flow of ideas (beginning, middle, resolution).
- **Expressing Nuanced Opinions**: Providing reasons and justifications rather than simple yes/no responses.

### 3.5 Pronunciation (Post-V1 / Future Exploration)

- Acoustic phoneme recognition and stress patterns are deferred. V1 focuses strictly on transcription and linguistic structure.

---

## 4. Post-Session Feedback System

### 4.1 Guiding Principles

- **Selective & Prioritized**: Presents only the top 2–4 highest-impact points per session. Never dumps an exhaustive red-pen list of every slip.
- **Positive Reinforcement**: Always leads with observed strengths (e.g., _"Great use of conditional structures when discussing the hypothetical scenario!"_).
- **Actionable & Clear**: Pairs every identified improvement area with a plain-English explanation and a side-by-side comparison.

### 4.2 Feedback Structure

```markdown
### 🌟 Highlights & Strengths

- You sustained the conversation for 8 turns and spoke fluently about your project!
- Excellent use of descriptive vocabulary: "intricate", "demanding".

### 💡 Top Improvement Areas

1. **Grammar: Past Tense after "didn't"**
   - You said: _"I didn't went to the meeting."_
   - Better: _"I didn't go to the meeting."_
   - Why: When using the auxiliary "did/didn't", the main verb stays in its base form.
   - [Try Again Button]

2. **Natural Expression**
   - You said: _"I made a big decision of my life."_
   - More Natural: _"I made a major life decision."_
```

---

## 5. "Try Again" Interactive Retry

The "Try Again" feature transforms static feedback into active kinesthetic learning:

1. Beneath an identified correction, the user clicks **"Try Again"**.
2. The user sees the target sentence or a prompt to rephrase their thought.
3. The user activates their microphone and speaks the corrected sentence.
4. The system transcribes the speech in real-time and evaluates the new attempt:
   - **Accurate retry**: Congratulates the user and marks immediate reinforcement in session telemetry.
   - **Partial retry**: Highlights the remaining discrepancy without judgment and invites one more try.
5. The comparison data is archived to document recovery from errors.

---

## 6. Daily Speaking Challenge (Later Phase)

### 6.1 Purpose

A focused, once-a-day challenge that encourages continuous, sustained speaking without the conversational back-and-forth.

### 6.2 Mechanics

1. **Topic Presentation**: The user receives a single engaging prompt (e.g., _"Describe a memorable trip and what it taught you about yourself."_).
2. **Preparation Timer (1–2 minutes)**: The user is given silent preparation time with optional brainstorming bullet points.
3. **Continuous Speech Target (~2 minutes)**:
   - The user records their response continuously.
   - The AI remains completely silent; there are zero interruptions.
4. **Non-Judgmental Encouragement**:
   - The 2-minute goal is an aspirational target, not a pass/fail barrier.
   - If a learner speaks for 45 seconds, the system offers positive encouragement (_"Great start! You spoke clearly for 45 seconds. With practice, you'll comfortably stretch your stories longer."_).
5. **Challenge Review**: Deep analysis of structure, fluency, vocabulary range, and recurring patterns, updating the learner profile.
6. **Retry & Version Comparison**: Users can record a second take to observe direct improvements in fluency and pause reduction.

---

## 7. Topic Generation Engine

The system generates dynamic, context-aware speaking prompts rather than picking from a static list:

- **Balanced Randomness**: Injects novel, thought-provoking scenarios to prevent conversational fatigue.
- **Competency Progression**: Calibrates prompt complexity to user ability (simple factual descriptions for beginners; abstract ethical/analytical scenarios for advanced speakers).
- **Profile Alignment**: Seamlessly weaves active learning priorities into topics (e.g., if the user needs past tense practice, topics focus on autobiographical experiences or past problem-solving).
- **Interest Matching**: Prioritizes topics related to user-declared hobbies, profession, or travel aspirations.

---

## 8. Privacy & Data Control

Learner speech and transcripts contain personal and professional disclosures. Privacy is a core requirement:

- **Local Storage Preference**: Transcripts and learner profiles remain stored locally on the user's system by default.
- **Transcript Management**: Users can toggle session recording on or off, clear conversation history, or delete specific sessions at any time.
- **Profile Reset & Export**: One-click export of progress history and learner profile data in standard JSON format, or permanent full-data deletion.
- **Zero Third-Party Training**: User voice and transcript data are never forwarded to external cloud providers for AI model training.
