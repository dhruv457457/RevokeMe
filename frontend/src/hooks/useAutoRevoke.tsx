import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { useSmartAccount } from './useSmartAccount';
import { encodeFunctionData, getAddress, isAddress, type Address, http } from 'viem';
import { createPimlicoClient } from 'permissionless/clients/pimlico';

// --- Configuration & Types ---
const INDEXER_URL = "http://localhost:8080/v1/graphql";
const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY;
const erc20Abi = [{ inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }] as const;

const pimlicoClient = createPimlicoClient({
  transport: http(`https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`),
});

interface DelegationGrant {
  owner: Address;
  expiry: bigint;
  signature?: `0x${string}`;
}
interface Approval {
    id: string;
    tokenAddress: `0x${string}`;
    spender: `0x${string}`;
    owner: `0x${string}`;
}

const GRANT_STORAGE_KEY = 'autoRevokeDelegationGrant';
const PROCESSED_IDS_KEY = 'autoRevokeProcessedIds';

// --- The Hook ---
export const useAutoRevoke = () => {
  const { address: eoaAddress, chain } = useAccount();
  const { smartAccount, bundlerClient } = useSmartAccount();
  const { signTypedDataAsync } = useSignTypedData();
  
  const [grant, setGrant] = useState<DelegationGrant | null>(null);
  const [status, setStatus] = useState<string>('Inactive');
  const isProcessing = useRef(false);

  // Load grant from localStorage on startup
  useEffect(() => {
    const savedGrant = localStorage.getItem(GRANT_STORAGE_KEY);
    if (savedGrant) {
      const parsed = JSON.parse(savedGrant, (key, value) => (key === 'expiry') ? BigInt(value) : value);
      if (parsed.owner === eoaAddress && parsed.expiry > BigInt(Math.floor(Date.now() / 1000))) {
        setGrant(parsed);
      } else {
        localStorage.removeItem(GRANT_STORAGE_KEY);
      }
    }
  }, [eoaAddress]);
  
  // Create a stable, memoized function for the revocation logic.
  const triggerAutoRevoke = useCallback(async (approval: Approval): Promise<boolean> => {
    if (!smartAccount || !bundlerClient) return false;
    try {
      const fee = await pimlicoClient.getUserOperationGasPrice();
      const opHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [{
          to: getAddress(approval.tokenAddress),
          data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [getAddress(approval.spender), BigInt(0)] }),
          value: BigInt(0)
        }],
        maxFeePerGas: fee.fast.maxFeePerGas,
        maxPriorityFeePerGas: fee.fast.maxPriorityFeePerGas,
      });
      setStatus(`Auto-revoke sent. Waiting for confirmation...`);
      await bundlerClient.waitForUserOperationReceipt({ hash: opHash });
      setStatus('Auto-revoke successful! Resuming watch...');
      return true;
    } catch (e) {
      console.error("--- DEBUG: Auto-revoke transaction failed ---", e);
      setStatus('Auto-revoke failed. Check console.');
      return false;
    }
  }, [smartAccount, bundlerClient]);

  // Create a stable, memoized function for the watcher's core logic.
  const checkForUnseenApprovals = useCallback(async () => {
    console.log(`%c[Watcher] Tick! Starting check... (isProcessing: ${isProcessing.current})`, 'color: gray');
    if (isProcessing.current || !smartAccount?.address) {
        if(isProcessing.current) console.log("%c[Watcher] Locked. Skipping this check.", 'color: orange');
        return;
    }

    const processedIds = new Set(JSON.parse(localStorage.getItem(PROCESSED_IDS_KEY) || '[]'));
    setStatus(`Watching for new approvals... (processed ${processedIds.size})`);
    console.log("[Watcher] Current processed IDs:", Array.from(processedIds));

    const graphqlQuery = {
      query: `query GetAllApprovals($owner: String!) { Approval(where: {owner: {_eq: $owner}, amount: {_gt: "0"}}) { id tokenAddress spender owner } }`,
      variables: { owner: smartAccount.address.toLowerCase() },
    };

    try {
      const response = await fetch(INDEXER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': 'testing' }, body: JSON.stringify(graphqlQuery) });
      const data = await response.json();
      console.log("[Watcher] Indexer response:", data);
      
      const allActiveApprovals: Approval[] = data?.data?.Approval ?? [];
      const unseenApproval = allActiveApprovals.find(app => !processedIds.has(app.id));
      console.log("[Watcher] Found unseen approval:", unseenApproval || "None");

      if (unseenApproval) {
        isProcessing.current = true;
        console.log(`%c[Watcher] LOCKING. Processing: ${unseenApproval.id}`, 'color: blue; font-weight: bold;');
        setStatus(`Found new approval for ${unseenApproval.tokenAddress}. Triggering...`);
        try {
          const success = await triggerAutoRevoke(unseenApproval);
          if (success) {
            const currentProcessedIds = new Set(JSON.parse(localStorage.getItem(PROCESSED_IDS_KEY) || '[]'));
            const newProcessedIds = new Set(currentProcessedIds).add(unseenApproval.id);
            localStorage.setItem(PROCESSED_IDS_KEY, JSON.stringify(Array.from(newProcessedIds)));
            console.log("[Watcher] Added to processed list:", unseenApproval.id);
          }
        } finally {
          console.log(`%c[Watcher] UNLOCKING. Finished processing.`, 'color: blue; font-weight: bold;');
          isProcessing.current = false;
        }
      }
    } catch (e) { 
      console.error("--- DEBUG: Watcher failed to fetch ---", e);
      isProcessing.current = false;
    }
  }, [smartAccount, triggerAutoRevoke]);

  // This useEffect now ONLY manages the timer.
  useEffect(() => {
    if (!grant) {
      setStatus('Inactive');
      return;
    }
    
    checkForUnseenApprovals();

    const intervalId = setInterval(() => {
      checkForUnseenApprovals();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [grant, checkForUnseenApprovals]);

  // --- Functions for the UI ---
  const authorizeAutoRevoke = async () => {
    if (!eoaAddress || !smartAccount?.address || !chain) return;
    const delegation = {
      owner: eoaAddress,
      expiry: BigInt(Math.floor(Date.now() / 1000) + (24 * 60 * 60)), // 24 hours
    };
    const signature = await signTypedDataAsync({
      domain: { name: 'AutoRevoke dApp', version: '1', chainId: chain.id, verifyingContract: smartAccount.address },
      types: { Delegation: [{ name: 'owner', type: 'address' }, { name: 'expiry', type: 'uint256' }] },
      primaryType: 'Delegation',
      message: delegation,
    });
    const signedGrant = { ...delegation, signature };
    localStorage.setItem(GRANT_STORAGE_KEY, JSON.stringify(signedGrant, (key, value) => typeof value === 'bigint' ? value.toString() : value));
    setGrant(signedGrant);
  };

  const revokeAuthorization = () => {
    localStorage.removeItem(GRANT_STORAGE_KEY);
    localStorage.removeItem(PROCESSED_IDS_KEY);
    setGrant(null);
  };

  return { grant, status, authorizeAutoRevoke, revokeAuthorization };
};

