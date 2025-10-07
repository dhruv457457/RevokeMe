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
  return date.toLocaleString();
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
        // STYLING FIX: Updated text color for dark theme
        return <div className="p-5 text-center text-gray-400">No active approvals found.</div>;
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
            {/* STYLING FIX: Fully updated table for dark theme */}
            <table className="min-w-full text-sm text-gray-300">
                <thead className="bg-gray-800">
                    <tr>
                        <th className="px-4 py-3 text-left">
                            <input 
                                type="checkbox" 
                                className="accent-purple-500 bg-gray-700 border-gray-600 rounded" 
                                checked={approvals.length > 0 && checkedIds.length === approvals.length} 
                                onChange={handleCheckAll} 
                                disabled={isLoading} 
                            />
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">Asset</th>
                        <th className="px-4 py-3 text-left font-semibold">Type</th>
                        <th className="px-4 py-3 text-left font-semibold">Approved Amount</th>
                        <th className="px-4 py-3 text-left font-semibold">Value at Risk</th>
                        <th className="px-4 py-3 text-left font-semibold">Approved Spender</th>
                        <th className="px-4 py-3 text-left font-semibold">Owner Address</th>
                        <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Last Updated</th>
                        <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {approvals.map((a) => (
                        <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-800">
                            <td className="px-4 py-2">
                                <input 
                                    type="checkbox" 
                                    className="accent-purple-500 bg-gray-700 border-gray-600 rounded" 
                                    checked={checkedIds.includes(a.id)} 
                                    onChange={e => handleCheckSingle(e, a.id)} 
                                    disabled={isLoading} 
                                />
                            </td>
                            <td className="px-4 py-2 font-mono" title={a.tokenAddress}>{formatAddress(a.tokenAddress)}</td>
                            <td className="px-4 py-2">Token</td>
                            <td className="px-4 py-2">{formatAmount(a.amount)}</td>
                            <td className="px-4 py-2">Unknown</td>
                            <td className="px-4 py-2 font-mono" title={a.spender}>{formatAddress(a.spender)}</td>
                            
                            {/* TS FIX: Changed title={a.owner} to title={a.owner ?? ''} */}
                            <td className="px-4 py-2 font-mono" title={a.owner ?? ''}>{formatAddress(a.owner)}</td>
                            
                            <td className="px-4 py-2 whitespace-nowrap">{formatDate(a.blockTimestamp)}</td>
                            <td className="px-4 py-2">
                                <button 
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-3xl cursor-pointer disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors" 
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