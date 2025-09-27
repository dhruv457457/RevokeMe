import React from "react";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export const ConnectWalletButton: React.FC = () => {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm bg-white/10 px-2 py-1 rounded font-mono">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 px-4 py-2 rounded text-sm font-semibold hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="bg-blue-600 px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  );
};

export default ConnectWalletButton;
