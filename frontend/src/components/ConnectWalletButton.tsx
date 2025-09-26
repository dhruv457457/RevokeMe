import React from "react";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "@wagmi/connectors";

const ConnectWalletButton: React.FC = () => {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2">
        <span>
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
    >
      Connect Wallet
    </button>
  );
};

export default ConnectWalletButton;
