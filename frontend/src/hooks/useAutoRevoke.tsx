import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { useSmartAccount } from './useSmartAccount';
import { encodeFunctionData, getAddress, isAddress, type Address } from 'viem';

const INDEXER_URL = import.meta.env.VITE_INDEXER_URL as string;
const erc20Abi = [
  { inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }
] as const;

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

const GRANT_STORAGE_KEY = 'autoRevokeDelegationGrant';

export const useAutoRevoke = () => {
  const { address: eoaAddress, chain } = useAccount();
  const { smartAccount, pimlicoClient, smartClient } = useSmartAccount();
  
  const { signTypedDataAsync } = useSignTypedData();
  
  const [grant, setGrant] = useState<DelegationGrant | null>(null);
  const [status, setStatus] = useState<string>('Inactive');
  const isProcessing = useRef(false);
  const savedWatcherCallback = useRef<() => void>(undefined);

  // Load grant from localStorage on startup
  useEffect(() => {
    const savedGrant = localStorage.getItem(GRANT_STORAGE_KEY);
    if (savedGrant) {
      const parsed = JSON.parse(savedGrant, (key, value) => (key === 'expiry') ? BigInt(value) : value);
      if (parsed.owner === eoaAddress && parsed.expiry > BigInt(Math.floor(Date.now() / 1000))) {
        setGrant(parsed);
      }
    }
  }, [eoaAddress]);
  
  const triggerAutoRevoke = useCallback(async (approval: Approval): Promise<boolean> => {
    if (!smartAccount || !pimlicoClient || !smartClient || !isAddress(approval.tokenAddress) || !isAddress(approval.spender)) {
      console.error("--- DEBUG: Invalid smartAccount, pimlicoClient, smartClient, or addresses ---", { smartAccount, pimlicoClient, smartClient, tokenAddress: approval.tokenAddress, spender: approval.spender });
      setStatus('Auto-revoke failed: Invalid setup or addresses.');
      return false;
    }

    try {
      let fee;
      let lastError;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          fee = await pimlicoClient.getUserOperationGasPrice();
          break;
        } catch (e) {
          lastError = e;
          console.warn(`--- DEBUG: Gas price fetch attempt ${attempt} failed ---`, e);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      if (!fee) {
        throw lastError || new Error('Failed to fetch gas prices after retries.');
      }

      const opHash = await smartClient.sendUserOperation({
        calls: [{
          to: getAddress(approval.tokenAddress),
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [getAddress(approval.spender), BigInt(0)]
          }),
          value: BigInt(0)
        }],
        maxFeePerGas: fee.fast.maxFeePerGas,
        maxPriorityFeePerGas: fee.fast.maxPriorityFeePerGas,
      });
      setStatus(`Auto-revoke sent for ${approval.id}. Waiting...`);
      const { receipt } = await pimlicoClient.waitForUserOperationReceipt({ hash: opHash });
      setStatus(`Auto-revoke successful! TX: ${receipt.transactionHash}`);
      return true;
    } catch (e: any) {
      console.error("--- DEBUG: Auto-revoke transaction failed ---", e);
      setStatus(`Auto-revoke failed: ${e.message || 'Check console.'}`);
      return false;
    }
  }, [smartAccount, pimlicoClient, smartClient]);

  const checkForUnseenApprovals = useCallback(async () => {
    console.log(`%c[Watcher] Tick! Starting check... (isProcessing: ${isProcessing.current})`, 'color: gray');
    if (isProcessing.current || !smartAccount?.address || !smartClient) {
      if (isProcessing.current) console.log("%c[Watcher] Locked. Skipping this check.", 'color: orange');
      if (!smartAccount?.address) console.log("%c[Watcher] No smart account address.", 'color: orange');
      if (!smartClient) console.log("%c[Watcher] No smart client.", 'color: orange');
      setStatus('Inactive: Smart account not ready.');
      return;
    }

    setStatus(`Watching for new approvals...`);
    const graphqlQuery = {
      query: `query GetAllApprovals($addr: String!) { Approval(where: {_or: [{owner: {_eq: $addr}}, {spender: {_eq: $addr}}]}) { id tokenAddress spender owner amount } }`,
      variables: { addr: smartAccount.address.toLowerCase() },
    };

    try {
      const response = await fetch(INDEXER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(graphqlQuery) });
      const data = await response.json();
      console.log("[Watcher] Indexer response:", data);
      
      const allActiveApprovals: Approval[] = (data?.data?.Approval ?? []).filter((app: Approval) => {
        try { return BigInt(app.amount) > 0; } catch { return false; }
      });
      const approvalToRevoke = allActiveApprovals.find(app => app.owner.toLowerCase() === smartAccount.address.toLowerCase());
      console.log("[Watcher] Found approval to revoke:", approvalToRevoke || "None");

      if (approvalToRevoke) {
        isProcessing.current = true;
        console.log(`%c[Watcher] LOCKING. Processing: ${approvalToRevoke.id}`, 'color: blue; font-weight: bold;');
        setStatus(`Found new approval for ${approvalToRevoke.tokenAddress}. Triggering...`);
        try {
          await triggerAutoRevoke(approvalToRevoke);
        } finally {
          console.log(`%c[Watcher] UNLOCKING. Finished processing.`, 'color: blue; font-weight: bold;');
          isProcessing.current = false;
        }
      }
    } catch (e) { 
      console.error("--- DEBUG: Watcher failed to fetch ---", e);
      setStatus('Watcher failed to fetch approvals.');
      isProcessing.current = false;
    }
  }, [smartAccount, smartClient, triggerAutoRevoke]);

  useEffect(() => {
    savedWatcherCallback.current = checkForUnseenApprovals;
  }, [checkForUnseenApprovals]);

  useEffect(() => {
    if (!grant || !smartAccount?.address || !smartClient) {
      setStatus('Inactive: Awaiting authorization or smart account setup.');
      return;
    }
    
    function tick() {
      if (savedWatcherCallback.current) {
        savedWatcherCallback.current();
      }
    }

    tick();
    const intervalId = setInterval(tick, 15000);
    return () => clearInterval(intervalId);
  }, [grant, smartAccount, smartClient]);

  const authorizeAutoRevoke = async () => {
    if (!eoaAddress || !smartAccount) {
      setStatus('Authorization failed: No EOA or smart account.');
      return;
    }

    try {
      const expiry = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7); // 7 days
      const domain = {
        name: 'AutoRevokeDelegation',
        version: '1',
        chainId: chain?.id,
        verifyingContract: smartAccount.address,
      };
      const types = {
        Delegation: [
          { name: 'owner', type: 'address' },
          { name: 'expiry', type: 'uint256' },
        ],
      };
      const value = {
        owner: eoaAddress,
        expiry,
      };

      const signature = await signTypedDataAsync({ domain, types, primaryType: 'Delegation', message: value });
      // Note: In a real setup, you'd send this signature to the smart account or backend to enable delegation.
      // For this example, we're just simulating by storing the grant locally.
      console.log('Delegation signed:', signature);

      const newGrant: DelegationGrant = { owner: eoaAddress, expiry };
      setGrant(newGrant);
      localStorage.setItem(GRANT_STORAGE_KEY, JSON.stringify(newGrant, (_, value) => typeof value === 'bigint' ? value.toString() : value));
      setStatus('Authorized successfully!');
    } catch (e: any) {
      console.error('Authorization failed:', e);
      setStatus(`Authorization failed: ${e.message || 'Check console.'}`);
    }
  };

  const revokeAuthorization = () => {
    setGrant(null);
    localStorage.removeItem(GRANT_STORAGE_KEY);
    setStatus('Inactive: Authorization revoked.');
  };

  return { grant, status, authorizeAutoRevoke, revokeAuthorization };
}