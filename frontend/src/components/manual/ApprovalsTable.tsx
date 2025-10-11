// src/components/manual/ApprovalsTable.tsx
import React from 'react';
import { type Approval } from '../../utils/fetchApprovals';
import { formatUnits } from 'viem';

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
    onRevokeSingle: (approval: Approval) => Promise<void>;
    setStatus: (status: { type: 'loading' | 'success' | 'error', message: string }) => void;
    isLoading: boolean;
}

const ApprovalsTable: React.FC<Props> = ({ approvals, checkedIds, onCheckedIdsChange, onRevokeSingle, setStatus, isLoading }) => {
    if (approvals.length === 0) {
        return (
            <div className="p-10 text-center text-gray-500 bg-gray-900/50 rounded-lg">
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
    
    const handleRevokeClick = async (approval: Approval) => {
        try {
          await onRevokeSingle(approval);
        } catch (e: any) {
          setStatus({ type: 'error', message: e?.shortMessage || 'Error revoking.' });
        }
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm text-left text-gray-400">
                <thead className="bg-gray-800 text-xs text-gray-400 uppercase tracking-wider">
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
                        <tr key={a.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="px-4 py-4">
                                <input 
                                    type="checkbox" 
                                    className="accent-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-600"
                                    checked={checkedIds.includes(a.id)} 
                                    onChange={e => handleCheckSingle(e, a.id)} 
                                    disabled={isLoading} 
                                />
                            </td>
                            <td className="px-4 py-4 font-mono text-gray-300" title={a.tokenAddress}>{formatAddress(a.tokenAddress)}</td>
                            <td className="px-4 py-4 font-semibold text-white">{formatAmount(a.amount)}</td>
                            <td className="px-4 py-4 font-mono" title={a.spender}>{formatAddress(a.spender)}</td>
                            <td className="px-4 py-4 font-mono" title={a.owner ?? ''}>{formatAddress(a.owner)}</td>
                            <td className="px-4 py-4 whitespace-nowrap">{formatDate(a.blockTimestamp)}</td>
                            <td className="px-4 py-4 text-center">
                                <button 
                                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors" 
                                    onClick={() => handleRevokeClick(a)} 
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