/**
 * ETW — Shared Fund Flow Graph Pure Mapping Helpers
 * Maps DB records and raw entity/relationship arrays to React Flow graph nodes and edges.
 * Handles cycles, missing data, gap nodes, and Indian currency formatting.
 */

export type EntityType =
  | "person"
  | "company"
  | "trust"
  | "foundation"
  | "NGO"
  | "project"
  | "region"
  | "other"
  | string;

export interface GraphEntity {
  id: string;
  name: string;
  type: EntityType;
  location?: string | null;
  description?: string | null;
}

export interface GraphEvidence {
  title?: string;
  url: string;
  sourceOrg?: string;
  date?: string;
}

export interface GraphRelationship {
  id?: string;
  from: string;
  to: string;
  label?: string | null;
  type?: string | null;
  amount?: number | null;
  currency?: string | null;
  date?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
  evidence?: (GraphEvidence | string)[] | null;
  verified: boolean;
  isEstimated?: boolean;
  isGap?: boolean;
  gapExplanation?: string | null;
}

export interface GraphMappedNode {
  id: string;
  type: "entity" | "gap";
  data: {
    entity: GraphEntity;
    label?: string;
    gapExplanation?: string | null;
  };
}

export interface GraphMappedEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data: {
    relationshipId?: string;
    relationshipType?: string | null;
    amount?: number | null;
    currency?: string;
    date?: string | null;
    source?: string | null;
    sourceUrl?: string | null;
    evidence?: (GraphEvidence | string)[] | null;
    isVerified: boolean;
    isEstimated?: boolean;
    isGap?: boolean;
    gapExplanation?: string | null;
  };
}

/**
 * Format amounts according to the Indian numbering system (e.g. ₹25,00,000)
 */
export function formatIndianRupee(
  amount: number | null | undefined,
  currency: string = "INR"
): string {
  if (amount == null) return "Not publicly disclosed";
  const symbol = currency === "INR" || currency === "₹" ? "₹" : `${currency} `;
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const str = absAmount.toString();

  if (str.length <= 3) {
    return `${isNegative ? "-" : ""}${symbol}${str}`;
  }

  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${isNegative ? "-" : ""}${symbol}${formattedOther},${lastThree}`;
}

/**
 * Cycle detection: returns true if adding an edge from source to target would create a cycle.
 */
export function wouldCreateCycle(
  source: string,
  target: string,
  adjacencyList: Map<string, Set<string>>
): boolean {
  if (source === target) return true;
  const visited = new Set<string>();
  const queue: string[] = [target];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === source) return true;
    if (!visited.has(current)) {
      visited.add(current);
      const neighbors = adjacencyList.get(current);
      if (neighbors) {
        for (const neighbor of neighbors) {
          queue.push(neighbor);
        }
      }
    }
  }
  return false;
}

/**
 * Pure mapping helper: Transforms entities & relationships to sanitized Graph nodes & edges.
 * Handles missing entity definitions, gap nodes ("?"), cycles, and missing data gracefully.
 */
export function mapEntitiesAndRelationshipsToGraph(
  entities: GraphEntity[],
  relationships: GraphRelationship[]
): {
  nodes: GraphMappedNode[];
  edges: GraphMappedEdge[];
  hasCycles: boolean;
} {
  const entityMap = new Map<string, GraphEntity>();
  for (const ent of entities) {
    entityMap.set(ent.id, {
      ...ent,
      type: ent.type || "other",
    });
  }

  const nodes: GraphMappedNode[] = [];
  const edges: GraphMappedEdge[] = [];
  const adjacency = new Map<string, Set<string>>();
  let hasCycles = false;

  // Process relationships and ensure all referenced endpoints exist
  relationships.forEach((rel, index) => {
    const relId = rel.id || `rel-${index}`;
    let sourceId = rel.from;
    let targetId = rel.to;

    // Handle gap nodes
    if (rel.isGap || sourceId === "?" || targetId === "?") {
      const gapId = `gap-${relId}`;
      if (sourceId === "?" || !sourceId) {
        sourceId = gapId;
        entityMap.set(gapId, {
          id: gapId,
          name: "Not publicly traceable",
          type: "other",
          description: rel.gapExplanation || "Gap in publicly available financial records",
        });
      } else if (targetId === "?" || !targetId) {
        targetId = gapId;
        entityMap.set(gapId, {
          id: gapId,
          name: "Not publicly traceable",
          type: "other",
          description: rel.gapExplanation || "Gap in publicly available financial records",
        });
      }
    }

    // Auto-stub missing source/target entities
    if (!entityMap.has(sourceId)) {
      entityMap.set(sourceId, {
        id: sourceId,
        name: sourceId,
        type: "other",
        description: "Not publicly disclosed in entity registry",
      });
    }
    if (!entityMap.has(targetId)) {
      entityMap.set(targetId, {
        id: targetId,
        name: targetId,
        type: "other",
        description: "Not publicly disclosed in entity registry",
      });
    }

    // Check for cycles
    const isCycle = wouldCreateCycle(sourceId, targetId, adjacency);
    if (isCycle) {
      hasCycles = true;
    } else {
      if (!adjacency.has(sourceId)) {
        adjacency.set(sourceId, new Set());
      }
      adjacency.get(sourceId)!.add(targetId);
    }

    // Create edge
    edges.push({
      id: relId,
      source: sourceId,
      target: targetId,
      label: rel.label || undefined,
      data: {
        relationshipId: relId,
        relationshipType: rel.type,
        amount: rel.amount,
        currency: rel.currency || "INR",
        date: rel.date,
        source: rel.source,
        sourceUrl: rel.sourceUrl,
        evidence: rel.evidence,
        isVerified: rel.verified === true,
        isEstimated: rel.isEstimated === true,
        isGap: rel.isGap === true || sourceId.startsWith("gap-") || targetId.startsWith("gap-"),
        gapExplanation: rel.gapExplanation,
      },
    });
  });

  // Construct node list from entityMap
  for (const [id, ent] of entityMap.entries()) {
    const isGapNode = id.startsWith("gap-") || ent.name === "Not publicly traceable";
    nodes.push({
      id,
      type: isGapNode ? "gap" : "entity",
      data: {
        entity: ent,
        label: isGapNode ? "Not publicly traceable" : ent.name,
        gapExplanation: isGapNode ? ent.description : null,
      },
    });
  }

  return { nodes, edges, hasCycles };
}
