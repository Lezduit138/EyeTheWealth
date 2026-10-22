/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  Handle,
  Position,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { X, Table, Network, HelpCircle, AlertCircle, ExternalLink } from "lucide-react";
import {
  GraphEntity,
  GraphRelationship,
  formatIndianRupee,
  mapEntitiesAndRelationshipsToGraph,
} from "@/lib/graph/fund-flow-mapper";

// ─── Custom Node Components ──────────────────────────────────────────────────

const EntityNode = ({ data }: any) => {
  const isSelected = !!data.selected;
  const entity: GraphEntity = data.entity;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${entity.type}: ${entity.name}`}
      className={`p-3 min-w-[220px] max-w-[280px] bg-white border-2 border-black relative cursor-pointer hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
        isSelected ? "ring-2 ring-black ring-offset-2 shadow-lg" : ""
      }`}
      onClick={() => data.onClick?.(entity)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          data.onClick?.(entity);
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-black !w-2 !h-2 !border-none !rounded-none"
      />
      <div className="flex items-center justify-between mb-1">
        <span className="uppercase font-bold tracking-widest text-neutral-500 text-[10px]">
          {entity.type || "OTHER"}
        </span>
      </div>
      <div className="font-bold text-sm leading-snug text-black break-words">
        {entity.name}
      </div>
      {entity.location && (
        <div className="text-xs text-neutral-600 mt-1 truncate">
          {entity.location}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-black !w-2 !h-2 !border-none !rounded-none"
      />
    </div>
  );
};

const GapNode = ({ data }: any) => {
  const isSelected = !!data.selected;
  const entity: GraphEntity = data.entity;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Not publicly traceable gap node"
      className={`flex flex-col items-center justify-center p-2 min-w-[180px] cursor-pointer bg-white border-2 border-dashed border-neutral-400 hover:border-black transition-colors focus:outline-none focus:ring-2 focus:ring-black ${
        isSelected ? "border-black ring-2 ring-black" : ""
      }`}
      onClick={() => data.onClick?.(entity)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          data.onClick?.(entity);
        }
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-black !w-2 !h-2 !border-none !rounded-none"
      />
      <div className="w-8 h-8 border-2 border-dashed border-black rounded-full flex items-center justify-center text-black font-bold mb-1 bg-neutral-100">
        <HelpCircle size={18} />
      </div>
      <div className="text-[11px] text-black font-bold uppercase tracking-wider text-center">
        Not Publicly Traceable
      </div>
      {data.gapExplanation && (
        <div className="text-[10px] text-neutral-600 text-center mt-1 px-1 line-clamp-2">
          {data.gapExplanation}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
};

const nodeTypes = {
  entity: EntityNode,
  gap: GapNode,
};

// ─── Dagre Layout Engine ─────────────────────────────────────────────────────

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const nodeWidth = 240;
  const nodeHeight = 110;

  dagreGraph.setGraph({
    rankdir: direction,
    align: "UL",
    ranksep: 90,
    nodesep: 60,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id) || { x: 0, y: 0 };
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

// ─── Main Component Props ────────────────────────────────────────────────────

export interface FundFlowGraphProps {
  entities: GraphEntity[];
  relationships: GraphRelationship[];
  className?: string;
  emptyStateMessage?: string;
}

export function FundFlowGraph({
  entities,
  relationships,
  className = "",
  emptyStateMessage = "No public transactions on record to generate a fund flow graph.",
}: FundFlowGraphProps) {
  const [selectedEntity, setSelectedEntity] = useState<GraphEntity | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "table">("graph");

  // Pure mapping from input to ReactFlow structures
  const mapped = useMemo(() => {
    return mapEntitiesAndRelationshipsToGraph(entities, relationships);
  }, [entities, relationships]);

  const rawNodes = useMemo<Node[]>(() => {
    return mapped.nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: 0, y: 0 },
      data: {
        entity: n.data.entity,
        label: n.data.label,
        gapExplanation: n.data.gapExplanation,
      },
    }));
  }, [mapped.nodes]);

  const rawEdges = useMemo<Edge[]>(() => {
    return mapped.edges.map((e) => {
      const isUnverified = !e.data.isVerified;
      const isEstimated = !!e.data.isEstimated;
      const isGap = !!e.data.isGap;

      let amountText = "";
      if (e.data.amount != null) {
        amountText = formatIndianRupee(e.data.amount, e.data.currency);
        if (isEstimated) amountText += " (Estimated)";
      } else {
        amountText = "Not publicly disclosed";
      }

      let edgeLabel = amountText;
      if (isUnverified) {
        edgeLabel = `Unverified • ${amountText}`;
      }
      if (e.data.relationshipType) {
        edgeLabel = `${e.data.relationshipType}: ${edgeLabel}`;
      }

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: edgeLabel,
        data: e.data,
        style: {
          stroke: "#000",
          strokeWidth: isGap || isUnverified ? 1.5 : 2,
          strokeDasharray: isGap || isUnverified ? "5, 5" : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#000",
        },
        labelStyle: {
          fontFamily: "monospace, sans-serif",
          fontSize: 10,
          fontWeight: 700,
          fill: isUnverified ? "#444" : "#000",
        },
        labelBgStyle: {
          fill: "#ffffff",
          stroke: "#000000",
          strokeWidth: 1,
        },
        labelBgPadding: [4, 3] as [number, number],
      };
    });
  }, [mapped.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Apply Dagre layout on data change
  useEffect(() => {
    if (rawNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const layouted = getLayoutedElements(rawNodes, rawEdges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [rawNodes, rawEdges, setNodes, setEdges]);

  // Handle ESC key to dismiss detail panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedEntity(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNodeClick = useCallback((entity: GraphEntity) => {
    setSelectedEntity(entity);
  }, []);

  // Wrap nodes with current selection state and onClick handler
  const wrappedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onClick: handleNodeClick,
        selected: selectedEntity?.id === node.id,
      },
    }));
  }, [nodes, handleNodeClick, selectedEntity]);

  // Filter edges for side-panel inspection
  const incomingEdges = useMemo(() => {
    if (!selectedEntity) return [];
    return edges.filter((e) => e.target === selectedEntity.id);
  }, [selectedEntity, edges]);

  const outgoingEdges = useMemo(() => {
    if (!selectedEntity) return [];
    return edges.filter((e) => e.source === selectedEntity.id);
  }, [selectedEntity, edges]);

  // Empty state handling
  if (entities.length === 0 && relationships.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 p-8 text-center bg-neutral-50 text-neutral-500 font-mono text-xs">
        {emptyStateMessage}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-[620px] border-2 border-black bg-white flex flex-col font-sans ${className}`}
      aria-label="Interactive Fund Flow Graph"
    >
      {/* Top Controls Toolbar */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <div className="bg-white border-2 border-black flex shadow-sm">
          <button
            type="button"
            className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
              viewMode === "graph"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-neutral-100"
            }`}
            onClick={() => setViewMode("graph")}
            aria-pressed={viewMode === "graph"}
          >
            <Network size={14} /> Graph
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border-l-2 border-black transition-colors ${
              viewMode === "table"
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-neutral-100"
            }`}
            onClick={() => setViewMode("table")}
            aria-pressed={viewMode === "table"}
          >
            <Table size={14} /> View as table
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "graph" ? (
        <div className="w-full h-full">
          <ReactFlow
            nodes={wrappedNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.25}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            className="bg-neutral-50"
          >
            <Background color="#000" gap={24} size={1} />
            <Controls
              style={{
                borderRadius: 0,
                border: "2px solid #000",
                boxShadow: "none",
                background: "#ffffff",
              }}
              showInteractive={false}
            />
          </ReactFlow>
        </div>
      ) : (
        /* Accessible Table Fallback */
        <div className="flex-1 overflow-auto p-4 bg-white pt-14">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-black bg-neutral-100">
                <th className="p-2.5 font-bold uppercase tracking-wider">From</th>
                <th className="p-2.5 font-bold uppercase tracking-wider">To</th>
                <th className="p-2.5 font-bold uppercase tracking-wider">Type</th>
                <th className="p-2.5 font-bold uppercase tracking-wider">Amount</th>
                <th className="p-2.5 font-bold uppercase tracking-wider">Date</th>
                <th className="p-2.5 font-bold uppercase tracking-wider">Status</th>
                <th className="p-2.5 font-bold uppercase tracking-wider">Source</th>
              </tr>
            </thead>
            <tbody>
              {edges.map((edge) => {
                const sourceEntity = entities.find((e) => e.id === edge.source);
                const targetEntity = entities.find((e) => e.id === edge.target);
                const isVerified = edge.data?.isVerified === true;
                const isGap = edge.data?.isGap === true;

                return (
                  <tr
                    key={edge.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50"
                  >
                    <td className="p-2.5 font-bold">
                      {sourceEntity?.name || edge.source}
                    </td>
                    <td className="p-2.5 font-bold">
                      {targetEntity?.name || edge.target}
                    </td>
                    <td className="p-2.5 font-mono">
                      {edge.data?.relationshipType || "Transaction"}
                    </td>
                    <td className="p-2.5 font-mono font-bold">
                      {formatIndianRupee(edge.data?.amount, edge.data?.currency)}
                    </td>
                    <td className="p-2.5 font-mono text-neutral-600">
                      {edge.data?.date || "—"}
                    </td>
                    <td className="p-2.5">
                      {isGap ? (
                        <span className="bg-neutral-200 text-neutral-800 px-1.5 py-0.5 font-mono font-bold text-[10px]">
                          GAP
                        </span>
                      ) : isVerified ? (
                        <span className="bg-black text-white px-1.5 py-0.5 font-mono font-bold text-[10px]">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="border border-black text-black px-1.5 py-0.5 font-mono font-bold text-[10px]">
                          UNVERIFIED
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {edge.data?.sourceUrl ? (
                        <a
                          href={edge.data.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-neutral-600 flex items-center gap-1"
                        >
                          {edge.data.source || "Source"} <ExternalLink size={10} />
                        </a>
                      ) : (
                        edge.data?.source || "—"
                      )}
                    </td>
                  </tr>
                );
              })}
              {edges.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-6 text-center text-neutral-500 italic"
                  >
                    No relationship records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Accessible Side Panel (Esc to dismiss) */}
      {selectedEntity && (
        <aside
          role="dialog"
          aria-label="Entity Details"
          className="absolute top-0 right-0 h-full w-full sm:max-w-md bg-white border-l-2 border-black shadow-2xl flex flex-col z-20 overflow-y-auto"
        >
          <div className="sticky top-0 bg-black text-white p-4 flex justify-between items-start z-10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
                {selectedEntity.type || "ENTITY"}
              </span>
              <h2 className="text-lg font-bold leading-tight mt-0.5">
                {selectedEntity.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEntity(null)}
              className="text-white hover:text-neutral-300 p-1 focus:outline-none focus:ring-1 focus:ring-white"
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 flex-1 space-y-5 text-xs">
            {selectedEntity.location && (
              <div>
                <span className="block font-mono uppercase text-neutral-500 font-bold mb-1">
                  Location
                </span>
                <p className="font-semibold text-neutral-900">
                  {selectedEntity.location}
                </p>
              </div>
            )}

            {selectedEntity.description && (
              <div>
                <span className="block font-mono uppercase text-neutral-500 font-bold mb-1">
                  Description
                </span>
                <p className="text-neutral-700 leading-relaxed">
                  {selectedEntity.description}
                </p>
              </div>
            )}

            {/* Inflows */}
            {incomingEdges.length > 0 && (
              <div>
                <h3 className="font-mono uppercase font-bold text-neutral-900 border-b-2 border-black pb-1 mb-2">
                  Inflows / Sources ({incomingEdges.length})
                </h3>
                <div className="space-y-2">
                  {incomingEdges.map((e) => {
                    const fromNode = entities.find((ent) => ent.id === e.source);
                    return (
                      <div
                        key={e.id}
                        className="p-2 border border-black bg-neutral-50 space-y-1"
                      >
                        <div className="flex justify-between font-bold">
                          <span>{fromNode?.name || e.source}</span>
                          <span className="font-mono">
                            {formatIndianRupee(e.data?.amount, e.data?.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-neutral-600">
                          <span>{e.data?.relationshipType || "Transaction"}</span>
                          <span>{e.data?.date || ""}</span>
                        </div>
                        {e.data?.sourceUrl && (
                          <div className="pt-1">
                            <a
                              href={e.data.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-[11px] font-bold text-black flex items-center gap-1"
                            >
                              Source: {e.data.source || "Document"} <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Outflows */}
            {outgoingEdges.length > 0 && (
              <div>
                <h3 className="font-mono uppercase font-bold text-neutral-900 border-b-2 border-black pb-1 mb-2">
                  Outflows / Destinations ({outgoingEdges.length})
                </h3>
                <div className="space-y-2">
                  {outgoingEdges.map((e) => {
                    const toNode = entities.find((ent) => ent.id === e.target);
                    return (
                      <div
                        key={e.id}
                        className="p-2 border border-black bg-neutral-50 space-y-1"
                      >
                        <div className="flex justify-between font-bold">
                          <span>{toNode?.name || e.target}</span>
                          <span className="font-mono">
                            {formatIndianRupee(e.data?.amount, e.data?.currency)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px] text-neutral-600">
                          <span>{e.data?.relationshipType || "Transaction"}</span>
                          <span>{e.data?.date || ""}</span>
                        </div>
                        {e.data?.sourceUrl && (
                          <div className="pt-1">
                            <a
                              href={e.data.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline text-[11px] font-bold text-black flex items-center gap-1"
                            >
                              Source: {e.data.source || "Document"} <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {incomingEdges.length === 0 && outgoingEdges.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-neutral-100 text-neutral-600 font-mono text-[11px]">
                <AlertCircle size={14} />
                <span>No direct transaction relationships recorded.</span>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
