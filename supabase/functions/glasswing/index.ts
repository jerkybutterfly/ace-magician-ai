// Glasswing / Mythos backend — AI vuln hunter, code auditor, agent reasoner
// Uses Lovable AI Gateway with tool-calling for structured outputs.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const FINDING_SCHEMA = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low", "info"],
          },
          category: { type: "string" },
          location: {
            type: "string",
            description: "File:line, URL, or component path",
          },
          description: { type: "string" },
          impact: { type: "string" },
          exploit_scenario: { type: "string" },
          patch_suggestion: { type: "string" },
          cwe: { type: "string" },
          confidence: { type: "string", enum: ["high", "medium", "low"] },
        },
        required: ["title", "severity", "description", "patch_suggestion", "confidence"],
        additionalProperties: false,
      },
    },
    summary: { type: "string" },
  },
  required: ["findings", "summary"],
  additionalProperties: false,
};

const AGENT_STEP_SCHEMA = {
  type: "object",
  properties: {
    thought: { type: "string", description: "Reasoning about what to do next" },
    action: {
      type: "string",
      enum: [
        "web_search",
        "web_fetch",
        "run_command",
        "drana_run",
        "analyze",
        "finish",
      ],
    },
    action_input: { type: "string" },
    is_final: { type: "boolean" },
    final_report: { type: "string" },
  },
  required: ["thought", "action", "is_final"],
  additionalProperties: false,
};

async function callAI(opts: {
  model?: string;
  system: string;
  user: string;
  toolName: string;
  schema: unknown;
  reasoning?: "low" | "medium" | "high";
}) {
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");
  const body: Record<string, unknown> = {
    model: opts.model || "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: opts.toolName,
          description: "Return the structured result.",
          parameters: opts.schema,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: opts.toolName } },
  };
  if (opts.reasoning) body.reasoning = { effort: opts.reasoning };

  const r = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (r.status === 429) throw Object.assign(new Error("Rate limited"), { status: 429 });
  if (r.status === 402) throw Object.assign(new Error("Out of AI credits"), { status: 402 });
  if (!r.ok) throw new Error(`AI error ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("AI returned no tool call");
  return JSON.parse(args);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, payload } = await req.json();

    if (mode === "hunt") {
      // Vuln hunter — recon context → candidate vulnerabilities
      const { target, recon, model } = payload;
      const result = await callAI({
        model: model || "google/gemini-3-flash-preview",
        reasoning: "high",
        system:
          "You are Mythos, Anthropic's frontier defensive cybersecurity model used in Project Glasswing. " +
          "You analyze recon data to identify candidate vulnerabilities in critical software. " +
          "Be rigorous: only report findings you can justify with the evidence. Mark confidence honestly. " +
          "Prefer high-impact issues (RCE, auth bypass, privilege escalation, memory safety, injection, crypto misuse).",
        user: `TARGET: ${target}\n\nRECON DATA:\n${recon}\n\nIdentify candidate vulnerabilities. For each finding include CWE id when applicable, an exploit scenario, and a concrete patch suggestion.`,
        toolName: "report_findings",
        schema: FINDING_SCHEMA,
      });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "audit") {
      // Code auditor — deep static review with patches
      const { code, language, context, model } = payload;
      const result = await callAI({
        model: model || "google/gemini-3-flash-preview",
        reasoning: "high",
        system:
          "You are Mythos performing a defensive code audit. Find real security bugs: injection, auth bypass, " +
          "taint flows, memory safety, race conditions, crypto misuse, secret leakage, deserialization, SSRF, path traversal, " +
          "broken access control. For each finding, cite the exact line(s), describe the exploit, and write a concrete patch diff suggestion.",
        user:
          `LANGUAGE: ${language || "auto"}\nCONTEXT: ${context || "(none)"}\n\nCODE:\n\`\`\`\n${code}\n\`\`\``,
        toolName: "report_findings",
        schema: FINDING_SCHEMA,
      });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "agent_step") {
      // One reasoning step of the autonomous agent loop
      const { goal, history, model } = payload;
      const result = await callAI({
        model: model || "google/gemini-3-flash-preview",
        reasoning: "medium",
        system:
          "You are the Mythos autonomous agent. You plan, act, and reflect to accomplish a security goal. " +
          "On each step, decide ONE action. Available actions:\n" +
          "- web_search: input = query string (uses DuckDuckGo)\n" +
          "- web_fetch: input = URL to fetch and read\n" +
          "- run_command: input = shell command (lab mode required on agent)\n" +
          "- drana_run: input = JSON {\"command\":\"...\",\"target\":\"...\"} for Drana recon tools\n" +
          "- analyze: input = your analysis text (no external call)\n" +
          "- finish: set is_final=true and provide final_report\n" +
          "Be efficient. Stop when the goal is met or further actions are unsafe.",
        user: `GOAL: ${goal}\n\nHISTORY (most recent last):\n${history}\n\nDecide the next step.`,
        toolName: "next_step",
        schema: AGENT_STEP_SCHEMA,
      });
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown mode" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const status = (e as { status?: number }).status || 500;
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("glasswing error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
