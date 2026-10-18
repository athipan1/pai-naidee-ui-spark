import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WikiSearchResponse {
  query?: { search?: Array<{ title?: string }> };
}

interface WikiSummary {
  extract?: string;
  title?: string;
  content_urls?: { desktop?: { page?: string } };
}

async function findWikipediaSummary(
  lang: string,
  term: string,
): Promise<{ extract: string; url: string } | null> {
  const searchRes = await fetch(
    `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term)}&srlimit=1&format=json&origin=*`,
  );
  if (!searchRes.ok) return null;
  const searchJson = (await searchRes.json()) as WikiSearchResponse;
  const title = searchJson.query?.search?.[0]?.title;
  if (!title) return null;

  const summaryRes = await fetch(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );
  if (!summaryRes.ok) return null;
  const summary = (await summaryRes.json()) as WikiSummary;
  if (!summary.extract) return null;

  return {
    extract: summary.extract,
    url:
      summary.content_urls?.desktop?.page ??
      `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: places, error } = await supabase
      .from('places')
      .select('id, name, name_local, description');
    if (error) throw error;

    const results: Array<{ id: string; name: string; status: string }> = [];

    for (const place of places ?? []) {
      // Thai Wikipedia with the local name first, then English with the Latin name.
      const found =
        (place.name_local
          ? await findWikipediaSummary('th', place.name_local)
          : null) ?? (await findWikipediaSummary('en', place.name));

      if (!found) {
        results.push({ id: place.id, name: place.name, status: 'not_found' });
        continue;
      }

      const { error: updateError } = await supabase
        .from('places')
        .update({ description: found.extract, updated_at: new Date().toISOString() })
        .eq('id', place.id);

      results.push({
        id: place.id,
        name: place.name,
        status: updateError ? `error: ${updateError.message}` : 'updated',
      });
    }

    const updated = results.filter((r) => r.status === 'updated').length;
    return new Response(
      JSON.stringify({ success: true, total: results.length, updated, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
