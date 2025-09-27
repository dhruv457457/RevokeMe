import React, { useState, useCallback, useEffect, createContext, useContext, ReactNode } from "react";
// Import from CDN to resolve build issues
import { useAccount, useWalletClient, useSwitchChain } from "wagmi";
import { http, createPublicClient } from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { Implementation, toMetaMaskSmartAccount } from "@metamask/delegation-toolkit";

// Import the config from the single file structure
import { monadTestnet, BUNDLER_RPC_URL } from "../config";

// --- TYPE DEFINITIONS ---
interface SmartAccountContextValue {
  smartAccount: any | null;
  setupSmartAccount: () => Promise<void>;
  isSettingUp: boolean;
  isReady: boolean;
}

// --- CONTEXT CREATION ---
const SmartAccountContext = createContext<SmartAccountContextValue | undefined>(undefined);

// --- PROVIDER COMPONENT ---
// This component wraps your app and provides the smart account state and logic.
export const SmartAccountProvider = ({ children }: { children: ReactNode }) => {
  const [smartAccount, setSmartAccount] = useState<any | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);

  const { data: walletClient } = useWalletClient();
  const { address: owner, isConnected, chainId } = useAccount();

  // A single flag to determine if all conditions are met
  const isReady = isConnected && !!walletClient && !!owner && chainId === monadTestnet.id;

  const setupSmartAccount = useCallback(async () => {
    if (!isReady) {
      console.error("Setup aborted: Not ready (check connection, wallet data, and network).");
      return;
    }

    setIsSettingUp(true);
    try {
      const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });
      const bundlerClient = createBundlerClient({ client: publicClient, transport: http(BUNDLER_RPC_URL) });

      const instance = await toMetaMaskSmartAccount({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [owner!, [], [], []], // owner is guaranteed by isReady check
        deploySalt: "0x",
        signer: { walletClient: walletClient! }, // walletClient is guaranteed by isReady check
      });

      setSmartAccount(instance);
      (window as any).bundlerClient = bundlerClient;
      console.log("Smart Account setup successful:", instance);
    } catch (error) {
      console.error("Error during smart account setup:", error);
    } finally {
      setIsSettingUp(false);
    }
  }, [isReady, walletClient, owner]);

  useEffect(() => {
    if (isReady && !smartAccount && !isSettingUp) {
      setupSmartAccount();
    }
  }, [isReady, smartAccount, isSettingUp, setupSmartAccount]);

  const value = { smartAccount, setupSmartAccount, isSettingUp, isReady };

  return (
    <SmartAccountContext.Provider value={value}>
      {children}
    </SmartAccountContext.Provider>
  );
};


// --- CUSTOM HOOK ---
// This is the hook that your components will use to access the context.
// It is correctly named and exported here.
export const useSmartAccount = (): SmartAccountContextValue => {
  const context = useContext(SmartAccountContext);
  if (context === undefined) {
    throw new Error("useSmartAccount must be used within a SmartAccountProvider");
  }
  return context;
};

