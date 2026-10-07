/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo } from "react";
import { FundFlow } from "@/components/ui/FundFlow";

interface Transaction {
  id: string;
  date: Date | null;
  amount: number | null;
  senderName: string | null;
  recipientName: string | null;
  transactionType: string | null;
  verificationStatus: string;
  sourceUrl: string | null;
}

interface NgoFundFlowWrapperProps {
  ngoName: string;
  transactions: Transaction[];
}

export function NgoFundFlowWrapper({ ngoName, transactions }: NgoFundFlowWrapperProps) {
  const { nodes, edges } = useMemo(() => {
    const nds: any[] = [];
    const eds: any[] = [];

    // Center node for the NGO
    nds.push({
      id: "center-ngo",
      type: "entity",
      data: {
        entity: {
          id: "center-ngo",
          name: ngoName,
          type: "NGO",
        }
      }
    });

    if (transactions.length === 0) {
      return { nodes: nds, edges: eds };
    }

    transactions.forEach((tx, idx) => {
      // Determine if NGO is sender or recipient (usually recipient in this DB, but let's be dynamic)
      const isSender = tx.senderName === ngoName;
      const otherPartyName = isSender ? tx.recipientName : tx.senderName;
      const otherPartyId = `party-${idx}`;

      // Create node for the other party
      if (otherPartyName) {
        nds.push({
          id: otherPartyId,
          type: "entity",
          data: {
            entity: {
              id: otherPartyId,
              name: otherPartyName,
              type: tx.transactionType || "Entity",
            }
          }
        });

        // Create edge
        eds.push({
          id: `edge-${idx}`,
          source: isSender ? "center-ngo" : otherPartyId,
          target: isSender ? otherPartyId : "center-ngo",
          data: {
            amount: tx.amount,
            date: tx.date ? new Date(tx.date).getFullYear().toString() : "Unknown",
            isVerified: tx.verificationStatus === "VERIFIED" || tx.verificationStatus === "OFFICIAL",
            relationshipType: tx.transactionType,
            sourceUrl: tx.sourceUrl,
          }
        });
      } else {
        // Gap node
        const gapId = `gap-${idx}`;
        nds.push({
          id: gapId,
          type: "gap",
          data: {
            entity: { id: gapId, name: "Unknown Entity", type: "Unknown" },
            label: "Not Publicly Traceable"
          }
        });
        
        eds.push({
          id: `edge-${idx}`,
          source: isSender ? "center-ngo" : gapId,
          target: isSender ? gapId : "center-ngo",
          data: {
            amount: tx.amount,
            date: tx.date ? new Date(tx.date).getFullYear().toString() : "Unknown",
            isVerified: false,
            isGap: true,
            relationshipType: tx.transactionType,
            sourceUrl: tx.sourceUrl,
          }
        });
      }
    });

    return { nodes: nds, edges: eds };
  }, [ngoName, transactions]);

  if (transactions.length === 0) {
    return (
      <div className="border border-dashed border-gray-300 p-10 text-center text-gray-500">
        No public transaction records found to generate a fund flow graph.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-black text-white p-3 text-sm font-bold flex justify-between">
        <span>FUND FLOW GRAPH</span>
        <span className="text-gray-400 font-normal">
          ETW does not claim to show every transaction. Only publicly verifiable records are shown.
        </span>
      </div>
      <FundFlow nodes={nodes} edges={edges} />
    </div>
  );
}
