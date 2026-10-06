"use client";

// ETW — Fund Flow Visualization Component using React Flow
// Strict black and white styling.
// Top-to-bottom layout.

import React, { useMemo, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  MarkerType,
  Handle,
  Position,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";

// ─── Custom Nodes ────────────────────────────────────────────────────────────

// Entity node
const EntityNode = ({ data }: any) => {
  return (
    <div
      className={`etw-card p-3 min-w-[200px] bg-white border-2 border-black relative cursor-pointer hover:bg-gray-50`}
      onClick={() => data.onClick(data.entity)}
    >
      <Handle type="target" position={Position.Top} className="!bg-black !w-2 !h-2" />
      <div className="etw-label mb-1" style={{ fontSize: "0.6rem" }}>
        {data.entity.type}
      </div>
      <div className="font-bold text-sm leading-tight">{data.entity.name}</div>
      {data.entity.location && (
        <div className="text-xs text-gray-600 mt-1">{data.entity.location}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-black !w-2 !h-2" />
    </div>
  );
};

// Unknown / Gap node
const GapNode = ({ data }: any) => {
  return (
    <div className="flex flex-col items-center justify-center p-2 min-w-[150px]">
      <Handle type="target" position={Position.Top} className="!bg-black !w-2 !h-2" />
      <div className="w-10 h-10 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center text-gray-500 font-bold mb-2">
        ?
      </div>
      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider text-center">
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

// ─── Component ───────────────────────────────────────────────────────────────

interface FundFlowProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (entity: any) => void;
  className?: string;
}

export function FundFlow({ nodes, edges, onNodeClick, className = "" }: FundFlowProps) {
  // Wrap nodes to inject onClick handler
  const wrappedNodes = useMemo(
    () =>
      nodes.map((node) => {
        if (node.type === "entity") {
          return {
            ...node,
            data: { ...node.data, onClick: onNodeClick || (() => {}) },
          };
        }
        return node;
      }),
    [nodes, onNodeClick]
  );

  // Apply ETW styling to edges
  const styledEdges = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        style: {
          stroke: "#000",
          strokeWidth: 2,
          strokeDasharray: edge.data?.isVerified === false ? "5 5" : undefined,
          ...edge.style,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#000",
        },
        labelStyle: {
          fontFamily: "var(--font-sans)",
          fontSize: 10,
          fontWeight: 700,
          fill: "#000",
        },
        labelBgStyle: {
          fill: "#fff",
          stroke: "#000",
          strokeWidth: 1,
          rx: 0, // square corners for ETW
          ry: 0,
        },
        labelBgPadding: [4, 2] as [number, number],
      })),
    [edges]
  );

  return (
    <div className={`w-full h-full border border-black bg-white ${className}`}>
      <ReactFlow
        nodes={wrappedNodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }} // Hide if you have pro, otherwise React Flow attribution shows
      >
        <Background color="#ccc" gap={20} size={1} />
        <Controls
          style={{
            borderRadius: 0,
            border: "1px solid #000",
            boxShadow: "none",
          }}
        />
      </ReactFlow>
    </div>
  );
}
