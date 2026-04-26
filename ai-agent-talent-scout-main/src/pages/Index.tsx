import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Candidate, MOCK_CANDIDATES } from "@/data/candidates";
import { ParsedJD, ScoredCandidate, EngagementResult } from "@/types/agent";
import { SAMPLE_JDS } from "@/data/sampleJD";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CandidateCard } from "@/components/CandidateCard";
import { AgentTimeline, AgentStep } from "@/components/AgentTimeline";
import { toast } from "sonner";
import { Sparkles, Play, FileText, Github, Loader2, ArrowDown, Zap, BookOpen } from "lucide-react";

const Index = () => {
  const [activeJD, setActiveJD] = useState(SAMPLE_JDS[0].id);
  const [jdText, setJdText] = useState(SAMPLE_JDS[0].text);
  const [includeGithub, setIncludeGithub] = useState(true);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [parsedJD, setParsedJD] = useState<ParsedJD | null>(null);
  const [pool, setPool] = useState<Candidate[]>([]);
  const [scored, setScored] = useState<ScoredCandidate[]>([]);

  const updateStep = (id: string, patch: Partial<AgentStep>) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const callFn = async <T,>(name: string, body: any): Promise<T> => {
    const { data, error } = await supabase.functions.invoke(name, { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data as T;
  };

  const run = async () => {
    if (jdText.trim().length < 30) {
      toast.error("Please paste a real job description (30+ chars).");
      return;
    }

    setRunning(true);
    setParsedJD(null);
    setScored([]);
    setPool([]);

    const initialSteps: AgentStep[] = [
      { id: "parse", label: "Parsing job description", status: "running" },
      { id: "discover", label: "Discovering candidates", status: "pending" },
      { id: "match", label: "Scoring & explaining matches", status: "pending" },
      { id: "engage", label: "Simulating outreach (top 5)", status: "pending" },
      { id: "rank", label: "Ranking final shortlist", status: "pending" },
    ];
    setSteps(initialSteps);

    try {
      // 1. Parse JD
      const { parsed } = await callFn<{ parsed: ParsedJD }>("parse-jd", { jd: jdText });
      setParsedJD(parsed);
      updateStep("parse", { status: "done", detail: `${parsed.title} · ${parsed.mustHaveSkills.slice(0, 4).join(", ")}` });

      // 2. Discover
      updateStep("discover", { status: "running" });
      let candidates: Candidate[] = [...MOCK_CANDIDATES];
      if (includeGithub) {
        try {
          const { candidates: gh } = await callFn<{ candidates: Candidate[] }>("discover-github", {
            skills: parsed.mustHaveSkills, location: parsed.location, limit: 4,
          });
          candidates = [...candidates, ...gh];
        } catch (e) {
          console.warn("GitHub discovery failed (non-fatal):", e);
        }
      }
      setPool(candidates);
      updateStep("discover", { status: "done", detail: `${candidates.length} profiles (${MOCK_CANDIDATES.length} pool + ${candidates.length - MOCK_CANDIDATES.length} GitHub)` });

      // 3. Match
      updateStep("match", { status: "running" });
      const { results } = await callFn<{ results: ScoredCandidate[] }>("match-candidates", {
        jd: parsed,
        candidates: candidates.map(c => ({
          id: c.id, name: c.name, title: c.title, location: c.location,
          yearsExperience: c.yearsExperience, skills: c.skills, bio: c.bio,
        })),
      });
      results.sort((a, b) => b.match.matchScore - a.match.matchScore);
      setScored(results);
      updateStep("match", { status: "done", detail: `Top match: ${results[0]?.match.matchScore}/100` });

      // 4. Engage top 5
      updateStep("engage", { status: "running" });
      const topN = results.slice(0, 5);
      const engagements = await Promise.all(topN.map(async (r) => {
        const cand = candidates.find(c => c.id === r.candidateId);
        if (!cand) return null;
        try {
          const { engagement } = await callFn<{ engagement: EngagementResult }>("engage-candidate", { jd: parsed, candidate: cand });
          return { id: r.candidateId, engagement };
        } catch (e) {
          console.warn("engage failed for", r.candidateId, e);
          return null;
        }
      }));

      const engMap = new Map(engagements.filter(Boolean).map(e => [e!.id, e!.engagement]));
      const finalScored: ScoredCandidate[] = results.map(r => {
        const eng = engMap.get(r.candidateId);
        const combined = eng ? Math.round(r.match.matchScore * 0.6 + eng.interestScore * 0.4) : undefined;
        return { ...r, engagement: eng, combinedScore: combined };
      });
      updateStep("engage", { status: "done", detail: `${engMap.size} conversations simulated` });

      // 5. Rank
      updateStep("rank", { status: "running" });
      finalScored.sort((a, b) => {
        const aa = a.combinedScore ?? a.match.matchScore * 0.6;
        const bb = b.combinedScore ?? b.match.matchScore * 0.6;
        return bb - aa;
      });
      setScored(finalScored);
      updateStep("rank", { status: "done", detail: `Shortlist ready · ${finalScored.filter(s => (s.combinedScore ?? 0) >= 60).length} strong leads` });

      toast.success("Shortlist ready", { description: "Scroll down to view ranked candidates." });
      setTimeout(() => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (e: any) {
      console.error(e);
      toast.error("Agent run failed", { description: e?.message ?? "Unknown error" });
      setSteps(prev => prev.map(s => s.status === "running" ? { ...s, status: "pending", detail: "failed" } : s));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-hero">
        <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="container relative mx-auto px-6 py-12 lg:py-20 max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-mono-tight text-sm tracking-wider uppercase text-muted-foreground">TalentScout AI</span>
            <Link to="/docs" className="ml-auto text-xs font-mono-tight text-muted-foreground hover:text-foreground transition-smooth flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 hover:border-primary/50">
              <BookOpen className="h-3.5 w-3.5" /> Write-up & docs
            </Link>
          </div>

          <h1 className="font-display text-5xl md:text-7xl leading-[1.05] mb-5 max-w-4xl">
            From <span className="text-gradient italic">job description</span> to a ranked,<br />
            <span className="text-gradient-accent italic">already-engaged</span> shortlist.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            An autonomous agent that parses the JD, discovers candidates from a curated pool and live GitHub search,
            scores fit with explainable reasoning, and simulates outreach to gauge real interest.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" /> Lovable AI</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-accent" /> GitHub public API</span>
            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Match × Interest scoring</span>
          </div>
        </div>
      </section>

      {/* Input + Timeline */}
      <section className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4 text-primary" /> Job description
              </Label>
              <span className="text-[11px] text-muted-foreground font-mono-tight">{jdText.length} chars</span>
            </div>

            {/* Sample JD picker */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SAMPLE_JDS.map((s) => {
                const active = activeJD === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={running}
                    onClick={() => { setActiveJD(s.id); setJdText(s.text); }}
                    className={`text-left px-3 py-2 rounded-lg border text-xs transition-smooth ${
                      active
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "border-border bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="font-medium text-[12.5px]">{s.label}</div>
                    <div className="font-mono-tight text-[10.5px] opacity-80 mt-0.5">{s.tag}</div>
                  </button>
                );
              })}
            </div>

            <Textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste any job description here..."
              className="min-h-[280px] font-mono text-[13px] leading-relaxed bg-card border-border resize-y"
              disabled={running}
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Switch id="gh" checked={includeGithub} onCheckedChange={setIncludeGithub} disabled={running} />
                <Label htmlFor="gh" className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Github className="h-3.5 w-3.5" /> Also search GitHub
                </Label>
              </div>
              <Button onClick={run} disabled={running} size="lg" className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:opacity-90 glow-primary font-medium">
                {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Agent running...</> : <><Play className="h-4 w-4 mr-2" /> Run agent</>}
              </Button>
            </div>

            {parsedJD && (
              <div className="mt-6 rounded-xl border border-border bg-card p-4 animate-fade-up">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono-tight">JD understood as</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Role:</span> <span className="font-medium">{parsedJD.title}</span></div>
                  <div><span className="text-muted-foreground">Seniority:</span> <span className="font-medium">{parsedJD.seniority}</span></div>
                  <div><span className="text-muted-foreground">Experience:</span> <span className="font-medium">{parsedJD.yearsExperience}+ years</span></div>
                  <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{parsedJD.location} {parsedJD.remote && "(remote ok)"}</span></div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-1.5">Must-have skills</div>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedJD.mustHaveSkills.map(s => <span key={s} className="text-[11px] px-2 py-0.5 rounded-md bg-primary/15 text-primary font-mono-tight">{s}</span>)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-display text-lg mb-4 flex items-center gap-2">
                <Loader2 className={`h-4 w-4 ${running ? "animate-spin text-accent" : "text-muted-foreground"}`} />
                Agent pipeline
              </h3>
              {steps.length === 0 ? (
                <p className="text-sm text-muted-foreground">Run the agent to see live progress here.</p>
              ) : (
                <AgentTimeline steps={steps} />
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Results */}
      {scored.length > 0 && (
        <section id="results" className="container mx-auto px-6 pb-20 max-w-6xl">
          <div className="flex items-end justify-between mb-6 border-t border-border pt-10">
            <div>
              <h2 className="font-display text-4xl md:text-5xl">Ranked shortlist</h2>
              <p className="text-muted-foreground mt-2">
                Combined score = <span className="font-mono-tight text-foreground">0.6 × Match + 0.4 × Interest</span>. Top 5 were engaged.
              </p>
            </div>
            <ArrowDown className="h-5 w-5 text-muted-foreground hidden md:block" />
          </div>
          <div className="space-y-4">
            {scored.map((s, i) => {
              const cand = pool.find(c => c.id === s.candidateId);
              if (!cand) return null;
              return <CandidateCard key={s.candidateId} candidate={cand} scored={s} rank={i + 1} />;
            })}
          </div>
        </section>
      )}

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground font-mono-tight">
        Built for the AI Talent Scouting challenge · Lovable Cloud + Lovable AI · Mock pool + GitHub public API
      </footer>
    </div>
  );
};

export default Index;
