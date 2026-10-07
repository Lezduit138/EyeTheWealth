/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// ETW — Fund Flow Visualization Component using React Flow
// Strict black and white styling, auto top-to-bottom layout via dagre.

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
import { X, Table, Network } from "lucide-react";

// ─── Formatters ─────────────────────────────────────────────────────────────

export function formatIndianRupee(amount: number | null | undefined): string {
  if (amount == null) return "Not publicly disclosed";
  const str = amount.toString();
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== "") lastThree = "," + lastThree;
  return "₹" + otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
}

// ─── Custom Nodes ───────────────────────────────────────────────────────────

const EntityNode = ({ data }: any) => {
  return (
    <div
      className={`p-3 min-w-[200px] bg-white border-2 border-black relative cursor-pointer hover:bg-gray-100 transition-colors ${
        data.selected ? "ring-2 ring-black ring-offset-2" : ""
      }`}
      onClick={() => data.onClick(data.entity)}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') data.onClick(data.entity); }}
    >
      <Handle type="target" position={Position.Top} className="!bg-black !w-2 !h-2 !border-none !rounded-none" />
      <div className="uppercase font-bold tracking-widest text-gray-500 mb-1" style={{ fontSize: "0.6rem" }}>
        {data.entity.type}
      </div>
      <div className="font-bold text-sm leading-tight text-black">{data.entity.name}</div>
      {data.entity.location && (
        <div className="text-xs text-gray-600 mt-1">{data.entity.location}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-black !w-2 !h-2 !border-none !rounded-none" />
    </div>
  );
};

const GapNode = ({ data }: any) => {
  return (
    <div 
      className="flex flex-col items-center justify-center p-2 min-w-[150px] cursor-pointer"
      onClick={() => data.onClick ? data.onClick(data.entity) : null}
    >
      <Handle type="target" position={Position.Top} className="!bg-black !w-2 !h-2 !border-none !rounded-none" />
      <div className="w-10 h-10 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2 bg-white">
        ?
      </div>
      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider text-center bg-white p-1">
        {data.label || "Not Publicly Traceable"}
      </div>
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
};

const nodeTypes = {
  entity: EntityNode,
  gap: GapNode,
};

// ─── Dagre Layout ───────────────────────────────────────────────────────────

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = "TB") => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 220;
  const nodeHeight = 100;

  dagreGraph.setGraph({ rankdir: direction, align: 'UL', ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
      style: { opacity: 1 },
    };
  });

  return { nodes: newNodes, edges };
};

// ─── Component ──────────────────────────────────────────────────────────────

export interface FundFlowProps {
  nodes: Node[];
  edges: Edge[];
  className?: string;
}

export function FundFlow({ nodes: initialNodes, edges: initialEdges, className = "" }: FundFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "table">("graph");

  // Layout initialization
  useEffect(() => {
    if (initialNodes.length === 0) return;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle ESC to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedEntity(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNodeClick = useCallback((entity: any) => {
    setSelectedEntity(entity);
  }, []);

  const wrappedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: { 
        ...node.data, 
        onClick: handleNodeClick,
        selected: selectedEntity?.id === node.id || selectedEntity?.id === node.data?.entity?.id
      },
    }));
  }, [nodes, handleNodeClick, selectedEntity]);

  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const isUnverified = edge.data?.isVerified === false;
      const isEstimated = edge.data?.isEstimated === true;
      
      let label = "";
      if (edge.data?.amount != null) {
        label = formatIndianRupee(edge.data.amount);
        if (isEstimated) label += " (Est.)";
      } else {
        label = "Not publicly disclosed";
      }

      if (isUnverified) {
        label = "Unverified - " + label;
      }

      // Add relationship type to label if present
      if (edge.data?.relationshipType) {
        label = `${edge.data.relationshipType}: ${label}`;
      }

      return {
        ...edge,
        label,
        style: {
          stroke: "#000",
          strokeWidth: 2,
          strokeDasharray: (isUnverified || edge.data?.isGap) ? "6 6" : undefined,
          ...edge.style,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#000",
        },
        labelStyle: {
          fontFamily: "Inter, sans-serif",
          fontSize: 11,
          fontWeight: 700,
          fill: isUnverified ? "#666" : "#000",
        },
        labelBgStyle: {
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 1,
          rx: 0,
          ry: 0,
        },
        labelBgPadding: [6, 4] as [number, number],
      };
    });
  }, [edges]);

  // Derive incoming/outgoing relationships for the side panel
  const selectedNodeIncomingEdges = selectedEntity 
    ? edges.filter(e => e.target === selectedEntity.id || e.target === selectedEntity.entity?.id)
    : [];
  
  const selectedNodeOutgoingEdges = selectedEntity 
    ? edges.filter(e => e.source === selectedEntity.id || e.source === selectedEntity.entity?.id)
    : [];

  return (
    <div className={`relative w-full h-[600px] border-2 border-black bg-white flex flex-col ${className}`}>
      
      {/* Top Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-end p-2 pointer-events-none">
        <div className="pointer-events-auto bg-white border-2 border-black flex">
          <button 
            className={`p-2 flex items-center gap-2 text-sm font-bold uppercase transition-colors ${viewMode === "graph" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
            onClick={() => setViewMode("graph")}
          >
            <Network size={16} /> Graph
          </button>
          <button 
            className={`p-2 flex items-center gap-2 text-sm font-bold uppercase border-l-2 border-black transition-colors ${viewMode === "table" ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"}`}
            onClick={() => setViewMode("table")}
          >
            <Table size={16} /> Table
          </button>
        </div>
      </div>

      {viewMode === "graph" ? (
        <ReactFlow
          nodes={wrappedNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={1.5}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          className="bg-[#fcfcfc]"
        >
          <Background color="#ccc" gap={20} size={1} />
          <Controls 
            style={{ 
              borderRadius: 0, 
              border: "2px solid #000", 
              boxShadow: "none"
            }} 
            showInteractive={false}
          />
        </ReactFlow>
      ) : (
        // Table Fallback View
        <div className="flex-1 overflow-auto p-4 bg-white pt-16">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="p-3 font-bold uppercase tracking-wider">From</th>
                <th className="p-3 font-bold uppercase tracking-wider">To</th>
                <th className="p-3 font-bold uppercase tracking-wider">Type</th>
                <th className="p-3 font-bold uppercase tracking-wider">Amount</th>
                <th className="p-3 font-bold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {edges.map((edge, i) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                const isUnverified = edge.data?.isVerified === false;
                
                return (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-bold">{sourceNode?.data?.entity?.name || "Unknown"}</td>
                    <td className="p-3 font-bold">{targetNode?.data?.entity?.name || "Unknown"}</td>
                    <td className="p-3">{edge.data?.relationshipType || "Transaction"}</td>
                    <td className="p-3">{formatIndianRupee(edge.data?.amount)}</td>
                    <td className="p-3">
                      {isUnverified ? (
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 text-xs font-bold uppercase">Unverified</span>
                      ) : (
                        <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">Verified</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {edges.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500 italic">No relationship data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Accessible Side Panel */}
      {selectedEntity && (
        <div className="absolute top-0 right-0 h-full w-full max-w-sm bg-white border-l-2 border-black shadow-2xl flex flex-col z-20 overflow-y-auto animate-in slide-in-from-right">
          <div className="sticky top-0 bg-black text-white p-4 flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                {selectedEntity.type || "Entity"} Details
              </div>
              <h2 className="text-xl font-bold leading-tight">{selectedEntity.name || "Unknown"}</h2>
            </div>
            <button 
              onClick={() => setSelectedEntity(null)}
              className="text-white hover:text-gray-300 transition-colors p-1"
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-5 flex-1">
            {selectedEntity.location && (
              <div className="mb-4">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Location</span>
                <p className="text-sm font-medium">{selectedEntity.location}</p>
              </div>
            )}
            
            {selectedEntity.description && (
              <div className="mb-6">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Description</span>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedEntity.description}</p>
              </div>
            )}

            {selectedNodeIncomingEdges.length > 0 && (
              <div className="mb-6">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 border-b-2 border-black pb-1">Inflow / Sources</span>
                <ul className="space-y-3">
                  {selectedNodeIncomingEdges.map((e, idx) => {
                    const sourceNode = nodes.find(n => n.id === e.source);
                    return (
                      <li key={idx} className="bg-gray-50 p-2 border border-gray-200">
                        <div className="text-xs font-bold mb-1">{sourceNode?.data?.entity?.name || "Unknown"}</div>
                        <div className="text-sm font-mono mb-1">{formatIndianRupee(e.data?.amount)}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <span className="text-[10px] uppercase text-gray-500">{e.data?.date || e.data?.year || ""}</span>
                          {e.data?.sourceUrl && (
                            <a href={e.data.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold underline">Source ↗</a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {selectedNodeOutgoingEdges.length > 0 && (
              <div className="mb-6">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 border-b-2 border-black pb-1">Outflow / Destinations</span>
                <ul className="space-y-3">
                  {selectedNodeOutgoingEdges.map((e, idx) => {
                    const targetNode = nodes.find(n => n.id === e.target);
                    return (
                      <li key={idx} className="bg-gray-50 p-2 border border-gray-200">
                        <div className="text-xs font-bold mb-1">{targetNode?.data?.entity?.name || "Unknown"}</div>
                        <div className="text-sm font-mono mb-1">{formatIndianRupee(e.data?.amount)}</div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                          <span className="text-[10px] uppercase text-gray-500">{e.data?.date || e.data?.year || ""}</span>
                          {e.data?.sourceUrl && (
                            <a href={e.data.sourceUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold underline">Source ↗</a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            
            {(selectedNodeIncomingEdges.length === 0 && selectedNodeOutgoingEdges.length === 0) && (
              <div className="text-sm text-gray-500 italic mt-4">
                No direct financial relationships traced.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
