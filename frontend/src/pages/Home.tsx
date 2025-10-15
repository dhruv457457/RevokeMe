import React from "react";
import HeroSection from "../components/HeroSection"; // Make sure HeroSection is in its own file
import InteractiveFeatures from "../components/InteractiveFeatures";
import CTABanner from "../components/CTABanner";
import Footer from "../components/Footer";
import LatestGlobalApprovals from "../components/LatestGlobalApprovals";
import PopularSpenders from "../components/PopularSpenders";

const Home: React.FC = () => {
  return (
    <div className="w-full text-white min-h-screen">
      <HeroSection />
      
      {/* Global Approvals Dashboard Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Global Approval Activity
            </h2>
            <p className="text-lg text-gray-400 mt-2">
              Discover the latest approvals and most popular contracts across the ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Latest Global Approvals Card */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="text-xl font-semibold text-gray-200">
                  Latest Activity
                </h3>
              </div>
              <div className="dashboard-card-content">
                <LatestGlobalApprovals limit={5} />
              </div>
            </div>

            {/* Most Popular Spenders Card */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="text-xl font-semibold text-gray-200">
                  Most Popular Spenders
                </h3>
              </div>
              <div className="dashboard-card-content">
                <PopularSpenders limit={5} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <InteractiveFeatures />
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Home;