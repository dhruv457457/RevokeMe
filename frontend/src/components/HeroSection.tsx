export default function HeroSection() {
  return (
    <section className="bg-[#09090B] text-white py-20 px-4 min-h-[50vh] flex flex-col items-center justify-center ">
      <div className="max-w-4xl text-center ">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-8">
          Explore Your Wallet's Approvals
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10">
          Search for active token and NFT approvals by wallet address. Take
          control of your digital assets.
        </p>
        <div className="relative w-full max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search by Wallet Address, Token, or NFT Approval..."
            className="relative z-10 w-full py-4 pl-6 pr-16 bg-[#1A1A1D] border border-[#333336] rounded-3xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7f48de] focus:border-transparent transition-colors"
          />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-[#7f48de] hover:bg-[#7437DC] p-2 px-4 rounded-3xl transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          {/* Subtle Glow Effect */}
          <div className="absolute top-[50px] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[20%] bg-[#7f48de] rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}