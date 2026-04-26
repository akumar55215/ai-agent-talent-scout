# Sample Inputs & Outputs — TalentScout AI

Four representative runs. Inputs are the JDs shipped in `src/data/sampleJD.ts`; outputs are abbreviated runs of the agent pipeline (top 3 only). Numbers shown are typical — exact AI text varies run to run since the rationale/conversation are LLM-generated. **Match scores are deterministic and reproducible.**

---

## Sample 1 — Senior Full-Stack Engineer (AI startup, remote)

### Input (JD)
```
Senior Full-Stack Engineer — AI Startup (Remote, Global)

We are an early-stage AI startup building developer tooling. Looking for a
senior full-stack engineer (5+ years) comfortable shipping 0→1 products.

Must have: TypeScript, React, Node.js, PostgreSQL
Nice to have: tRPC, Tailwind, AWS, LLM API experience
Location: Remote (any timezone, async-friendly)
```

### Parsed JDStruct
```json
{
  "role": "Senior Full-Stack Engineer",
  "seniority": "Senior",
  "mustHave": ["typescript", "react", "node.js", "postgresql"],
  "niceToHave": ["trpc", "tailwind", "aws", "llm api"],
  "minYearsExperience": 5,
  "location": "Remote",
  "domain": "AI / developer tooling"
}
```

### Top 3 ranked output
```
#1  Ravi Krishnan          Match 92  Interest 88  Combined 90  [Hot]
    Strengths: full TS/React/Node/Postgres overlap; 8 YOE; remote-only.
    Gaps:     none material.
    Reply:   "Yes — happy to chat. Can you share comp band & team size?"

#2  Priya Sharma           Match 88  Interest 81  Combined 85  [Hot]
    Strengths: 0→1 SaaS to 30k MAUs; product-minded; full stack overlap.
    Gaps:     no AWS in profile (nice-to-have).
    Reply:   "Interested. Open to a 20-min intro next Tuesday."

#3  Aisha Bello            Match 80  Interest 76  Combined 78  [Warm]
    Strengths: Product Engineer; TS/React/Node solid.
    Gaps:     4 YOE vs 5 required.
    Reply:   "Open in principle — would want to understand the mentoring path."
```

---

## Sample 2 — ML / LLM Engineer (Bay Area, hybrid)

### Input (JD)
```
ML / LLM Engineer — Series B, San Francisco (Hybrid 3 days)

Building production RAG and agentic systems. 4+ years ML; 1+ year shipping LLM apps.

Must have: Python, PyTorch, LangChain or LlamaIndex, vector databases
Nice to have: fine-tuning, evals, Ray, Kubernetes
Location: San Francisco (hybrid, 3 days in office)
```

### Top 3 ranked output
```
#1  Wei Zhang              Match 91  Interest 72  Combined 84  [Warm]
    Strengths: PyTorch + LangChain in prod; 5 YOE; published evals work.
    Gaps:     none on must-haves.
    Reply:   "Curious — but I'm remote-only currently. Would you consider remote?"

#2  Diego Hernandez        Match 84  Interest 86  Combined 85  [Hot]
    Strengths: Built RAG pipelines on pgvector; lives in SF Bay; fine-tuning XP.
    Gaps:     no Ray.
    Reply:   "In SF and looking. Hybrid is fine. When can we talk?"

#3  Mohammed Iqbal         Match 78  Interest 65  Combined 73  [Warm]
    Strengths: Python/PyTorch deep; 6 YOE.
    Gaps:     LangChain/LlamaIndex limited — mostly raw model serving.
    Reply:   "Open to chat — but I'd want to understand the LLM scope first."
```

---

## Sample 3 — Senior Product Designer (Fintech, NYC)

### Input (JD)
```
Senior Product Designer — Fintech (NYC, Hybrid)

Lead end-to-end design for a consumer money app. 5+ years product design,
strong systems thinking and prototyping.

Must have: Figma, design systems, prototyping, user research
Nice to have: motion design, accessibility (WCAG), fintech experience
Location: New York (hybrid)
```

### Top 3 ranked output
```
#1  Sara Lindqvist         Match 90  Interest 84  Combined 87  [Hot]
    Strengths: Built design system at scale; 7 YOE; NYC-based.
    Gaps:     no fintech (nice-to-have).
    Reply:   "Yes, very interested — fintech would be a new domain for me, exciting."

#2  Jordan Pierre          Match 85  Interest 78  Combined 82  [Hot]
    Strengths: Figma + research + motion; consumer apps.
    Gaps:     5 YOE, lighter on systems leadership.
    Reply:   "Happy to chat — what's the team structure look like?"

#3  Nora Khan              Match 79  Interest 60  Combined 71  [Warm]
    Strengths: Strong systems thinker; accessibility specialist.
    Gaps:     prefers remote; NYC hybrid is friction.
    Reply:   "Interested in the work, but hybrid is a hard sell for me."
```

---

## Sample 4 — DevOps / Platform Engineer (EU remote)

### Input (JD)
```
DevOps / Platform Engineer — Scale-up (EU Remote)

Own the platform for a 50-engineer team. 4+ years infra/SRE.

Must have: Kubernetes, Terraform, AWS, CI/CD (GitHub Actions or similar)
Nice to have: observability (Datadog, Grafana), cost optimization, security
Location: Remote within EU timezones
```

### Top 3 ranked output
```
#1  Markus Becker          Match 93  Interest 82  Combined 89  [Hot]
    Strengths: K8s + Terraform + AWS; ran platform for 80-eng org; Berlin.
    Gaps:     none on must-haves.
    Reply:   "Sounds great — let's set up a call this week."

#2  Elena Rossi             Match 86  Interest 74  Combined 81  [Warm]
    Strengths: Strong SRE background; Datadog + cost work; Milan.
    Gaps:     Terraform OK but mostly Pulumi recently.
    Reply:   "Open. Curious about the on-call rotation."

#3  Tomáš Novák              Match 80  Interest 70  Combined 76  [Warm]
    Strengths: 6 YOE infra; security mindset.
    Gaps:     less recent K8s production exposure.
    Reply:   "Could be interesting — what's the comp range?"
```

---

## How to reproduce

1. Open the live demo (or run locally per `README.md`).
2. Pick the matching JD from the JD Picker (or paste any JD text).
3. Toggle "Also search GitHub" on/off as desired.
4. Click **Run agent**.
5. Watch `AgentTimeline`; scroll to the ranked candidate list.

Match scores will reproduce exactly. Interest scores and AI rationale will vary slightly each run — they are LLM outputs, persona-grounded but not deterministic.
