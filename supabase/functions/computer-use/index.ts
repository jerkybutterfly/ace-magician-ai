import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `You are "Computer Use" — an autonomous desktop operator inspired by OpenAI Codex.
You see a screenshot of the user's desktop and decide the SINGLE next action to progress the goal.

Respond with STRICT JSON only — no prose, no markdown:
{
  "thought": "one short sentence about what you see and why you chose this action",
  "action": {
    "type": "click" | "double_click" | "right_click" | "move" | "type" | "key" | "hotkey" | "scroll" | "wait" | "done" | "fail",
    "x": <int pixel, required for click/double_click/right_click/move/scroll>,
    "y": <int pixel, required for click/double_click/right_click/move/scroll>,
    "text": "<string, required for type>",
    "key": "<string, required for key, e.g. 'enter', 'esc', 'tab'>",
    "keys": ["ctrl","c"],   // required for hotkey
    "amount": <int, scroll wheel ticks, +up / -down>,
    "ms": <int, wait duration>,
    "reason": "<for done/fail: explain>"
  },
  "needs_approval": true | false,
  "risk": "low" | "medium" | "high"
}

Rules:
- Coordinates are in the SAME pixel space as the screenshot you see.
- Prefer one small step at a time. If a menu opened, click the right item next turn.
- BEFORE typing into a field, you MUST first emit a "click" on the field (one turn), THEN "type" on the next turn. Optionally include x/y on the "type" action so the agent re-focuses the field.
- For search/submit, after typing emit a "key" with key="enter" on the next turn.
- Set needs_approval=true and risk=high for: deleting files, sending email, payments, installing software, system settings, anything destructive.
- Use "done" when the goal is complete, "fail" if blocked.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { goal, image, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!image) throw new Error("image (base64 PNG) required");

    const userContent: unknown[] = [
      { type: "text", text: `GOAL: ${goal}\n\nRecent actions:\n${(history || []).slice(-6).map((h: { summary: string }) => "- " + h.summary).join("\n") || "(none)"}\n\nReturn ONLY the JSON for the next action.` },
      { type: "image_url", image_url: { url: `data:image/png;base64,${image}` } },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("computer-use AI error", response.status, t);
      return new Response(JSON.stringify({ error: t || "AI error" }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { parsed = { thought: "parse error", action: { type: "fail", reason: "model returned non-JSON" }, needs_approval: false, risk: "low" }; }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("computer-use error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
