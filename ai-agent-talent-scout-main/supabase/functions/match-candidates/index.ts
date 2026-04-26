// Explainable matching: deterministic skill-overlap + AI-generated rationale.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

type ParsedJD = {
  title: string; seniority: string; mustHaveSkills: string[]; niceToHaveSkills: string[];
  yearsExperience: number; location: string; remote: boolean; domain: string; summary: string;
};

type Candidate = {
  id: string; name: string; title: string; location: string;
  yearsExperience: number; skills: string[]; bio: string;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#.]/g, '');

function deterministicScore(jd: ParsedJD, c: Candidate) {
  const cSkills = new Set(c.skills.map(norm));
  const must = jd.mustHaveSkills.map(norm);
  const nice = jd.niceToHaveSkills.map(norm);

  const mustHits = must.filter(s => cSkills.has(s));
  const niceHits = nice.filter(s => cSkills.has(s));

  const mustRatio = must.length ? mustHits.length / must.length : 0;
  const niceRatio = nice.length ? niceHits.length / nice.length : 0;

  // Experience: 0 below threshold-2, 1 at/above threshold, partial in between
  const expDelta = c.yearsExperience - jd.yearsExperience;
  const expScore = expDelta >= 0 ? 1 : Math.max(0, 1 + expDelta / 3);

  // Title alignment: cheap keyword overlap on titles
  const jdTitleTokens = new Set(norm(jd.title).split(/[^a-z0-9]+/).filter(Boolean));
  const cTitleTokens = norm(c.title).split(/[^a-z0-9]+/).filter(Boolean);
  const titleOverlap = cTitleTokens.filter(t => jdTitleTokens.has(t)).length;
  const titleScore = Math.min(1, titleOverlap / Math.max(1, jdTitleTokens.size));

  // Weighted score
  const raw = mustRatio * 0.55 + niceRatio * 0.15 + expScore * 0.20 + titleScore * 0.10;
  const score = Math.round(raw * 100);

  const skillOverlap = [...mustHits, ...niceHits].map(s => {
    // Return the original-cased skill from candidate
    const original = c.skills.find(x => norm(x) === s);
    return original || s;
  });

  return {
    score, mustHits, niceHits, expDelta, skillOverlap,
    missingMust: must.filter(s => !cSkills.has(s)),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
    const { jd, candidates } = await req.json() as { jd: ParsedJD; candidates: Candidate[] };
    if (!jd || !Array.isArray(candidates)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1) Deterministic scoring for ALL candidates
    const scored = candidates.map(c => ({ c, s: deterministicScore(jd, c) }));
    // 2) Take top 8 for AI explanation (cost control)
    scored.sort((a, b) => b.s.score - a.s.score);
    const top = scored.slice(0, Math.min(8, scored.length));

    // 3) Single batched AI call to generate concise explanations
    const tools = [{
      type: 'function',
      function: {
        name: 'explain_matches',
        description: 'Generate concise reasoning for candidate-JD fit.',
        parameters: {
          type: 'object',
          properties: {
            explanations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  candidateId: { type: 'string' },
                  oneLineSummary: { type: 'string', description: '12-22 words: why they fit (or do not).' },
                  reasons: { type: 'array', items: { type: 'string' }, description: '2-4 short bullets of strengths.' },
                  gaps: { type: 'array', items: { type: 'string' }, description: '0-3 short bullets of weaknesses or risks.' },
                },
                required: ['candidateId', 'oneLineSummary', 'reasons', 'gaps'],
                additionalProperties: false,
              }
            }
          },
          required: ['explanations'],
          additionalProperties: false,
        }
      }
    }];

    const payload = {
      jd: { title: jd.title, seniority: jd.seniority, mustHave: jd.mustHaveSkills, niceToHave: jd.niceToHaveSkills, years: jd.yearsExperience, domain: jd.domain, location: jd.location, remote: jd.remote },
      candidates: top.map(({ c, s }) => ({
        id: c.id, name: c.name, title: c.title, years: c.yearsExperience, location: c.location,
        skills: c.skills, bio: c.bio,
        signals: { skillOverlap: s.skillOverlap, missingMust: s.missingMust, expDelta: s.expDelta, score: s.score }
      })),
    };

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a senior technical recruiter. Be specific, honest, and concise. Cite skills by name. Never invent facts. Keep each bullet under 14 words.' },
          { role: 'user', content: 'Generate explanations for each candidate based on this JD and the precomputed signals.\n\n' + JSON.stringify(payload) },
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'explain_matches' } },
      }),
    });

    if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limited. Try again shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!aiRes.ok) { const t = await aiRes.text(); console.error('match err', aiRes.status, t); throw new Error(`AI ${aiRes.status}`); }

    const data = await aiRes.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const explanations: any[] = args ? JSON.parse(args).explanations : [];
    const explMap = new Map(explanations.map((e: any) => [e.candidateId, e]));

    const results = scored.map(({ c, s }) => {
      const e = explMap.get(c.id);
      return {
        candidateId: c.id,
        match: {
          matchScore: s.score,
          skillOverlap: s.skillOverlap,
          reasons: e?.reasons ?? [
            `${s.mustHits.length}/${jd.mustHaveSkills.length} must-have skills matched`,
            `${c.yearsExperience}y experience vs ${jd.yearsExperience}y required`,
          ],
          gaps: e?.gaps ?? (s.missingMust.length ? [`Missing: ${s.missingMust.slice(0,3).join(', ')}`] : []),
          oneLineSummary: e?.oneLineSummary ?? `${c.name} matches ${s.mustHits.length}/${jd.mustHaveSkills.length} must-haves with ${c.yearsExperience}y experience.`,
        }
      };
    });

    return new Response(JSON.stringify({ results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('match-candidates error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
