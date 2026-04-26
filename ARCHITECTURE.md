# Architecture — TalentScout AI

## High-level diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  Browser — React 18 + Vite + TypeScript + Tailwind                  │
│                                                                     │
│  pages/Index.tsx ── orchestrates the pipeline                       │
│    │                                                                │
│    ├─ JD Picker (4 sample roles) + free-text textarea               │
│    ├─ AgentTimeline       (live status of each step)                │
│    ├─ CandidateCard × N   (Match / Interest / Combined rings)       │
│    └─ ConversationView    (simulated outreach chat log)             │
│                                                                     │
│  All AI / network calls go through:                                 │
│    supabase.functions.invoke("<fn-name>", { body })                 │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTPS (anon key)
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Lovable Cloud — Supabase Edge Functions (Deno, stateless)          │
│                                                                     │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │  parse-jd    │  │ discover-github  │  │ match-candidates │       │
│  │              │  │                  │  │                  │       │
│  │ raw JD text  │  │ skills+location  │  │ JD + candidates  │       │
│  │      ↓       │  │       ↓          │  │       ↓          │       │
│  │ AI tool-call │  │ GitHub Search    │  │ deterministic    │       │
│  │ → JD struct  │  │ → Candidate[]    │  │ score + AI       │       │
│  └──────┬───────┘  └────────┬─────────┘  │ rationale        │       │
│         │                   │            └────────┬─────────┘       │
│         │                   │                     │                 │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │  engage-candidate                                        │       │
│  │  (top-5) JD + candidate persona                          │       │
│  │       ↓                                                  │       │
│  │  4-turn role-play (recruiter ⇄ candidate)                │       │
│  │       ↓                                                  │       │
│  │  Interest score 0–100 + verdict + cited signals          │       │
│  └──────────────────────────────────────────────────────────┘       │
└────────┬─────────────────────────┬──────────────────────────────────┘
         │                         │
         ▼                         ▼
   Lovable AI Gateway         GitHub Public Search API
   google/gemini-2.5-flash    /search/users + /users/:login
   (tool-calling, no API      (no auth required, 60 req/h)
    key needed in code)
```

## Components

### Frontend (`src/`)
| Path | Role |
|---|---|
| `pages/Index.tsx` | Pipeline orchestrator; calls each edge function in sequence; computes combined ranking. |
| `pages/Docs.tsx` | In-app one-page write-up + architecture description. |
| `data/candidates.ts` | 15 synthetic candidates with persona axes. |
| `data/sampleJD.ts` | 4 reference JDs (Full-Stack, ML/LLM, Product Designer, DevOps). |
| `types/agent.ts` | Shared TS types between client & functions. |
| `components/ScoreRing.tsx` | SVG circular score display. |
| `components/AgentTimeline.tsx` | Live per-step status (idle / running / done / error). |
| `components/CandidateCard.tsx` | Match + interest summary, strengths, gaps, full chat log. |
| `components/ConversationView.tsx` | Bubble UI for the simulated outreach. |

### Backend (`supabase/functions/`)
| Function | Input | Output | Notes |
|---|---|---|---|
| `parse-jd` | `{ jdText }` | `JDStruct` (role, seniority, must/nice skills, YOE, location, domain) | AI tool-call with strict schema. |
| `discover-github` | `{ skills[], location? }` | `Candidate[]` | Free GitHub Search; merges with built-in pool client-side. |
| `match-candidates` | `{ jd, candidates[] }` | `MatchResult[]` (score + rationale) | Score is deterministic; AI only generates the explanation. |
| `engage-candidate` | `{ jd, candidate }` | `{ messages[], interestScore, verdict, signals[] }` | Same model role-plays both sides for 4 turns. |

All four functions:
- Use the `LOVABLE_API_KEY` server-side (never exposed to the browser).
- Use **tool-calling** (not JSON mode) for reliable typed outputs.
- Are stateless — no DB writes; the prototype is judged on the agent loop, not CRUD.

## Data flow (one run)

```
1. User picks a JD or pastes text  → pages/Index.tsx
2. invoke("parse-jd")              → JDStruct
3. (optional) invoke("discover-github")   → Candidate[]
4. merge with built-in pool        → unified Candidate[]
5. invoke("match-candidates")      → ranked MatchResult[]
6. take top 5 → invoke("engage-candidate") in parallel × 5
7. compute combined = 0.6*match + 0.4*interest
8. render ranked CandidateCard list
```

## Scoring

### Match Score (deterministic)
```
score = 0.55 * must_have_overlap_ratio
      + 0.15 * nice_to_have_overlap_ratio
      + 0.20 * experience_score          // 1.0 if YOE >= required, linear decay otherwise
      + 0.10 * title_alignment_score     // token overlap on titles
```
Skill normalization: lowercased, punctuation stripped (so `TypeScript` == `typescript`).

### Interest Score (LLM, persona-grounded)
- Conditioned on `openness`, `compFocus`, `remoteOnly`, `interests` per candidate.
- Cites 2–4 signals quoting the candidate's own replies.
- Bands: Hot 80+, Warm 55–79, Cold 30–54, Not interested <30.

### Combined
`combined = 0.6 * match + 0.4 * interest` — single line, easily tunable.

## Key trade-offs (one-liners — see WRITEUP.md for full reasoning)

- Simulated replies (no real inbox setup) → directional, not measured.
- Synthetic pool + GitHub only → no LinkedIn until partner data is available.
- No persistence → prototype is the agent loop, not a CRUD app.
- Single AI provider (Gemini 2.5 Flash) → one key, abstraction is one fetch away.
- Top-5 engagement only → cost/latency control.
- Deterministic match math + AI rationale → recruiter-auditable numbers.
