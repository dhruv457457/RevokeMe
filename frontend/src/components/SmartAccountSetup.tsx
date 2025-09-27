import React from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useSmartAccount } from "../hooks/useSmartAccount";
import { monadTestnet } from "../config";

export const SmartAccountSetup: React.FC = () => {
  const { smartAccount, setupSmartAccount, isSettingUp, isReady } = useSmartAccount();
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  if (!isConnected) {
    return <p className="text-center text-gray-500 mt-8">Please connect your wallet to begin.</p>;
  }
  
  if (isConnected && chainId !== monadTestnet.id) {
    return (
      <div className="mt-8">
        <button
          onClick={() => switchChain({ chainId: monadTestnet.id })}
          className="px-6 py-3 rounded text-white font-bold w-full max-w-sm transition bg-yellow-500 hover:bg-yellow-600"
        >
          Switch to Monad Testnet
        </button>
      </div>
    );
  }

  const getButtonText = () => {
    if (!isReady && isConnected) return "Preparing Wallet...";
    if (isSettingUp) return "Setting Up...";
    if (smartAccount) return "Smart Account Ready!";
    return "Setup Smart Account";
  };

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      <button
        onClick={setupSmartAccount}
        disabled={!isReady || !!smartAccount || isSettingUp}
        className={`px-6 py-3 rounded text-white font-bold w-full max-w-sm transition ${
          smartAccount
            ? "bg-green-600 cursor-default"
            : isSettingUp || (isConnected && !isReady)
            ? "bg-gray-500 cursor-wait animate-pulse"
            : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {getButtonText()}
      </button>
      {smartAccount && (
        <pre className="mt-6 p-4 bg-gray-100 rounded max-w-3xl mx-auto text-left overflow-x-auto" style={{ fontSize: "0.8rem" }}>
          {JSON.stringify({ address: smartAccount.address, type: smartAccount.type }, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default SmartAccountSetup;
