/**
 * GraphRAG — Graph-based Retrieval-Augmented Generation
 *
 * Replaces flat vector search with a graph of typed nodes and weighted edges.
 * Memories are stored as entities (nodes) connected by typed relationships (edges),
 * enabling multi-hop reasoning like "User X is married to Person Y who owns Company Z."
 *
 * Storage: localStorage (survives page refreshes, synced to agent via /memory/*).
 * Retrieval: BFS/DFS traversal from seed nodes + LLM-powered relationship queries.
 */

import { getSettings } from './settings';

// ── Types ──────────────────────────────────────────────────────────────

export type NodeType =
  | 'person'
  | 'place'
  | 'tool'
  | 'project'
  | 'concept'
  | 'event'
  | 'file'
  | 'command'
  | 'preference'
  | 'skill'
  | 'error'
  | 'lesson'
  | 'goal'
  | 'entity';

export type EdgeType =
  | 'works_on'
  | 'owns'
  | 'uses'
  | 'located_in'
  | 'related_to'
  | 'depends_on'
  | 'learned_from'
  | 'created_by'
  | 'failed_at'
  | 'solved_by'
  | 'prefers'
  | 'knows'
  | 'manages'
  | 'contains'
  | 'caused_by'
  | 'resolved_by'
  | 'alternatively_uses'
  | 'evolved_into'
  | 'part_of'
  | 'mentions';

export interface GraphNode {
  id: string;
  type: NodeType;
  label: string;
  properties: Record<string, string | number | boolean>;
  created_at: number;
  updated_at: number;
  access_count: number;  // how often this node is retrieved — boosts relevance
}

export interface GraphEdge {
  id: string;
  source: string;  // node id
  target: string;  // node id
  type: EdgeType;
  weight: number;  // 0-1, strengthened on co-occurrence
  properties: Record<string, string | number>;
  created_at: number;
  evidence: string;  // the text/episode that created this edge
}

export interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphQueryResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  context: string;  // formatted text for LLM injection
  confidence: number;
}

// ── Storage ────────────────────────────────────────────────────────────

const GRAPH_KEY = 'graphrag-state-v1';

function loadGraph(): GraphState {
  try {
    const raw = localStorage.getItem(GRAPH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { nodes: [], edges: [] };
}

function saveGraph(state: GraphState): void {
  try {
    localStorage.setItem(GRAPH_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('GraphRAG save failed:', e);
  }
}

// ── Node CRUD ──────────────────────────────────────────────────────────

function makeId(label: string, type: NodeType): string {
  return `${type}::${label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}`;
}

export function upsertNode(
  label: string,
  type: NodeType,
  properties: Record<string, string | number | boolean> = {},
): GraphNode {
  const state = loadGraph();
  const id = makeId(label, type);
  const now = Date.now();
  const existing = state.nodes.find((n) => n.id === id);

  if (existing) {
    existing.properties = { ...existing.properties, ...properties };
    existing.updated_at = now;
    existing.access_count++;
    saveGraph(state);
    return existing;
  }

  const node: GraphNode = {
    id,
    type,
    label,
    properties,
    created_at: now,
    updated_at: now,
    access_count: 1,
  };
  state.nodes.push(node);
  saveGraph(state);
  return node;
}

export function getNode(id: string): GraphNode | undefined {
  return loadGraph().nodes.find((n) => n.id === id);
}

export function findNodes(query: string, type?: NodeType): GraphNode[] {
  const state = loadGraph();
  const q = query.toLowerCase();
  return state.nodes.filter(
    (n) =>
      (!type || n.type === type) &&
      (n.label.toLowerCase().includes(q) ||
        Object.values(n.properties).some(
          (v) => typeof v === 'string' && v.toLowerCase().includes(q),
        )),
  );
}

// ── Edge CRUD ──────────────────────────────────────────────────────────

function makeEdgeId(source: string, target: string, type: EdgeType): string {
  return `${source}--${type}--${target}`;
}

export function connect(
  sourceLabel: string,
  sourceType: NodeType,
  targetLabel: string,
  targetType: NodeType,
  edgeType: EdgeType,
  weight = 0.5,
  evidence = '',
  properties: Record<string, string | number> = {},
): GraphEdge {
  const source = upsertNode(sourceLabel, sourceType);
  const target = upsertNode(targetLabel, targetType);
  const state = loadGraph();
  const edgeId = makeEdgeId(source.id, target.id, edgeType);
  const now = Date.now();
  const existing = state.edges.find((e) => e.id === edgeId);

  if (existing) {
    // Strengthen edge on co-occurrence (decay toward 1.0)
    existing.weight = Math.min(1.0, existing.weight + 0.1 * (1.0 - existing.weight));
    existing.properties = { ...existing.properties, ...properties };
    if (evidence) existing.evidence = evidence;
    saveGraph(state);
    return existing;
  }

  const edge: GraphEdge = {
    id: edgeId,
    source: source.id,
    target: target.id,
    type: edgeType,
    weight: Math.max(0.1, Math.min(1.0, weight)),
    properties,
    created_at: now,
    evidence,
  };
  state.edges.push(edge);
  saveGraph(state);
  return edge;
}

// ── Graph Traversal ────────────────────────────────────────────────────

/**
 * BFS traversal from a seed node, collecting nodes and edges up to maxDepth.
 * Returns the subgraph relevant to the seed.
 */
export function traverseFrom(
  seedId: string,
  maxDepth = 2,
  maxNodes = 30,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const state = loadGraph();
  const visited = new Set<string>();
  const resultNodes: GraphNode[] = [];
  const resultEdges: GraphEdge[] = [];
  const queue: { id: string; depth: number }[] = [{ id: seedId, depth: 0 }];

  while (queue.length > 0 && resultNodes.length < maxNodes) {
    const { id, depth } = queue.shift()!;
    if (visited.has(id) || depth > maxDepth) continue;
    visited.add(id);

    const node = state.nodes.find((n) => n.id === id);
    if (!node) continue;
    node.access_count++;
    resultNodes.push(node);

    // Find all connected edges
    const connected = state.edges.filter(
      (e) => e.source === id || e.target === id,
    );
    for (const edge of connected) {
      resultEdges.push(edge);
      const nextId = edge.source === id ? edge.target : edge.source;
      if (!visited.has(nextId) && depth + 1 <= maxDepth) {
        queue.push({ id: nextId, depth: depth + 1 });
      }
    }
  }

  saveGraph(state); // persist access_count updates
  return { nodes: resultNodes, edges: resultEdges };
}

/**
 * Find nodes most relevant to a text query using label/property matching.
 * Falls back to full graph scan when no seed nodes match.
 */
export function findRelevantSubgraph(
  query: string,
  maxNodes = 20,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const state = loadGraph();
  const q = query.toLowerCase();

  // Score each node by relevance to query
  const scored = state.nodes.map((n) => {
    let score = 0;
    if (n.label.toLowerCase().includes(q)) score += 10;
    for (const v of Object.values(n.properties)) {
      if (typeof v === 'string' && v.toLowerCase().includes(q)) score += 5;
    }
    // Boost by access frequency
    score += Math.min(n.access_count * 0.5, 5);
    // Boost by recency
    const ageHours = (Date.now() - n.updated_at) / 3600000;
    if (ageHours < 24) score += 3;
    else if (ageHours < 168) score += 1;
    return { node: n, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const seeds = scored.slice(0, 5).filter((s) => s.score > 0).map((s) => s.node);

  if (seeds.length === 0) {
    // No direct matches — return most-accessed nodes as context
    const topByAccess = [...state.nodes]
      .sort((a, b) => b.access_count - a.access_count)
      .slice(0, maxNodes);
    const nodeIds = new Set(topByAccess.map((n) => n.id));
    const edges = state.edges.filter(
      (e) => nodeIds.has(e.source) || nodeIds.has(e.target),
    );
    return { nodes: topByAccess, edges };
  }

  // Traverse from top seeds and merge subgraphs
  const mergedNodes = new Map<string, GraphNode>();
  const mergedEdges = new Map<string, GraphEdge>();

  for (const seed of seeds) {
    const sub = traverseFrom(seed.id, 2, maxNodes);
    for (const n of sub.nodes) mergedNodes.set(n.id, n);
    for (const e of sub.edges) mergedEdges.set(e.id, e);
  }

  return {
    nodes: [...mergedNodes.values()].slice(0, maxNodes),
    edges: [...mergedEdges.values()],
  };
}

// ── Context Formatting ─────────────────────────────────────────────────

/**
 * Format a subgraph into human-readable context for LLM injection.
 * Example output:
 *   - Stephen Dunne [person] works_on Project X
 *   - Project X [project] uses Ollama [tool]
 *   - Ollama [tool] evolved_into Laguna XS 2.1 [entity]
 */
export function formatGraphContext(subgraph: {
  nodes: GraphNode[];
  edges: GraphEdge[];
}): string {
  if (subgraph.nodes.length === 0) return '';

  const parts: string[] = ['--- GRAPH MEMORY (relationship-aware context) ---'];

  // Group edges by source for readable rendering
  const bySource = new Map<string, GraphEdge[]>();
  for (const edge of subgraph.edges) {
    const arr = bySource.get(edge.source) ?? [];
    arr.push(edge);
    bySource.set(edge.source, arr);
  }

  const nodeMap = new Map(subgraph.nodes.map((n) => [n.id, n]));

  for (const node of subgraph.nodes) {
    const edges = bySource.get(node.id) ?? [];
    if (edges.length === 0) {
      // Leaf node — just show it
      const props = Object.entries(node.properties)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      parts.push(`• ${node.label} [${node.type}]${props ? ` (${props})` : ''}`);
    } else {
      for (const edge of edges) {
        const target = nodeMap.get(edge.target);
        if (!target) continue;
        const strength = edge.weight >= 0.8 ? '→' : edge.weight >= 0.5 ? '→' : '→';
        const confidence = edge.weight >= 0.8 ? '★' : edge.weight >= 0.5 ? '☆' : '·';
        parts.push(
          `• ${node.label} [${node.type}] ${confidence}${edge.type.replace(/_/g, ' ')} ${target.label} [${target.type}]`,
        );
        if (edge.evidence) {
          parts.push(`  evidence: ${edge.evidence.slice(0, 120)}`);
        }
      }
    }
  }

  return parts.join('\n');
}

// ── Auto-Extract from Text ─────────────────────────────────────────────

/**
 * Given a text chunk (e.g., a chat turn, episode, or document),
 * extract entities and relationships using regex + heuristics.
 * This is the "passive learning" component — no LLM call needed.
 */
export function extractFromText(text: string): {
  nodes: { label: string; type: NodeType }[];
  edges: { source: string; sourceType: NodeType; target: string; targetType: NodeType; edgeType: EdgeType; evidence: string }[];
} {
  const nodes: { label: string; type: NodeType }[] = [];
  const edges: { source: string; sourceType: NodeType; target: string; targetType: NodeType; edgeType: EdgeType; evidence: string }[] = [];

  // Extract tool/command mentions
  const toolMatches = text.match(/\b(ollama|llama\.?cpp|lmstudio|lm studio|colibri|openai|gemini|chromadb|chroma|remotion|fooocus|piper|ffmpeg|playwright|selenium|chromium|chrome|firefox|docker|node\.?js|python|typescript|rust|java|c\+\+|sql|redis|mongodb|postgresql|sqlite|nginx|apache|tailscale|adb|mqtt|zigbee|home.?assistant|n8n|obsidian|supabase|firecrawl|openai|claude|anthropic|deepseek|qwen|mistral|llava|nomic)\b/gi);
  if (toolMatches) {
    for (const m of new Set(toolMatches.map((t) => t.toLowerCase()))) {
      nodes.push({ label: m, type: 'tool' });
    }
  }

  // Extract file paths
  const fileMatches = text.match(/[A-Z]:\\[\w.\-\s\/]+|~\/[\w.\-\/]+|\.\.?\/[\w.\-\/]+/g);
  if (fileMatches) {
    for (const f of new Set(fileMatches.slice(0, 5))) {
      nodes.push({ label: f.trim(), type: 'file' });
    }
  }

  // Extract project names (capitalized multi-word)
  const projectMatches = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g);
  if (projectMatches) {
    for (const p of new Set(projectMatches.slice(0, 5))) {
      if (!/^(The|This|That|When|Where|What|How|Why|Please|Could|Would|Should|Can|I|You|We|They|It)/.test(p)) {
        nodes.push({ label: p, type: 'project' });
      }
    }
  }

  // Extract error patterns → lessons
  const errorMatches = text.match(/error[:\s]+(.{20,100})/gi);
  if (errorMatches) {
    for (const e of errorMatches.slice(0, 3)) {
      nodes.push({ label: e.slice(0, 80), type: 'error' });
    }
  }

  // Build edges from co-occurrence in same sentence
  const sentences = text.split(/[.!?\n]+/).filter((s) => s.trim().length > 10);
  for (const sentence of sentences) {
    const s = sentence.toLowerCase();
    const toolsInSentence = nodes.filter(
      (n) => n.type === 'tool' && s.includes(n.label.toLowerCase()),
    );
    // If 2+ tools mentioned together, create related_to edge
    for (let i = 0; i < toolsInSentence.length; i++) {
      for (let j = i + 1; j < toolsInSentence.length; j++) {
        edges.push({
          source: toolsInSentence[i].label,
          sourceType: 'tool',
          target: toolsInSentence[j].label,
          targetType: 'tool',
          edgeType: 'related_to',
          evidence: sentence.trim().slice(0, 200),
        });
      }
    }
  }

  return { nodes, edges };
}

/**
 * Ingest a text chunk into the graph — extract entities and build connections.
 * Call this from chat turns, episodes, or document ingestion.
 */
export function ingestText(text: string): { nodesAdded: number; edgesAdded: number } {
  const extracted = extractFromText(text);
  let nodesAdded = 0;
  let edgesAdded = 0;

  for (const n of extracted.nodes) {
    upsertNode(n.label, n.type);
    nodesAdded++;
  }

  for (const e of extracted.edges) {
    connect(
      e.source, e.sourceType,
      e.target, e.targetType,
      e.edgeType, 0.5, e.evidence,
    );
    edgesAdded++;
  }

  return { nodesAdded, edgesAdded };
}

// ── Query API ──────────────────────────────────────────────────────────

/**
 * Main query function: finds relevant subgraph and formats it for LLM context.
 * This replaces flat vector search with graph-aware retrieval.
 */
export function graphQuery(query: string): GraphQueryResult {
  const subgraph = findRelevantSubgraph(query, 25);
  const context = formatGraphContext(subgraph);

  // Confidence based on how many nodes matched and edge strength
  const avgEdgeWeight = subgraph.edges.length > 0
    ? subgraph.edges.reduce((sum, e) => sum + e.weight, 0) / subgraph.edges.length
    : 0;
  const confidence = Math.min(1.0,
    (subgraph.nodes.length > 0 ? 0.3 : 0) +
    Math.min(subgraph.nodes.length / 10, 0.3) +
    avgEdgeWeight * 0.4,
  );

  return {
    nodes: subgraph.nodes,
    edges: subgraph.edges,
    context,
    confidence,
  };
}

// ── Stats ──────────────────────────────────────────────────────────────

export function graphStats(): {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<string, number>;
  edgesByType: Record<string, number>;
  mostAccessed: { label: string; type: string; count: number }[];
} {
  const state = loadGraph();
  const nodesByType: Record<string, number> = {};
  const edgesByType: Record<string, number> = {};

  for (const n of state.nodes) {
    nodesByType[n.type] = (nodesByType[n.type] || 0) + 1;
  }
  for (const e of state.edges) {
    edgesByType[e.type] = (edgesByType[e.type] || 0) + 1;
  }

  const mostAccessed = [...state.nodes]
    .sort((a, b) => b.access_count - a.access_count)
    .slice(0, 10)
    .map((n) => ({ label: n.label, type: n.type, count: n.access_count }));

  return {
    totalNodes: state.nodes.length,
    totalEdges: state.edges.length,
    nodesByType,
    edgesByType,
    mostAccessed,
  };
}

/**
 * Clear the entire graph (for reset/debug).
 */
export function clearGraph(): void {
  saveGraph({ nodes: [], edges: [] });
}

/**
 * Export graph as JSON for backup/sync.
 */
export function exportGraph(): string {
  return JSON.stringify(loadGraph(), null, 2);
}

/**
 * Import graph from JSON.
 */
export function importGraph(json: string): void {
  const state = JSON.parse(json) as GraphState;
  if (Array.isArray(state.nodes) && Array.isArray(state.edges)) {
    saveGraph(state);
  }
}
