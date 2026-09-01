# Learner Profile & Pattern Detection: AI English Coach

## 1. Overview & Learning Loop

The defining innovation of AI English Coach is its **longitudinal memory system**:

> **Conversation → Analysis → Evidence → Learner Profile Update → Pattern Detection → Personalization → Future Practice**

Rather than treating every speaking session as an isolated, forgetful event, the application continuously builds a rich, structured profile of the learner's habits, strengths, trouble areas, and long-term trajectory.

---

## 2. Learner Profile Components

A user's profile consists of the following structured data domains:

```
┌─────────────────────────────────────────────────────────────┐
│                       LEARNER PROFILE                       │
├──────────────────────────────┬──────────────────────────────┤
│ 1. Competency Baseline       │ 2. Learning Goals            │
│    • Current level (A2–C1)   │    • Workplace fluency       │
│    • Speaking confidence     │    • Interview preparation   │
│    • Total speaking time     │    • Everyday casual speech  │
├──────────────────────────────┼──────────────────────────────┤
│ 3. Pattern State Machine     │ 4. Vocabulary Bank           │
│    • Active weaknesses       │    • Overused terms          │
│    • Improving patterns      │    • Successfully adopted    │
│    • Mastered patterns       │    • Target idioms & phrases │
├──────────────────────────────┼──────────────────────────────┤
│ 5. Fluency Telemetry Log     │ 6. Current Priorities        │
│    • Words per minute (WPM)  │    • Top 2–3 active focus    │
│    • Pause frequency & length│      areas for practice      │
│    • Filler-word trends      │    • Scheduled rotation      │
└──────────────────────────────┴──────────────────────────────┘
```

---

## 3. Pattern Detection State Machine

A core design rule of AI English Coach is:

> **"A single mistake is not a pattern."**

Learners frequently make accidental slips due to fatigue, distraction, or speaking speed. Treating every isolated slip as a major linguistic weakness damages morale and leads to counterproductive drilling.

The Pattern Detection Engine uses an evidence-based state machine with 5 stages:

```
                  ┌───────────────────────┐
                  │   ONE-TIME MISTAKE    │
                  │ (1 occurrence, log it)│
                  └───────────┬───────────┘
                              │
               Repeated in    │
             another session  ▼
                  ┌───────────────────────┐
                  │    POSSIBLE PATTERN   │
                  │(2 occurrences recorded)
                  └───────────┬───────────┘
                              │
              3+ occurrences  │
             across sessions  ▼
                  ┌───────────────────────┐
                  │  CONFIRMED WEAKNESS   │
                  │(High priority practice│
                  └───────────┬───────────┘
                              │
               Correct usage  │
             observed in chat ▼
                  ┌───────────────────────┐
                  │   IMPROVING PATTERN   │
                  │(Gradual reinforcement)│
                  └───────────┬───────────┘
                              │
             5+ consistent    │
             correct usages   ▼
                  ┌───────────────────────┐
                  │   MASTERED PATTERN    │
                  │ (Retired from drills) │
                  └───────────────────────┘
```

### 3.1 Pattern Life Cycle Stages

1. **One-Time Mistake**:
   - Encountered once in a session (e.g., _"I didn't went"_).
   - Logged quietly in session telemetry, but not classified as a profile weakness.
   - May be addressed in immediate post-session feedback if high priority, but will not steer future sessions alone.

2. **Possible Pattern**:
   - The same underlying grammatical or structural error appears in a second session (e.g., _"I didn't knew"_).
   - Flagged for observation in subsequent conversations.

3. **Confirmed Recurring Weakness**:
   - The error occurs across 3 or more independent sessions (e.g., _"I didn't went"_, _"I didn't knew"_, _"I didn't saw"_).
   - System registers high confidence that the learner has an unmastered rule (e.g., _past-tense auxiliary verb construction_).
   - Elevated to **Active Learning Priority**.

4. **Improving Pattern**:
   - The user begins correctly applying the rule in spontaneous conversation (e.g., _"I didn't go"_, _"I didn't see"_).
   - The system tracks the ratio of correct to incorrect usages over recent sessions.

5. **Mastered Pattern**:
   - The user consistently applies the correct structure across 5+ consecutive opportunities with zero regression.
   - **De-prioritization Rule**: The system deliberately stops creating practice prompts for this rule. Mastered concepts are retired to prevent repetitive boredom.

---

## 4. Personalization Engine

The Personalization Engine determines what topics and contexts the AI will generate for future conversations:

```
┌─────────────────────────────────────────────────────────────┐
│                    PERSONALIZATION ENGINE                   │
├─────────────────────────────────────────────────────────────┤
│ INPUTS:                                                     │
│ • Active Weakness Patterns     • User Learning Goals        │
│ • Demonstrated Strengths       • Recent Practice History    │
│ • Topic Variety / Freshness    • User Engagement / Mood     │
│                                                             │
│ PROCESSING:                                                 │
│ Contextual Alignment (Select scenarios that naturally       │
│ require target grammatical structures or vocabulary)        │
│                                                             │
│ OUTPUT:                                                     │
│ Tailored Conversation Prompts / Scenarios                   │
└─────────────────────────────────────────────────────────────┘
```

### 4.1 Contextual Learning vs. Grammar Worksheets

AI English Coach rejects the notion of presenting mechanical grammar fill-in-the-blank worksheets. Instead, it practices **contextual immersion**:

- **Weakness**: Learner struggles with irregular past-tense verbs after _"didn't"_.
- **Ineffective Approach**: Displaying a list of 20 sentences to correct.
- **Contextual Approach**: Generating a friendly storytelling conversation mode:
  - Prompt: _"Tell me about a vacation or trip where things didn't go according to plan."_
  - The topic naturally prompts past-tense storytelling and negative auxiliary constructions (_"We didn't catch the train"_, _"I didn't think about the weather"_).
  - The user acquires correct habits through natural, spoken application.

### 4.2 Variety & Engagement Safeguards

- **Fatigue Protection**: Never target the same weakness in more than two consecutive sessions.
- **Interest Balancing**: Interleave structured weakness-targeting scenarios with relaxed, freeform interest topics (movies, travel, daily life).
- **Positive Reinforcement**: Deliberately create opportunities for the user to practice their demonstrated strengths, sustaining conversational confidence.
