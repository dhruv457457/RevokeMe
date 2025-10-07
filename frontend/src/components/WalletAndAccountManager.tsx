// src/components/WalletAndAccountManager.tsx

import React, { useState, useRef, useEffect } from 'react';
import { useConnect, useAccount, useDisconnect, useSwitchChain, useWalletClient } from "wagmi";
import { injected } from "@wagmi/connectors";
import { motion, AnimatePresence } from "framer-motion";
import { useSmartAccount } from "../hooks/useSmartAccount"; // Make sure this path is correct
import { monadTestnet } from "../config"; // Make sure this path is correct

// --- Helper Components for Icons ---
const Spinner: React.FC = () => (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CopyIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);


export const WalletAndAccountManager: React.FC = () => {
    // Wallet Hooks
    const { connect } = useConnect();
    const { isConnected, address, chainId } = useAccount();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const { data: walletClient } = useWalletClient();

    // Smart Account Hooks
    const { smartAccount, setupSmartAccount, isSettingUp } = useSmartAccount();

    // UI State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [copiedAddress, setCopiedAddress] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // ✨ NEW: State for the address animation
    const [isShowingEoa, setIsShowingEoa] = useState(true);

    // ✨ NEW: Effect to cycle between addresses every 4 seconds
    useEffect(() => {
        if (smartAccount && address) {
            const interval = setInterval(() => {
                setIsShowingEoa(prev => !prev);
            }, 4000); // Switch every 4 seconds
            
            return () => clearInterval(interval); // Cleanup on unmount
        }
    }, [smartAccount, address]);


    const handleCopy = (addr: string) => {
        navigator.clipboard.writeText(addr);
        setCopiedAddress(addr);
        setTimeout(() => setCopiedAddress(''), 2000); // Reset after 2 seconds
    };

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    // 1. Not Connected
    if (!isConnected) {
        return (
            <button
                onClick={() => connect({ connector: injected() })}
                className="bg-[#7f4de] text-white hover:bg-[#7437DC] cursor-pointer px-4 py-2 rounded-md text-sm font-semibold transition-colors"
            >
                Connect Wallet
            </button>
        );
    }

    // 2. Connected, but on the wrong chain
    if (chainId !== monadTestnet.id) {
        return (
            <button
                onClick={() => switchChain({ chainId: monadTestnet.id })}
                className="bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30 cursor-pointer px-4 py-2 rounded-md text-sm font-semibold transition-colors"
            >
                Switch Network
            </button>
        );
    }

    // 3. Smart account is ready -> Show new dropdown with BOTH addresses
    if (smartAccount && address) {
        const eoaAddress = address;
        const saAddress = smartAccount.address;

        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 text-sm bg-white/10 text-white px-3 py-2 rounded-md font-mono transition-colors hover:bg-white/20"
                >
                    {/* ✨ NEW: Animated address display */}
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={isShowingEoa ? 'eoa' : 'sa'}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.3 }}
                            className="block w-28 text-left" // Fixed width to prevent layout shifts
                        >
                            {isShowingEoa
                                ? `${eoaAddress?.slice(0, 6)}...${eoaAddress?.slice(-4)}`
                                : `${saAddress?.slice(0, 6)}...${saAddress?.slice(-4)}`
                            }
                        </motion.span>
                    </AnimatePresence>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 p-2 w-72 bg-[#1A1A1D] border border-[#333336] rounded-lg shadow-xl z-20"
                        >
                            {/* EOA Wallet Section */}
                            <div className="px-2 pt-1 pb-2">
                                <div className="text-xs font-semibold text-gray-400 uppercase">EOA Wallet (Controller)</div>
                                <div className="flex items-center justify-between mt-1 text-gray-300 hover:text-white">
                                    <span className="text-sm font-mono truncate pr-2">{eoaAddress}</span>
                                    <button onClick={() => handleCopy(eoaAddress)} className="p-1 rounded hover:bg-white/10">
                                        {copiedAddress === eoaAddress ? <CheckIcon /> : <CopyIcon />}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Smart Account Section */}
                            <div className="px-2 pt-2 pb-2 border-t border-[#333336]">
                                <div className="text-xs font-semibold text-green-400 uppercase">Smart Account</div>
                                <div className="flex items-center justify-between mt-1 text-gray-300 hover:text-white">
                                    <span className="text-sm font-mono truncate pr-2">{saAddress}</span>
                                    <button onClick={() => handleCopy(saAddress)} className="p-1 rounded hover:bg-white/10">
                                        {copiedAddress === saAddress ? <CheckIcon /> : <CopyIcon />}
                                    </button>
                                </div>
                            </div>

                            {/* Disconnect Button */}
                            <div className="mt-1 pt-2 border-t border-[#333336]">
                                <button
                                    onClick={() => { disconnect(); setIsDropdownOpen(false); }}
                                    className="w-full flex items-center text-left px-2 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Disconnect
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // 4. Setting up smart account
    if (isSettingUp) {
        return (
             <button
                disabled
                className="flex items-center space-x-2 text-sm bg-white/10 text-white px-3 py-2 rounded-md font-mono cursor-wait"
            >
                <Spinner />
                <span>Setting up...</span>
            </button>
        );
    }

    // 5. Ready to set up smart account
    return (
        <button
            onClick={() => {if (walletClient && address) setupSmartAccount()}}
            disabled={!walletClient || !address}
            className="bg-[#7f4de] text-white hover:bg-[#7437DC] cursor-pointer px-4 py-2 rounded-md text-sm font-semibold transition-colors"
        >
            Setup Account
        </button>
    );
};