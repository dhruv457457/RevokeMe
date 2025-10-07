import React from 'react';
import { motion } from 'framer-motion';

// --- Visual Components for Bento Grid Items with Hover Animations ---

const MetaMaskVisual = () => (
    <motion.div 
        className="w-full h-full rounded-lg flex items-center justify-center p-4 overflow-hidden"
        initial="initial"
        whileHover="hover"
    >
        <div className="relative w-24 h-24">
            <motion.div 
                className="absolute inset-0 border-4 border-purple-500 rounded-full"
                variants={{
                    initial: { scale: 1, opacity: 0.7 },
                    hover: { scale: 1.1, opacity: 1, transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" } }
                }}
            />
            <motion.div 
                className="absolute inset-2 border-4 border-blue-500 rounded-full"
                 variants={{
                    initial: { scale: 1, opacity: 0.7 },
                    hover: { scale: 0.9, opacity: 1, transition: { duration: 0.5, repeat: Infinity, repeatType: "reverse" } }
                }}
            />
            <div className="absolute inset-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.789-2.75 9.566-1.74 2.777-2.5 5.434-2.5 5.434H12M12 11c0-3.517 1.009-6.789 2.75-9.566 1.74-2.777 2.5-5.434 2.5-5.434H12M12 11v11" />
                </svg>
            </div>
        </div>
    </motion.div>
);
const MonadVisual = () => (
    <motion.div 
        className="w-full h-full rounded-lg flex flex-col justify-center items-center p-4 overflow-hidden"
        initial="initial"
        whileHover="hover"
    >
        <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute h-full w-px bg-green-500/20" />
            <div className="absolute w-full h-px bg-green-500/20" />
            {[...Array(5)].map((_, i) => (
                <motion.div 
                    key={i}
                    className="absolute w-2 h-2 bg-green-500 rounded-full"
                    variants={{
                        initial: { scale: 1, opacity: 0 },
                        hover: { scale: 1.5, opacity: 1 }
                    }}
                    transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: i * 0.4, 
                        ease: "easeInOut" 
                    }}
                />
            ))}
        </div>
        <p className="font-mono text-green-400 text-sm mt-2">10,000 TPS</p>
    </motion.div>
);

const EnvioVisual = () => (
    <motion.div 
        className="w-full h-full rounded-lg flex flex-col p-4 justify-between"
        initial="initial"
        whileHover="hover"
    >
        <div className="font-mono text-xs text-gray-500">&lt;GraphQL Query /&gt;</div>
        <div className="space-y-2">
            <motion.div variants={{ initial: { width: '75%' }, hover: { width: '90%' } }} className="h-3 bg-purple-500/30 rounded-full" />
            <motion.div variants={{ initial: { width: '50%' }, hover: { width: '70%' } }} className="h-3 bg-purple-500/30 rounded-full" />
            <motion.div variants={{ initial: { width: '66%' }, hover: { width: '80%' } }} className="h-3 bg-purple-500/30 rounded-full" />
        </div>
        <div className="font-mono text-xs text-purple-400 self-end">=&gt; Real-time API</div>
    </motion.div>
);

const MonitoringVisual = () => (
    <div className="w-full h-full  rounded-lg flex items-center justify-center p-4">
        <div className="w-28 h-28 border-4 border-blue-400 rounded-full flex items-center justify-center relative">
            <motion.div 
                className="absolute h-full w-1 bg-blue-400 rounded-full origin-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            <div className="w-20 h-20 bg-blue-500/30 rounded-full flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </div>
        </div>
    </div>
);

const BatchRevokeVisual = () => (
    <motion.div 
        className="w-full h-full rounded-lg flex items-center justify-center p-4 space-x-2"
        initial="initial"
        whileHover="hover"
    >
        {[...Array(3)].map((_, i) => (
             <motion.div 
                key={i}
                className="w-10 h-10 border-2 border-red-500 rounded-lg bg-red-900/30 flex items-center justify-center"
                variants={{
                    initial: { opacity: 1, x: 0 },
                    hover: { opacity: 0.5, x: -10 }
                }}
                transition={{ delay: i * 0.1 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </motion.div>
        ))}
         <div className="text-2xl font-bold text-gray-500">&rarr;</div>
         <motion.div 
            className="w-12 h-12 border-2 border-dashed border-green-500 rounded-lg bg-green-900/30 flex items-center justify-center"
            variants={{
                initial: { scale: 1 },
                hover: { scale: 1.2, rotate: 10 }
            }}
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
             </svg>
         </motion.div>
    </motion.div>
);

const RiskAssessmentVisual = () => (
    <motion.div 
        className="w-full h-full rounded-lg flex items-center justify-center p-4"
        initial="initial"
        whileHover="hover"
    >
        <div className="relative font-mono text-sm">
            <motion.div 
                className="flex items-center gap-2 text-yellow-400"
                variants={{ initial: { x: 0 }, hover: { x: 5 } }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.21 2.852-1.21 3.488 0l6.096 11.623c.636 1.21-.472 2.778-1.744 2.778H3.905c-1.272 0-2.38-1.567-1.744-2.778L8.257 3.099zM10 13a1 1 0 100-2 1 1 0 000 2zm-1-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                <span>High Risk</span>
            </motion.div>
             <motion.div 
                className="flex items-center gap-2 text-green-400 mt-2"
                variants={{ initial: { x: 0 }, hover: { x: -5 } }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <span>Verified</span>
            </motion.div>
        </div>
    </motion.div>
);

// --- Feature Configuration ---
const features = [
  {
    id: 'metamask-smart-accounts',
    title: 'MetaMask Smart Accounts',
    description: 'Powered by ERC-4337 and ERC-7710, our platform leverages modular smart accounts for features like gasless transactions and advanced permission sharing.',
    visual: <MetaMaskVisual />,
    colSpan: 'lg:col-span-2',
  },
  {
    id: 'wallet-monitoring',
    title: 'Real-time Wallet Monitoring',
    description: 'Continuously monitor your wallet for new or high-risk approvals. Stay informed and secure 24/7.',
    visual: <MonitoringVisual />,
    colSpan: 'lg:col-span-1',
  },
   {
    id: 'risk-assessment',
    title: 'Automated Risk Assessment',
    description: 'Our system automatically identifies and flags suspicious or overly permissive token approvals in your wallet.',
    visual: <RiskAssessmentVisual />,
    colSpan: 'lg:col-span-1',
  },
  {
    id: 'batch-revoke',
    title: 'Batch Revocation',
    description: 'Revoke multiple approvals at once, saving time and gas fees. Streamline your wallet security management.',
    visual: <BatchRevokeVisual />,
    colSpan: 'lg:col-span-1',
  },
  {
    id: 'monad',
    title: 'Built on Monad',
    description: 'Built on a high-performance L1, achieving 10,000 TPS with sub-second finality for a seamless user experience.',
    visual: <MonadVisual />,
    colSpan: 'lg:col-span-1',
  },
   {
    id: 'envio',
    title: 'Indexed by Envio',
    description: 'Utilizing a high-performance indexer to provide real-time, production-ready APIs for all your approval data.',
    visual: <EnvioVisual />,
    colSpan: 'lg:col-span-2',
  },
];

const BentoGridItem: React.FC<{
  feature: typeof features[0];
}> = ({ feature }) => {
  return (
    <motion.div
      key={feature.id}
      className={`relative rounded-3xl border border-[#333336] bg-[#0C0C0E] p-6 flex flex-col overflow-hidden cursor-pointer ${feature.colSpan}`}
    >
      {/* Visual content at the top */}
      <div className="flex-grow flex items-center justify-center rounded-lg overflow-hidden mb-4 h-48">
        {feature.visual}
      </div>
      {/* Text content at the bottom */}
      <div className="flex-shrink-0">
        <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
};

const InteractiveFeatures: React.FC = () => {
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

        {/* --- UPDATED Bento Grid Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[26rem]">
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