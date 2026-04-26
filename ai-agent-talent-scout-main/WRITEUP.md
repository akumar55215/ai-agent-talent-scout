# TalentScout AI — One-Page Write-up

## The problem
Recruiters spend most of their day on two activities, both bottlenecks with measurable cost: **sifting** through profiles to assess fit, and **chasing** candidates to find out if they are even open to a conversation. Match-quality tools exist; interest-quality tools mostly don't. A shortlist of "qualified people" is half a product — what you actually need is "qualified **and** likely to engage."

## The approach
TalentScout AI is a single-loop autonomous agent that compresses the recruiter workflow into one run. Paste a JD, get back a ranked shortlist where every candidate has:

1. An **explainable Match Score** (deterministic skill-overlap math + an AI rationale you can audit).
2. A **simulated outreach conversation** (the same LLM role-plays both sides over 4 turns).
3. An **Interest Score** derived from the candidate's actual replies, not the model's vibes.
4. A **Combined Score** = `0.6 × Match + 0.4 × Interest` — fit weighted higher because an interested-but-unqualified candidate is still a no-hire.

The agent loop: `parse JD → discover candidates → score & explain → engage top-5 → score interest → rank`.

## The architecture
- **Frontend:** React 18 + Vite + TypeScript + Tailwind. One page (`Index.tsx`) orchestrates the pipeline; presentation is decomposed into `AgentTimeline`, `CandidateCard`, `ConversationView`, `ScoreRing`. A docs page renders this write-up in-app.
- **Backend:** four stateless Supabase Edge Functions (Deno) on Lovable Cloud — `parse-jd`, `discover-github`, `match-candidates`, `engage-candidate`. Each one wraps a single AI tool-call against the Lovable AI gateway (Google Gemini 2.5 Flash). The `LOVABLE_API_KEY` lives server-side only.
- **AI contract:** every model call uses **tool-calling with a strict schema**, never JSON mode. JSON-mode prompting is brittle; tool-calling gets you typed outputs that don't break the pipeline downstream.
- **Discovery:** a curated pool of 15 hand-crafted candidates (with persona axes — `openness`, `compFocus`, `remoteOnly`, `interests`) plus the live GitHub public Search API (`language:<skill> location:<city>`). The unified ranking step treats both sources identically, so a strong GitHub hit can outrank a weaker pool candidate.
- **Match math (deterministic):**
  `0.55 · must-have-overlap + 0.15 · nice-to-have-overlap + 0.20 · experience-score + 0.10 · title-alignment`. Skills are normalized so `TypeScript` collapses to `typescript`.
- **Interest math (LLM, persona-grounded):** the model scores from quoted candidate replies and cites 2–4 signals. Anchored bands (Hot 80+, Warm 55–79, Cold 30–54, Not interested <30) keep it consistent.

See `ARCHITECTURE.md` for the diagram and per-function I/O contracts.

## Trade-offs (and why)
| Decision | Why it's right for a 1-day prototype | What it costs |
|---|---|---|
| **Simulated replies** instead of real inbox outreach | No SMTP/Gmail/Resend setup; demo runs end-to-end anywhere. Persona axes keep replies directionally honest (a `remoteOnly` candidate declines a hybrid role). | Interest is plausible, not measured. A real product would close the loop with `Resend` + a public reply URL. |
| **Synthetic pool + GitHub** (no LinkedIn) | Free, no scraping ToS issues, deterministic enough to test the agent loop on edge cases (declines, comp-driven, remote-only). | Doesn't reflect ATS-scale volume. The discovery layer is a single function returning a normalized `Candidate` shape — adding sources is additive. |
| **No persistence** | Prototype is judged on the agent loop, not CRUD. Faster iteration. | A real product would store runs, conversations, recruiter feedback to fine-tune the combined-score weights per company. |
| **Single AI provider** (Gemini 2.5 Flash via Lovable AI) | One key, fast, free trial credits. | Locked in for the demo. Provider is one fetch call away. |
| **Top-5 engagement only** | 4 LLM calls per engagement × 5 = 20 calls per run — bounded cost & latency. | Bottom of the list isn't engaged — but those are the lowest-match candidates a recruiter would skip anyway. |
| **Deterministic match + AI rationale** (not full-LLM judge) | The number cannot hallucinate. A recruiter can audit it. | Slightly less "smart" than a free-form LLM grader, but trustworthy. |
| **Tool-calling, not JSON mode** | Reliable parses; one bad parse anywhere kills an agent pipeline. | Slightly more verbose function definitions. Worth it. |

## What I'd build next (with another week)
1. **Real outreach** via Resend/Gmail + a public reply URL → measure actual interest.
2. **LinkedIn / Wellfound** discovery via a proper data partner.
3. **Recruiter feedback loop**: thumbs up/down on shortlist → fine-tune the combined-score weights per company.
4. **Diversity-aware ranking** as a toggleable second view.
5. **Cost dashboard**: tokens per run, $/qualified-lead — the actual ROI metric.

## How it maps to the judging criteria
- **Works end-to-end (20%)** — paste a JD, get a ranked shortlist with full conversation logs. No mocked steps in the agent loop itself.
- **Quality of the core agent (25%)** — explicit pipeline, tool-calling at every AI step, persona-grounded simulation, recruiter-auditable scoring.
- **Quality of the output (20%)** — explainable Match (with strengths/gaps), Interest (with cited signals), Combined ranking that surfaces the right person, not just the most-qualified one.
- **Technical implementation (15%)** — typed across the wire, stateless edge functions, secret hygiene, deterministic where it matters and AI where it helps.
- **Polish (the rest)** — single-purpose UI, live agent timeline, in-app docs, four sample JDs across functions.
