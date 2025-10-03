import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { wagmiConfig } from "./config";
import { SmartAccountProvider } from "./hooks/useSmartAccount";

import NavBar from "./components/NavBar";
import Footer from "./components/Footer"; 
import Home from "./pages/Home";
import RevokeERC20 from "./pages/RevokeERC20";
import SmartAccountSetup from "./components/SmartAccountSetup";
import AutoRevokePage from "./pages/AutoRevokePage";
import ApproveERC20 from "./pages/ApproveERC20";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <SmartAccountProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <NavBar />
              <main className="flex-grow ">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/revoke-erc20" element={<RevokeERC20 />} />
                  <Route path="/auto-revoke" element={<AutoRevokePage />} />
                  <Route path="/approve-erc20" element={<ApproveERC20 />} />      
                </Routes>
                <SmartAccountSetup />
              </main>
              <Footer /> 
            </div>
          </Router>
        </SmartAccountProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;