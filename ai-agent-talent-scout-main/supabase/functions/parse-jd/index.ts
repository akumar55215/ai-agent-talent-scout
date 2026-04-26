// Parses a Job Description into structured fields using Lovable AI (tool-calling for reliable JSON).
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
    const { jd } = await req.json();
    if (!jd || typeof jd !== 'string' || jd.length < 20) {
      return new Response(JSON.stringify({ error: 'JD text too short' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tools = [{
      type: "function",
      function: {
        name: "extract_jd",
        description: "Extract structured fields from a job description.",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Role title" },
            seniority: { type: "string", description: "Junior, Mid, Senior, Staff, Principal, Manager etc." },
            mustHaveSkills: { type: "array", items: { type: "string" }, description: "5-10 critical skills" },
            niceToHaveSkills: { type: "array", items: { type: "string" } },
            yearsExperience: { type: "number", description: "Minimum years required, integer" },
            location: { type: "string" },
            remote: { type: "boolean" },
            domain: { type: "string", description: "e.g. fintech, AI, healthcare" },
            summary: { type: "string", description: "One sentence describing the role and what makes it appealing" },
          },
          required: ["title", "seniority", "mustHaveSkills", "niceToHaveSkills", "yearsExperience", "location", "remote", "domain", "summary"],
          additionalProperties: false,
        }
      }
    }];

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a precise recruiter assistant. Extract clean, normalized fields. Skills should be canonical (e.g. "TypeScript" not "typescript/ts").' },
          { role: 'user', content: `Job description:\n\n${jd}` },
        ],
        tools,
        tool_choice: { type: 'function', function: { name: 'extract_jd' } },
      }),
    });

    if (aiRes.status === 429) return new Response(JSON.stringify({ error: 'Rate limited. Try again in a moment.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted. Add credits in Settings → Workspace → Usage.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error('parse-jd ai err', aiRes.status, t);
      throw new Error(`AI gateway error ${aiRes.status}`);
    }

    const data = await aiRes.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error('No tool call in response');
    const parsed = JSON.parse(args);

    return new Response(JSON.stringify({ parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('parse-jd error', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
