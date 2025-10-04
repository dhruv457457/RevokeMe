import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className=" text-white p-10 ">
      <div className="max-w-7xl mx-auto p-10 rounded-3xl border border-[#333336]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: RevokeMe Info */}
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold mb-4 text-gray-200">RevokeMe</h3>
            <p className="text-gray-400 text-sm mb-4">
              Empowering users with advanced token approval management and wallet security.
            </p>
            <div className="flex space-x-4">
              {/* Twitter Icon */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c11 3 17 0 17-12V3.5a10.43 10.43 0 0 0 3-3" />
                </svg>
              </a>
              {/* GitHub Icon (example, you can add more) */}
              <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 3c0 0-1.04-.35-3.47 1.35A12.67 12.67 0 0 0 12 5.05c-2.04 0-4.07.37-6.1.18-.3-.58-.7-1.42-.94-1.79z" />
                  <path d="M12 20.91v-8" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Features */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Features</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Instant Revocation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Wallet Monitoring</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Risk Assessment</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Batch Revoke</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">User Guide</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Support</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-200">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-800">
          © {new Date().getFullYear()} RevokeMe. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;