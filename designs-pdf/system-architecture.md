# Interview Copilot — Technical Design Document

## Overview

Real-time interview coaching system that listens to live interviews via speech-to-text, classifies conversation intent, and generates contextual guidance cards. Supports three interview modes: System Design, Behavioral, and Coding.

---

## Architecture

```
┌─────────────┐     WebSocket      ┌──────────────┐     WebSocket     ┌─────────────┐
│   Browser    │ ◄───────────────► │   Server.js   │ ◄──────────────► │  Deepgram    │
│  (Frontend)  │     HTTP/SSE      │  (Node/Express)│     REST API    │  (STT)       │
└─────────────┘                    └──────────────┘                   └─────────────┘
                                         │  │
                                    REST │  │ REST
                                         ▼  ▼
                                   ┌──────────────┐
                                   │  Gemini 2.5   │  ← Classification (cheap, fast)
                                   │  Flash        │
                                   └──────────────┘
                                   ┌──────────────┐
                                   │  Claude       │  ← Answer generation (quality)
                                   │  Sonnet 4     │
                                   └──────────────┘
```

## Speech-to-Text Layer

Two engines available, selected via URL parameter `?speech=deepgram`:

| Feature | Browser API | Deepgram Nova-3 |
|---------|------------|-----------------|
| Cost | Free | ~$0.36/hour |
| Device support | Chrome/Edge desktop only | All browsers/devices |
| Accuracy (accented speech) | Poor | Better (with keyword boosting) |
| Speaker diarization | No | Yes |
| Chunking control | Uncontrollable | Configurable (utterance_end_ms, endpointing) |

### Deepgram Configuration
- Model: `nova-3`
- Encoding: `linear16`, 16kHz, mono
- Features: smart_format, punctuate, diarize, VAD events
- Utterance end: 3000ms
- Keyword boosting: ~80 domain terms across behavioral, system design, and coding vocabulary (boost 1.0–1.5)

### Keyword Boosting Categories
- **Interview frameworks**: STAR, CARL, SOAR, OKRs, KPIs, DORA, RACI (1.5)
- **Management terms**: high performing, cross-functional, stakeholder, skip-level, psychological safety (1.5)
- **System design**: sharding, CAP theorem, load balancer, consistent hashing, Kafka, Redis (1.5)
- **Coding**: binary search, dynamic programming, sliding window, two pointer, memoization (1.5)

---

## AI Model Strategy

### Hybrid Architecture
| Task | Model | Rationale |
|------|-------|-----------|
| Classification (all 3 modes) | Gemini 2.5 Flash | ~$0.015/session, <1s response, thinking disabled |
| Answer generation | Claude Sonnet 4 | Higher quality writing, streaming |
| Fallback classification | Claude Sonnet 4 | When Gemini key unavailable |

### Cost Per Session (~45 min interview)
| Component | Cost |
|-----------|------|
| Gemini classification | ~$0.04 |
| Claude answers | ~$0.48 |
| Deepgram STT | ~$0.36 |
| **Total** | **~$0.88/hour** |

---

## System Design Mode

### Two-Stage Classification Pipeline

**Job 1 — Fast Classifier** (every speech chunk)
- Model: Gemini 2.5 Flash, thinking disabled
- Max output: 200 tokens
- Latency: <1 second
- Actions: `question`, `follow_up`, `design_challenge`, `answering`, `struggling`, `none`
- Also detects: phase transitions, topic labels, main question inference
- Returns immediately to frontend

**Job 2 — Content Analyzer** (async, non-blocking)
- Model: Gemini 2.5 Flash
- Max output: 500 tokens
- Triggers: questions, follow-ups, challenges, phase changes, clarification phase
- Extracts: new requirements (FR/NFR), contextual suggestions, pitfalls, topics covered
- Pushes results via SSE — does not block Job 1 response

### Server-Sent Events (SSE)
| Event | Payload | Trigger |
|-------|---------|---------|
| `phase_change` | `{phase, previousPhase}` | Phase transition detected |
| `requirements_update` | `{functional[], non_functional[], version}` | New requirements extracted |
| `suggestion` | `{text, topic}` | Contextual suggestion (max 1 per 2 min) |
| `pitfall` | `{warning, topic}` | Design weakness detected (max 1 per 3 min) |

### Design Flow
```
Requirements (FR + NFR)
    → Core Entities / Data Model
    → API / Interface / Data Flow
    → High-Level Design
    → Deep Dives
```

### Phase Detection
- `clarification` — scope questions, requirements gathering
- `entities` — listing entities, fields, data model
- `api_design` — defining endpoints, data flow
- `high_level_design` — drawing components, architecture
- `deep_dive` — specific component internals, scaling, failure handling
- `wrap_up` — feedback, interview ending

### Rate Limiting
| Card Type | Minimum Gap |
|-----------|------------|
| Follow-up | 3 minutes |
| Design challenge | 3 minutes |
| Pitfall | 3 minutes |
| Suggestion (coach bar) | 2 minutes |
| New question | No limit |

### Requirements Accumulator
- Server-side state: `conversationState.requirements`
- Versioned (increments on each update)
- Deduplication via substring matching
- Pushed to frontend via SSE, updates existing card in place

### Design References (designs.js)
Pre-built reference data for ~10 common system designs (Dropbox, Ticketmaster, GoPuff, etc.):
- Keywords for auto-matching
- FR/NFR lists
- Entity definitions
- API endpoints
- HLD diagrams (Mermaid)
- Deep-dive topics with diagrams

---

## Behavioral Mode

### Classification
- Model: Gemini 2.5 Flash (with Claude fallback)
- Max output: 4000 tokens (to handle thinking overhead)
- Thinking disabled via `thinkingBudget: 0`
- Intent types: `past_experience`, `philosophy`, `concept`, `personal`, `probe`, `setup`, `none`
- Framework matching: 6 frameworks (high-performing-teams, management-style, scaling-org, stakeholder-management, technical-strategy, conflict-resolution)

### Story Bank (behavioral-stories.js)
- ~10 CARL-structured stories (Kafka OOM, Terraform Golden Path, Cloud Migration, etc.)
- Each story has: situation, context, actions, results, learnings
- Probes: follow-up questions with prepared answers
- Signal tags: driving-results, handling-ambiguity, conflict-resolution, etc.

### Duplicate Detection
- Word overlap function with stemming and stop words
- 40% similarity threshold
- Prevents re-firing the same question

### Speech Chunking (Deepgram)
- Minimum flush: 35 words (vs 8 for browser API)
- Rolling timer: 40 seconds
- Silence threshold: 3500ms

---

## Coding Mode

### Pattern Detection
6 algorithm patterns with multi-level optimization:
- hash-map, two-pointers, sliding-window, binary-search, DFS/BFS, dynamic-programming

Each pattern has:
- Keywords for auto-matching
- Brute-force → optimized progression levels
- Java code templates per level
- Complexity analysis (time + space)
- Walkthrough points

### Actions
- `problem_detected` — extract problem statement, match pattern
- `approach` — candidate discussing approach
- `optimize` — interviewer pushes for better solution
- `hint` — candidate is stuck
- `candidate_coding` — actively writing code

---

## Frontend Architecture

### System Design (index.html)
- **Card feed**: question, follow-up, challenge, hint, pitfall, topic-gap, flow-step cards
- **Phase badge**: real-time phase indicator via SSE
- **Requirements card**: updates in place via SSE
- **Coach bar**: suggestions, keyboard shortcuts (M=more, H=hint, T=tradeoffs, N=next, E=estimate)
- **Transcript bar**: live speech with interim highlighting
- **Debug panel**: test analyzer, logs, tuning controls
- **Mermaid diagrams**: ER, sequence, architecture diagrams rendered in cards

### Behavioral (behavioral.html)
- **Prep mode**: question browser by domain, practice assignments
- **Live mode**: CARL cards, framework cards, follow-up detection
- **Dual speech engine**: browser API or Deepgram via URL parameter

### Coding (coding.html)
- **Pattern badge**: current algorithm pattern
- **Level progression**: visual dots showing optimization level
- **Code cards**: Java templates with complexity analysis

---

## Server Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analyze` | POST | System design classification (two-stage) |
| `/api/answer` | POST | Streaming answer generation (Claude) |
| `/api/coach` | POST | Keyboard-triggered coaching |
| `/api/events` | GET | SSE stream for real-time updates |
| `/api/state` | GET | Current conversation state |
| `/api/reset` | POST | Reset conversation state |
| `/api/behavioral/analyze` | POST | Behavioral intent classification |
| `/api/behavioral/answer` | POST | Behavioral answer generation |
| `/api/behavioral/data` | GET | Story bank data |
| `/api/behavioral/help` | POST | Depth-aware coaching |
| `/api/coding/analyze` | POST | Coding pattern classification |
| `/api/coding/answer` | POST | Coding answer generation |
| `/api/coding/reset` | POST | Reset coding state |
| `/ws/deepgram` | WS | Deepgram speech proxy |
| `/api/log` | POST | Client-side log aggregation |

---

## Key Design Decisions

1. **Gemini for classification, Claude for answers** — 30x cost reduction on high-volume classification with no quality loss. Claude reserved for low-volume, high-quality answer generation.

2. **Two-stage pipeline** — Fast classifier returns instantly for UI responsiveness. Content analyzer runs async for enrichment without blocking.

3. **SSE over WebSocket for state push** — Simpler than a full WebSocket for one-way server→client updates. WebSocket reserved for Deepgram audio streaming.

4. **Keyword boosting over post-processing** — Fixing transcription at the source (Deepgram) is more reliable than trying to correct garbled text after the fact.

5. **Rate limiting at the frontend** — 3-minute minimum gap between cards prevents information overload during a live interview. Server detects everything; frontend decides what to show.

6. **Requirements accumulation** — Server maintains a running requirements object that deduplicates and versions. Frontend updates the existing card in place rather than creating new cards.

---

## Files

| File | Purpose |
|------|---------|
| `server.js` | Express server, all API endpoints, AI integrations, state management |
| `public/index.html` | System design frontend |
| `public/behavioral.html` | Behavioral interview frontend |
| `public/coding.html` | Coding interview frontend |
| `designs.js` | System design reference data (entities, APIs, HLD diagrams) |
| `behavioral-stories.js` | CARL stories, frameworks, signal definitions |
| `coding-patterns.js` | Algorithm patterns, Java templates, complexity references |
| `detection.js` | Question extraction, filler detection utilities |
| `.env` | API keys (Anthropic, Deepgram, Gemini) |
