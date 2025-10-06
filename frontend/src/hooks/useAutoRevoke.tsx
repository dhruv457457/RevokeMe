import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { useSmartAccount } from './useSmartAccount';
import { encodeFunctionData, getAddress ,type Address } from 'viem';

const INDEXER_URL = import.meta.env.VITE_INDEXER_URL as string;
const erc20Abi = [ { inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' } ] as const;

// --- Interfaces ---
interface DelegationGrant {
  owner: Address;
  expiry: bigint;
}
interface Approval {
  id: string;
  tokenAddress: `0x${string}`;
  spender: `0x${string}`;
  owner: `0x${string}`;
  amount: string;
}
export interface AutoRevokeSettings {
  whitelist: string[];
  blacklist: string[];
  batchingPeriod: number; // in seconds
}

// --- Local Storage Keys ---
const GRANT_STORAGE_KEY = 'autoRevokeDelegationGrant';
const SETTINGS_STORAGE_KEY = 'autoRevokeSettings';
const BATCH_STORAGE_KEY = 'autoRevokeBatch';

export const useAutoRevoke = () => {
  const { address: eoaAddress, chain } = useAccount();
  const { smartAccount, pimlicoClient, smartClient } = useSmartAccount();
  const { signTypedDataAsync } = useSignTypedData();
  
  const [grant, setGrant] = useState<DelegationGrant | null>(null);
  const [status, setStatus] = useState<string>('Inactive');
  const [settings, setSettings] = useState<AutoRevokeSettings>({ whitelist: [], blacklist: [], batchingPeriod: 300 });
  const [approvalsToBatch, setApprovalsToBatch] = useState<Approval[]>([]);
  const isProcessing = useRef(false);
  
  // ✨ FIX: useRef requires an initial value.
  const watcherCallbackRef = useRef<(() => void) | null>(null);
  const batcherCallbackRef = useRef<(() => void) | null>(null);

  // Load state from localStorage on startup
  useEffect(() => {
    if (!eoaAddress) return;

    const savedGrant = localStorage.getItem(GRANT_STORAGE_KEY);
    if (savedGrant) {
      const parsed = JSON.parse(savedGrant, (key, value) => (key === 'expiry') ? BigInt(value) : value);
      if (parsed.owner.toLowerCase() === eoaAddress.toLowerCase() && parsed.expiry > BigInt(Math.floor(Date.now() / 1000))) {
        setGrant(parsed);
      } else {
        localStorage.removeItem(GRANT_STORAGE_KEY);
      }
    }
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    const savedBatch = localStorage.getItem(BATCH_STORAGE_KEY);
    if (savedBatch) setApprovalsToBatch(JSON.parse(savedBatch));
  }, [eoaAddress]);
  
  // Core Revocation Logic
  const triggerRevokeBatch = useCallback(async (approvals: Approval[]) => {
    if (!smartAccount || !pimlicoClient || !smartClient || approvals.length === 0) {
      setStatus('Batch revoke failed: Invalid setup.');
      return;
    }
    isProcessing.current = true;
    try {
      const calls = approvals.map(app => ({
        to: getAddress(app.tokenAddress),
        data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [getAddress(app.spender), 0n] }),
        value: 0n
      }));
      const fee = await pimlicoClient.getUserOperationGasPrice();
      const opHash = await smartClient.sendUserOperation({
        calls,
        maxFeePerGas: fee.fast.maxFeePerGas,
        maxPriorityFeePerGas: fee.fast.maxPriorityFeePerGas,
      });
      setStatus(`Batch of ${approvals.length} sent. Waiting...`);
      const { receipt } = await pimlicoClient.waitForUserOperationReceipt({ hash: opHash });
      setStatus(`Batch successful! TX: ${receipt.transactionHash.slice(0, 12)}...`);
    } catch (e: any) {
      console.error("Batch revoke transaction failed", e);
      setStatus(`Batch revoke failed: ${e.shortMessage || 'Check console.'}`);
      setApprovalsToBatch(prev => [...prev, ...approvals]);
    } finally {
      isProcessing.current = false;
    }
  }, [smartAccount, pimlicoClient, smartClient]);

  // Logic for the Watcher and Batcher (kept up-to-date by the ref)
  useEffect(() => {
    watcherCallbackRef.current = async () => {
      if (isProcessing.current || !smartAccount?.address) return;
      console.log('%c[DEBUG] Watcher Tick...', 'color: gray');

      try {
        const graphqlQuery = { query: `query GetAllApprovals($addr: String!) { Approval(where: {owner: {_eq: $addr}, amount: {_gt: "0"}}) { id tokenAddress spender owner amount } }`, variables: { addr: smartAccount.address.toLowerCase() }};
        const response = await fetch(INDEXER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(graphqlQuery) });
        const data = await response.json();
        const allActiveApprovals: Approval[] = data?.data?.Approval ?? [];

        const newApprovalsToProcess: Approval[] = [];
        const approvalsForImmediateRevoke: Approval[] = [];
        const currentBatchIds = new Set(approvalsToBatch.map(a => a.id));

        for (const approval of allActiveApprovals) {
          if (currentBatchIds.has(approval.id)) continue;
          const spender = approval.spender.toLowerCase();
          if (settings.whitelist.some(w => w.toLowerCase() === spender)) continue;
          if (settings.blacklist.some(b => b.toLowerCase() === spender)) {
            approvalsForImmediateRevoke.push(approval);
          } else {
            newApprovalsToProcess.push(approval);
          }
        }

        if (approvalsForImmediateRevoke.length > 0) {
          setStatus(`Blacklisted spender found! Immediately revoking...`);
          triggerRevokeBatch(approvalsForImmediateRevoke);
        }

        if (newApprovalsToProcess.length > 0) {
          const updatedBatch = [...approvalsToBatch, ...newApprovalsToProcess];
          setApprovalsToBatch(updatedBatch);
          localStorage.setItem(BATCH_STORAGE_KEY, JSON.stringify(updatedBatch));
        }
      } catch (e) { console.error("Watcher error:", e); setStatus('Watcher failed to fetch.'); }
    };
    
    batcherCallbackRef.current = () => {
      if (approvalsToBatch.length > 0 && !isProcessing.current) {
        console.log(`%c[DEBUG] Batcher Tick... Processing ${approvalsToBatch.length} approvals.`, 'color: blue; font-weight: bold;');
        const batchToProcess = [...approvalsToBatch];
        setApprovalsToBatch([]);
        localStorage.removeItem(BATCH_STORAGE_KEY);
        triggerRevokeBatch(batchToProcess);
      }
    };
  }, [settings, smartAccount, approvalsToBatch, triggerRevokeBatch]);


  // Master useEffect to control timers
  useEffect(() => {
    if (!grant) {
      setStatus('Inactive: Awaiting authorization.');
      return;
    }

    const watcherTick = () => watcherCallbackRef.current?.();
    const batcherTick = () => batcherCallbackRef.current?.();
    
    console.log('%c[DEBUG] Starting timers...', 'color: green');
    const watcherInterval = setInterval(watcherTick, 15000);
    const batcherInterval = setInterval(batcherTick, settings.batchingPeriod * 1000);

    return () => {
      console.log('%c[DEBUG] STOP! Clearing timers.', 'color: red; font-weight: bold;');
      clearInterval(watcherInterval);
      clearInterval(batcherInterval);
    };
  }, [grant, settings.batchingPeriod]);

  
  // Authorization and Settings Management
  const authorizeAutoRevoke = async () => {
    if (!eoaAddress || !smartAccount) {
      setStatus('Authorization failed: No EOA or smart account.');
      return;
    }
    try {
      const expiry = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7);
      const domain = { name: 'AutoRevokeDelegation', version: '1', chainId: chain?.id, verifyingContract: smartAccount.address, };
      const types = { Delegation: [ { name: 'owner', type: 'address' }, { name: 'expiry', type: 'uint256' }, ], };
      const value = { owner: eoaAddress, expiry, };
      await signTypedDataAsync({ domain, types, primaryType: 'Delegation', message: value });
      const newGrant: DelegationGrant = { owner: eoaAddress, expiry };
      setGrant(newGrant);
      localStorage.setItem(GRANT_STORAGE_KEY, JSON.stringify(newGrant, (_, val) => typeof val === 'bigint' ? val.toString() : val));
      setStatus('Authorized successfully!');
    } catch (e: any) {
      console.error('Authorization failed:', e);
      setStatus(`Authorization failed: ${e.message || 'Check console.'}`);
    }
  };
  
  const revokeAuthorization = () => {
    console.log('%c[DEBUG] revokeAuthorization called!', 'color: orange');
    setGrant(null);
    localStorage.removeItem(GRANT_STORAGE_KEY);
    setStatus('Inactive: Authorization revoked.');
  };

  const updateSettings = (newSettings: Partial<AutoRevokeSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { 
    grant, 
    status, 
    authorizeAutoRevoke, 
    revokeAuthorization,
    settings,
    updateSettings,
    approvalsToBatch
  };
};