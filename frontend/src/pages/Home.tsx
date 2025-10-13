// src/pages/Home.tsx
import React from "react";
import { useAccount } from "wagmi";
import { useSmartAccount } from "../hooks/useSmartAccount";
import ApprovalList from "../components/ApprovalList";
import HeroSection from "../components/HeroSection";
import InteractiveFeatures from "../components/InteractiveFeatures";
import CTABanner from "../components/CTABanner";
import { Link } from "react-router-dom";

const SmartAccountPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75h.008v.008H12v-.008z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h4 className="font-semibold text-gray-300">Smart Account Not Ready</h4>
        <p className="text-sm text-gray-500 mt-1">Connect your wallet and set it up to see approvals.</p>
    </div>
);

const EoaPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.793V9.75a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06.44h-2.122a1.5 1.5 0 01-1.061-.44H4.5A2.25 2.25 0 002.25 9.75v3.043m18.75 0A2.25 2.25 0 0118.75 15h-1.5a2.25 2.25 0 01-2.25-2.25v-1.5a2.25 2.25 0 012.25-2.25h1.5A2.25 2.25 0 0121 12.793z" />
        </svg>
        <h4 className="font-semibold text-gray-300">Wallet Not Connected</h4>
        <p className="text-sm text-gray-500 mt-1">Connect your wallet to view your main account's approvals.</p>
    </div>
);

const Home: React.FC = () => {
  const { address: eoaAddress} = useAccount();
  const { smartAccount } = useSmartAccount();


  return (
    <div className="w-full text-white min-h-screen">
      <HeroSection />
      {/* Approvals Dashboard Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-lg text-gray-400 mt-2">
              Real-time token approvals for your connected accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Smart Account Approvals Card */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="text-xl font-semibold text-gray-200">
                  Smart Account Approvals
                </h3>
                {smartAccount?.address && (
                  <span className="font-mono text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {smartAccount.address.slice(0, 6)}...{smartAccount.address.slice(-4)}
                  </span>
                )}
              </div>
              <div className="dashboard-card-content">
                {smartAccount?.address ? (
                  <ApprovalList ownerAddress={smartAccount.address} limit={5} />
                ) : (
                  <SmartAccountPlaceholder />
                )}
              </div>
              <div className="dashboard-card-footer">
                <Link to="/revoke-erc20" className="view-more-button">
                  View More
                </Link>
              </div>
            </div>

            {/* Main Account (EOA) Approvals Card */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="text-xl font-semibold text-gray-200">
                  Main Account (EOA) Approvals
                </h3>
                {eoaAddress && (
                  <span className="font-mono text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                    {eoaAddress.slice(0, 6)}...{eoaAddress.slice(-4)}
                  </span>
                )}
              </div>
              <div className="dashboard-card-content">
                {eoaAddress ? (
                  <ApprovalList ownerAddress={eoaAddress} limit={5} />
                ) : (
                   <EoaPlaceholder />
                )}
              </div>
               <div className="dashboard-card-footer">
                <Link to="/revoke-erc20" className="view-more-button">
                  View More 
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InteractiveFeatures />
      <CTABanner />
    </div>
  );
};

export default Home;