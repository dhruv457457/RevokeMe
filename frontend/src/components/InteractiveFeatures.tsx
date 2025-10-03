import React, { useState } from 'react';


const features = [
  {
    id: 'revoke-approvals',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 14l-2 2m4-4l2-2m-3-1l-3 3M11 13l3 3M17 7l-2 2M7 17l2 2" />
        <path d="M19 12a7 7 0 01-14 0" />
      </svg>
    ),
    title: 'Instant Approval Revocation',
    description: 'Quickly revoke unlimited token and NFT allowances given to dApps. Secure your assets in real-time.',
    imageUrl: 'https://i.ibb.co/HLrqnQzT/unnamed-1.png', 
  },
  {
    id: 'wallet-monitoring',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: 'Real-time Wallet Monitoring',
    description: 'Continuously monitor your wallet for new or high-risk approvals. Stay informed and secure 24/7.',
    imageUrl: 'https://i.ibb.co/DfBgSGbF/unnamed-2.png', // Placeholder image
  },
  {
    id: 'risk-assessment',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    title: 'Automated Risk Assessment',
    description: 'Our system automatically identifies and flags suspicious or overly permissive token approvals in your wallet.',
    imageUrl: 'https://i.ibb.co/ycSWWg2c/unnamed-3.png', 
  },
  {
    id: 'batch-revoke',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'Batch Revocation',
    description: 'Revoke multiple approvals at once, saving time and gas fees. Streamline your wallet security management.',
    imageUrl: 'https://i.ibb.co/2026svBt/unnamed-4.png', 
  },
];

const InteractiveFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(features[0].id);

  const currentImage = features.find(f => f.id === activeFeature)?.imageUrl;

  return (
    <section className="bg-black text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            <span className="text-gray-200">Advanced Security Features </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto md:mx-0">
            Experience professional-grade tools to manage and secure your token
            and NFT approvals, designed for both novice and experienced crypto users.
          </p>
        </div>

        {/* Features & Image Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Feature List */}
          <div className="space-y-8">
            {features.map((feature) => (
              <div
                key={feature.id}
                className={`flex items-start p-4 rounded-xl cursor-pointer transition-colors duration-200 ${
                  activeFeature === feature.id
                    ? 'bg-[#1A1A1D] border border-[#333336] shadow-lg' // Highlight active
                    : 'hover:bg-[#1A1A1D] border border-transparent' // Hover effect
                }`}
                onClick={() => setActiveFeature(feature.id)}
              >
                <div className="p-3 rounded-full bg-[#1A1A1D] border border-[#333336] mr-4">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-base">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Dynamic Image */}
          <div className="md:sticky md:top-20"> {/* Added sticky for better visibility on scroll */}
            <div className="rounded-3xl p-6 border border-[#333336] shadow-xl overflow-hidden">
              <img
                src={currentImage}
                alt={`Screenshot of ${activeFeature} feature`}
                className="w-full h-auto rounded-lg object-cover transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveFeatures;