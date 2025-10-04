import React, { useState, useRef, useEffect } from 'react';
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "@wagmi/connectors";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "./ui/resizable-navbar";

// --- Reusable Connect Wallet Button ---
const ConnectWalletButton: React.FC = () => {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


  if (isConnected) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 text-sm bg-white/10 text-white px-3 py-2 rounded-md font-mono transition-colors hover:bg-white/20"
        >
          <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          {/* Chevron Down Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 py-2 w-48 bg-[#1A1A1D] border border-[#333336] rounded-lg shadow-xl z-20"
            >
              <button
                onClick={() => {
                  disconnect();
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                {/* Disconnect Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="bg-[#7f48de] text-white hover:bg-[#7437DC] cursor-pointer px-4 py-2 rounded-md text-sm font-semibold transition-colors"
    >
      Connect Wallet
    </button>
  );
};


// --- New Resizable NavBar Component ---
const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", link: "/" },
    { name: "Revoke ERC20", link: "/revoke-erc20" },
    { name: "Auto Revoke", link: "/auto-revoke" },
    { name: "Approve ERC20", link: "/approve-erc20" },
  ];

  return (
    <Navbar className="sticky top-0 p-2">
      {/* --- Desktop Navigation --- */}
      <NavBody className="w-full">
        <div className="flex items-center gap-x-2">
            <Link to="/" className="text-xl font-bold text-white">RevokeMe</Link>
        </div>
        <NavItems items={navItems} />
        <div className="relative z-20">
            <ConnectWalletButton />
        </div>
      </NavBody>

      {/* --- Mobile Navigation --- */}
      <MobileNav>
        <MobileNavHeader>
          <div className="flex items-center gap-x-2">
            <Link to="/" className="text-xl font-bold text-white">AutoRevoke</Link>
          </div>
          <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            <div className="flex flex-col space-y-4">
                {navItems.map((item, idx) => (
                    <Link
                        key={`mobile-link-${idx}`}
                        to={item.link}
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-neutral-300 hover:text-white"
                    >
                        {item.name}
                    </Link>
                ))}
                <div className='px-4 pt-4 border-t border-gray-800'>
                    <ConnectWalletButton />
                </div>
            </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
};

export default NavBar;