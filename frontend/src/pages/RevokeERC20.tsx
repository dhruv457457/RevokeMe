// pages/RevokeErc20Page.tsx
import React from 'react';
import ManualRevokePanel from '../components/manual/ManualRevokePanel';
import AutoRevokePanel from '../components/auto/AutoRevokePanel';
import SmartAccountDetails from '../components/details/SmartAccountDetails';
import EOADetails from '../components/details/EOADetails';

const RevokeErc20Page: React.FC = () => {
  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-12">
      {/* NEW HEADER SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <EOADetails />
        <SmartAccountDetails />
      </div>

      {/* EXISTING LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        <div className="lg:col-span-2">
          <ManualRevokePanel />
        </div>
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <AutoRevokePanel />
        </div>
      </div>
    </div>
  );
};

export default RevokeErc20Page;