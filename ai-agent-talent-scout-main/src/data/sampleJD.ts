export type SampleJD = { id: string; label: string; tag: string; text: string };

export const SAMPLE_JDS: SampleJD[] = [
  {
    id: "fullstack",
    label: "Senior Full-Stack Engineer",
    tag: "TS · React · Node · Remote",
    text: `Senior Full-Stack Engineer (TypeScript / React / Node)

We're a Series A AI startup building agentic developer tools. We're hiring a Senior Full-Stack Engineer to own user-facing surfaces end-to-end and shape our product direction.

What you'll do
- Ship features across our React/Next.js front-end and Node.js + PostgreSQL back-end
- Build delightful UX on top of LLM-powered workflows (RAG, agents, streaming)
- Own performance, accessibility, and the design-system layer
- Work directly with the founders on product decisions

Must have
- 5+ years building production web apps
- Strong TypeScript, React, Node.js
- Comfort with PostgreSQL and at least one cloud (AWS/GCP)
- Product instincts — you care why, not just how

Nice to have
- Experience shipping AI/LLM features
- Stripe / billing integrations
- Open-source contributions

Location: Remote (global) or hybrid in SF.
Compensation: competitive base + meaningful equity.`,
  },
  {
    id: "ml",
    label: "ML Engineer (LLMs)",
    tag: "Python · PyTorch · RAG · Hybrid NYC",
    text: `Machine Learning Engineer — Applied LLMs

We're building a vertical AI product for the legal industry and need an ML engineer who can take research-grade ideas to production reliably.

What you'll do
- Design and ship retrieval pipelines (RAG, hybrid search, rerankers)
- Fine-tune and evaluate small/medium open models (Llama, Mistral, Qwen)
- Build evals that actually catch regressions before they hit users
- Partner with product to translate fuzzy user pain into measurable wins

Must have
- 4+ years in ML/AI engineering, including 1+ year shipping LLM features
- Strong Python, PyTorch or JAX
- Solid grasp of transformers, embeddings, vector DBs (pgvector / Pinecone / Weaviate)
- Comfort owning a service in production (Docker, AWS/GCP)

Nice to have
- Distributed training experience (DeepSpeed, FSDP)
- Published research or strong open-source footprint
- Experience with legal, medical or other regulated data

Location: Hybrid in New York (3 days/week).
Compensation: $200k–$260k + equity.`,
  },
  {
    id: "design",
    label: "Senior Product Designer",
    tag: "Figma · Design Systems · Remote EU",
    text: `Senior Product Designer

We're a 25-person fintech building money tools for freelancers across Europe. We need a senior designer to own end-to-end product design for our core flows.

What you'll do
- Lead design on 2–3 major surfaces (onboarding, invoicing, tax)
- Evolve and maintain our design system in Figma
- Run lightweight research with real users every sprint
- Partner closely with engineering to ship pixel-tight UI

Must have
- 5+ years designing consumer or prosumer products
- A portfolio that shows shipped work, not just concepts
- Strong Figma, prototyping, and systems thinking
- Excellent written English

Nice to have
- Fintech, accounting, or B2B SaaS background
- Motion / Lottie experience
- Ability to write copy that doesn't need a rewrite

Location: Remote within EU timezones (±2h CET).
Compensation: €75k–€95k + equity.`,
  },
  {
    id: "devops",
    label: "Senior DevOps / Platform Engineer",
    tag: "Kubernetes · AWS · Terraform · Remote",
    text: `Senior DevOps / Platform Engineer

We're a 60-person B2B SaaS scaling rapidly. You'll own the platform that ~40 product engineers ship on every day.

What you'll do
- Own our Kubernetes (EKS) clusters and the deployment pipeline end-to-end
- Drive reliability: SLOs, incident response, post-mortems
- Build internal developer-platform tooling (CI templates, preview envs, feature flags)
- Champion cost efficiency without slowing teams down

Must have
- 5+ years in DevOps / SRE / Platform roles
- Production Kubernetes experience
- Strong AWS, Terraform, and Linux fundamentals
- Comfort writing Go or Python for tooling

Nice to have
- Experience with service mesh (Istio / Linkerd)
- Database operations at scale (Postgres, Aurora)
- Security hardening, SOC2 prep

Location: Remote (Americas timezones).
Compensation: $180k–$220k + equity.`,
  },
];

// Backwards-compatible default export
export const SAMPLE_JD = SAMPLE_JDS[0].text;
