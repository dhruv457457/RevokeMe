import React, { useState, useEffect } from "react";
import { fetchLatestGlobalApprovals } from "../utils/fetchApprovals";
import type { Approval } from "../utils/fetchApprovals";
// Helper components & functions
const CubeIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400"><path d="M21 16V8L12 2L3 8V16L12 22L21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.27 6.96L12 12.01L20.73 6.96" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const formatTimeAgo = (timestamp?: string | null): string => {
    if (!timestamp) return "-";
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const LatestGlobalApprovals: React.FC<{ limit?: number }> = ({ limit = 5 }) => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchLatestGlobalApprovals(limit);
        setApprovals(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [limit]);

  if (isLoading) return <div className="text-center p-8 text-gray-300 animate-pulse">Loading activity...</div>;
  if (error) return <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg">{error}</div>;
  if (approvals.length === 0) return <div className="text-center p-8 text-gray-500">No recent approvals found.</div>;

  return (
    <div className="space-y-1">
      {approvals.map((approval) => (
        <div key={approval.id} className="approval-card flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 p-3 rounded-full"><CubeIcon /></div>
            <div>
              <p className="font-semibold text-sm" title={approval.owner ?? ''}>
                Owner: {approval.owner?.slice(0, 6)}...{approval.owner?.slice(-4)}
              </p>
              <p className="text-xs text-gray-500">{formatTimeAgo(approval.blockTimestamp)}</p>
            </div>
          </div>
          <div className="text-right">
             <p className="font-mono text-sm text-gray-300" title={approval.spender}>
               Spender: {approval.spender.slice(0, 8)}...
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LatestGlobalApprovals;