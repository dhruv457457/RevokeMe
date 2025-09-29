// src/config.ts

import { http, defineChain } from "viem";
import { createConfig } from "wagmi";
import { injected } from "wagmi/connectors";

// Define the Monad Testnet Chain
export const monadTestnet = defineChain({
  id: 10143, // Note: Your previous code had a different ID, ensure this is the correct one.
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

// Define the Alchemy Bundler RPC URL
export const BUNDLER_RPC_URL = "https://monad-testnet.g.alchemy.com/v2/prb3bBkj1v9clt6hCTvVqcOBOCCHgLc6";

// Create the Wagmi Configuration
export const wagmiConfig = createConfig({
  autoConnect: true,
  // ✅ This change makes the MetaMask connection more specific and reliable
  connectors: [injected({ target: 'metaMask' })],
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
});