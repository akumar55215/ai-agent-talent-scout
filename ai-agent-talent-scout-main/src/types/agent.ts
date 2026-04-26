// Shared types between client and edge functions
export type ParsedJD = {
  title: string;
  seniority: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  yearsExperience: number;
  location: string;
  remote: boolean;
  domain: string;
  summary: string;
};

export type MatchExplanation = {
  matchScore: number; // 0-100
  reasons: string[];
  gaps: string[];
  skillOverlap: string[];
  oneLineSummary: string;
};

export type ChatTurn = {
  role: "agent" | "candidate";
  content: string;
};

export type EngagementResult = {
  conversation: ChatTurn[];
  interestScore: number; // 0-100
  signals: string[];
  verdict: "Hot" | "Warm" | "Cold" | "Not interested";
};

export type ScoredCandidate = {
  candidateId: string;
  match: MatchExplanation;
  engagement?: EngagementResult;
  combinedScore?: number;
};
