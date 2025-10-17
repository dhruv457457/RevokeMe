// src/components/NavBar.tsx

import React, { useState } from 'react';
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
// 1. Import the new, unified component
import { WalletAndAccountManager } from './WalletAndAccountManager'; // Adjust the path if needed

// The old ConnectWalletButton component is no longer required in this file.

const NavBar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: "Home", link: "/" },
        { name: "Revoke ERC20", link: "/revoke-erc20" },
    ];

    return (
        <Navbar className="sticky top-0 p-2">
            {/* --- Desktop Navigation --- */}
            <NavBody className="w-full">
                <div className="flex items-center gap-x-2">
                    <img src="https://i.ibb.co/5g5CF4jN/RevokeMe.png" className='h-8' alt="RevokeMe Logo" />
                    <Link to="/" className="text-xl font-bold text-white">RevokeMe</Link>
                </div>
                <NavItems items={navItems} />
                <div className="relative z-20">
                    {/* 2. Replace the old button with the new manager */}
                    <WalletAndAccountManager />
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
                            {/* 3. Also replace it in the mobile menu */}
                            <WalletAndAccountManager />
                        </div>
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </Navbar>
    );
};

export default NavBar;