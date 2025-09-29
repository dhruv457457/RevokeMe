// src/components/SmartAccountManager.tsx

import React, { useState, useCallback } from "react";
import { useAccount, useWalletClient, useSwitchChain } from "wagmi";
import { http, createPublicClient } from 'viem';
import { createBundlerClient } from 'viem/account-abstraction';
import { toMetaMaskSmartAccount, Implementation } from '@metamask/delegation-toolkit';
import { monadTestnet, BUNDLER_RPC_URL } from '../config';

const ENTRYPOINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

export const SmartAccountManager: React.FC = () => {
  // All state is held locally in this single component
  const [smartAccount, setSmartAccount] = useState<any | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // All wagmi hooks are called directly in this component
  const { isConnected, chainId, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();

  // All logic is in a single useCallback hook here
  const setupSmartAccount = useCallback(async () => {
    if (!walletClient || !address) {
      setError("Wallet client or address not available.");
      return;
    }

    setIsSettingUp(true);
    setError(null);
    console.log("Attempting setup with Wallet Client:", walletClient);

    try {
      const pubClient = createPublicClient({ chain: monadTestnet, transport: http(BUNDLER_RPC_URL) });
      const bundler = createBundlerClient({ client: pubClient, transport: http(BUNDLER_RPC_URL) });

      const smartAccountConfig = {
        client: pubClient,
        bundlerClient: bundler,
        implementation: Implementation.Hybrid,
        deployParams: {
          owner: address,
          activeModules: [],
          entryPoint: ENTRYPOINT_ADDRESS,
          moduleInstallData: [],
        },
        deploySalt: 0n,
        signer: walletClient,
      };

      const instance = await toMetaMaskSmartAccount(smartAccountConfig);
      if (!instance.address) throw new Error('Smart account initialization failed');
      setSmartAccount(instance);

    } catch (err: any) {
      console.error('CRITICAL ERROR during smart account setup:', err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSettingUp(false);
    }
  }, [walletClient, address]);

  // All UI logic is here
  if (!isConnected) {
    return <p className="text-center text-gray-500 mt-8">Please connect your wallet.</p>;
  }
  if (chainId !== monadTestnet.id) {
    return (
      <button onClick={() => switchChain({ chainId: monadTestnet.id })}>
        Switch to Monad Testnet
      </button>
    );
  }

  const buttonText = isSettingUp ? "Setting Up..." : smartAccount ? "Smart Account Ready!" : "Setup Smart Account";

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <button onClick={setupSmartAccount} disabled={!!smartAccount || isSettingUp || !walletClient}>
        {buttonText}
      </button>
      {smartAccount && (
        <pre>{JSON.stringify({ address: smartAccount.address }, null, 2)}</pre>
      )}
      {error && (
        <p style={{ color: 'red', marginTop: '1rem' }}>
          <strong>Error:</strong> {error}
        </p>
      )}
    </div>
  );
};