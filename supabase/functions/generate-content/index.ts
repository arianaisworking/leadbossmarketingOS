// Supabase Edge Function: generate-content
// Deploy with: supabase functions deploy generate-content
// Set secret: supabase secrets set OPENAI_API_KEY=sk-...

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Payload = {
  mode?: "content" | "campaign";
  brand?: Record<string, string>;
  source?: { name?: string; platform?: string; link?: string; text?: string; visual?: string };
  images?: Array<{ name?: string; type?: string; dataUrl?: string }>;
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY secret is missing.");
    const payload = (await req.json()) as Payload;
    const b = payload.brand ?? {};
    const s = payload.source ?? {};

    const system = `You are The Lead Boss content strategist. Do not copy competitor wording. Extract the topic, pain point, hook, and structure, then create original content for Medicare agency owners, FMOs, IMOs, and call centers. Tone: premium, confident, useful, clear, compliant, and growth-focused. Avoid guaranteed sales claims, cheap-lead language, spam language, and pretending to be a customer if the user is not actually a customer.`;

    const userText = `BRAND CONTEXT\nCompany: ${b.company ?? "The Lead Boss"}\nEmail: ${b.email ?? "ariana@theleadboss.com"}\nCore Message: ${b.core ?? b.core_message ?? "Your agents sell. We deliver opportunities."}\nOffer: ${b.offer ?? "Medicare live transfers and lead generation support"}\nIdeal Customer: ${b.icp ?? "Medicare agencies, FMOs, IMOs, and call centers"}\nTone: ${b.tone ?? "premium, helpful, growth-focused"}\nGuardrails: ${b.avoid ?? "Do not overclaim or copy competitors."}\n\nTASK: ${payload.mode === "campaign" ? "Create a full weekly campaign plan from this source." : "Create a complete daily content pack from this source."}\n\nSOURCE\nName: ${s.name ?? "Untitled"}\nPlatform: ${s.platform ?? "Unknown"}\nLink: ${s.link ?? ""}\nText/Transcript/Article/Notes:\n${s.text ?? ""}\n\nVisual/Photo Notes:\n${s.visual ?? ""}\n\nReturn valid JSON only with this shape:\n{\n  "original_angle": "...",\n  "assets": [\n    {"title":"LinkedIn Authority Post","content":"..."},\n    {"title":"Facebook Post","content":"..."},\n    {"title":"Instagram Carousel","content":"slide by slide copy"},\n    {"title":"Reel / Short Script","content":"..."},\n    {"title":"YouTube Short","content":"title + caption"},\n    {"title":"Industry Insight","content":"..."},\n    {"title":"Comment Question","content":"..."},\n    {"title":"Blog Outline","content":"..."},\n    {"title":"ChatGPT Visual Prompt","content":"..."},\n    {"title":"ElevenLabs Prompt","content":"..."},\n    {"title":"HeyGen Prompt","content":"..."},\n    {"title":"Calendar Suggestions","content":"..."}\n  ]\n}`;

    const content: any[] = [{ type: "text", text: userText }];
    for (const img of (payload.images ?? []).slice(0, 4)) {
      if (img.dataUrl?.startsWith("data:image/")) {
        content.push({ type: "image_url", image_url: { url: img.dataUrl } });
      }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error(await response.text());
    const json = await response.json();
    const raw = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = { raw, assets: [] }; }

    return new Response(JSON.stringify({ raw, ...parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message ?? err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

