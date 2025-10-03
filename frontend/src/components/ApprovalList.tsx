import React, { useState, useEffect } from "react";
import { isAddress, formatUnits } from "viem";

// Use the correct URL from your indexer's terminal output
const INDEXER_URL = import.meta.env.VITE_INDEXER_URL as string;

// Type Definitions
interface Approval {
  id: string;
  tokenAddress: `0x${string}`;
  spender: `0x${string}`;
  owner: `0x${string}` | null;
  amount: string;
  blockTimestamp: string | null;
}

interface ApprovalListProps {
  ownerAddress?: `0x${string}`;
}

const formatAmount = (amount: string) => {
  try {
    const formatted = Number(formatUnits(BigInt(amount), 18));
    if (formatted > 1e12) return "Unlimited";
    return formatted.toLocaleString();
  } catch {
    return amount;
  }
};

const formatDate = (timestamp?: string | null) => {
  if (!timestamp) return "-";
  const asNum = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  if (!asNum || isNaN(asNum)) return "-";
  const date = new Date(Number(asNum) * 1000);
  return date.toLocaleDateString(); // Shorter format for cards
};

const ApprovalList: React.FC<ApprovalListProps> = ({ ownerAddress }) => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchApprovalsFromIndexer = async () => {
      if (!ownerAddress || !isAddress(ownerAddress)) {
        if (isMounted) setApprovals([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      const normalized = ownerAddress.toLowerCase();
      const graphqlQuery = {
        query: `
          query GetApprovals($addr: String!) {
            Approval(
              where: { _or: [{ owner: { _eq: $addr } }, { spender: { _eq: $addr } }]},
              order_by: { blockTimestamp: desc }
            ) {
              id owner spender tokenAddress amount blockTimestamp
            }
          }
        `,
        variables: { addr: normalized },
      };

      try {
        const response = await fetch(INDEXER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(graphqlQuery),
        });

        if (!response.ok) throw new Error(`Indexer request failed: ${response.status}`);
        const data = await response.json();
        if (data.errors) throw new Error("GraphQL error: " + data.errors.map((e: any) => e.message).join("; "));

        const activeApprovals = (data?.data?.Approval ?? []).filter(
          (app: Approval) => {
            try { return BigInt(app.amount) > 0n; }
            catch { return false; }
          }
        );
        if (isMounted) setApprovals(activeApprovals);
      } catch (err: any) {
        if (isMounted) setError(err?.message ?? "Could not connect to the indexer.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchApprovalsFromIndexer();
    return () => { isMounted = false; };
  }, [ownerAddress]);

  if (!ownerAddress) {
    return (
      <div className="text-center p-8 text-gray-400">
        Please select an account to view approvals.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-8 text-gray-300 animate-pulse">
        Loading approvals...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg">{error}</div>
    );
  }

  if (approvals.length === 0) {
    return (
      <div className="text-center p-8 text-gray-400">
        No active approvals found for this account.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {approvals.map((approval) => (
        <div key={approval.id} className="approval-card">
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm text-gray-300 truncate" title={approval.tokenAddress}>
              Token: {approval.tokenAddress.slice(0, 6)}...{approval.tokenAddress.slice(-4)}
            </span>
            <span className="text-xs text-gray-500">{formatDate(approval.blockTimestamp)}</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Spender</span>
              <span className="font-mono text-gray-200 truncate" title={approval.spender}>
                {approval.spender.slice(0, 10)}...{approval.spender.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-400">Allowance</span>
              <span className="font-semibold text-purple-400">{formatAmount(approval.amount)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalList;