// src/components/auto/AutoRevokePanel.tsx
import React from 'react';
import { useAutoRevoke } from '../../hooks/useAutoRevoke';
import { useSmartAccount } from '../../hooks/useSmartAccount';
import ListManager from './ListManager';
import AuthorizationCard from './AuthorizationCard';

const AutoRevokePanel: React.FC = () => {
    const { smartAccount, isReady } = useSmartAccount();
    const { 
        grant, 
        status, 
        authorizeAutoRevoke, 
        revokeAuthorization, 
        settings, 
        updateSettings, 
        approvalsToBatch 
    } = useAutoRevoke();

    if (!isReady || !smartAccount) {
        return (
            <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-8 text-center">
                <h3 className="font-bold text-yellow-300 text-lg">Smart Account Required</h3>
                <p className="mt-3 text-md text-yellow-400">
                    Connect your wallet to enable the Auto-Revoke Terminal.
                </p>
            </div>
        );
    }

    return (
        <div className="border border-[#333336] bg-[#0C0C0E] rounded-3xl shadow-2xl p-8 space-y-8 h-full">
            <div className="text-center border-b border-gray-700 pb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">Auto-Revoke Terminal</h2>
                <p className="text-md text-gray-400 mt-2">
                    Automated protection for your Smart Account
                </p>
            </div>

            <AuthorizationCard
                grant={grant}
                onAuthorize={authorizeAutoRevoke}
                onRevoke={revokeAuthorization}
            />

            {grant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-700">
                    {/* --- Settings Column --- */}
                    <div className="space-y-8">
                        <div>
                            <label htmlFor="batchingPeriod" className="block text-md font-medium text-gray-300 mb-3">
                                Revoke Batching Interval
                            </label>
                            <select
                                id="batchingPeriod"
                                value={settings.batchingPeriod}
                                onChange={(e) => updateSettings({ batchingPeriod: Number(e.target.value) })}
                                className="mt-1 block w-full pl-4 pr-12 py-3 bg-gray-800 border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-md rounded-lg transition-all"
                            >
                                <option value={10}>10 Seconds (Test)</option>
                                <option value={60}>1 Minute</option>
                                <option value={300}>5 Minutes</option>
                                <option value={900}>15 Minutes</option>
                            </select>
                        </div>
                        <ListManager
                            title="Whitelist Spenders"
                            list={settings.whitelist}
                            onAdd={(addr) => updateSettings({ whitelist: [...settings.whitelist, addr] })}
                            onRemove={(addr) => updateSettings({ whitelist: settings.whitelist.filter(a => a !== addr) })}
                        />
                    </div>

                    {/* --- Live Log Column --- */}
                    <div className="bg-black rounded-lg p-5 h-72 flex flex-col shadow-inner">
                         <div className="flex-shrink-0 flex items-center gap-3 mb-4 border-b border-gray-800 pb-3">
                            <span className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="font-mono text-md text-gray-400 tracking-wider">Live Activity Log</p>
                        </div>
                        <div className="flex-grow overflow-y-auto font-mono text-sm text-gray-300 space-y-2 pr-2">
                            <p><span className="text-green-400 mr-3 text-lg">›</span>{status}</p>
                            {approvalsToBatch.length > 0 && (
                                <p><span className="text-blue-400 mr-3 text-lg">›</span>Queued for next batch: {approvalsToBatch.length} approvals</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoRevokePanel;