import React from "react";
import ConnectWalletButton from "./ConnectWalletButton";

const NavBar: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="font-bold text-lg">AutoRevoke dApp</div>
      <div>
        <ConnectWalletButton />
      </div>
    </nav>
  );
};

export default NavBar;
