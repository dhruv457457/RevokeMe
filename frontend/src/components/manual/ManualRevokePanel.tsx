// src/components/manual/ManualRevokePanel.tsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { useSmartAccount } from '../../hooks/useSmartAccount';
import { encodeFunctionData, isAddress, getAddress, zeroAddress } from 'viem';
import { revocationModuleFactoryAddress, revocationModuleFactoryAbi } from '../../lib/contracts/contracts';
import { fetchApprovals, type Approval } from '../../utils/fetchApprovals';
import ApprovalsTable from './ApprovalsTable';
import StatusDisplay from '../shared/StatusDisplay';
import { erc20Abi } from '../../lib/abis/erc20Abi';

// --- Helper Components & Icons ---
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const IconSpinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

// --- Type Definitions ---
type SortOption = 'newest' | 'oldest' | 'spender-az' | 'spender-za' | 'amount-high' | 'amount-low';
interface ActiveFilters {
    amount: ('unlimited' | 'limited')[];
    type: ('token' | 'nft')[];
}

const formatAddress = (addr?: string | null) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '-';

// --- Main Component ---
const ManualRevokePanel: React.FC = () => {
    const { address: eoaAddress } = useAccount();
    const { smartAccount, pimlicoClient, smartClient, isReady } = useSmartAccount();
    const { data: writeContractHash, writeContractAsync } = useWriteContract();

    // Core State
    const [accountType, setAccountType] = useState<'smart' | 'eoa'>('eoa');
    const selectedAddress = accountType === 'smart' ? smartAccount?.address : eoaAddress;
    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    
    // UI State for dropdowns
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    // New Sort & Filter State
    const [sortOption, setSortOption] = useState<SortOption>('newest');
    const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ amount: [], type: [] });

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) setIsSortOpen(false);
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) setIsFilterOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const { data: userModuleAddress, isLoading: isCheckingModule, refetch: refetchModuleAddress } = useReadContract({
        address: revocationModuleFactoryAddress,
        abi: revocationModuleFactoryAbi,
        functionName: 'getModule',
        args: [eoaAddress ?? zeroAddress],
        query: { enabled: accountType === 'eoa' && !!eoaAddress }
    });
    
    const { isSuccess: isCreationSuccess } = useWaitForTransactionReceipt({ hash: writeContractHash });
    useEffect(() => {
        if (isCreationSuccess && status.message.includes('Deploying')) {
            setStatus({ type: 'success', message: 'Module created successfully! You can now batch revoke.' });
            refetchModuleAddress();
        }
    }, [isCreationSuccess, refetchModuleAddress, status.message]);

    useEffect(() => {
        if (!selectedAddress || !isAddress(selectedAddress)) {
            setApprovals([]);
            return;
        }
        setIsLoading(true);
        setStatus({ type: 'idle', message: '' });
        fetchApprovals(selectedAddress)
            .then(setApprovals)
            .catch(() => setStatus({ type: 'error', message: 'Could not fetch approvals.' }))
            .finally(() => setIsLoading(false));
    }, [selectedAddress]);

    // New Memoized function to apply sort and filters
    const displayedApprovals = useMemo(() => {
        const unlimitedThreshold = BigInt("0xffffffffffffffffffffffffffffffff");
        
        const filtered = approvals.filter(approval => {
            // Amount filter
            if (activeFilters.amount.length > 0) {
                const isUnlimited = BigInt(approval.amount) > unlimitedThreshold;
                if (activeFilters.amount.includes('unlimited') && !isUnlimited) return false;
                if (activeFilters.amount.includes('limited') && isUnlimited) return false;
            }
            // Type filter (Note: only 'token' is supported by current data)
            if (activeFilters.type.length > 0 && !activeFilters.type.includes('token')) {
                return false;
            }
            return true;
        });

        return filtered.sort((a, b) => {
            switch (sortOption) {
                case 'newest':
                    return Number(b.blockTimestamp ?? 0) - Number(a.blockTimestamp ?? 0);
                case 'oldest':
                    return Number(a.blockTimestamp ?? 0) - Number(b.blockTimestamp ?? 0);
                case 'spender-az':
                    return a.spender.localeCompare(b.spender);
                case 'spender-za':
                    return b.spender.localeCompare(a.spender);
                case 'amount-high':
                    return Number(BigInt(b.amount) - BigInt(a.amount));
                case 'amount-low':
                    return Number(BigInt(a.amount) - BigInt(b.amount));
                default:
                    return 0;
            }
        });
    }, [approvals, sortOption, activeFilters]);

    // Single Revoke Logic
    const handleRevokeSingle = async (approval: Approval) => {
        const { tokenAddress, spender } = approval;
        if (!isAddress(tokenAddress) || !isAddress(spender)) {
            throw new Error("Invalid token or spender address.");
        }
        setStatus({ type: 'loading', message: `Revoking for ${formatAddress(spender)}...` });
        if (accountType === 'smart') {
            if (!isReady || !pimlicoClient || !smartClient) throw new Error('Smart Account is not ready.');
            const fee = await pimlicoClient.getUserOperationGasPrice();
            const opHash = await smartClient.sendUserOperation({
                calls: [{
                    to: getAddress(tokenAddress),
                    data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [getAddress(spender), 0n] }),
                    value: 0n
                }],
                maxFeePerGas: fee.fast.maxFeePerGas,
                maxPriorityFeePerGas: fee.fast.maxPriorityFeePerGas,
            });
            const { receipt } = await pimlicoClient.waitForUserOperationReceipt({ hash: opHash });
            setStatus({ type: 'success', message: `Revoked successfully! Tx: ${receipt.transactionHash.slice(0,12)}...` });
        } else {
            const txHash = await writeContractAsync({
                address: getAddress(tokenAddress),
                abi: erc20Abi,
                functionName: 'approve',
                args: [getAddress(spender), 0n]
            });
            setStatus({ type: 'success', message: `Revoke transaction sent! Hash: ${txHash.slice(0,12)}...` });
        }
    };

    // EOA Module Creation Logic
    const handleCreateModule = async () => {
        try {
            setStatus({ type: 'loading', message: 'Deploying your personal revocation module...' });
            await writeContractAsync({
                address: revocationModuleFactoryAddress,
                abi: revocationModuleFactoryAbi,
                functionName: 'createModule'
            });
        } catch(e: any) {
            setStatus({ type: 'error', message: e?.shortMessage || 'Module creation failed.' });
        }
    };

    // Batch Revoke Logic
    const handleRevokeBatch = async () => {
        const toRevoke = approvals.filter(a => checkedIds.includes(a.id));
        if (toRevoke.length === 0) return;
        try {
            if (accountType === 'smart') {
                if (!isReady || !pimlicoClient || !smartClient) throw new Error('Smart Account is not ready.');
                setStatus({ type: 'loading', message: `Batch revoking ${toRevoke.length} approvals...` });
                const calls = toRevoke.map(a => ({
                    to: getAddress(a.tokenAddress),
                    data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [getAddress(a.spender), 0n] }),
                    value: 0n
                }));
                const fee = await pimlicoClient.getUserOperationGasPrice();
                const opHash = await smartClient.sendUserOperation({ calls, maxFeePerGas: fee.fast.maxFeePerGas, maxPriorityFeePerGas: fee.fast.maxPriorityFeePerGas });
                const { receipt } = await pimlicoClient.waitForUserOperationReceipt({ hash: opHash });
                setStatus({ type: 'success', message: `Batch revoked! Tx: ${receipt.transactionHash.slice(0, 12)}...` });
            } else {
                 let successCount = 0;
                 for (const approval of toRevoke) {
                     try {
                         await handleRevokeSingle(approval);
                         successCount++;
                     } catch (e: any) {
                         setStatus({ type: 'error', message: `Failed at approval ${successCount + 1}. Aborting.` });
                         return;
                     }
                 }
                 setStatus({ type: 'success', message: `Successfully revoked ${successCount} approvals.` });
            }
        } catch (e: any) {
            setStatus({ type: 'error', message: e?.shortMessage || 'An unexpected error occurred.' });
        } finally {
            setCheckedIds([]);
        }
    };
    
    // Determines the batch button's text, action, and disabled state
    const getButtonState = () => {
        const isLoadingState = status.type === 'loading';
        if (accountType === 'eoa') {
            if (isCheckingModule) return { text: 'Checking Setup...', disabled: true, action: () => {} };
            if (!userModuleAddress || userModuleAddress === zeroAddress) return { text: 'Enable Batch Revoke', disabled: isLoadingState, action: handleCreateModule };
        }
        return { text: `Revoke Selected (${checkedIds.length})`, disabled: checkedIds.length === 0 || isLoadingState, action: handleRevokeBatch };
    };

   const buttonState = getButtonState();

    // --- New Filter & Sort Handlers ---
    const handleSortSelect = (option: SortOption) => {
        setSortOption(option);
        setIsSortOpen(false);
    };

   const handleFilterChange = <K extends keyof ActiveFilters>(
    category: K,
    value: ActiveFilters[K][number]
) => {
    setActiveFilters(prev => {
        const current = prev[category];
        const updated = current.includes(value as never)
            ? current.filter(item => item !== value)
            : [...current, value];
        return { ...prev, [category]: updated };
    });
};
    const sortOptions: { key: SortOption, label: string }[] = [
        { key: 'newest', label: 'Last Updated: Newest to Oldest' },
        { key: 'oldest', label: 'Last Updated: Oldest to Newest' },
        { key: 'spender-az', label: 'Approved Spender: A to Z' },
        { key: 'spender-za', label: 'Approved Spender: Z to A' },
        { key: 'amount-high', label: 'Approved Amount: High to Low' },
        { key: 'amount-low', label: 'Approved Amount: Low to High' },
    ];
    
    return (
        <div className="border border-[#333336] bg-[#0C0C0E] rounded-3xl shadow-lg p-6 h-full flex flex-col">
            {/* Header Section */}
            <div className="flex-shrink-0">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-200">Manual Approval Management</h2>
                    {/* Account Type Buttons */}
                     <div className="flex items-center gap-2 p-1 bg-[#1A1A1D]  rounded-lg mt-4 md:mt-0">
                        <button onClick={() => setAccountType('eoa')} className={`w-full md:w-auto px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${accountType === 'eoa' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}>Main Account (EOA)</button>
                        <button onClick={() => setAccountType('smart')} className={`w-full md:w-auto px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${accountType === 'smart' ? 'bg-purple-600 text-white' : ' text-gray-400 hover:bg-gray-700'}`}>Smart Account</button>
                    </div>
                </div>

                {/* Controls Section */}
                <div className="flex flex-col md:flex-row gap-4 items-center mb-4 border-b border-gray-700 pb-4">
                    {/* Sort and Filter Buttons */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative" ref={filterRef}>
                            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm bg-[#1A1A1D] border border-[#333336] rounded-md text-gray-300 ">
                                <span>Filters</span>
                                <span className="text-xs bg-gray-600 px-1.5 py-0.5 rounded-full">{activeFilters.amount.length + activeFilters.type.length}</span>
                            </button>
                            {isFilterOpen && (
                                <div className="absolute top-full mt-2 w-60 bg-[#0C0C0E] border border-[#333336] rounded-lg shadow-xl z-20 p-4 text-gray-300 text-sm">
                                    <h5 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">Asset Type</h5>
                                    <label className="flex items-center gap-2 mb-3"><input type="checkbox" className="accent-purple-500" checked={activeFilters.type.includes('token')} onChange={() => handleFilterChange('type', 'token')} /> Token</label>
                                    <label className="flex items-center gap-2 mb-3 cursor-not-allowed text-gray-600" title="NFT data not available"><input type="checkbox" disabled /> NFT</label>
                                    
                                    <h5 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-2 border-t border-gray-700 pt-3">Approved Amount</h5>
                                    <label className="flex items-center gap-2 mb-3"><input type="checkbox" className="accent-purple-500" checked={activeFilters.amount.includes('unlimited')} onChange={() => handleFilterChange('amount', 'unlimited')} /> Unlimited</label>
                                    <label className="flex items-center gap-2 mb-3"><input type="checkbox" className="accent-purple-500" checked={activeFilters.amount.includes('limited')} onChange={() => handleFilterChange('amount', 'limited')} /> Limited</label>
                                </div>
                            )}
                        </div>
                        <div className="relative" ref={sortRef}>
                             <button onClick={() => setIsSortOpen(!isSortOpen)} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm bg-[#1A1A1D] border border-[#333336] rounded-md text-gray-300"><span>Sort</span> <ChevronDownIcon/></button>
                             {isSortOpen && (
                                <div className="absolute top-full mt-2 w-64 bg-[#0C0C0E] border border-[#333336] rounded-lg shadow-xl z-20 text-gray-300 text-sm">
                                    {sortOptions.map(opt => (
                                        <button key={opt.key} onClick={() => handleSortSelect(opt.key)} className={`w-full text-left px-4 py-2 hover:bg-[#1A1A1D] ${sortOption === opt.key ? 'bg-[#1A1A1D]' : ''}`}>{opt.label}</button>
                                    ))}
                                </div>
                             )}
                        </div>
                    </div>
                </div>
                 <StatusDisplay status={status} />
            </div>

            <div className="flex-grow overflow-y-auto">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-400">Loading approvals...</div>
                ) : (
                    <ApprovalsTable
                    approvals={displayedApprovals}
                    checkedIds={checkedIds}
                    onCheckedIdsChange={setCheckedIds}
                    onRevokeSingle={handleRevokeSingle}
                    setStatus={setStatus}
                    isLoading={status.type === 'loading'}
                />
                )}
            </div>

            <div className="flex-shrink-0 pt-4 border-t border-gray-700 mt-4">
                {approvals.length > 0 && !isLoading && (
                     <div className="flex items-center justify-between gap-4">
                        <button onClick={buttonState.action} disabled={buttonState.disabled} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[180px]">
                            {status.type === 'loading' && buttonState.text !== 'Checking Setup...' ? <IconSpinner /> : buttonState.text}
                        </button>
                        {accountType === 'eoa' && userModuleAddress && userModuleAddress !== zeroAddress ? (
                             <span className="text-xs text-green-400 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                Batch revoke enabled
                             </span>
                         ) : null}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManualRevokePanel;
