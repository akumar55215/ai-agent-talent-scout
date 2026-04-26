import { Link } from "react-router-dom";
import { ArrowLeft, Github, FileText, Cpu, Workflow, Scale } from "lucide-react";

const Section = ({ id, title, icon: Icon, children }: any) => (
  <section id={id} className="scroll-mt-20 mb-16">
    <h2 className="font-display text-3xl md:text-4xl mb-4 flex items-center gap-3">
      <Icon className="h-6 w-6 text-primary" /> {title}
    </h2>
    <div className="prose-invert text-[15px] leading-relaxed text-foreground/90 space-y-4">
      {children}
    </div>
  </section>
);

const Code = ({ children }: { children: React.ReactNode }) => (
  <pre className="bg-card border border-border rounded-lg p-4 overflow-x-auto text-[12.5px] font-mono text-foreground/90 whitespace-pre">
    {children}
  </pre>
);

export default function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 transition-smooth">
            <ArrowLeft className="h-4 w-4" /> Back to agent
          </Link>
          <span className="font-mono-tight text-xs uppercase tracking-wider text-muted-foreground">Docs · TalentScout AI</span>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-5xl md:text-6xl leading-tight mb-3">
          One-page <span className="text-gradient italic">write-up</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
          Approach, architecture, scoring logic, sample inputs/outputs, and trade-offs for the
          AI Talent Scouting challenge.
        </p>

        {/* Nav chips */}
        <nav className="flex flex-wrap gap-2 mb-12 text-sm font-mono-tight">
          {[
            ["approach", "Approach"],
            ["architecture", "Architecture"],
            ["scoring", "Scoring logic"],
            ["samples", "Sample I/O"],
            ["tradeoffs", "Trade-offs"],
            ["repo", "Repo & README"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="px-3 py-1.5 rounded-md border border-border bg-card hover:border-primary/50 transition-smooth">
              {label}
            </a>
          ))}
        </nav>

        <Section id="approach" title="Approach" icon={FileText}>
          <p>
            Recruiters spend most of their time on two things: <strong>sifting</strong> profiles for
            fit, and <strong>chasing</strong> candidates to find out if they're even open to a chat.
            TalentScout AI compresses both into a single agent run. It parses the JD, discovers
            candidates from a curated pool plus the live GitHub Search API, scores fit deterministically
            (with AI-generated reasoning), simulates outreach by role-playing both recruiter and
            candidate, and produces a ranked shortlist where <em>Interest</em> is a first-class signal
            — not a guess.
          </p>
          <p>
            Every AI call uses <strong>tool-calling with a strict schema</strong> rather than
            JSON-mode prompting. This is the most reliable way to get parseable, typed output
            from an LLM in an agent pipeline where one bad parse breaks everything downstream.
          </p>
        </Section>

        <Section id="architecture" title="Architecture" icon={Workflow}>
          <Code>{`┌──────────────────────────────────────────────────────────────────────┐
│  React UI (Vite + Tailwind)                                          │
│  - JD picker (4 samples) + custom textarea + GitHub toggle           │
│  - Live agent timeline                                               │
│  - Ranked candidate cards (Match / Interest / Combined rings)        │
└────────────┬─────────────────────────────────────────────────────────┘
             │ supabase.functions.invoke()
             ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Supabase Edge Functions (Deno)                                      │
│  ┌────────────┐  ┌────────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ parse-jd   │  │ discover-      │  │ match-       │  │ engage-   │ │
│  │            │  │ github         │  │ candidates   │  │ candidate │ │
│  └─────┬──────┘  └───────┬────────┘  └──────┬───────┘  └─────┬─────┘ │
│        │                 │                  │                │       │
└────────┼─────────────────┼──────────────────┼────────────────┼───────┘
         │                 │                  │                │
         ▼                 ▼                  ▼                ▼
   Lovable AI         GitHub Search     Lovable AI       Lovable AI
   (gemini-2.5-       /search/users     (deterministic   (role-plays
   flash, tool        + /users/:login   score + AI       both sides,
   calling)           public, no auth   explanations)    tool-calling)`}</Code>
          <p>
            <strong>Why edge functions?</strong> The <code>LOVABLE_API_KEY</code> must never reach
            the browser. All AI calls and rate-limit handling are server-side. Functions are
            stateless — no DB persistence is required for the demo.
          </p>
        </Section>

        <Section id="scoring" title="Scoring logic" icon={Scale}>
          <h3 className="font-display text-xl mt-2">Match Score (0–100) — deterministic</h3>
          <Code>{`score = 0.55 × must_have_overlap_ratio
      + 0.15 × nice_to_have_overlap_ratio
      + 0.20 × experience_score          // 1.0 if ≥ required, decays linearly
      + 0.10 × title_alignment_score     // token overlap on titles`}</Code>
          <p>
            Skills are normalized (lowercased, punctuation stripped) so <code>TypeScript</code> and
            <code> typescript</code> collapse. The AI layer adds a one-line summary, 2–4 strength bullets,
            and 0–3 gap bullets — but the <strong>number is purely deterministic</strong>, so a
            recruiter can audit it.
          </p>

          <h3 className="font-display text-xl mt-6">Interest Score (0–100) — AI from conversation</h3>
          <p>
            Generated after a 4-turn simulated conversation, conditioned on the candidate's
            persona axes (<code>openness</code>, <code>compFocus</code>, <code>remoteOnly</code>,
            <code> interests</code>) and the actual JD details. Anchored verdict bands keep scoring
            consistent: <strong>Hot</strong> 80+, <strong>Warm</strong> 55–79,
            <strong> Cold</strong> 30–54, <strong>Not interested</strong> &lt;30. The model is required to
            cite 2–4 short signals quoting the candidate's own words.
          </p>

          <h3 className="font-display text-xl mt-6">Combined Score</h3>
          <Code>{`combined = 0.6 × Match + 0.4 × Interest`}</Code>
          <p>
            Match is weighted higher because an interested-but-unqualified candidate is still a
            no-hire — but the weighting is a single line of code to tune.
          </p>
        </Section>

        <Section id="samples" title="Sample inputs & outputs" icon={Cpu}>
          <p>
            Four sample JDs ship in-app (Full-Stack, ML/LLM, Product Design, DevOps) so judges can
            stress-test the agent across very different role types without typing anything.
          </p>
          <h3 className="font-display text-xl mt-2">Example output (Senior Full-Stack, top 3)</h3>
          <Code>{`#1  Ravi Krishnan          Match 92  Interest 88  Combined 90  [Hot]
    "Indie hacker turned senior engineer; 12 production SaaS; TS/React/Node aligned;
     remote-only matches role; high openness — replied enthusiastically and proposed times."

#2  Priya Sharma           Match 88  Interest 81  Combined 85  [Hot]
    "Shipped 0→1 SaaS to 30k MAUs; product-minded; remote-first; strong stack overlap.
     Asked about team size before committing — engaged."

#3  Aisha Bello            Match 80  Interest 76  Combined 78  [Warm]
    "Product Engineer with full-stack TS; 4y vs 5y required (slight gap);
     wants mentoring path — open to chat next week."`}</Code>
        </Section>

        <Section id="tradeoffs" title="Trade-offs" icon={Scale}>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Simulated replies vs. real outreach</strong> — demo runs with no inbox setup. Persona-grounding keeps the interest signal directionally honest.</li>
            <li><strong>Synthetic pool + GitHub</strong> — free tier, no scraping ToS risk. Matching code is identical regardless of source, so adding LinkedIn/Wellfound later is additive.</li>
            <li><strong>No persistence layer</strong> — the prototype is judged on the agent loop, not CRUD. A real product would store runs and recruiter feedback to fine-tune scoring.</li>
            <li><strong>Single AI provider (Gemini 2.5 Flash via Lovable AI)</strong> — one key, fast, free trial credits. Provider abstraction is one fetch call away.</li>
            <li><strong>Top-5 engagement only</strong> — bounds cost and latency (4 LLM calls × 5 candidates). The bottom of the list is also what a recruiter would skip first.</li>
            <li><strong>Deterministic match math + AI rationale</strong> — recruiters can trust the number; the LLM only ever explains it.</li>
          </ul>
        </Section>

        <Section id="repo" title="Source code & README" icon={Github}>
          <p>
            The full README, architecture diagram, scoring details, and run-it-locally instructions
            also live in <code>README.md</code> at the repo root — this page mirrors that content
            so judges can read everything without leaving the live demo.
          </p>
          <p className="text-sm text-muted-foreground">
            To publish the source: push the project to a public GitHub repo and link it in the
            submission form. The included <code>README.md</code> is structured for first-impression
            judging (what · why · how · trade-offs).
          </p>
        </Section>

        <footer className="border-t border-border pt-6 mt-12 text-xs text-muted-foreground font-mono-tight text-center">
          TalentScout AI · One-page write-up · Lovable Cloud + Lovable AI
        </footer>
      </div>
    </div>
  );
}
