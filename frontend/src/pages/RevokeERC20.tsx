// src/pages/RevokeERC20.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

    const tabs = [
        { id: 'manual', label: 'Manual Management', color: 'bg-blue-600' },
        { id: 'auto', label: 'Auto-Revoke Terminal', color: 'bg-purple-600' }
    ];
    
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    const panelVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

  return (
    <div className="max-w-7xl mx-auto min-h-screen py-12 ">
      
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
      <div>
        {/* --- Modern Switcher UI with distinct colors --- */}
        <div className="flex justify-start mb-8">
            <div className="flex space-x-1 rounded-full bg-[#1A1A1D] p-1.5">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative rounded-full px-5 py-2 text-sm font-semibold text-gray-300 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        {activeTab === tab.id && (
                            <motion.span
                                layoutId="active_pill"
                                className={`absolute inset-0 z-10 ${tab.color}`}
                                style={{ borderRadius: 9999 }}
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-20">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>


        {/* --- Animated Panel Content --- */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'manual' && <ManualRevokePanel />}
            {activeTab === 'auto' && <AutoRevokePanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RevokeErc20Page;