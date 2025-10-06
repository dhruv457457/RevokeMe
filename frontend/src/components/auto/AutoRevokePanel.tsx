// components/auto/AutoRevokePanel.tsx
import React from 'react';
import { useAutoRevoke } from '../../hooks/useAutoRevoke';
import { useSmartAccount } from '../../hooks/useSmartAccount';
import ListManager from './ListManager';
import AuthorizationCard from './AuthorizationCard';

const AutoRevokePanel: React.FC = () => {
    const { smartAccount, isReady } = useSmartAccount();
    const { grant, status, authorizeAutoRevoke, revokeAuthorization, settings, updateSettings, approvalsToBatch } = useAutoRevoke();

    if (!isReady || !smartAccount) {
        return (
            <div className="bg-yellow-900/50 border border-yellow-700 rounded-lg p-6 text-center">
                <h3 className="font-bold text-yellow-300">Smart Account Required</h3>
                <p className="mt-2 text-sm text-yellow-400">Connect your wallet to enable the Auto-Revoke Terminal.</p>
            </div>
        );
    }

    return (
        <div className="border border-[#333336] bg-[#0C0C0E] rounded-3xl shadow-lg p-6 space-y-6 h-full">
            <div className="text-center border-b border-gray-700 pb-4">
                <h2 className="text-xl font-bold text-gray-200">Auto-Revoke Terminal</h2>
                <p className="text-sm text-gray-400 mt-1">Automated protection for your Smart Account</p>
            </div>

            <AuthorizationCard
                grant={grant}
                onAuthorize={authorizeAutoRevoke}
                onRevoke={revokeAuthorization}
            />

            {grant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-700">
                    {/* --- Settings Column --- */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="batchingPeriod" className="block text-sm font-medium text-gray-400 mb-2">
                                Revoke Batching Interval
                            </label>
                            <select
                                id="batchingPeriod"
                                value={settings.batchingPeriod}
                                onChange={(e) => updateSettings({ batchingPeriod: Number(e.target.value) })}
                                className="mt-1 block w-full pl-3 pr-10 py-2 bg-gray-800 border-gray-600 text-gray-200 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
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
                    <div className="bg-black rounded-md p-4 h-64 flex flex-col">
                         <div className="flex-shrink-0 flex items-center gap-2 mb-2">
                            <span className="h-3 w-3 bg-green-500 rounded-full"></span>
                            <p className="font-mono text-sm text-gray-400">Live Activity Log</p>
                        </div>
                        <div className="flex-grow overflow-y-auto font-mono text-xs text-gray-300 space-y-1">
                            {/* We will map over a log state here. For now, we display the current status */}
                            <p><span className="text-green-400 mr-2">◆</span>{status}</p>
                            {approvalsToBatch.length > 0 && (
                                <p><span className="text-blue-400 mr-2">◆</span>Queued for next batch: {approvalsToBatch.length} approvals</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AutoRevokePanel;