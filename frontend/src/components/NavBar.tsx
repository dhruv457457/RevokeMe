import React from 'react';
// Imports for the ConnectWalletButton, using direct CDN links to solve resolution errors
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "@wagmi/connectors";

// The ConnectWalletButton component is now defined directly inside NavBar.tsx
// This removes the need for a separate file import that was causing the error.
const ConnectWalletButton: React.FC = () => {
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


// The original NavBar component now uses the ConnectWalletButton defined above.
const NavBar: React.FC = () => {
  return (
    <header className="mb-8 flex justify-between items-center bg-gray-900 text-white p-4 shadow-md">
      <h1 className="text-xl font-bold">AutoRevoke dApp</h1>
      <ConnectWalletButton />
    </header>
  );
};

export default NavBar;

