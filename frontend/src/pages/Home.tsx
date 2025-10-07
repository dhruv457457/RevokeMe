import React from "react";
import { useAccount } from "wagmi";
import { useSmartAccount } from "../hooks/useSmartAccount";
import ApprovalList from "../components/ApprovalList";
import HeroSection from "../components/HeroSection";
import InteractiveFeatures from "../components/InteractiveFeatures";
import CTABanner from "../components/CTABanner";
import { Link } from "react-router-dom";

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
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      Smart Account not yet set up.
                    </p>
                  </div>
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
                   <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">
                      EOA not connected.
                    </p>
                  </div>
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