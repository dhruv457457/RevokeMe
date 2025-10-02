import { http, defineChain } from 'viem';
import { createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Define the Monad Testnet Chain
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
    public: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

// Define RPC URLs
export const NODE_RPC_URL = 'https://testnet-rpc.monad.xyz'; // Public node RPC for chain interactions (can use Alchemy if preferred)
// export const NODE_RPC_URL = 'https://monad-testnet.g.alchemy.com/v2/prb3bBkj1v9clt6hCTvVqcOBOCCHgLc6'; // Uncomment if you prefer Alchemy
export const BUNDLER_RPC_URL = `https://api.pimlico.io/v2/10143/rpc?apikey=${import.meta.env.VITE_PIMLICO_API_KEY}`; // Pimlico bundler for user operations

// Create the Wagmi Configuration
export const wagmiConfig = createConfig({
  connectors: [injected({ target: 'metaMask' })],
  chains: [monadTestnet],
  transports: {
    [monadTestnet.id]: http(NODE_RPC_URL, { timeout: 120000 }), // Use NODE_RPC_URL for Wagmi
  },
  ssr: true,
});