import React from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./config";
import { SmartAccountProvider } from "./hooks/useSmartAccount";

import NavBar from "./components/NavBar";
import Home from "./components/Home";
import SmartAccountSetup from "./components/SmartAccountSetup";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <SmartAccountProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col text-center">
            <NavBar />
            <main className="flex-grow p-8">
              <Home />
              <SmartAccountSetup />
            </main>
          </div>
        </SmartAccountProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
// import React, { useState, useCallback, useEffect } from "react";
// import {
//   WagmiProvider,
//   createConfig,
//   useConnect,
//   useAccount,
//   useDisconnect,
//   useWalletClient,
//   useSwitchChain,
// } from "wagmi";
// import { http, createPublicClient, defineChain } from "viem";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { injected } from "wagmi/connectors";
// import { createBundlerClient } from "viem/account-abstraction";
// import { Implementation, toMetaMaskSmartAccount } from "@metamask/delegation-toolkit";

// // --- 1. DEFINE THE MONAD TESTNET CHAIN (USING YOUR DETAILS) ---
// const monadTestnet = defineChain({
//   id: 10143,
//   name: 'Monad Testnet',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Monad',
//     symbol: 'MON',
//   },
//   rpcUrls: {
//     default: { http: ['https://testnet-rpc.monad.xyz'] },
//   },
//   blockExplorers: {
//     default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
//   },
//   testnet: true,
// });


// // --- 2. CONFIGURE THE APP FOR MONAD ---
// const BUNDLER_RPC_URL = "https://monad-testnet.g.alchemy.com/v2/prb3bBkj1v9clt6hCTvVqcOBOCCHgLc6";
// const queryClient = new QueryClient();

// const wagmiConfig = createConfig({
//   autoConnect: true,
//   connectors: [injected()],
//   chains: [monadTestnet],
//   transports: {
//     [monadTestnet.id]: http(),
//   },
// });

// // --- 3. App Content Component ---
// function AutoRevokeApp() {
//   const [smartAccount, setSmartAccount] = useState(null);
//   const [isSettingUp, setIsSettingUp] = useState(false);

//   const { data: walletClient } = useWalletClient();
//   const { isConnected, address: owner, chainId } = useAccount();
//   const { switchChain } = useSwitchChain();
  
//   const isReady = isConnected && !!walletClient && !!owner && chainId === monadTestnet.id;

//   const setupSmartAccount = useCallback(async () => {
//     if (!isReady) {
//       console.error("Setup aborted: Not ready (check connection, wallet data, and network).");
//       return;
//     }

//     try {
//       setIsSettingUp(true);
//       const publicClient = createPublicClient({ chain: monadTestnet, transport: http() });
//       const bundlerClient = createBundlerClient({ client: publicClient, transport: http(BUNDLER_RPC_URL) });

//       const instance = await toMetaMaskSmartAccount({
//         client: publicClient,
//         implementation: Implementation.Hybrid,
//         deployParams: [owner, [], [], []],
//         deploySalt: "0x",
//         signer: { walletClient },
//       });

//       setSmartAccount(instance);
//       (window as any).bundlerClient = bundlerClient;
//       console.log("Smart Account setup successful:", instance);
//     } catch (error) {
//       console.error("Error during smart account setup:", error);
//     } finally {
//       setIsSettingUp(false);
//     }
//   }, [isReady, walletClient, owner]);

//   useEffect(() => {
//     if (isReady && !smartAccount && !isSettingUp) {
//       setupSmartAccount();
//     }
//   }, [isReady, smartAccount, isSettingUp, setupSmartAccount]);

//   const getButtonText = () => {
//       if (isConnected && chainId !== monadTestnet.id) return "Switch to Monad Testnet";
//       if (!isReady && isConnected) return "Preparing Wallet...";
//       if (isSettingUp) return "Setting Up...";
//       if (smartAccount) return "Smart Account Ready!";
//       return "Setup Smart Account";
//   };
  
//   const handleButtonClick = () => {
//       if (isConnected && chainId !== monadTestnet.id) {
//           switchChain({ chainId: monadTestnet.id });
//       } else {
//           setupSmartAccount();
//       }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col text-center">
//       <header className="mb-8 flex justify-between items-center bg-gray-900 text-white p-4 shadow-md">
//         <h1 className="text-xl font-bold">AutoRevoke dApp</h1>
//         <ConnectWalletButton />
//       </header>
//       <main className="flex-grow p-8">
//         <h2 className="text-2xl font-semibold mb-4">MetaMask Smart Account Setup</h2>
//         {!isConnected && <p>Please connect your wallet to get started.</p>}
//         {isConnected && (
//           <>
//             <button
//               onClick={handleButtonClick}
//               disabled={ (chainId === monadTestnet.id && (!isReady || !!smartAccount || isSettingUp)) }
//               className={`px-6 py-3 rounded text-white font-bold w-full max-w-sm transition ${
//                 smartAccount
//                   ? "bg-green-600 cursor-default"
//                   : isSettingUp || (isConnected && !isReady && chainId === monadTestnet.id)
//                   ? "bg-gray-500 cursor-wait animate-pulse"
//                   : chainId !== monadTestnet.id
//                   ? "bg-yellow-500 hover:bg-yellow-600"
//                   : "bg-purple-600 hover:bg-purple-700"
//               }`}
//             >
//               {getButtonText()}
//             </button>
//             {smartAccount && (
//               <pre
//                 className="mt-6 p-4 bg-gray-100 rounded max-w-3xl mx-auto text-left overflow-x-auto"
//                 style={{ fontSize: "0.8rem" }}
//               >
//                 {JSON.stringify({ address: smartAccount.address, type: smartAccount.type }, null, 2)}
//               </pre>
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// }

// function ConnectWalletButton() {
//   const { connect } = useConnect();
//   const { isConnected, address } = useAccount();
//   const { disconnect } = useDisconnect();

//   if (isConnected)
//     return (
//       <div className="flex items-center space-x-4">
//         <span className="text-sm bg-white/10 px-2 py-1 rounded font-mono">
//           Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
//         </span>
//         <button
//           onClick={() => disconnect()}
//           className="bg-red-600 px-4 py-2 rounded text-sm font-semibold hover:bg-red-700"
//         >
//           Disconnect
//         </button>
//       </div>
//     );

//   return (
//     <button
//       onClick={() => connect({ connector: injected() })}
//       className="bg-blue-600 px-4 py-2 rounded text-sm font-semibold hover:bg-blue-700"
//     >
//       Connect Wallet
//     </button>
//   );
// }

// // --- 4. Main App Component (Provider Setup) ---
// export default function App() {
//   return (
//     <QueryClientProvider client={queryClient}>
//       <WagmiProvider config={wagmiConfig}>
//         <AutoRevokeApp />
//       </WagmiProvider>
//     </QueryClientProvider>
//   );
// }