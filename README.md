# Fanthom AI — Executive Meeting Intelligence & Conversation Ledger

> A high-signal, editorial meeting intelligence workspace and pre-meeting briefing engine inspired by modern executive productivity workflows.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff.svg)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Submission-Ready-emerald.svg)]()

---

## 1. What is Fanthom AI?

**Fanthom AI** is an editorial meeting workspace and conversational knowledge base designed to make meeting discussions genuinely searchable, navigable, and actionable.

While inspired by tools like Fathom, Fanthom AI avoids the generic, neon-accented "AI SaaS dashboard" paradigm. Instead, it adopts the visual hierarchy of an **executive research and editorial productivity tool**:
* Content over chrome
* Typography and whitespace over nested card boxes
* Hairline dividers over heavy borders
* Restrained charcoal palette over rainbow gradients
* Zero decorative AI badges or sparkle clichés

---

## 2. Key Differentiator: Pre-Meeting Briefs

Most meeting notetakers only provide value *after* a call concludes. Fanthom AI introduces **Pre-Meeting Intelligence Briefs** to answer the critical question:

> *"What do I need to know before I walk into this meeting?"*

For upcoming meetings, Fanthom automatically synthesizes context carried forward from prior syncs:
* **Participants & Executive Roles**: Who is attending, their department, and their stake in the agenda.
* **Carried-Over Commitments**: Action items assigned in previous discussions that remain open or pending review.
* **Prior Agreed Decisions**: Key decisions and RFCs established in predecessor meetings with instant source traceability back to the exact second in the original transcript.
* **Unresolved Questions & Friction Points**: Blockers flagged previously that require alignment today.
* **Interactive Talking Points**: A dynamic checklist for the user to prep agenda items or log custom notes.

---

## 3. Core Workflows

1. **Meeting Library & Upcoming Sync**:
   * An editorial library organized by upcoming sessions requiring prep and recent completed conversations.
   * Instant category filtering (`Architecture`, `Sales`, `Engineering`, `1:1 Reviews`) and one-click filtering for `"My Open Tasks Only"`.

2. **Editorial Meeting Workspace**:
   * **The Transcript as Centerpiece**: Turns rendered in a clean typographic layout with timestamps (`00:25`), speaker names, and generous vertical rhythm.
   * **Active Playback Tracking**: Hairline left border indicator synchronizing live speech with timeline playback.
   * **Quiet Decision Masthead**: High-level consensus and architectural rulings embedded directly in the header.

3. **The Meeting Index**:
   * A structured navigation rail replacing traditional disparate cards:
     * `01 Brief`: Switchable perspectives (*Executive Overview*, *Sales & Commercial*, *Engineering Architecture*, *1:1 Coaching*) with one-click Markdown copy.
     * `02 Decisions`: Numbered ledger rows (`01`, `02`, `03`) with deciders, summary context, and timestamp jump links.
     * `03 Actions`: Minimal checklist rows (`□` / `☑`) with inline assignee, due date, and clickable origin timestamps.
     * `04 Highlights`: Curated soundbites and quotes with speaker attribution.
     * `05 Dynamics`: Quiet speaking distribution metrics.

4. **Interactive Moments & Sharing**:
   * Text selection triggers an in-situ editorial toolbar to save highlights, create tasks, or share moments.
   * Share modal generates clean, deep-linked URLs (`#meeting=<id>&t=<seconds>`) preserving exact speaker context and quotes.

5. **Cross-Meeting Intelligence & Global Search**:
   * Accessible anywhere via `Cmd/Ctrl + K` or `/`.
   * Searches across meeting titles, speaker turns, decisions, action items, and natural-language queries (e.g., *"split-brain"*, *"pricing terms"*, *"migration concerns"*).
   * Selecting a result navigates directly to the meeting, seeks playback to the exact second, and highlights matching dialogue.

---

## 4. Technology Stack

* **Core Framework**: React 19 + TypeScript 5.7
* **Build Tool & Dev Server**: Vite 6.1
* **Styling**: Vanilla CSS with structured design tokens (no heavy utility frameworks, zero CSS-in-JS overhead)
* **Icons**: Lucide React
* **Audio Synthesis**: Web Audio API oscillator/synthesizer for synchronized local playback simulation
* **Routing**: Hash-based deep linking (`#meeting=<id>&t=<seconds>`, `#brief=<id>`) for 100% reliable client-side SPA routing across static hosts

---

## 5. Repository Structure

```text
├── .agent-logs/                # Verified 8x SWE agent capture logs
│   ├── 2026-09-30_13-46-52_...md  # Active session log (updated via hook)
│   ├── 2026-09-30_14-10-00_...md  # Canary Session 1 log
│   └── 2026-09-30_14-15-00_...md  # Canary Session 2 log
├── .agents/                    # Workspace agent hooks
│   ├── hooks.json              # PostInvocation hook configuration
│   └── capture.py              # Hook runner script
├── scripts/
│   ├── capture.py              # 8x verbatim transcript capture parser
│   ├── canary_test.py          # Independent multi-session canary test runner
│   ├── run_tests.js            # Automated test runner
│   └── test_search.ts          # Search & intelligence test suite
├── src/
│   ├── components/
│   │   ├── ContextRail.tsx     # Meeting Index (Brief, Decisions, Actions, Highlights)
│   │   ├── Dashboard.tsx       # Meeting Library & Upcoming Sessions
│   │   ├── GlobalSearchModal.tsx # Cross-meeting search (Cmd+K)
│   │   ├── Navbar.tsx          # Top navigation & search trigger
│   │   ├── PlayerBar.tsx       # Quiet timeline scrubber & audio controls
│   │   ├── PreMeetingBriefView.tsx # Pre-meeting intelligence view
│   │   ├── ShareModal.tsx      # Shareable moment deep-link modal
│   │   ├── TranscriptView.tsx  # Editorial transcript layout & text selection
│   │   └── WorkspaceHeader.tsx # Header with back link & decision summary
│   ├── data/
│   │   └── seededMeetings.ts   # Comprehensive seeded meeting dataset
│   ├── utils/
│   │   ├── formatters.ts       # Date, time, and currency helpers
│   │   └── searchEngine.ts     # Multi-meeting search & query engine
│   ├── App.tsx                 # Root application state & hash router
│   ├── index.css               # Design tokens & editorial CSS styles
│   ├── main.tsx                # React entry point
│   └── types.ts                # TypeScript domain models
├── CAPTURE-TEST.md             # 8x capture setup documentation & canary proofs
├── package.json
├── tsconfig.json
├── vercel.json                 # Vercel SPA deployment rewrite configuration
└── vite.config.ts
```

---

## 6. Seeded Meeting Dataset & Realism

The application comes pre-loaded with comprehensive, believable corporate discussions:
* **Primary Meeting**: `Q4 Core Architecture & Distributed Cache Strategy`
  * **Duration**: 58 minutes (~1 hour).
  * **Participants**: 8 attendees across Architecture, Engineering Leadership, SRE, Security, Data, Frontend, and Product.
  * **Dialogue**: Realistic discussion regarding p99 latency spikes, Memcached consistent hashing vs. Redis Cluster with Raft failover, TLS 1.3 on port 6380, write-through cache invalidation, and shadow-read rollout strategy.
* **Commercial & Sales Meeting**: `Acme Corp — Security & CMEK Implementation Kickoff` (35 mins)
  * Discussion on $120/seat enterprise pricing, SOC2 Type II compliance, customer-managed encryption keys, and mutual NDA deliverables.
* **Engineering Meeting**: `Mobile SDK & Offline Sync Architecture` (25 mins)
  * SQLite WAL mode vs. IndexedDB client storage, CRDT state merge conflict resolution.
* **1:1 Leadership Review**: `1:1 Engineering Leadership & Team Growth` (30 mins)
  * Career ladders, promotion rubric, and hiring roadmaps.
* **Upcoming Sessions**: Two scheduled forward-looking meetings linked to predecessor discussions with open commitments carried over.

---

## 7. Implementation Notes & Limitations

* **Audio Playback Simulation**:
  To ensure a frictionless, zero-setup demo experience without requiring gigabytes of proprietary audio files, the audio timeline uses the browser's native **Web Audio API** to generate a soft, rhythmic audio carrier wave synchronized to the exact speech turn timestamps.
* **Bot Recording Simulation**:
  Clicking *"Simulate Notetaker Bot"* simulates a cloud notetaker bot joining an active calendar event, emitting a realistic confirmation toast.
* **Deterministic Fallback & Search**:
  Cross-meeting search and intelligence synthesis are powered by a deterministic, client-side indexing engine (`src/utils/searchEngine.ts`) that scores transcript dialogue, decisions, speaker names, and tasks. This ensures 100% availability, offline resilience, and zero dependency on external paid API keys.
* **State Persistence**:
  Action item completion states and custom talking points are managed in application state and preserved during the session.

---

## 8. Local Development & Testing

### Prerequisites
* Node.js 18+
* npm 9+

### Quick Start
```bash
# Clone the repository
git clone https://github.com/pravalika2307/Fanthom-AI.git
cd Fanthom-AI

# Install dependencies
npm install

# Run development server
npm run dev
```
The app will be accessible at `http://localhost:5173`.

### Running Tests
```bash
npm test
```
Executes the cross-meeting intelligence test suite verifying search indexing, NLP queries, speaker filtering, and timestamp accuracy.

### Production Build
```bash
npm run build
```
Typechecks via `tsc` and builds the minified production bundle in `dist/`.

---

## 9. 8x SWE Agent Capture Setup

This repository was developed using the **Antigravity IDE** agentic pairing workflow. In accordance with the 8x SWE assignment requirements:
* Automated capture hooks are configured in `.agents/hooks.json` listening to `PostInvocation` lifecycle events.
* Verbatim prompts and final responses are extracted and saved to `.agent-logs/`.
* Both Canary 1 and Canary 2 were verified across independent sessions.
* Full documentation and raw verification outputs are available in [`CAPTURE-TEST.md`](CAPTURE-TEST.md).

---

## 10. Deployment

* **Demo Link**: [https://fanthom-ai.vercel.app](https://fanthom-ai.vercel.app) *(or your deployed Vercel URL)*
* **Static Host Ready**: Contains `vercel.json` with universal SPA rewrites. Zero server dependencies required.
