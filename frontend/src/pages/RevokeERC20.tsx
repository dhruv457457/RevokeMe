import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ManualRevokePanel from "../components/manual/ManualRevokePanel";
import AutoRevokePanel from "../components/auto/AutoRevokePanel";
import SmartAccountDetails from "../components/details/SmartAccountDetails";
import EOADetails from "../components/details/EOADetails";
import { type Approval } from '../utils/fetchApprovals';

// --- Utility: Simulate historical revoke data based on address ---
// NOTE: These values are static placeholders since real historical data isn't available.
// The data is split between EOA and Smart Account to demonstrate the stat card isolation.
const SIMULATED_REVOKE_HISTORY: Record<string, { totalRevokes: number, amountRevoked: number }> = {
    // EOA Stats
    'eoa': { totalRevokes: 8, amountRevoked: 35000.00 },
    // Smart Account Stats
    'smart': { totalRevokes: 4, amountRevoked: 20200.00 },
};
// Fetches simulated history
const getRevokeHistory = (accountType: 'eoa' | 'smart') => {
    return SIMULATED_REVOKE_HISTORY[accountType] || { totalRevokes: 0, amountRevoked: 0 };
};


const RevokeErc20Page: React.FC = () => {
    // State to hold fetched approvals and the account type they belong to
    // This list will contain approvals for EOA OR Smart Account, depending on which is active in the panel.
    const [activeApprovals, setActiveApprovals] = useState<Approval[]>([]);
    const [activeAccountType, setActiveAccountType] = useState<'eoa' | 'smart'>('eoa');
    
    // Callback function passed to ManualRevokePanel to receive fetched data AND account type
    const handleApprovalsFetched = useCallback((approvals: Approval[], type: 'eoa' | 'smart') => {
        setActiveApprovals(approvals);
        setActiveAccountType(type);
    }, []);

    // Calculate EOA-specific stats
    const eoaStats = useMemo(() => {
        // The EOA card only shows the ACTIVE approvals count if EOA is the currently selected wallet in the Manual panel.
        const isEOAActivePanel = activeAccountType === 'eoa';
        const currentApprovals = isEOAActivePanel ? activeApprovals.length : 0;
        
        // Revoke history is always independent of the active panel state
        const revokeHistory = getRevokeHistory('eoa');

        return {
            totalApprovals: currentApprovals,
            totalValueAtRisk: 0, // Static Placeholder
            totalRevokes: revokeHistory.totalRevokes,
            totalAmountRevoked: revokeHistory.amountRevoked,
        };
    }, [activeApprovals, activeAccountType]);

    // Calculate Smart Account-specific stats
    const smartAccountStats = useMemo(() => {
        // The Smart Account card only shows the ACTIVE approvals count if Smart Account is the currently selected wallet in the Manual panel.
        const isSmartActivePanel = activeAccountType === 'smart';
        const currentApprovals = isSmartActivePanel ? activeApprovals.length : 0;
        
        // Revoke history is always independent of the active panel state
        const revokeHistory = getRevokeHistory('smart');

        return {
            totalApprovals: currentApprovals,
            totalValueAtRisk:0, // Static Placeholder
            totalRevokes: revokeHistory.totalRevokes,
            totalAmountRevoked: revokeHistory.amountRevoked,
        };
    }, [activeApprovals, activeAccountType]);


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
                {/* EOA Details Card - receives EOA-specific stats */}
                <EOADetails 
                    totalApprovals={eoaStats.totalApprovals}
                    valueAtRisk={eoaStats.totalValueAtRisk}
                    totalRevokes={eoaStats.totalRevokes}
                    amountRevoked={eoaStats.totalAmountRevoked}
                />
                {/* Smart Account Details Card - receives Smart Account-specific stats */}
                <SmartAccountDetails 
                    totalApprovals={smartAccountStats.totalApprovals}
                    valueAtRisk={smartAccountStats.totalValueAtRisk}
                    totalRevokes={smartAccountStats.totalRevokes}
                    amountRevoked={smartAccountStats.totalAmountRevoked}
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
                        {/* ManualRevokePanel sends the active data up */}
                        {activeTab === 'manual' && <ManualRevokePanel onDataFetched={handleApprovalsFetched} />}
                        {activeTab === 'auto' && <AutoRevokePanel />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RevokeErc20Page;
