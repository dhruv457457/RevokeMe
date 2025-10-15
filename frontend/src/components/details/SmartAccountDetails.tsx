// components/details/SmartAccountDetails.tsx
import React, { useState, useEffect } from 'react';
import { useSmartAccount } from '../../hooks/useSmartAccount';
import { formatEther } from 'viem';
import StatItem from './StatItem'; // Import the new component

// --- Icons for Stats ---
const ApprovalIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-4l-3-3-6 6-2-2-3 3 6 6 3-3" /></svg>;
const RiskIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const RevokeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const AmountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;

// A simple copy-to-clipboard utility hook
const useCopyToClipboard = () => {
    const [copied, setCopied] = useState(false);
    const copy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };
    return { copied, copy };
};

interface SmartAccountDetailsProps {
    totalApprovals: number;
    valueAtRisk: number;
    totalRevokes: number;
    amountRevoked: number;
}

const SmartAccountDetails: React.FC<SmartAccountDetailsProps> = ({ totalApprovals, valueAtRisk, totalRevokes, amountRevoked }) => {
    const { smartAccount, publicClient, isReady, isSettingUp } = useSmartAccount();
    const [balance, setBalance] = useState<string>('0');
    const { copied, copy } = useCopyToClipboard();

    useEffect(() => {
        const fetchBalance = async () => {
            if (isReady && publicClient && smartAccount?.address) {
                try {
                    const bal = await publicClient.getBalance({ address: smartAccount.address });
                    setBalance(formatEther(bal));
                } catch (error) {
                    console.error("Failed to fetch smart account balance:", error);
                    setBalance('0');
                }
            }
        };
        fetchBalance();
    }, [isReady, publicClient, smartAccount?.address]);

    const address = smartAccount?.address;

    return (
        <div className="bg-[#101012] border border-[#1A1A1D] rounded-3xl p-6 h-full flex flex-col justify-between">
            {/* Top Section: Details & Balance */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6">
                    <div>
                        <h3 className="text-sm font-semibold text-purple-400">Delegation Wallet (Smart Account)</h3>
                        {isSettingUp && <p className="text-gray-400 text-xs mt-2 animate-pulse">Initializing...</p>}
                        {isReady && address && (
                            <div className="mt-2 flex items-center gap-2 max-w-xs sm:max-w-none">
                                <p className="text-lg font-mono text-gray-200 truncate" title={address}>
                                    {address.slice(0, 6)}...{address.slice(-4)}
                                </p>
                                <button onClick={() => copy(address)} className="text-gray-400 hover:text-white transition-colors shrink-0">
                                    {copied ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-2xl font-bold text-white">
                        {parseFloat(balance).toFixed(4)} <span className="text-lg font-medium text-gray-400">MONAD</span>
                    </p>
                </div>
            </div>

            {/* Bottom Section: Stats */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-t border-gray-700/50 pt-4 mt-4 gap-4 sm:gap-0">
                <StatItem icon={<ApprovalIcon />} label="Approvals" value={totalApprovals} index={0} />
                <div className="hidden sm:block h-8 border-l border-gray-700/50"></div>
                <StatItem icon={<RiskIcon />} label="Value at Risk" value={`$${valueAtRisk.toLocaleString()}`} colorClass="text-yellow-400" index={1} />
                <div className="hidden sm:block h-8 border-l border-gray-700/50"></div>
                <StatItem icon={<RevokeIcon />} label="Total Revokes" value={totalRevokes} index={2} />
                <div className="hidden sm:block h-8 border-l border-gray-700/50"></div>
                <StatItem icon={<AmountIcon />} label="Amount Revoked" value={`$${amountRevoked.toLocaleString()}`} colorClass="text-red-400" index={3} />
            </div>
        </div>
    );
};

export default SmartAccountDetails;