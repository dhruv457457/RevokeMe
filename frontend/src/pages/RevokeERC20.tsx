// src/pages/RevokeERC20.tsx
import React from "react";
import ManualRevokePanel from "../components/manual/ManualRevokePanel";
import AutoRevokePanel from "../components/auto/AutoRevokePanel";
import SmartAccountDetails from "../components/details/SmartAccountDetails";
import EOADetails from "../components/details/EOADetails";

const RevokeErc20Page: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto min-h-screen py-12 px-4">
      {/* HEADER SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <EOADetails />
        <SmartAccountDetails />
      </div>

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
