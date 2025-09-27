import { createConfig } from "wagmi";
import { http, defineChain } from "viem";
import { injected } from "@wagmi/connectors";
import { QueryClient } from "@tanstack/react-query";

// --- 1. DEFINE THE MONAD TESTNET CHAIN ---
// This object contains all the specific details for the Monad Testnet.
export const monadTestnet = defineChain({
  id: 10143,
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


// --- 2. CONFIGURE CONSTANTS ---
// In a real project, this key should be in a secure .env file.
// It is hardcoded here because the environment does not support them.
export const BUNDLER_RPC_URL = "https://monad-testnet.g.alchemy.com/v2/prb3bBkj1v9clt6hCTvVqcOBOCCHgLc6";

// Create a new instance of QueryClient for react-query
export const queryClient = new QueryClient();

// --- 3. CREATE WAGMI CONFIGURATION ---
// This is the main configuration object for wagmi.
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [injected()],
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(),
  },
});
