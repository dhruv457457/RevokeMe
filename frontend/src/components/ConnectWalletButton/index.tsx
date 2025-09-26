// ConnectWalletButton/index.tsx
import React from 'react';

const ConnectWalletButton: React.FC<{ onConnect: () => void }> = ({ onConnect }) => (
  <button className="connect-wallet-btn" onClick={onConnect}>
    Connect Wallet
  </button>
);

export default ConnectWalletButton;
