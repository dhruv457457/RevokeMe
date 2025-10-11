// src/pages/RevokeERC20.tsx
import React from "react";
import ManualRevokePanel from "../components/manual/ManualRevokePanel";
import AutoRevokePanel from "../components/auto/AutoRevokePanel";
import SmartAccountDetails from "../components/details/SmartAccountDetails";
import EOADetails from "../components/details/EOADetails";

const RevokeErc20Page: React.FC = () => {
    // Note: These are placeholder values. You would fetch and calculate these.
    const stats = {
        totalApprovals: 28,
        totalValueAtRisk: 125034.50,
        totalRevokes: 12,
        totalAmountRevoked: 55200.00,
    };

  return (
    <div className="max-w-7xl mx-auto min-h-screen py-12 px-4">
      
      {/* --- Wallet Cards with Integrated Stats --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <EOADetails 
            totalApprovals={stats.totalApprovals}
            valueAtRisk={stats.totalValueAtRisk}
            totalRevokes={stats.totalRevokes}
            amountRevoked={stats.totalAmountRevoked}
        />
        <SmartAccountDetails 
            totalApprovals={stats.totalApprovals}
            valueAtRisk={stats.totalValueAtRisk}
            totalRevokes={stats.totalRevokes}
            amountRevoked={stats.totalAmountRevoked}
        />
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