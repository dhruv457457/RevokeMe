import React, { useState } from 'react';
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { injected } from "@wagmi/connectors";
import { Link } from "react-router-dom";
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

  if (isConnected) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm bg-white/10 text-white px-3 py-2 rounded-md font-mono hidden sm:block">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="bg-red-600 text-white cursor-pointer px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Disconnect
        </button>
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