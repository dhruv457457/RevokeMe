import React, { useState } from 'react';
import { useAutoRevoke } from '../hooks/useAutoRevoke';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { isAddress, getAddress } from 'viem';

// --- Reusable Icon Components for a better UI ---
const IconShieldCheck = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.944c0-3.956-1.58-7.5-4.382-10.016z" /></svg>;
const IconShieldExclamation = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;

// --- Sub-component for managing Whitelists/Blacklists ---
const ListManager: React.FC<{
  title: string;
  list: string[];
  onAdd: (address: string) => void;
  onRemove: (address: string) => void;
}> = ({ title, list, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (isAddress(input)) {
      onAdd(getAddress(input));
      setInput('');
    } else {
      alert("Invalid address provided.");
    }
  };

  return (
    <div>
      <h5 className="font-medium text-gray-800">{title} ({list.length})</h5>
      <div className="mt-2 flex rounded-md shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter spender address (0x...)"
          className="flex-1 min-w-0 block w-full px-3 py-2 border-gray-300 rounded-l-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
        <button onClick={handleAdd} className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none">Add</button>
      </div>
      <div className="mt-3 bg-gray-50 border rounded-md p-2 h-24 overflow-y-auto space-y-1">
        {list.length === 0 && <p className="text-xs text-gray-500 text-center pt-2">No addresses added.</p>}
        {list.map(addr => (
          <div key={addr} className="flex justify-between items-center bg-white px-2 py-1 rounded">
            <span className="font-mono text-xs">{addr}</span>
            <button onClick={() => onRemove(addr)} className="text-red-500 hover:text-red-700 font-bold text-lg leading-none">&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- Main Page Component ---
const AutoRevokePage: React.FC = () => {
  const { smartAccount } = useSmartAccount();
  const { grant, status, authorizeAutoRevoke, revokeAuthorization, settings, updateSettings, approvalsToBatch } = useAutoRevoke();

  if (!smartAccount) {
    return (
      <div className="text-center mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-yellow-800">Smart Account Required</h2>
        <p className="mt-2 text-yellow-700">Please connect your wallet and set up your Smart Account to enable auto-revocation.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white border rounded-lg shadow-xl space-y-8">
      
      {/* --- Header --- */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Auto-Revoke Service</h2>
        <p className="text-gray-600">
          Set rules to automatically revoke new token approvals for your Smart Account.
        </p>
      </div>

      {/* --- Main Status & Action Card --- */}
      <div className={`p-6 rounded-lg border ${grant ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center space-x-4">
          <div>{grant ? <IconShieldCheck /> : <IconShieldExclamation />}</div>
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${grant ? 'text-green-800' : 'text-gray-800'}`}>
              Auto-Revoke is {grant ? 'ACTIVE' : 'INACTIVE'}
            </h3>
            <p className={`text-sm ${grant ? 'text-green-700' : 'text-gray-600'}`}>
              {grant 
                ? `Service is running. Delegation expires: ${new Date(Number(grant.expiry) * 1000).toLocaleString()}`
                : 'Sign a message to grant this service permission to revoke approvals on your behalf.'
              }
            </p>
          </div>
           <button
            onClick={grant ? revokeAuthorization : authorizeAutoRevoke}
            className={`px-6 py-3 font-bold rounded-lg transition w-48 text-white ${grant ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
          >
            {grant ? 'De-authorize & Stop' : 'Authorize & Start'}
          </button>
        </div>
      </div>

      {/* --- Live Activity & Settings (only shown when active) --- */}
      {grant && (
        <div className="space-y-8">
          {/* --- Live Activity Feed --- */}
          <div className="pt-8 border-t">
            <h4 className="font-semibold text-lg text-center mb-4">Live Activity Feed</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-100 rounded-md">
                <h5 className="font-medium text-center">Status</h5>
                <p className="font-mono text-sm text-center text-gray-700 mt-2 min-h-[40px]">{status}</p>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h5 className="font-medium text-center text-blue-800">Queued for Next Batch</h5>
                <p className="text-3xl font-bold text-center text-blue-900 mt-2">{approvalsToBatch.length}</p>
              </div>
            </div>
          </div>

          {/* --- Settings Panel --- */}
          <div className="pt-8 border-t">
            <h4 className="font-semibold text-lg text-center mb-4">Settings</h4>
            <div className="space-y-6 p-6 bg-gray-50 rounded-lg border">
              <div>
                <label htmlFor="batchingPeriod" className="block text-sm font-medium text-gray-700">Batching Period</label>
                <select
                  id="batchingPeriod"
                  value={settings.batchingPeriod}
                  onChange={(e) => updateSettings({ batchingPeriod: Number(e.target.value) })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                >
                  <option value={10}>10 Seconds (for testing)</option>
                  <option value={60}>1 Minute</option>
                  <option value={300}>5 Minutes</option>
                  <option value={600}>10 Minutes</option>
                </select>
                <p className="mt-2 text-xs text-gray-500">Approvals are collected and revoked in batches at this interval.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ListManager
                  title="Whitelist Spenders"
                  list={settings.whitelist}
                  onAdd={(addr) => updateSettings({ whitelist: [...settings.whitelist, addr] })}
                  onRemove={(addr) => updateSettings({ whitelist: settings.whitelist.filter(a => a !== addr) })}
                />
                <ListManager
                  title="Blacklist Spenders"
                  list={settings.blacklist}
                  onAdd={(addr) => updateSettings({ blacklist: [...settings.blacklist, addr] })}
                  onRemove={(addr) => updateSettings({ blacklist: settings.blacklist.filter(a => a !== addr) })}
                />
              </div>
               <p className="text-xs text-gray-500 text-center pt-2">
                <b>Whitelist:</b> Approvals to these spenders will be ignored. <b>Blacklist:</b> Approvals to these spenders will be revoked immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoRevokePage;