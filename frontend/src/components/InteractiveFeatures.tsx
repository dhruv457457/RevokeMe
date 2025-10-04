import React, {  useEffect } from 'react';
import { motion } from 'framer-motion';

const features = [
 
  {
    id: 'wallet-monitoring',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    title: 'Real-time Wallet Monitoring',
    description: 'Continuously monitor your wallet for new or high-risk approvals. Stay informed and secure 24/7.',
    imageUrl: 'https://i.ibb.co/zgvPZmQ/unnamed-5.png',
  
     colSpan: 'lg:col-span-2',
    rowSpan: 'lg:row-span-2',
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
    imageUrl: 'https://i.ibb.co/9HRGgnV9/unnamed-1.png',
   
      colSpan: 'lg:col-span-2',
    rowSpan: 'lg:row-span-1',
  },
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
    imageUrl: 'https://i.ibb.co/pmNzFgk/unnamed-6.png',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
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
    imageUrl: 'https://i.ibb.co/wtfBqvw/Gemini-Generated-Image-tcml4ltcml4ltcml.png',
    colSpan: 'lg:col-span-1',
    rowSpan: 'lg:row-span-1',
  },
];

const BentoGridItem: React.FC<{
  feature: typeof features[0];
}> = ({ feature }) => {
  return (
    <motion.div
      key={feature.id}
      className={`relative rounded-3xl border border-[#333336] bg-[#0C0C0E] p-6 flex flex-col justify-between overflow-hidden
                  ${feature.colSpan} ${feature.rowSpan}`}
    >
     

      {/* Content */}
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
        </div>
        
        {/* Image Container */}
        <div className="flex-grow mt-4 flex items-center justify-center rounded-3xl overflow-hidden">
          <img
            src={feature.imageUrl}
            alt={feature.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
};

const InteractiveFeatures: React.FC = () => {
    // Preload images
  useEffect(() => {
    features.forEach((feature) => {
      const img = new Image();
      img.src = feature.imageUrl;
    });
  }, []);

  return (
    <section className=" text-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            <span className="text-gray-200">Advanced Security Features </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Experience professional-grade tools to manage and secure your token
            and NFT approvals, designed for both novice and experienced crypto users.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[20rem]  rounded-3xl p-1">
          {/* Feature Boxes */}
          {features.map((feature) => (
            <BentoGridItem
              key={feature.id}
              feature={feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveFeatures;