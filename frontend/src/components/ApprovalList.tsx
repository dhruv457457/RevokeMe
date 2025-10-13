// src/components/ApprovalList.tsx
import React, { useState, useEffect } from "react";
import { isAddress, formatUnits } from "viem";

// Use the correct URL from your indexer's terminal output
const INDEXER_URL = import.meta.env.VITE_INDEXER_URL as string;

// --- Helper Components & Functions ---

const CubeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
    <path d="M21 16V8L12 2L3 8V16L12 22L21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27 6.96L12 12.01L20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NoApprovalsPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" />
        </svg>
        <h4 className="font-semibold text-gray-300">All Clear!</h4>
        <p className="text-sm text-gray-500 mt-1">No active approvals found for this account.</p>
    </div>
);


const formatTimeAgo = (timestamp?: string | null): string => {
    if (!timestamp) return "-";
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds} secs ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
};

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
  limit?: number;
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

const ApprovalList: React.FC<ApprovalListProps> = ({ ownerAddress, limit }) => {
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
    // This case is handled by the parent component (Home.tsx) now
    return null;
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
    return <NoApprovalsPlaceholder />;
  }

  const displayedApprovals = limit ? approvals.slice(0, limit) : approvals;

  return (
    <div className="space-y-1">
      {displayedApprovals.map((approval) => (
        <div key={approval.id} className="approval-card flex justify-between items-center p-4">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 p-3 rounded-full">
              <CubeIcon />
            </div>
            <div>
              <p className="font-semibold" title={approval.tokenAddress}>
                Token: {approval.tokenAddress.slice(0, 6)}...{approval.tokenAddress.slice(-4)}
              </p>
              <p className="text-sm text-gray-500">{formatTimeAgo(approval.blockTimestamp)}</p>
            </div>
          </div>
          {/* Right Side */}
          <div className="text-right">
            <p className="font-mono text-sm text-gray-300" title={approval.spender}>
              Spender: {approval.spender.slice(0, 8)}...{approval.spender.slice(-4)}
            </p>
            <p className="text-sm font-semibold text-gray-400 mt-1">
              Allowance: {formatAmount(approval.amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalList;