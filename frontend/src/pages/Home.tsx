import React from "react";
import HeroSection from "../components/HeroSection";
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
      <section className="py-8 px-4 md:py-16 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 md:mb-12 px-2 md:px-0">
            <p className="text-lg text-gray-400 mt-2">
              Discover the latest approvals and most popular contracts across the ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
            {/* Latest Global Approvals */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="text-xl font-semibold text-gray-200">Recent Activity</h3>
              </div>
              <div className="dashboard-card-content">
                <LatestGlobalApprovals limit={4} />
              </div>
            </div>

            {/* Popular Spenders */}
            <div className="dashboard-card">
              <div className="dashboard-card-header">
                <h3 className="text-xl font-semibold text-gray-200">Most Popular Spenders</h3>
              </div>
              <div className="dashboard-card-content">
                <PopularSpenders limit={4} />
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
