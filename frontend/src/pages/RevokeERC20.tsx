// src/pages/RevokeERC20.tsx
import React from "react";
import ManualRevokePanel from "../components/manual/ManualRevokePanel";
import AutoRevokePanel from "../components/auto/AutoRevokePanel";
import SmartAccountDetails from "../components/details/SmartAccountDetails";
import EOADetails from "../components/details/EOADetails";
import StatsCard from "../components/ui/StatsCard"; 

// --- SVG Icons for Stats ---
const TotalApprovalsIcon = () => (
    <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ValueAtRiskIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const TotalRevokesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const TotalAmountIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
    </svg>
);

const AvgAmountIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
);


const RevokeErc20Page: React.FC = () => {
    // Note: These are placeholder values. You would fetch and calculate these.
    const stats = {
        totalApprovals: 28,
        totalValueAtRisk: 125034.50,
        totalRevokes: 12,
        totalAmountRevoked: 55200.00,
        averageRevokeAmount: 4600.00,
    };

  return (
    <div className="max-w-7xl mx-auto min-h-screen py-12 px-4">
      
      {/* --- NEW TWO-ROW LAYOUT --- */}
      <div className="space-y-8 mb-12">
        {/* Row 1: Wallet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-44">
                <EOADetails />
            </div>
            <div className="h-44">
                <SmartAccountDetails />
            </div>
        </div>

        {/* Row 2: Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="h-24">
                <StatsCard
                    title="Total Approvals"
                    value={stats.totalApprovals.toString()}
                    icon={<TotalApprovalsIcon />}
                />
            </div>
            <div className="h-24">
                 <StatsCard
                    title="Total Value at Risk"
                    value={`$${stats.totalValueAtRisk.toLocaleString()}`}
                    icon={<ValueAtRiskIcon />}
                />
            </div>
            <div className="h-24">
                <StatsCard
                    title="Total Revokes"
                    value={stats.totalRevokes.toString()}
                    icon={<TotalRevokesIcon />}
                />
            </div>
            <div className="h-24">
                <StatsCard
                    title="Total Amount Revoked"
                    value={`$${stats.totalAmountRevoked.toLocaleString()}`}
                    icon={<TotalAmountIcon />}
                />
            </div>
            <div className="h-24">
                <StatsCard
                    title="Average Revoke Amount"
                    value={`$${stats.averageRevokeAmount.toLocaleString()}`}
                    icon={<AvgAmountIcon />}
                />
            </div>
        </div>
      </div>


      {/* --- PANELS SECTION --- */}
      <div className="space-y-12">
        <div>
          <ManualRevokePanel />
        </div>
        <div>
          <AutoRevokePanel />
        </div>
      </div>
    </div>
  );
};

export default RevokeErc20Page;