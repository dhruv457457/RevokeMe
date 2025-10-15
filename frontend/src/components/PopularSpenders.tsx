import React, { useState, useEffect } from "react";
import { fetchPopularSpenders} from "../utils/fetchApprovals";
import type { SpenderStats } from "../utils/fetchApprovals";
// Helper Icon
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;

const PopularSpenders: React.FC<{ limit?: number }> = ({ limit = 5 }) => {
  const [spenders, setSpenders] = useState<SpenderStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchPopularSpenders(1000, limit);
        setSpenders(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [limit]);

  if (isLoading) return <div className="text-center p-8 text-gray-300 animate-pulse">Analyzing spenders...</div>;
  if (error) return <div className="text-center p-8 text-red-400 bg-red-900/20 rounded-lg">{error}</div>;
  if (spenders.length === 0) return <div className="text-center p-8 text-gray-500">Could not determine popular spenders.</div>;

  return (
    <div className="space-y-1">
      {spenders.map(({ spender, count }) => (
        <div key={spender} className="approval-card flex justify-between items-center p-4">
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 p-3 rounded-full"><ShieldIcon /></div>
            <div>
              <p className="font-semibold font-mono text-sm" title={spender}>
                {spender.slice(0, 10)}...{spender.slice(-4)}
              </p>
               <p className="text-xs text-gray-500">Known Spender</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-300">{count.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Recent Approvals</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PopularSpenders;