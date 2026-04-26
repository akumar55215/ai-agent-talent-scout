import { useState } from "react";
import { Candidate } from "@/data/candidates";
import { ScoredCandidate } from "@/types/agent";
import { ScoreRing } from "./ScoreRing";
import { ConversationView } from "./ConversationView";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Github, MapPin, Briefcase, Sparkles, AlertCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  candidate: Candidate;
  scored: ScoredCandidate;
  rank: number;
}

export function CandidateCard({ candidate, scored, rank }: Props) {
  const [expanded, setExpanded] = useState(rank <= 1);
  const { match, engagement, combinedScore } = scored;

  const verdictColor = engagement
    ? engagement.verdict === "Hot" ? "text-success border-success/40 bg-success/10"
    : engagement.verdict === "Warm" ? "text-warning border-warning/40 bg-warning/10"
    : engagement.verdict === "Cold" ? "text-muted-foreground border-border bg-muted/40"
    : "text-destructive border-destructive/40 bg-destructive/10"
    : "";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-card-elevated transition-smooth hover:border-primary/40 animate-fade-up">
      {/* Rank ribbon */}
      <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center bg-secondary text-muted-foreground font-mono-tight text-sm">
        #{rank}
      </div>

      <div className="p-5 pl-16">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex flex-1 min-w-[240px] items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-display text-lg">
              {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-xl">{candidate.name}</h3>
                <Badge variant="outline" className="text-[10px] font-mono-tight uppercase tracking-wider">
                  {candidate.source === "GitHub" ? <><Github className="h-2.5 w-2.5 mr-1" />GitHub</> : "Pool"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap mt-0.5">
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{candidate.title}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{candidate.location}</span>
                <span className="font-mono-tight">{candidate.yearsExperience}y</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ScoreRing value={match.matchScore} label="Match" variant="primary" />
            {engagement && <ScoreRing value={engagement.interestScore} label="Interest" variant="accent" />}
            {combinedScore !== undefined && <ScoreRing value={combinedScore} label="Combined" variant="gradient" size={72} />}
          </div>
        </div>

        <p className="mt-4 text-sm text-foreground/90 leading-relaxed">
          <Sparkles className="inline h-3.5 w-3.5 text-primary mr-1.5 -mt-0.5" />
          {match.oneLineSummary}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {match.skillOverlap.slice(0, 8).map(s => (
            <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary font-mono-tight">
              {s}
            </span>
          ))}
        </div>

        <Button
          variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}
          className="mt-4 -ml-2 text-muted-foreground hover:text-foreground"
        >
          {expanded ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
          {expanded ? "Hide details" : "View reasoning & conversation"}
        </Button>

        {expanded && (
          <div className="mt-4 grid gap-5 lg:grid-cols-2 border-t border-border pt-5 animate-fade-up">
            {/* Reasoning */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-mono-tight mb-2 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" /> Why they match
              </h4>
              <ul className="space-y-1.5 text-sm">
                {match.reasons.map((r, i) => (
                  <li key={i} className="flex gap-2"><span className="text-primary mt-1">▸</span><span>{r}</span></li>
                ))}
              </ul>
              {match.gaps.length > 0 && (
                <>
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-mono-tight mt-4 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" /> Gaps & risks
                  </h4>
                  <ul className="space-y-1.5 text-sm">
                    {match.gaps.map((g, i) => (
                      <li key={i} className="flex gap-2"><span className="text-warning mt-1">▸</span><span className="text-foreground/80">{g}</span></li>
                    ))}
                  </ul>
                </>
              )}
              {candidate.github && (
                <a href={candidate.github} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Github className="h-3 w-3" /> View GitHub profile
                </a>
              )}
            </div>

            {/* Conversation */}
            <div>
              <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-mono-tight mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> Simulated outreach</span>
                {engagement && (
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", verdictColor)}>
                    {engagement.verdict}
                  </span>
                )}
              </h4>
              {engagement ? (
                <>
                  <ConversationView conversation={engagement.conversation} candidateName={candidate.name} />
                  <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono-tight mb-1">Interest signals</div>
                    <ul className="text-xs space-y-1">
                      {engagement.signals.map((s, i) => <li key={i} className="text-foreground/80">• {s}</li>)}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">Not yet engaged.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
