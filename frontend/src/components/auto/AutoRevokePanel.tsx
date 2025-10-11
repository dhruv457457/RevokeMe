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
                    Connect your wallet and set up your Smart Account to enable the Auto-Revoke Terminal.
                </p>
            </div>
        );
    }

    return (
        <div className="border border-[#333336] bg-[#0C0C0E] rounded-3xl shadow-2xl p-8 h-full">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-700 pb-6 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Auto-Revoke Terminal</h2>
                    <p className="text-md text-gray-400 mt-1">
                        Automated protection for your Smart Account.
                    </p>
                </div>
                <div className="mt-4 md:mt-0 flex-shrink-0">
                     <AuthorizationCard
                        grant={grant}
                        onAuthorize={authorizeAutoRevoke}
                        onRevoke={revokeAuthorization}
                    />
                </div>
            </div>

            {/* --- MAIN CONTENT (Shown only when active) --- */}
            {grant ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* --- Column 1: Configuration --- */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-300">Configuration</h3>
                        <div>
                            <label htmlFor="batchingPeriod" className="block text-sm font-medium text-gray-400 mb-2">
                                Revoke Batching Interval
                            </label>
                            <select
                                id="batchingPeriod"
                                value={settings.batchingPeriod}
                                onChange={(e) => updateSettings({ batchingPeriod: Number(e.target.value) })}
                                className="block w-full pl-4 pr-12 py-2.5 bg-gray-800 border-gray-600 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-lg transition-all"
                            >
                                <option value={10}>10 Seconds (Test)</option>
                                <option value={60}>1 Minute</option>
                                <option value={300}>5 Minutes</option>
                                <option value={900}>15 Minutes</option>
                            </select>
                        </div>
                        <ListManager
                            title="Whitelisted Spenders (Trusted)"
                            list={settings.whitelist}
                            onAdd={(addr) => updateSettings({ whitelist: [...settings.whitelist, addr] })}
                            onRemove={(addr) => updateSettings({ whitelist: settings.whitelist.filter(a => a !== addr) })}
                        />
                    </div>

                    {/* --- Column 2: Live Monitoring --- */}
                    <div className="space-y-6">
                         <h3 className="text-lg font-semibold text-gray-300">Live Monitoring</h3>
                        <div className=" rounded-3xl border border-[#333336] p-4 h-64 flex flex-col shadow-inner">
                            <div className="flex-shrink-0 flex items-center gap-3 mb-3">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <p className="font-mono text-sm text-gray-400">Live Activity Log</p>
                            </div>
                            <div className="flex-grow overflow-y-auto font-mono text-xs text-gray-300 space-y-2 pr-2 border-t border-[#333336] pt-3">
                                <p><span className="text-green-400 mr-2">›</span>{status}</p>
                                {approvalsToBatch.length > 0 && (
                                    <p><span className="text-blue-400 mr-2">›</span>Queued for next batch: {approvalsToBatch.length} approvals</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                 <div className="text-center py-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6.364-3.636l-1.414 1.414M2.21 12h-2m3.636-6.364L2.38 4.22m15.256 15.256l1.414 1.414M12 21v-2m-3.636-3.636l-1.414-1.414M21.79 12h2m-3.636-6.364l1.414-1.414M12 4.25c-4.28 0-7.75 3.47-7.75 7.75s3.47 7.75 7.75 7.75 7.75-3.47 7.75-7.75S16.28 4.25 12 4.25z" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-gray-400">Service is Offline</h3>
                    <p className="mt-1 text-sm text-gray-500">Authorize the service to begin monitoring and managing approvals.</p>
                </div>
            )}
        </div>
    );
};

export default AutoRevokePanel;