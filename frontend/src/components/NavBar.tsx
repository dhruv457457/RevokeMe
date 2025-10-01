import React from 'react';
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "@wagmi/connectors";
import { Link, NavLink } from "react-router-dom"; // Use NavLink for active styles

// --- Component 1: Connect Wallet Button ---
// This component now *only* handles connecting and disconnecting.
const ConnectWalletButton: React.FC = () => {
  const { connect } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm bg-white/10 px-3 py-2 rounded-md font-mono hidden sm:block">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="bg-blue-600 px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
    >
      Connect Wallet
    </button>
  );
};

// --- Component 2: Main NavBar ---
// This component now handles the overall layout and navigation structure.
const NavBar: React.FC = () => {
  // Style for the active NavLink
  const activeLinkStyle = {
    textDecoration: 'underline',
    color: '#a78bfa', // A light purple for the active link
  };

  return (
    <header className="mb-8 flex justify-between items-center bg-gray-900 text-white p-4 shadow-md w-full">
      {/* Left Side: Title */}
      <div className="flex-shrink-0">
        <Link to="/" className="text-xl font-bold">AutoRevoke dApp</Link>
      </div>

      {/* Center: Navigation Links */}
      <nav className="hidden md:flex flex-grow justify-center">
        <ul className="flex items-center space-x-6 text-gray-300">
          <li>
            <NavLink 
              to="/" 
              className="hover:text-white transition-colors"
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/revoke-erc20" 
              className="hover:text-white transition-colors"
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              Revoke ERC20
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/batch-revoke" 
              className="hover:text-white transition-colors"
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              Batch Revoke
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/auto-revoke" 
              className="hover:text-white transition-colors"
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              Auto Revoke
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/approve-erc20" 
              className="hover:text-white transition-colors"
              style={({ isActive }) => isActive ? activeLinkStyle : undefined}
            >
              Approve ERC20
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Right Side: Connect Button */}
      <div className="flex-shrink-0">
        <ConnectWalletButton />
      </div>
    </header>
  );
};

export default NavBar;