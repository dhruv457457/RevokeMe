// src/components/manual/ApprovalsTable.tsx
import React, { useState } from 'react';
import { type Approval } from '../../utils/fetchApprovals';
import { formatUnits } from 'viem';

// --- Icons ---
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


// Helper functions specific to this table
const formatAddress = (addr: string | null) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '-';

const formatAmount = (amount: string) => {
    try {
        // This is a common representation for an unlimited approval (max uint256)
        if (BigInt(amount) >= BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")) {
            return "Unlimited";
        }
        return Number(formatUnits(BigInt(amount), 18)).toLocaleString();
    } catch {
        return "N/A";
    }
};

const formatDate = (timestamp?: string | null) => {
  if (!timestamp) return '-';
  const asNum = Number(timestamp);
  if (!asNum || isNaN(asNum)) return '-';
  const date = new Date(asNum * 1000);
  // More readable date format
  return date.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};


interface Props {
    approvals: Approval[];
    checkedIds: string[];
    onCheckedIdsChange: (ids: string[]) => void;
    onRevokeSingle: (approval: Approval) => void;
    isLoading: boolean;
}

const ApprovalsTable: React.FC<Props> = ({ approvals, checkedIds, onCheckedIdsChange, onRevokeSingle, isLoading }) => {
    const [copiedId, setCopiedId] = useState('');

    const handleCopy = (id: string, addr: string) => {
        navigator.clipboard.writeText(addr);
        setCopiedId(id);
        setTimeout(() => setCopiedId(''), 2000); // Reset after 2 seconds
    };

    if (approvals.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500 bg-[#1A1A1D] rounded-xl">
                <h3 className="font-semibold text-gray-300">No Active Approvals</h3>
                <p className="text-sm mt-1">There are no active token approvals for this account.</p>
            </div>
        );
    }

    const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCheckedIdsChange(e.target.checked ? approvals.map(a => a.id) : []);
    };

    const handleCheckSingle = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        onCheckedIdsChange(
            e.target.checked ? [...checkedIds, id] : checkedIds.filter(x => x !== id)
        );
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-400 rounded-2xl">
                <thead className="bg-[#1A1A1D] text-xs text-gray-400 uppercase tracking-wider">
                    <tr>
                        <th scope="col" className="px-4 py-3">
                            <input 
                                type="checkbox" 
                                className="accent-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-600" 
                                checked={approvals.length > 0 && checkedIds.length === approvals.length} 
                                onChange={handleCheckAll} 
                                disabled={isLoading} 
                            />
                        </th>
                        <th scope="col" className="px-4 py-3">Asset</th>
                        <th scope="col" className="px-4 py-3">Amount</th>
                        <th scope="col" className="px-4 py-3">Spender</th>
                        <th scope="col" className="px-4 py-3">Owner</th>
                        <th scope="col" className="px-4 py-3">Last Updated</th>
                        <th scope="col" className="px-4 py-3 text-center">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {approvals.map((a) => (
                        <tr key={a.id} className="border-b border-gray-800 hover:bg-gray-800/20">
                            <td className="px-4 py-4">
                                <input 
                                    type="checkbox" 
                                    className="accent-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-600"
                                    checked={checkedIds.includes(a.id)} 
                                    onChange={e => handleCheckSingle(e, a.id)} 
                                    disabled={isLoading} 
                                />
                            </td>
                            <td className="px-4 py-4 font-mono text-gray-300" title={a.tokenAddress}>
                                <div className="flex items-center gap-2">
                                    <span>{formatAddress(a.tokenAddress)}</span>
                                    <button onClick={() => handleCopy(`${a.id}-token`, a.tokenAddress)} className="p-1 rounded hover:bg-white/10">
                                        {copiedId === `${a.id}-token` ? <CheckIcon /> : <CopyIcon />}
                                    </button>
                                </div>
                            </td>
                            <td className="px-4 py-4 font-semibold text-white">{formatAmount(a.amount)}</td>
                            <td className="px-4 py-4 font-mono" title={a.spender}>
                                <div className="flex items-center gap-2">
                                    <span>{formatAddress(a.spender)}</span>
                                    <button onClick={() => handleCopy(`${a.id}-spender`, a.spender)} className="p-1 rounded hover:bg-white/10">
                                        {copiedId === `${a.id}-spender` ? <CheckIcon /> : <CopyIcon />}
                                    </button>
                                </div>
                            </td>
                            <td className="px-4 py-4 font-mono" title={a.owner ?? ''}>
                                <div className="flex items-center gap-2">
                                    <span>{formatAddress(a.owner)}</span>
                                    {a.owner && (
                                        <button onClick={() => handleCopy(`${a.id}-owner`, a.owner!)} className="p-1 rounded hover:bg-white/10">
                                            {copiedId === `${a.id}-owner` ? <CheckIcon /> : <CopyIcon />}
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">{formatDate(a.blockTimestamp)}</td>
                            <td className="px-4 py-4 text-center">
                                <button 
                                    className="px-4 py-1.5 border border-gray-600 text-white hover:text-red-400 font-semibold rounded-3xl cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors" 
                                    onClick={() => onRevokeSingle(a)} 
                                    disabled={isLoading}
                                >
                                    Revoke
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ApprovalsTable;