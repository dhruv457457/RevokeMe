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
    return Number(formatUnits(BigInt(amount), 18)).toLocaleString();
  } catch {
    return amount;
  }
};

const formatDate = (timestamp?: string | null) => {
  if (!timestamp) return "-";
  const asNum = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  if (!asNum || isNaN(asNum)) return "-";
  const date = new Date(Number(asNum) * 1000);
  return date.toLocaleString();
};

const ApprovalList: React.FC<ApprovalListProps> = ({ ownerAddress }) => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [sampleApprovals, setSampleApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchApprovalsFromIndexer = async () => {
      if (!ownerAddress || !isAddress(ownerAddress)) {
        if (isMounted) {
          setApprovals([]);
          setSampleApprovals([]);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      const normalized = ownerAddress.toLowerCase();

      const graphqlQuery = {
        query: `
          query GetApprovalsAndSample($addr: String!) {
            SampleApprovals: Approval(limit: 5, order_by: { blockTimestamp: desc }) {
              id owner spender tokenAddress amount blockTimestamp
            }
            OwnerOrSpender: Approval(
              where: { _or: [{ owner: { _eq: $addr } }, { spender: { _eq: $addr } }]}
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

        if (!response.ok) {
          throw new Error(
            `Cannot reach indexer at ${INDEXER_URL} (HTTP ${response.status})`
          );
        }

        const rawText = await response.text();
        let data: any;
        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error("Response from indexer is not valid JSON.");
        }

        if (data.errors) {
          throw new Error("GraphQL error: " + data.errors.map((e: any) => e.message).join("; "));
        }

        const sampleRows: Approval[] = data?.data?.SampleApprovals ?? [];
        const ownerOrSpenderRows: Approval[] = data?.data?.OwnerOrSpender ?? [];
        const activeApprovals = ownerOrSpenderRows.filter(
          (app) => {
            try {
              return BigInt(app.amount) > 0n;
            } catch {
              return false;
            }
          }
        );

        if (isMounted) {
          setSampleApprovals(sampleRows);
          setApprovals(activeApprovals);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err?.message ??
              "Could not connect to the indexer backend. Make sure it is running locally."
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApprovalsFromIndexer();

    return () => {
      isMounted = false;
    };
  }, [ownerAddress]);

  if (!ownerAddress) {
    return (
      <div className="text-center p-8 text-gray-500">
        Please select an account to view approvals.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-8 animate-pulse text-gray-500">
        Loading approvals from indexer...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500 bg-red-50 rounded-lg">{error}</div>
    );
  }

  // Approval table for matches
  if (approvals.length > 0) {
    return (
      <div className="mt-6 border rounded-lg shadow-md bg-white w-full max-w-4xl mx-auto">
        <table className="w-full text-left table-auto">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Token Address</th>
              <th className="p-4 font-semibold">Owner</th>
              <th className="p-4 font-semibold">Spender</th>
              <th className="p-4 font-semibold text-right">Allowance (approx)</th>
              <th className="p-4 font-semibold text-right">Block Time</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval) => (
              <tr key={approval.id} className="border-b last-border-b-0 hover:bg-gray-50 transition-colors">
                <td className="p-4 text-sm font-mono break-all">{approval.tokenAddress}</td>
                <td className="p-4 text-sm font-mono break-all">{approval.owner || "-"}</td>
                <td className="p-4 text-sm font-mono break-all">{approval.spender}</td>
                <td className="p-4 text-right font-semibold">{formatAmount(approval.amount)}</td>
                <td className="p-4 text-right text-sm text-gray-500">{formatDate(approval.blockTimestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // No matches → Show sample data
  return (
    <div className="mt-6 max-w-4xl mx-auto text-center">
      <p className="text-gray-600 mb-4">
        No active approvals found for <span className="font-mono bg-gray-100 p-1 rounded">{ownerAddress}</span>.
      </p>
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-left font-semibold mb-2">Sample approvals from the indexer (latest 5 rows)</h3>
        {sampleApprovals.length === 0 ? (
          <div className="text-gray-500">No approvals in the indexer yet.</div>
        ) : (
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-2 text-xs font-semibold">Owner</th>
                <th className="p-2 text-xs font-semibold">Spender</th>
                <th className="p-2 text-xs font-semibold">Token</th>
                <th className="p-2 text-xs font-semibold">Amount</th>
                <th className="p-2 text-xs font-semibold">Block Time</th>
              </tr>
            </thead>
            <tbody>
              {sampleApprovals.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2 text-xs font-mono break-all">{s.owner || "-"}</td>
                  <td className="p-2 text-xs font-mono break-all">{s.spender}</td>
                  <td className="p-2 text-xs font-mono break-all">{s.tokenAddress}</td>
                  <td className="p-2 text-xs">{formatAmount(s.amount)}</td>
                  <td className="p-2 text-xs text-gray-500">{formatDate(s.blockTimestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-3">
        Tip: the indexer stores approvals by the owner. If nothing shows up, toggle accounts or check your indexer configuration.
      </p>
    </div>
  );
};

export default ApprovalList;
