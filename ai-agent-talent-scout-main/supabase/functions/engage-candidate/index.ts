// Simulated outreach: AI plays both the recruiter agent AND the candidate (using their persona).
// Returns a 4-turn conversation and an interpreted Interest Score with signals.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
    const { jd, candidate } = await req.json();
    if (!jd || !candidate) {
      return new Response(JSON.stringify({ error: 'Missing jd or candidate' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const tools = [{
      type: 'function',
      function: {
        name: 'simulate_outreach',
        description: 'Simulate a 4-turn recruiter ↔ candidate exchange and score interest.',
        parameters: {
          type: 'object',
          properties: {
            conversation: {
              type: 'array',
              minItems: 4, maxItems: 4,
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['agent', 'candidate'] },
                  content: { type: 'string' },
                },
                required: ['role', 'content'],
                additionalProperties: false,
              }
            },
            interestScore: { type: 'number', description: '0-100 interpreted from the candidate replies' },
            signals: { type: 'array', items: { type: 'string' }, description: '2-4 short phrases citing what was said' },
            verdict: { type: 'string', enum: ['Hot', 'Warm', 'Cold', 'Not interested'] },
          },
          required: ['conversation', 'interestScore', 'signals', 'verdict'],
          additionalProperties: false,
        }
      }
    }];

    const sys = `You simulate realistic recruiter outreach for a hiring agent demo.
You will produce EXACTLY 4 turns: agent, candidate, agent, candidate.

TURN 1 (agent): Personalized cold outreach (3-4 sentences). Reference one specific thing from the candidate's bio/skills, then describe the role and ask if they'd like to learn more.
TURN 2 (candidate): Reply IN CHARACTER using the persona. The persona drives tone:
  - High openness → curious, asks questions
  - Low openness → polite but lukewarm or declines
  - High compFocus → asks about salary/equity early
  - remoteOnly + onsite role → friction
  - Match interests → enthusiasm
TURN 3 (agent): Address what they said, share 1-2 concrete details (impact, team, comp range if asked), propose a 20-min intro call.
TURN 4 (candidate): Final response in character — accept, suggest times, push back, or decline.

Then score interest 0-100 based on what the CANDIDATE actually said:
- 80-100 Hot: clearly wants to proceed
- 55-79 Warm: open, has conditions
- 30-54 Cold: polite skepticism
- 0-29 Not interested: declines

Cite 2-4 signals quoting brief phrases. Be honest — if the persona declines, score it low.`;

    const userPayload = {
      jd: { title: jd.title, seniority: jd.seniority, summary: jd.summary, mustHave: jd.mustHaveSkills, location: jd.location, remote: jd.remote, domain: jd.domain },
      candidate: {
        name: candidate.name, title: candidate.title, location: candidate.location,
        years: candidate.yearsExperience, skills: candidate.skills, bio: candidate.bio,
        persona: candidate.persona,
      }
    };

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: JSON.stringify(userPayload) },
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'simulate_outreach' } },
      }),
    });

    if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limited. Try again shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!aiRes.ok) { const t = await aiRes.text(); console.error('engage err', aiRes.status, t); throw new Error(`AI ${aiRes.status}`); }

    const data = await aiRes.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error('No tool call');
    const result = JSON.parse(args);

    return new Response(JSON.stringify({ engagement: result }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('engage-candidate error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
