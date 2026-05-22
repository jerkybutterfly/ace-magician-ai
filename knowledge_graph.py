"""
knowledge_graph.py — Persistent Knowledge Graph Engine
Uses NetworkX for in-memory graph operations with JSON file persistence.
Supports entity/relationship CRUD, shortest-path queries, and neighbourhood lookups.
"""
from __future__ import annotations

import json
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

try:
    import networkx as nx  # type: ignore
except ImportError:
    raise ImportError("Run: pip install networkx")

# ── Storage ────────────────────────────────────────────────────────────────────
GRAPH_FILE = Path(__file__).parent / "knowledge_graph.json"
_graph: nx.DiGraph = nx.DiGraph()
_lock = threading.RLock()


# ── Persistence ────────────────────────────────────────────────────────────────

def _save() -> None:
    """Persist the graph to disk as JSON (node-link format)."""
    data = nx.node_link_data(_graph)
    GRAPH_FILE.write_text(json.dumps(data, indent=2, default=str), encoding="utf-8")


def _load() -> None:
    """Load graph from disk if the file exists."""
    global _graph
    if GRAPH_FILE.exists():
        try:
            data = json.loads(GRAPH_FILE.read_text(encoding="utf-8"))
            _graph = nx.node_link_graph(data, directed=True, multigraph=False)
        except Exception:
            _graph = nx.DiGraph()
    else:
        _graph = nx.DiGraph()


# Load on import
_load()


# ── Helpers ────────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.utcnow().isoformat()


def _node_dict(node_id: str) -> dict[str, Any]:
    attrs = dict(_graph.nodes.get(node_id, {}))
    attrs["id"] = node_id
    return attrs


def _edge_dict(src: str, dst: str) -> dict[str, Any]:
    attrs = dict(_graph.edges.get((src, dst), {}))
    attrs["source"] = src
    attrs["target"] = dst
    return attrs


# ── Public API ─────────────────────────────────────────────────────────────────

def add_entity(
    name: str,
    entity_type: str = "concept",
    description: str = "",
    **extra: Any,
) -> dict[str, Any]:
    """Add or update a node (entity) in the graph."""
    with _lock:
        node_id = name.lower().strip().replace(" ", "_")
        if not _graph.has_node(node_id):
            _graph.add_node(
                node_id,
                name=name,
                type=entity_type,
                description=description,
                created_at=_now(),
                **extra,
            )
        else:
            _graph.nodes[node_id].update(
                name=name,
                type=entity_type,
                description=description,
                updated_at=_now(),
                **extra,
            )
        _save()
        return _node_dict(node_id)


def add_relationship(
    source: str,
    target: str,
    relation: str,
    weight: float = 1.0,
    notes: str = "",
) -> dict[str, Any]:
    """Add or update a directed edge (relationship) between two entities.
    Entities are auto-created if they don't exist."""
    with _lock:
        src_id = source.lower().strip().replace(" ", "_")
        dst_id = target.lower().strip().replace(" ", "_")
        # Auto-create nodes if missing
        if not _graph.has_node(src_id):
            _graph.add_node(src_id, name=source, type="concept", created_at=_now())
        if not _graph.has_node(dst_id):
            _graph.add_node(dst_id, name=target, type="concept", created_at=_now())
        _graph.add_edge(
            src_id,
            dst_id,
            relation=relation,
            weight=weight,
            notes=notes,
            created_at=_now(),
        )
        _save()
        return _edge_dict(src_id, dst_id)


def get_entity(name: str) -> Optional[dict[str, Any]]:
    node_id = name.lower().strip().replace(" ", "_")
    with _lock:
        if not _graph.has_node(node_id):
            return None
        return _node_dict(node_id)


def get_neighbours(name: str, depth: int = 1) -> dict[str, Any]:
    """Return the neighbourhood of a node up to `depth` hops."""
    node_id = name.lower().strip().replace(" ", "_")
    with _lock:
        if not _graph.has_node(node_id):
            return {"error": f"Entity '{name}' not found"}
        subgraph_nodes = {node_id}
        frontier = {node_id}
        for _ in range(depth):
            next_frontier = set()
            for n in frontier:
                next_frontier.update(_graph.successors(n))
                next_frontier.update(_graph.predecessors(n))
            frontier = next_frontier - subgraph_nodes
            subgraph_nodes.update(frontier)
        sub = _graph.subgraph(subgraph_nodes)
        return {
            "centre": node_id,
            "nodes": [_node_dict(n) for n in sub.nodes],
            "edges": [_edge_dict(u, v) for u, v in sub.edges],
        }


def shortest_path(source: str, target: str) -> dict[str, Any]:
    """Find the shortest directed path between two entities."""
    src_id = source.lower().strip().replace(" ", "_")
    dst_id = target.lower().strip().replace(" ", "_")
    with _lock:
        try:
            path = nx.shortest_path(_graph, src_id, dst_id)
            edges = [_edge_dict(path[i], path[i + 1]) for i in range(len(path) - 1)]
            return {"path": path, "length": len(path) - 1, "edges": edges}
        except nx.NetworkXNoPath:
            return {"error": "No path found"}
        except nx.NodeNotFound as e:
            return {"error": str(e)}


def search_entities(query: str, limit: int = 20) -> list[dict[str, Any]]:
    """Full-text search across entity names and descriptions."""
    q = query.lower()
    with _lock:
        results = []
        for node_id in _graph.nodes:
            attrs = _graph.nodes[node_id]
            haystack = f"{node_id} {attrs.get('name','')} {attrs.get('description','')} {attrs.get('type','')}".lower()
            if q in haystack:
                results.append(_node_dict(node_id))
        return results[:limit]


def delete_entity(name: str) -> bool:
    node_id = name.lower().strip().replace(" ", "_")
    with _lock:
        if _graph.has_node(node_id):
            _graph.remove_node(node_id)
            _save()
            return True
        return False


def delete_relationship(source: str, target: str) -> bool:
    src_id = source.lower().strip().replace(" ", "_")
    dst_id = target.lower().strip().replace(" ", "_")
    with _lock:
        if _graph.has_edge(src_id, dst_id):
            _graph.remove_edge(src_id, dst_id)
            _save()
            return True
        return False


def graph_stats() -> dict[str, Any]:
    with _lock:
        return {
            "nodes": _graph.number_of_nodes(),
            "edges": _graph.number_of_edges(),
            "is_dag": nx.is_directed_acyclic_graph(_graph),
            "density": round(nx.density(_graph), 4),
            "components": nx.number_weakly_connected_components(_graph),
        }


def export_graph() -> dict[str, Any]:
    """Export the full graph as node-link JSON."""
    with _lock:
        return nx.node_link_data(_graph)
