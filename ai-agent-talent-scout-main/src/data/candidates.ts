export type Candidate = {
  id: string;
  name: string;
  title: string;
  location: string;
  yearsExperience: number;
  skills: string[];
  bio: string;
  source: "Mock" | "GitHub";
  avatarSeed: string;
  github?: string;
  // Persona axes used when simulating their replies (not shown to recruiter directly)
  persona: {
    openness: number; // 0-1 likelihood to entertain new roles
    compFocus: number; // 0-1 cares about comp
    remoteOnly: boolean;
    interests: string[];
  };
};

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "c1", name: "Aarav Mehta", title: "Senior Backend Engineer", location: "Bangalore, IN",
    yearsExperience: 7, skills: ["Python", "FastAPI", "PostgreSQL", "AWS", "Kubernetes", "Redis"],
    bio: "Builds high-throughput payment systems. Led migration to event-driven architecture at a fintech.",
    source: "Mock", avatarSeed: "aarav",
    persona: { openness: 0.8, compFocus: 0.6, remoteOnly: false, interests: ["fintech", "distributed systems", "open source"] }
  },
  {
    id: "c2", name: "Priya Sharma", title: "Full-Stack Engineer", location: "Remote (IN)",
    yearsExperience: 5, skills: ["TypeScript", "React", "Node.js", "GraphQL", "PostgreSQL", "AWS"],
    bio: "Product-minded engineer who shipped a 0→1 SaaS to 30k MAUs. Loves design systems.",
    source: "Mock", avatarSeed: "priya",
    persona: { openness: 0.9, compFocus: 0.4, remoteOnly: true, interests: ["product", "design", "early stage"] }
  },
  {
    id: "c3", name: "Diego Alvarez", title: "ML Engineer", location: "Berlin, DE",
    yearsExperience: 6, skills: ["Python", "PyTorch", "LLMs", "Ray", "MLOps", "AWS"],
    bio: "Trained recsys at scale. Recently fine-tuned LLMs for code-generation pipelines.",
    source: "Mock", avatarSeed: "diego",
    persona: { openness: 0.5, compFocus: 0.8, remoteOnly: false, interests: ["LLMs", "research", "GPU clusters"] }
  },
  {
    id: "c4", name: "Sara Cohen", title: "Staff Frontend Engineer", location: "Tel Aviv, IL",
    yearsExperience: 9, skills: ["TypeScript", "React", "Next.js", "WebGL", "Performance"],
    bio: "Performance fanatic. Cut TTI by 60% on a 200-engineer codebase.",
    source: "Mock", avatarSeed: "sara",
    persona: { openness: 0.4, compFocus: 0.7, remoteOnly: false, interests: ["performance", "DX", "tooling"] }
  },
  {
    id: "c5", name: "Kenji Watanabe", title: "DevOps / Platform Engineer", location: "Tokyo, JP",
    yearsExperience: 8, skills: ["Kubernetes", "Terraform", "AWS", "GCP", "Go", "Observability"],
    bio: "Built internal developer platforms for two unicorns. Treats reliability as product.",
    source: "Mock", avatarSeed: "kenji",
    persona: { openness: 0.6, compFocus: 0.5, remoteOnly: true, interests: ["platform", "SRE", "cost optimization"] }
  },
  {
    id: "c6", name: "Maya Johnson", title: "AI Research Engineer", location: "San Francisco, US",
    yearsExperience: 4, skills: ["Python", "PyTorch", "LLMs", "RAG", "LangChain", "Vector DBs"],
    bio: "Published on retrieval-augmented agents. Currently shipping RAG products.",
    source: "Mock", avatarSeed: "maya",
    persona: { openness: 0.85, compFocus: 0.5, remoteOnly: false, interests: ["agents", "research", "startup velocity"] }
  },
  {
    id: "c7", name: "Lucas Pereira", title: "Senior Backend Engineer", location: "São Paulo, BR",
    yearsExperience: 6, skills: ["Go", "gRPC", "PostgreSQL", "Kafka", "AWS", "Microservices"],
    bio: "Scaled a logistics platform from 10 to 1000 RPS without a single Sev-1.",
    source: "Mock", avatarSeed: "lucas",
    persona: { openness: 0.7, compFocus: 0.6, remoteOnly: true, interests: ["scale", "Go", "logistics"] }
  },
  {
    id: "c8", name: "Hannah Lee", title: "Mobile Engineer (iOS)", location: "Seoul, KR",
    yearsExperience: 5, skills: ["Swift", "SwiftUI", "iOS", "Kotlin", "Firebase"],
    bio: "Shipped 5 top-100 App Store apps. Cares deeply about animation craft.",
    source: "Mock", avatarSeed: "hannah",
    persona: { openness: 0.3, compFocus: 0.6, remoteOnly: false, interests: ["mobile", "animation", "consumer"] }
  },
  {
    id: "c9", name: "Omar Haddad", title: "Senior Data Engineer", location: "Dubai, AE",
    yearsExperience: 7, skills: ["Python", "Spark", "Airflow", "Snowflake", "dbt", "AWS"],
    bio: "Built petabyte-scale lakehouses. Strong opinions on data contracts.",
    source: "Mock", avatarSeed: "omar",
    persona: { openness: 0.55, compFocus: 0.7, remoteOnly: false, interests: ["data", "analytics", "governance"] }
  },
  {
    id: "c10", name: "Elena Ivanova", title: "Engineering Manager", location: "Lisbon, PT",
    yearsExperience: 11, skills: ["Leadership", "TypeScript", "React", "Node.js", "Hiring", "Strategy"],
    bio: "Grew teams from 4 to 25 across two startups. Player-coach style.",
    source: "Mock", avatarSeed: "elena",
    persona: { openness: 0.5, compFocus: 0.5, remoteOnly: true, interests: ["mentorship", "team building", "culture"] }
  },
  {
    id: "c11", name: "Ravi Krishnan", title: "Senior Full-Stack Engineer", location: "Hyderabad, IN",
    yearsExperience: 6, skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "Stripe"],
    bio: "Indie hacker turned senior engineer. Has shipped 12 production SaaS apps.",
    source: "Mock", avatarSeed: "ravi",
    persona: { openness: 0.95, compFocus: 0.5, remoteOnly: true, interests: ["SaaS", "indie hacking", "AI"] }
  },
  {
    id: "c12", name: "Nina Rasmussen", title: "Security Engineer", location: "Copenhagen, DK",
    yearsExperience: 8, skills: ["Security", "AWS", "Python", "Pentesting", "Compliance", "Kubernetes"],
    bio: "Builds secure-by-default platforms. Former red-teamer.",
    source: "Mock", avatarSeed: "nina",
    persona: { openness: 0.4, compFocus: 0.6, remoteOnly: false, interests: ["security", "compliance", "infra"] }
  },
  {
    id: "c13", name: "Tomás Garcia", title: "Senior Frontend Engineer", location: "Madrid, ES",
    yearsExperience: 6, skills: ["TypeScript", "React", "Vue", "CSS", "Design Systems", "A11y"],
    bio: "Accessibility advocate. Shipped a multi-brand design system used by 80 engineers.",
    source: "Mock", avatarSeed: "tomas",
    persona: { openness: 0.7, compFocus: 0.5, remoteOnly: true, interests: ["a11y", "design systems", "craft"] }
  },
  {
    id: "c14", name: "Aisha Bello", title: "Product Engineer", location: "Lagos, NG",
    yearsExperience: 4, skills: ["TypeScript", "React", "Node.js", "Postgres", "Product"],
    bio: "Generalist who treats every PR like a product decision. Mentors juniors.",
    source: "Mock", avatarSeed: "aisha",
    persona: { openness: 0.85, compFocus: 0.5, remoteOnly: true, interests: ["product", "fintech", "mentoring"] }
  },
  {
    id: "c15", name: "Felix Bauer", title: "Senior Go Engineer", location: "Munich, DE",
    yearsExperience: 7, skills: ["Go", "Kubernetes", "gRPC", "PostgreSQL", "Distributed Systems"],
    bio: "Backend engineer at a payments unicorn. Open-source maintainer of a popular Go lib.",
    source: "Mock", avatarSeed: "felix",
    persona: { openness: 0.5, compFocus: 0.7, remoteOnly: false, interests: ["Go", "OSS", "payments"] }
  },
];
