import React, { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { http, createPublicClient } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit'; // Updated import
import { monadTestnet, BUNDLER_RPC_URL } from '../config';

type BundlerClient = ReturnType<typeof createBundlerClient>;
type PublicClient = ReturnType<typeof createPublicClient>;

interface SmartAccountContextValue {
  smartAccount: any | null;
  bundlerClient: BundlerClient | null;
  publicClient: PublicClient | null;
  setupSmartAccount: () => Promise<void>;
  isSettingUp: boolean;
  isReady: boolean;
}

const SmartAccountContext = createContext<SmartAccountContextValue | undefined>(undefined);

export const SmartAccountProvider = ({ children }: { children: ReactNode }) => {
  const [smartAccount, setSmartAccount] = useState<any | null>(null);
  const [bundlerClient, setBundlerClient] = useState<BundlerClient | null>(null);
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
        transport: http(BUNDLER_RPC_URL, { timeout: 120000 }),
      });

      const bundler = createBundlerClient({
        client: pubClient,
        transport: http(BUNDLER_RPC_URL, { timeout: 120000 }),
      });
      
      setPublicClient(pubClient);
      setBundlerClient(bundler);

      if (!owner || !walletClient) throw new Error('Owner or wallet client not available');

      // Define the config object with inferred types
      const smartAccountConfig = {
        client: pubClient,
        bundlerClient: bundler,
        implementation: Implementation.Hybrid,
        deployParams: [owner as `0x${string}`, [], [], []] as const,
        deploySalt: '0x0',  // Ensure this is a valid hex string
        signer: { walletClient },
      };// Type assertion to ensure the object is treated as a valid config

      const instance = await toMetaMaskSmartAccount(smartAccountConfig);

      if (!instance.getAddress) throw new Error('Smart account initialization failed');
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

  const value = { smartAccount, bundlerClient, publicClient, setupSmartAccount, isSettingUp, isReady };

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