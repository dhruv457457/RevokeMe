// src/components/WagmiTest.tsx

import React, { useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

export const WagmiTest: React.FC = () => {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (walletClient) {
      console.log("WagmiTest: walletClient object is available:", walletClient);
    } else {
      console.log("WagmiTest: walletClient is not available yet.");
    }
  }, [walletClient]);

  const handleTestSign = async () => {
    if (!walletClient) {
      alert("Wallet Client is not available.");
      return;
    }
    try {
      console.log("Attempting to sign message...");
      const signature = await walletClient.signMessage({
        message: 'This is a test signature',
      });
      alert(`Success! Signature: ${signature}`);
    } catch (error) {
      console.error("SIGNATURE FAILED:", error);
      alert("Signing failed! Check the browser console for the error.");
    }
  };

  if (!isConnected) {
    return <p>Please connect your wallet to run the test.</p>;
  }

  return (
    <div style={{ border: '2px solid red', padding: '20px', margin: '20px' }}>
      <h2>Wagmi Direct Test</h2>
      <p><strong>Status:</strong> Connected</p>
      <p><strong>Address:</strong> {address}</p>
      <p><strong>WalletClient Ready?</strong> {walletClient ? 'Yes' : 'No'}</p>
      <button onClick={handleTestSign} style={{ marginTop: '10px' }}>
        Test Sign Message
      </button>
    </div>
  );
};