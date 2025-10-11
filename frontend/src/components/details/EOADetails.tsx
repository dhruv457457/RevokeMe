// components/details/EOADetails.tsx
import React, { useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';

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

interface EOADetailsProps {
  totalApprovals: number;
  valueAtRisk: number;
  totalRevokes: number;
  amountRevoked: number;
}

const EOADetails: React.FC<EOADetailsProps> = ({ totalApprovals, valueAtRisk, totalRevokes, amountRevoked }) => {
    const { address, isConnected } = useAccount();
    const { data: balanceData } = useBalance({ address });
    const { copied, copy } = useCopyToClipboard();

    if (!isConnected || !address) {
        return (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-full flex items-center justify-center">
                <p className="text-gray-400">Please connect your wallet.</p>
            </div>
        );
    }
    
    const balance = balanceData ? formatEther(balanceData.value) : '0';

    return (
        <div className="border border-[#333336] bg-[#0C0C0E] rounded-3xl p-6 h-full flex flex-col">
            {/* Top Section: Details & Balance */}
            <div className="flex justify-between items-start pb-4">
                {/* Left Side: Title & Address */}
                <div>
                    <h3 className="text-sm font-semibold text-blue-400">Connected Wallet (EOA)</h3>
                    <div className="mt-2 flex items-center gap-2">
                        <p className="text-lg font-mono text-gray-200 truncate" title={address}>
                            {address.slice(0, 6)}...{address.slice(-4)}
                        </p>
                        <button onClick={() => copy(address)} className="text-gray-400 hover:text-white transition-colors">
                            {copied ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            )}
                        </button>
                    </div>
                </div>
                {/* Right Side: Balance */}
                <div className="text-right">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-2xl font-bold text-white">{parseFloat(balance).toFixed(4)} <span className="text-lg font-medium text-gray-400">MONAD</span></p>
                </div>
            </div>

            {/* Bottom Section: Stats */}
            <div className="flex-grow grid grid-cols-2 gap-y-4 gap-x-2 content-center border-t border-gray-700 pt-4">
                <div>
                    <p className="text-xs text-gray-500">Active Approvals</p>
                    <p className="text-lg font-bold text-white">{totalApprovals}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Value at Risk</p>
                    <p className="text-lg font-bold text-yellow-400">${valueAtRisk.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Total Revokes</p>
                    <p className="text-lg font-bold text-white">{totalRevokes}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Amount Revoked</p>
                    <p className="text-lg font-bold text-red-400">${amountRevoked.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default EOADetails;