// components/details/SmartAccountDetails.tsx
import React, { useState, useEffect } from 'react';
import { useSmartAccount } from '../../hooks/useSmartAccount';
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

const SmartAccountDetails: React.FC = () => {
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
        <div className="border border-[#333336] bg-[#0C0C0E] rounded-3xl p-4 h-full flex flex-col justify-between">
            <div>
                <h3 className="text-sm font-semibold text-purple-400">Delegation Wallet (Smart Account)</h3>
                {isSettingUp && <p className="text-gray-400 text-xs mt-2 animate-pulse">Initializing...</p>}
                {isReady && address && (
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
                )}
            </div>
            <div className="mt-4">
                <p className="text-xs text-gray-500">Balance</p>
                <p className="text-2xl font-bold text-white">{parseFloat(balance).toFixed(4)} MONAD</p>
              
            </div>
        </div>
    );
};

export default SmartAccountDetails;