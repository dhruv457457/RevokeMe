// components/manual/ManualRevokePanel.tsx
import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { useSmartAccount } from '../../hooks/useSmartAccount';
import { encodeFunctionData, isAddress, getAddress, zeroAddress } from 'viem';
import { revocationModuleFactoryAddress, revocationModuleFactoryAbi } from '../../lib/contracts/contracts';
import { fetchApprovals, type Approval } from '../../utils/fetchApprovals';
import ApprovalsTable from './ApprovalsTable';
import StatusDisplay from '../shared/StatusDisplay';
import { erc20Abi } from '../../lib/abis/erc20Abi';

const formatAddress = (addr?: string | null) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '-';

const ManualRevokePanel: React.FC = () => {
    const { address: eoaAddress } = useAccount();
    const { smartAccount, pimlicoClient, smartClient, isReady } = useSmartAccount();
    const { data: writeContractHash, writeContractAsync } = useWriteContract();

    const [accountType, setAccountType] = useState<'smart' | 'eoa'>('smart');
    const selectedAddress = accountType === 'smart' ? smartAccount?.address : eoaAddress;

    const [approvals, setApprovals] = useState<Approval[]>([]);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
    
    // Logic to check for EOA module
    const { data: userModuleAddress, isLoading: isCheckingModule, refetch: refetchModuleAddress } = useReadContract({
        address: revocationModuleFactoryAddress,
        abi: revocationModuleFactoryAbi,
        functionName: 'getModule',
        args: [eoaAddress ?? zeroAddress],
        query: { enabled: accountType === 'eoa' && !!eoaAddress }
    });
    
    // Refetch module address after creation
    const { isSuccess: isCreationSuccess } = useWaitForTransactionReceipt({ hash: writeContractHash });
    useEffect(() => {
        if (isCreationSuccess && status.message.includes('Deploying')) {
            setStatus({ type: 'success', message: 'Module created successfully! You can now batch revoke.' });
            refetchModuleAddress();
        }
    }, [isCreationSuccess, refetchModuleAddress, status.message]);

    // Fetch approvals logic
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
    const IconSpinner = () => <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

    return (
        // FIX: Added `h-full flex flex-col` to make the panel stretch and organize content vertically
        <div className="border border-[#333336] bg-[#0C0C0E] rounded-3xl shadow-lg p-6 h-full flex flex-col">
            {/* Header Section */}
            <div className="flex-shrink-0">
                <h2 className="text-xl font-bold mb-4 text-gray-200">Manual Approval Management</h2>
                <div className="flex flex-wrap gap-2 items-center mb-4 border-b border-gray-700 pb-4">
                  
                    <button 
                      onClick={() => setAccountType('eoa')} 
                      className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${accountType === 'eoa' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Main Account (EOA)
                    </button>
                      <button 
                      onClick={() => setAccountType('smart')} 
                      className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${accountType === 'smart' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                        Smart Account
                    </button>
                    <span className="text-sm text-gray-400 ml-auto">Viewing: <span className="font-mono bg-gray-800 p-1 rounded-md text-gray-300">{selectedAddress ? formatAddress(selectedAddress) : '...'}</span></span>
                </div>
                <StatusDisplay status={status} />
            </div>

            {/* FIX: This new div wraps the table, allowing it to grow and scroll */}
            <div className="flex-grow overflow-y-auto">
                {isLoading ? (
                    <div className="p-6 text-center text-gray-400">Loading approvals...</div>
                ) : (
                    <ApprovalsTable
                    approvals={approvals}
                    checkedIds={checkedIds}
                    onCheckedIdsChange={setCheckedIds}
                    onRevokeSingle={handleRevokeSingle} // <-- FIX: Pass the actual function
                    setStatus={setStatus}
                    isLoading={status.type === 'loading'}
                />
                )}
            </div>

            {/* Footer Section */}
            <div className="flex-shrink-0 pt-4">
                {approvals.length > 0 && !isLoading && (
                     <div className="flex items-center justify-between gap-4">
                        <button
    onClick={buttonState.action}
    disabled={buttonState.disabled}
    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-bold disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
>
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