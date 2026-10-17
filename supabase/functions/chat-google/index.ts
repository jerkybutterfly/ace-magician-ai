import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, model } = await req.json();
    const GOOGLE_AI_STUDIO_KEY = Deno.env.get("GOOGLE_AI_STUDIO_KEY");
    if (!GOOGLE_AI_STUDIO_KEY) {
      throw new Error("GOOGLE_AI_STUDIO_KEY is not configured");
    }

    // Map model id to Gemini model name.
    // Google retired the 2.5 models for new API keys; map old ids to current ones.
    const modelMap: Record<string, string> = {
      "gemini-3.8-flash": "gemini-3.8-flash",
      "gemini-3.1-pro-preview": "gemini-3.1-pro-preview",
      "gemini-2.5-pro": "gemini-3.1-pro-preview",
      "gemini-2.5-flash": "gemini-3.8-flash",
      "gemini-2.0-flash": "gemini-3.8-flash",
      "gemini-2.5-pro-preview-06-05": "gemini-3.1-pro-preview",
      "gemini-2.5-flash-preview-05-20": "gemini-3.8-flash",
    };
    const normalized = (model || "").replace(/^google\//, "");
    const geminiModel = modelMap[normalized] || normalized || "gemini-3.8-flash";

    const url = `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GOOGLE_AI_STUDIO_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: geminiModel,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited by Google AI. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("Google AI error:", response.status, t);
      return new Response(
        JSON.stringify({ error: `Google AI error: ${t}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-google error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
