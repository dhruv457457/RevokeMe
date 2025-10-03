import React from 'react';

const CTABanner: React.FC = () => {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Grid Pattern (mimicking the reference image) */}
      <div className="absolute inset-0 z-0">
        <div className="grid grid-cols-8 gap-4 opacity-10">
          {[...Array(64)].map((_, i) => (
            <div
              key={i}
              className="w-full h-12 border-l border-b border-green-500 transform rotate-45"
              style={{
                borderColor: 'rgba(0, 255, 0, 0.1)', // Subtle green lines
                transform: `rotateX(60deg) rotateZ(45deg) scale(0.8)`, // Adjust perspective
                position: 'absolute',
                top: `${(Math.floor(i / 8) * 100) - 20}px`, // Adjust vertical spacing
                left: `${(i % 8) * 100 - 50}px`, // Adjust horizontal spacing
              }}
            ></div>
          ))}
        </div>
      </div>


      <div className="relative z-10 max-w-7xl mx-auto bg-[#0C0C0E] border border-[#333336] rounded-3xl p-8 md:p-12 text-center ">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to secure your wallet?
        </h2>
        <p className="text-lg text-gray-400 mb-8">
          Start revoking unnecessary permissions and protect your digital assets today.
        </p>
        <button className="inline-flex items-center justify-center px-8 py-3 bg-[#7f48de] hover:bg-[#7437DC] cursor-pointer text-white font-semibold rounded-lg transition-colors text-lg">
          Start Revoking Now
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default CTABanner;