"use client";

import React, { useMemo } from "react";
import { FundFlowGraph } from "@/components/graph/FundFlowGraph";
import { GraphEntity, GraphRelationship, EntityType } from "@/lib/graph/fund-flow-mapper";

interface Transaction {
  id: string;
  date: Date | string | null;
  amount: number | null;
  currency?: string | null;
  senderName: string | null;
  senderType?: string | null;
  recipientName: string | null;
  recipientType?: string | null;
  transactionType: string | null;
  verificationStatus: string;
  sourceName?: string | null;
  sourceUrl: string | null;
  isEstimate?: boolean;
}

interface NgoFundFlowWrapperProps {
  ngoName: string;
  transactions: Transaction[];
  className?: string;
}

export function NgoFundFlowWrapper({
  ngoName,
  transactions,
  className = "",
}: NgoFundFlowWrapperProps) {
  const { entities, relationships } = useMemo(() => {
    const entityMap = new Map<string, GraphEntity>();
    const rels: GraphRelationship[] = [];

    // Main central NGO node
    const mainNgoId = "center-ngo";
    entityMap.set(mainNgoId, {
      id: mainNgoId,
      name: ngoName,
      type: "NGO",
      description: "Subject NGO",
    });

    transactions.forEach((tx, idx) => {
      const isSender = tx.senderName === ngoName;
      const otherPartyName = isSender ? tx.recipientName : tx.senderName;
      const otherPartyType = isSender ? tx.recipientType : tx.senderType;
      const otherPartyId = otherPartyName
        ? `party-${otherPartyName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
        : `gap-${idx}`;

      if (otherPartyName) {
        if (!entityMap.has(otherPartyId)) {
          entityMap.set(otherPartyId, {
            id: otherPartyId,
            name: otherPartyName,
            type: (otherPartyType as EntityType) || "other",
          });
        }

        const isVerified =
          tx.verificationStatus === "Verified" ||
          tx.verificationStatus === "VERIFIED" ||
          tx.verificationStatus === "Official government record";

        rels.push({
          id: tx.id || `rel-${idx}`,
          from: isSender ? mainNgoId : otherPartyId,
          to: isSender ? otherPartyId : mainNgoId,
          type: tx.transactionType || "Funding",
          amount: tx.amount,
          currency: tx.currency || "INR",
          date: tx.date ? new Date(tx.date).getFullYear().toString() : undefined,
          source: tx.sourceName || undefined,
          sourceUrl: tx.sourceUrl || undefined,
          verified: isVerified,
          isEstimated: tx.isEstimate === true,
          isGap: false,
        });
      } else {
        // Gap node
        rels.push({
          id: tx.id || `rel-gap-${idx}`,
          from: isSender ? mainNgoId : "?",
          to: isSender ? "?" : mainNgoId,
          type: tx.transactionType || "Funding",
          amount: tx.amount,
          currency: tx.currency || "INR",
          date: tx.date ? new Date(tx.date).getFullYear().toString() : undefined,
          source: tx.sourceName || undefined,
          sourceUrl: tx.sourceUrl || undefined,
          verified: false,
          isEstimated: tx.isEstimate === true,
          isGap: true,
          gapExplanation: "Transaction source/counterparty is not publicly disclosed.",
        });
      }
    });

    return {
      entities: Array.from(entityMap.values()),
      relationships: rels,
    };
  }, [ngoName, transactions]);

  if (transactions.length === 0) {
    return (
      <div className="border border-neutral-300 p-8 text-center text-xs font-mono text-neutral-500 bg-neutral-50">
        No publicly verifiable transaction records available to generate a fund flow graph.
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-black text-white px-4 py-2 text-xs font-bold font-mono flex flex-col sm:flex-row justify-between gap-1 items-start sm:items-center">
        <span>FUND FLOW GRAPH</span>
        <span className="text-neutral-400 font-normal text-[11px]">
          Only publicly disclosed and verifiable records are shown
        </span>
      </div>
      <FundFlowGraph
        entities={entities}
        relationships={relationships}
        emptyStateMessage="No publicly verifiable transaction records available."
      />
    </div>
  );
}
