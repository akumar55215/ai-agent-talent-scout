// Live candidate discovery via GitHub public search API (no auth, free, rate-limited).
// Maps GitHub user data to our Candidate shape with a synthesized persona.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { skills, location, limit = 5 } = await req.json();
    if (!Array.isArray(skills) || skills.length === 0) {
      return new Response(JSON.stringify({ candidates: [] }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Use top 2 skills as language filters (GitHub supports `language:`)
    const top = skills.slice(0, 2).map((s: string) => `language:${s.toLowerCase().replace(/[^a-z0-9+#]/g, '')}`).join(' ');
    const loc = location && !/remote/i.test(location) ? ` location:"${location.split(',')[0].trim()}"` : '';
    const q = `${top}${loc} followers:>50`;

    const ghRes = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(q)}&per_page=${Math.min(limit, 10)}`, {
      headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'TalentScout-AI' },
    });

    if (!ghRes.ok) {
      console.warn('GitHub search failed', ghRes.status);
      return new Response(JSON.stringify({ candidates: [], warning: `GitHub search returned ${ghRes.status}` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await ghRes.json();
    const users = data.items?.slice(0, limit) ?? [];

    // Fetch full profile for each user (parallel, limited)
    const profiles = await Promise.all(users.map(async (u: any) => {
      try {
        const r = await fetch(u.url, { headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'TalentScout-AI' } });
        if (!r.ok) return null;
        return await r.json();
      } catch { return null; }
    }));

    const candidates = profiles.filter(Boolean).map((p: any, i: number) => ({
      id: `gh_${p.id}`,
      name: p.name || p.login,
      title: p.bio?.split(/[.|—–-]/)[0]?.trim().slice(0, 80) || 'Software Engineer',
      location: p.location || 'Unknown',
      yearsExperience: Math.min(15, Math.max(2, new Date().getFullYear() - new Date(p.created_at).getFullYear())),
      skills: skills.slice(0, 5), // We seed with searched skills; real per-repo analysis would be heavier
      bio: p.bio || `Open-source developer with ${p.public_repos} public repos and ${p.followers} followers.`,
      source: 'GitHub',
      avatarSeed: p.login,
      github: p.html_url,
      persona: {
        // Heuristic persona: more public activity → more open
        openness: Math.min(0.9, 0.4 + (p.public_repos > 30 ? 0.3 : 0.1) + (p.followers > 200 ? 0.2 : 0)),
        compFocus: 0.5,
        remoteOnly: !p.location || /remote/i.test(p.location || ''),
        interests: ['open source', ...skills.slice(0, 2).map((s: string) => s.toLowerCase())],
      }
    }));

    return new Response(JSON.stringify({ candidates }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('discover-github error', e);
    return new Response(JSON.stringify({ candidates: [], error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
