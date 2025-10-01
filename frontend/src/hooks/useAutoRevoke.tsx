import { useState, useEffect, useCallback, useRef } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { useSmartAccount } from './useSmartAccount';
import { encodeFunctionData, getAddress, isAddress, type Address, http } from 'viem';
import { createPimlicoClient } from 'permissionless/clients/pimlico';

// --- Configuration & Types ---
const INDEXER_URL = "http://localhost:8080/v1/graphql";
const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY;
const erc20Abi = [
  { inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], name: 'approve', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function' }
] as const;

const pimlicoClient = createPimlicoClient({
  transport: http(`https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`, { timeout: 30000 }),
});

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

// --- The Hook ---
export const useAutoRevoke = () => {
  const { address: eoaAddress, chain } = useAccount();
  const { smartAccount, bundlerClient } = useSmartAccount();
  const { signTypedDataAsync } = useSignTypedData();
  
  const [grant, setGrant] = useState<DelegationGrant | null>(null);
  const [status, setStatus] = useState<string>('Inactive');
  const isProcessing = useRef(false);
  const savedWatcherCallback = useRef<() => void>();

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
    if (!smartAccount || !bundlerClient || !isAddress(approval.tokenAddress) || !isAddress(approval.spender)) {
      console.error("--- DEBUG: Invalid smartAccount, bundlerClient, or addresses ---", { smartAccount, bundlerClient, tokenAddress: approval.tokenAddress, spender: approval.spender });
      setStatus('Auto-revoke failed: Invalid setup or addresses.');
      return false;
    }

    try {
      let fee;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          fee = await pimlicoClient.getUserOperationGasPrice();
          break;
        } catch (e) {
          console.warn(`--- DEBUG: Gas price fetch attempt ${attempt} failed ---`, e);
          if (attempt === 3) throw new Error('Failed to fetch gas prices after retries.');
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      const op = {
        account: smartAccount,
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
      };

      const opHash = await bundlerClient.sendUserOperation(op);
      setStatus(`Auto-revoke sent for ${approval.id}. Waiting...`);
      const { receipt } = await bundlerClient.waitForUserOperationReceipt({ hash: opHash });
      setStatus(`Auto-revoke successful! TX: ${receipt.transactionHash}`);
      return true;
    } catch (e: any) {
      console.error("--- DEBUG: Auto-revoke transaction failed ---", e);
      setStatus(`Auto-revoke failed: ${e.message || 'Check console.'}`);
      return false;
    }
  }, [smartAccount, bundlerClient]);

  const checkForUnseenApprovals = useCallback(async () => {
    console.log(`%c[Watcher] Tick! Starting check... (isProcessing: ${isProcessing.current})`, 'color: gray');
    if (isProcessing.current || !smartAccount?.address || !bundlerClient) {
      if (isProcessing.current) console.log("%c[Watcher] Locked. Skipping this check.", 'color: orange');
      if (!smartAccount?.address) console.log("%c[Watcher] No smart account address.", 'color: orange');
      if (!bundlerClient) console.log("%c[Watcher] No bundler client.", 'color: orange');
      setStatus('Inactive: Smart account not ready.');
      return;
    }

    setStatus(`Watching for new approvals...`);
    const graphqlQuery = {
      query: `query GetAllApprovals($addr: String!) { Approval(where: {_or: [{owner: {_eq: $addr}}, {spender: {_eq: $addr}}]}) { id tokenAddress spender owner amount } }`,
      variables: { addr: smartAccount.address.toLowerCase() },
    };

    try {
      const response = await fetch(INDEXER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-hasura-admin-secret': 'testing' }, body: JSON.stringify(graphqlQuery) });
      const data = await response.json();
      console.log("[Watcher] Indexer response:", data);
      
      const allActiveApprovals: Approval[] = (data?.data?.Approval ?? []).filter(app => {
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
  }, [smartAccount, bundlerClient, triggerAutoRevoke]);

  useEffect(() => {
    savedWatcherCallback.current = checkForUnseenApprovals;
  }, [checkForUnseenApprovals]);

  useEffect(() => {
    if (!grant || !smartAccount?.address || !bundlerClient) {
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
  }, [grant, smartAccount, bundlerClient]);

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
      localStorage.setItem(GRANT_STORAGE_KEY, JSON.stringify(newGrant, (key, value) => typeof value === 'bigint' ? value.toString() : value));
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
};