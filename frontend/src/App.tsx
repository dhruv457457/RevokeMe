import React from "react";
import {
  WagmiProvider,
  createConfig,
  useAccount,
  useConnect,
  useDisconnect,
  injected,
  
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mainnet, goerli } from "wagmi/chains";
import { http } from "viem";

import NavBar from "./components/NavBar";
import Home from "./components/Home";

// Create wagmi config (adjust chains as needed)
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [injected()],
  chains: [goerli, mainnet],
  client: http(),
});

// Create React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <div className="min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-grow p-4">
            <Home />
          </main>
        </div>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
