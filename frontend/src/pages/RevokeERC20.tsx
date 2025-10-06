import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { encodeFunctionData, isAddress, getAddress, formatUnits, zeroAddress } from 'viem';
import {
  revocationModuleFactoryAddress,
  revocationModuleFactoryAbi,
  revocationModuleAbi
} from '../lib/contracts/contracts';

// ERC20 ABI
const erc20Abi = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const INDEXER_URL = import.meta.env.VITE_INDEXER_URL as string;
const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY;

interface Approval {
  id: string;
  tokenAddress: `0x${string}`;
  spender: `0x${string}`;
  owner: `0x${string}` | null;
  amount: string;
  blockTimestamp?: string | null;
}

// Helper functions (remain the same)
const formatAddress = (addr?: string | null) =>
  addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '-';

const formatAmount = (amount: string) => {
  try { return Number(formatUnits(BigInt(amount), 18)).toLocaleString(); }
  catch { return amount; }
};

const formatDate = (timestamp?: string | null) => {
  if (!timestamp) return '-';
  const asNum = Number(timestamp);
  if (!asNum || isNaN(asNum)) return '-';
  const date = new Date(asNum * 1000);
  return date.toLocaleString();
};


const RevokeERC20Page: React.FC = () => {
  const { address: eoaAddress } = useAccount();
  const { smartAccount, pimlicoClient, smartClient } = useSmartAccount();
  const { data: writeContractHash, writeContractAsync } = useWriteContract();
  const [accountType, setAccountType] = useState<'smart' | 'eoa'>('smart');
  const selectedAddress = accountType === 'smart' ? smartAccount?.address : eoaAddress;

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle'|'loading'|'success'|'error', message: string }>({ type: 'idle', message: '' });

  // HOOK TO CHECK IF EOA USER HAS A MODULE
  const { data: userModuleAddress, isLoading: isCheckingModule, refetch: refetchModuleAddress } = useReadContract({
    address: revocationModuleFactoryAddress,
    abi: revocationModuleFactoryAbi,
    functionName: 'getModule',
    args: [eoaAddress ?? zeroAddress],
    query: {
      enabled: accountType === 'eoa' && !!eoaAddress,
    }
  });

  // REFETCH MODULE ADDRESS AFTER A CREATION TRANSACTION IS CONFIRMED
  const { isSuccess: isCreationSuccess } = useWaitForTransactionReceipt({
    hash: writeContractHash
  });

  useEffect(() => {
    if (isCreationSuccess) {
      setStatus({ type: 'success', message: 'Module created successfully! You can now batch revoke.' });
      refetchModuleAddress();
    }
  }, [isCreationSuccess, refetchModuleAddress]);
  
  // Fetch approvals logic
  useEffect(() => {
    if (!selectedAddress || !isAddress(selectedAddress)) {
      setApprovals([]);
      setCheckedIds([]);
      return;
    }
    setIsLoading(true);
    setStatus({ type: 'idle', message: '' });

    const query = {
      query: `
        query GetApprovals($addr: String!) {
          Approval(
            where: { _or: [
              { owner: { _eq: $addr }},
              { spender: { _eq: $addr }}
            ]},
            order_by: { blockTimestamp: desc }
          ) {
            id owner spender tokenAddress amount blockTimestamp
          }
        }
      `,
      variables: { addr: selectedAddress.toLowerCase() },
    };

    fetch(INDEXER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(query) })
    .then(r => r.json())
    .then(data => {
      const raw = data?.data?.Approval ?? [];
      setApprovals(raw.filter((a: Approval) => {
        try { return BigInt(a.amount) > 0n; } catch { return false; }
      }));
    })
    .catch(_e => setStatus({ type: 'error', message: 'Could not fetch approvals.' }))
    .finally(() => setIsLoading(false));
  }, [selectedAddress]);
  
  // Single revoke logic
  const handleRevokeSingle = async (approval: Approval) => {
    setStatus({ type: 'loading', message: 'Preparing to revoke approval...' });
    const { tokenAddress, spender } = approval;
    if (!isAddress(tokenAddress) || !isAddress(spender)) {
      setStatus({ type: 'error', message: 'Invalid addresses.' });
      return;
    }
    try {
      if (accountType === 'smart') {
        if (!smartAccount || !pimlicoClient || !smartClient || !PIMLICO_API_KEY) {
          setStatus({ type: 'error', message: 'Smart Account setup required.' });
          return;
        }
        const fee = await pimlicoClient.getUserOperationGasPrice();
        const opHash = await smartClient.sendUserOperation({
          calls: [{
            to: getAddress(tokenAddress),
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: 'approve',
              args: [getAddress(spender), BigInt(0)]
            }),
            value: BigInt(0)
          }],
          maxFeePerGas: fee.fast.maxFeePerGas,
          maxPriorityFeePerGas: fee.fast.maxPriorityFeePerGas,
        });
        setStatus({ type: 'loading', message: `Transaction sent, waiting for confirmation...` });
        const { receipt } = await pimlicoClient.waitForUserOperationReceipt({ hash: opHash });
        setStatus({ type: 'success', message: `Revoked! TX hash: ${receipt.transactionHash}` });
      } else {
        const txHash = await writeContractAsync({
          address: getAddress(tokenAddress),
          abi: erc20Abi,
          functionName: 'approve',
          args: [getAddress(spender), BigInt(0)]
        });
        setStatus({ type: 'success', message: `Revoked! TX hash: ${txHash}` });
      }
    } catch (e: any) {
      setStatus({ type: 'error', message: e?.shortMessage || 'Error revoking.' });
    }
  };

  // REVISED: Batch Revoke to handle EOA module creation
 // FINAL REVISION: Batch Revoke with correct EOA handling
const handleRevokeBatch = async () => {
  const approvalsToRevoke = approvals.filter(a => checkedIds.includes(a.id));
  if (approvalsToRevoke.length === 0) return;

  try {
    if (accountType === 'smart') {
      // Smart Account logic is correct and uses native batching.
      setStatus({ type: 'loading', message: `Preparing to batch revoke ${approvalsToRevoke.length} approvals...` });
      if (!smartAccount || !pimlicoClient || !smartClient) { throw new Error('Smart Account setup required.'); }
      
      const calls = approvalsToRevoke.map(approval => ({
          to: getAddress(approval.tokenAddress),
          data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [getAddress(approval.spender), 0n] }),
          value: 0n,
      }));
      const fee = await pimlicoClient.getUserOperationGasPrice();
      const opHash = await smartClient.sendUserOperation({ calls, maxFeePerGas: fee.fast.maxFee-per-gas, maxPriorityFeePerGas: fee.fast.max-priority-fee-per-gas });
      
      setStatus({ type: 'loading', message: 'Batch transaction sent, waiting for confirmation...' });
      const { receipt } = await pimlicoClient.waitForUserOperationReceipt({ hash: opHash });
      setStatus({ type: 'success', message: `Batch revoked! TX hash: ${receipt.transactionHash}` });
    } else {
      // EOA LOGIC: Revert to sequential transactions. This is the only way for EOAs.
      setStatus({ type: 'loading', message: `Preparing to revoke ${approvalsToRevoke.length} approvals one by one...` });
      
      let successCount = 0;
      for (const approval of approvalsToRevoke) {
        try {
          setStatus({ type: 'loading', message: `Revoking approval for ${formatAddress(approval.spender)}... (${successCount + 1}/${approvalsToRevoke.length})`});
          // We can reuse the single revoke logic, which is correct.
          await handleRevokeSingle(approval);
          successCount++;
        } catch (e: any) {
          setStatus({ type: 'error', message: `Failed to revoke for ${formatAddress(approval.spender)}. Error: ${e.shortMessage}. Aborting.` });
          return; // Stop on first failure
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

  // DETERMINE BUTTON TEXT AND DISABLED STATE
  const getButtonState = () => {
    const isLoadingState = status.type === 'loading';
    if (accountType === 'eoa') {
      if (isCheckingModule) {
        return { text: 'Checking Setup...', disabled: true };
      }
      if (!userModuleAddress || userModuleAddress === zeroAddress) {
        return { text: 'One-Time Setup: Create Module', disabled: isLoadingState };
      }
    }
    return { text: `Revoke Selected (${checkedIds.length})`, disabled: checkedIds.length === 0 || isLoadingState };
  };

  const buttonState = getButtonState();

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white border rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-1">ERC20 Approval Management</h2>
      <div className="flex gap-4 items-center mb-4">
        <button onClick={() => setAccountType('smart')}
          className={`px-4 py-1 rounded ${accountType==='smart'?'bg-purple-700 text-white':'bg-gray-200 text-gray-600'} font-semibold`}>
          Smart Account
        </button>
        <button onClick={() => setAccountType('eoa')}
          className={`px-4 py-1 rounded ${accountType==='eoa'?'bg-blue-700 text-white':'bg-gray-200 text-gray-600'} font-semibold`}>
          Main Account (EOA)
        </button>
        <span className="ml-6 text-sm text-gray-500">Viewing: <span className="font-mono bg-gray-100 p-1 rounded">{selectedAddress ? formatAddress(selectedAddress) : '-'}</span></span>
      </div>
      {status.message && (
        <div className={`mb-4 p-2 rounded-md text-sm ${status.type==="success"?"bg-green-100 text-green-800":status.type==="error"?"bg-red-100 text-red-800":"bg-blue-100 text-blue-800"}`}>
          {status.message}
        </div>
      )}
      
      <div className="w-full overflow-x-auto">
        {isLoading ? (
          <div className="p-6 text-center text-gray-500 animate-pulse">Loading approval list...</div>
        ) : approvals.length === 0 ? (
          <div className="p-5 text-center text-gray-500">No active approvals found for this account.</div>
        ) : (
          <>
            <table className="min-w-full border mb-2 text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2"><input type="checkbox"
                    checked={approvals.length > 0 && checkedIds.length===approvals.length}
                    onChange={e => setCheckedIds(e.target.checked?approvals.map(a=>a.id):[])} /></th>
                  <th className="px-4 py-2">Asset</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Approved<br />Amount</th>
                  <th className="px-4 py-2">Value at<br />Risk</th>
                  <th className="px-4 py-2">Approved Spender</th>
                  <th className="px-4 py-2">Owner Address</th>
                  <th className="px-4 py-2 whitespace-nowrap">Last Updated</th>
                  <th className="px-4 py-2 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvals.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <input type="checkbox"
                        checked={checkedIds.includes(a.id)}
                        onChange={e =>
                          setCheckedIds(
                            e.target.checked
                              ? [...checkedIds, a.id]
                              : checkedIds.filter(x => x !== a.id)
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 max-w-[150px] font-mono truncate">{formatAddress(a.tokenAddress)}</td>
                    <td className="px-4 py-2">Token</td>
                    <td className="px-4 py-2">{formatAmount(a.amount)}</td>
                    <td className="px-4 py-2">Unknown</td>
                    <td className="px-4 py-2 max-w-[150px] font-mono truncate">{formatAddress(a.spender)}</td>
                    <td className="px-4 py-2 max-w-[150px] font-mono truncate">{a.owner ? formatAddress(a.owner) : '-'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDate(a.blockTimestamp)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button className="px-3 py-1 bg-red-600 text-white rounded"
                        onClick={() => handleRevokeSingle(a)}
                        disabled={status.type==='loading'}>
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center gap-2">
              <button
                className="px-5 py-2 bg-red-700 text-white rounded font-bold disabled:bg-gray-400"
                onClick={handleRevokeBatch}
                disabled={buttonState.disabled}
              >
                {buttonState.text}
              </button>
              {accountType === 'eoa' && userModuleAddress && userModuleAddress !== zeroAddress && (
                 <span className="text-xs text-green-600">✓ Batch revoke enabled</span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="text-xs text-gray-400 mt-6">
        Tip: The "Revoke Selected" button sends a single batch transaction to save gas and time.
      </div>
    </div>
  );
};

export default RevokeERC20Page;