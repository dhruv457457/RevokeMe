import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { http, createPublicClient } from 'viem';
import { createSmartAccountClient } from 'permissionless';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit';
import { monadTestnet, NODE_RPC_URL, BUNDLER_RPC_URL } from '../config'; // Updated imports

type PimlicoClient = ReturnType<typeof createPimlicoClient>;
type PublicClient = ReturnType<typeof createPublicClient>;
type SmartAccountClientType = ReturnType<typeof createSmartAccountClient>;

interface SmartAccountContextValue {
  smartAccount: any | null;
  pimlicoClient: PimlicoClient | null;
  smartClient: SmartAccountClientType | null;
  publicClient: PublicClient | null;
  setupSmartAccount: () => Promise<void>;
  isSettingUp: boolean;
  isReady: boolean;
}

const SmartAccountContext = createContext<SmartAccountContextValue | undefined>(undefined);

export const SmartAccountProvider = ({ children }: { children: ReactNode }) => {
  const [smartAccount, setSmartAccount] = useState<any | null>(null);
  const [pimlicoClient, setPimlicoClient] = useState<PimlicoClient | null>(null);
  const [smartClient, setSmartClient] = useState<SmartAccountClientType | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const { data: walletClient } = useWalletClient();
  const { address: owner, isConnected, chainId } = useAccount();

  const isReady = isConnected && !!walletClient && !!owner && chainId === monadTestnet.id;

  const setupSmartAccount = useCallback(async () => {
    if (!isReady) return;

    setIsSettingUp(true);
    try {
      const pubClient = createPublicClient({
        chain: monadTestnet,
        transport: http(NODE_RPC_URL, { timeout: 120000 }),
      });

      const pimClient = createPimlicoClient({
        transport: http(BUNDLER_RPC_URL, { timeout: 120000 }),
        chain: monadTestnet,
      });

      setPublicClient(pubClient);
      setPimlicoClient(pimClient);

      if (!owner || !walletClient) throw new Error('Owner or wallet client not available');

      const smartAccountConfig = {
        client: pubClient,
        implementation: Implementation.Hybrid,
        deployParams: [
          owner as `0x${string}`,
          [] as `0x${string}`[],
          [] as bigint[],
          [] as bigint[]
        ] as [ `0x${string}`, `0x${string}`[], bigint[], bigint[] ],
        deploySalt: '0x0' as `0x${string}`,
        signer: { walletClient },
      };

      const instance = await toMetaMaskSmartAccount(smartAccountConfig);

      if (!instance.getAddress) throw new Error('Smart account initialization failed');

      const sClient = createSmartAccountClient({
        account: instance,
        chain: monadTestnet,
        bundlerTransport: http(BUNDLER_RPC_URL, { timeout: 120000 }),
      });

      setSmartClient(sClient);
      setSmartAccount(instance);
    } catch (error) {
      console.error('Error during smart account setup:', error);
    } finally {
      setIsSettingUp(false);
    }
  }, [isReady, walletClient, owner]);

  useEffect(() => {
    if (isReady && !smartAccount && !isSettingUp) {
      setupSmartAccount();
    }
  }, [isReady, smartAccount, isSettingUp, setupSmartAccount]);

  const value = { smartAccount, pimlicoClient, smartClient, publicClient, setupSmartAccount, isSettingUp, isReady };

  return (
    <SmartAccountContext.Provider value={value}>
      {children}
    </SmartAccountContext.Provider>
  );
};

export const useSmartAccount = (): SmartAccountContextValue => {
  const context = useContext(SmartAccountContext);
  if (context === undefined) {
    throw new Error('useSmartAccount must be used within a SmartAccountProvider');
  }
  return context;
};