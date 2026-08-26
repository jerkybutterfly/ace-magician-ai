/**
 * Test-Time Compute Scaling — Dynamic Reasoning Depth
 *
 * Standard agents use the same compute for every query. This module:
 * 1. Classifies task complexity (trivial → simple → moderate → complex → expert)
 * 2. Scales internal "thinking" tokens based on complexity
 * 3. Uses reasoning-focused models (o1/o3-style, DeepSeek-R1, QwQ) when available
 * 4. Generates thousands of hidden tokens to explore scenarios before acting
 *
 * The model "thinks longer" on hard problems, like a human pausing to reason.
 */

import { getSettings } from './settings';
import { classifyRequest, type TaskKind } from './smart-router';

// ── Complexity Levels ──────────────────────────────────────────────────

export type ComplexityLevel = 'trivial' | 'simple' | 'moderate' | 'complex' | 'expert';

export interface ComplexityProfile {
  level: ComplexityLevel;
  score: number;  // 0-100
  thinking_tokens: number;  // how many internal reasoning tokens to allow
  model_preference: 'fast' | 'balanced' | 'deep' | 'reasoning';
  timeout_ms: number;
  retries: number;
}

// ── Complexity Classification ──────────────────────────────────────────

const COMPLEXITY_SIGNALS = {
  // Trivial: greetings, yes/no, simple lookups
  trivial: /^(hi|hey|hello|yo|sup|thanks|ok|yes|no|cool|nice)\b/i,
  // Simple: single-step commands, simple questions
  simple: /^(what|when|where|who|how (?:do|to|long|old|much|many)|list|show|open|run|start|stop)\b/i,
  // Moderate: multi-step tasks, explanations, comparisons
  moderate: /\b(explain|compare|analyze|review|summarize|write|create|build|install|configure|setup|integrate|connect|deploy|migrate)\b/i,
  // Complex: architecture, debugging, multi-system, planning
  complex: /\b(design|architect|optimize|refactor|debug|troubleshoot|plan|strategize|implement.*system|full.*stack|end.*to.*end|multi.*step|pipeline|workflow|orchestrat)\b/i,
  // Expert: research, novel solutions, deep analysis, creativity
  expert: /\b(research|invent|novel|creative|prove|mathematic|theoretical|revolutionary|breakthrough|ground.*up|from.*scratch|paradigm|fundamental|root.*cause|deep.*dive|comprehensive.*analysis)\b/i,
};

function scoreComplexity(text: string, taskKind: TaskKind): ComplexityProfile {
  let score = 0;

  // Base score from task kind
  switch (taskKind) {
    case 'simple': score += 10; break;
    case 'code': score += 30; break;
    case 'tool': score += 25; break;
    case 'live': score += 20; break;
    case 'reasoning': score += 50; break;
    case 'vision': score += 35; break;
  }

  // Text length signal
  const words = text.split(/\s+/).length;
  if (words > 100) score += 15;
  else if (words > 50) score += 10;
  else if (words > 20) score += 5;

  // Complexity signal matching
  for (const [level, pattern] of Object.entries(COMPLEXITY_SIGNALS)) {
    if (pattern.test(text)) {
      switch (level) {
        case 'trivial': score += 0; break;
        case 'simple': score += 5; break;
        case 'moderate': score += 20; break;
        case 'complex': score += 40; break;
        case 'expert': score += 60; break;
      }
    }
  }

  // Multi-part question signal
  const questionMarks = (text.match(/\?/g) ?? []).length;
  if (questionMarks >= 3) score += 15;
  else if (questionMarks >= 2) score += 8;

  // Code complexity signals
  if (/\b(class|interface|type|enum|impl|trait|async|await|Promise|Observable)\b/.test(text)) score += 10;
  if (/\b(recursion|dynamic|optimization|algorithm|complexity)\b/i.test(text)) score += 15;

  // Normalize to 0-100
  score = Math.min(100, Math.max(0, score));

  // Map to level
  let level: ComplexityLevel;
  let model_preference: ComplexityProfile['model_preference'];
  let thinking_tokens: number;
  let timeout_ms: number;
  let retries: number;

  if (score <= 15) {
    level = 'trivial';
    model_preference = 'fast';
    thinking_tokens = 0;
    timeout_ms = 10_000;
    retries = 0;
  } else if (score <= 35) {
    level = 'simple';
    model_preference = 'fast';
    thinking_tokens = 128;
    timeout_ms = 15_000;
    retries = 0;
  } else if (score <= 55) {
    level = 'moderate';
    model_preference = 'balanced';
    thinking_tokens = 512;
    timeout_ms = 30_000;
    retries = 1;
  } else if (score <= 80) {
    level = 'complex';
    model_preference = 'deep';
    thinking_tokens = 2048;
    timeout_ms = 60_000;
    retries = 2;
  } else {
    level = 'expert';
    model_preference = 'reasoning';
    thinking_tokens = 4096;
    timeout_ms = 120_000;
    retries = 3;
  }

  return {
    level,
    score,
    thinking_tokens,
    model_preference,
    timeout_ms,
    retries,
  };
}

/**
 * Analyze a request and return the appropriate compute profile.
 */
export function analyzeComplexity(
  text: string,
  hasImage = false,
): ComplexityProfile {
  const taskKind = classifyRequest(text, { hasImage });
  return scoreComplexity(text, taskKind);
}

// ── Model Selection ────────────────────────────────────────────────────

/**
 * Pick the best model for the complexity level.
 * Reasoning models (o1, DeepSeek-R1, QwQ) get priority for expert tasks.
 */
export function pickReasoningModel(
  available: string[],
  profile: ComplexityProfile,
): string {
  const reasoningModels = [
    'deepseek-r1', 'qwq', 'o1', 'o3', 'qwen3-235b',
    'laguna-xs-2.1', 'gemini-2.5-pro', 'gpt-5',
  ];

  if (profile.model_preference === 'reasoning') {
    // Prefer reasoning models
    for (const rm of reasoningModels) {
      const found = available.find((m) => m.toLowerCase().includes(rm));
      if (found) return found;
    }
  }

  if (profile.model_preference === 'deep') {
    // Prefer large models
    const large = available.filter((m) => {
      const size = m.match(/(\d+(?:\.\d+)?)\s*b/i);
      return size && parseFloat(size[1]) >= 7;
    });
    if (large.length > 0) return large[0];
  }

  // Fallback to default
  return getSettings().defaultModel;
}

// ── Thinking Prompt Engineering ────────────────────────────────────────

/**
 * Build a thinking-reinforced prompt that encourages deep reasoning.
 * For expert tasks, the model generates extensive internal reasoning
 * before producing the final answer.
 */
export function buildThinkingPrompt(
  originalPrompt: string,
  profile: ComplexityProfile,
): string {
  if (profile.level === 'trivial' || profile.level === 'simple') {
    return originalPrompt;
  }

  const thinkingInstructions: Record<ComplexityLevel, string> = {
    trivial: '',
    simple: '',
    moderate: 'Think step by step. Consider alternatives before answering.',
    complex: `Take your time. Think through this carefully:
1. Break the problem into sub-problems
2. Consider multiple approaches
3. Identify potential pitfalls
4. Choose the best approach with justification
5. Implement the solution systematically`,
    expert: `This is a complex, expert-level task. Think deeply and thoroughly:
1. RESTATE the problem in your own words to ensure understanding
2. IDENTIFY all constraints, requirements, and edge cases
3. BRAINSTORM at least 3 different approaches
4. EVALUATE each approach (pros, cons, feasibility)
5. SELECT the best approach with clear reasoning
6. BREAK DOWN the implementation into concrete steps
7. ANTICIPATE failure modes and plan mitigations
8. PRODUCE a comprehensive, production-ready solution
Do NOT rush. Quality of reasoning matters more than speed.`,
  };

  return `${thinkingInstructions[profile.level]}\n\n${originalPrompt}`;
}

// ── Compute Budget Tracking ────────────────────────────────────────────

interface ComputeBudget {
  total_tokens_used: number;
  tasks_today: number;
  avg_tokens_per_task: number;
  peak_complexity: ComplexityLevel;
  reasoning_model_uses: number;
}

const BUDGET_KEY = 'reasoning-compute-budget-v1';

function loadBudget(): ComputeBudget {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    total_tokens_used: 0,
    tasks_today: 0,
    avg_tokens_per_task: 0,
    peak_complexity: 'trivial',
    reasoning_model_uses: 0,
  };
}

function saveBudget(budget: ComputeBudget): void {
  try {
    localStorage.setItem(BUDGET_KEY, JSON.stringify(budget));
  } catch {}
}

/**
 * Record compute usage for a task.
 */
export function recordComputeUsage(
  profile: ComplexityProfile,
  tokensUsed: number,
  usedReasoningModel: boolean,
): void {
  const budget = loadBudget();
  budget.total_tokens_used += tokensUsed;
  budget.tasks_today++;
  budget.avg_tokens_per_task = Math.round(budget.total_tokens_used / budget.tasks_today);

  const levels: ComplexityLevel[] = ['trivial', 'simple', 'moderate', 'complex', 'expert'];
  if (levels.indexOf(profile.level) > levels.indexOf(budget.peak_complexity)) {
    budget.peak_complexity = profile.level;
  }

  if (usedReasoningModel) budget.reasoning_model_uses++;

  saveBudget(budget);
}

/**
 * Get compute usage stats for display.
 */
export function getComputeStats(): ComputeBudget & { display: string } {
  const budget = loadBudget();
  return {
    ...budget,
    display: `Used ${budget.total_tokens_used.toLocaleString()} tokens across ${budget.tasks_today} tasks. Peak: ${budget.peak_complexity}. Reasoning model uses: ${budget.reasoning_model_uses}.`,
  };
}

// ── Integration Hook ───────────────────────────────────────────────────

/**
 * Main entry point: given a user message, determine the compute strategy.
 * Returns everything needed to execute the task at the right depth.
 */
export function planExecution(userMessage: string, hasImage = false): {
  profile: ComplexityProfile;
  thinking_prompt: string;
  model: string;
  timeout_ms: number;
} {
  const profile = analyzeComplexity(userMessage, hasImage);
  const thinking_prompt = buildThinkingPrompt(userMessage, profile);
  const available = [getSettings().defaultModel]; // could be expanded
  const model = pickReasoningModel(available, profile);

  return {
    profile,
    thinking_prompt,
    model,
    timeout_ms: profile.timeout_ms,
  };
}
