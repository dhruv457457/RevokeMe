import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useSmartAccount } from '../hooks/useSmartAccount';
import  ApprovalList  from '../components/ApprovalList'; // Import our new component

const Home: React.FC = () => {
    const { address: eoaAddress, isConnected } = useAccount();
    const { smartAccount } = useSmartAccount();
    const [accountType, setAccountType] = useState<'smart' | 'eoa'>('smart');

    // Determine which address to show approvals for based on the toggle
    const selectedAddress = accountType === 'smart' ? smartAccount?.address : eoaAddress;

    if (!isConnected) {
        return (
            <div className="text-center mt-12">
                <h1 className="text-3xl font-bold text-gray-800">Welcome to AutoRevoke</h1>
                <p className="mt-2 text-gray-600">Please connect your wallet to view and manage your token approvals.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-gray-800">Approvals Dashboard</h1>
            <p className="mt-2 text-center text-gray-600">View real-time token approvals for your connected accounts.</p>

            {/* Account switcher toggle */}
            <div className="flex justify-center my-8 p-1 bg-gray-200 rounded-lg">
                <button 
                    onClick={() => setAccountType('smart')} 
                    className={`w-1/2 p-2 rounded-md font-semibold transition ${accountType === 'smart' ? 'bg-purple-600 text-white shadow' : 'bg-transparent text-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`} 
                    disabled={!smartAccount}
                >
                    Smart Account
                </button>
                <button 
                    onClick={() => setAccountType('eoa')} 
                    className={`w-1/2 p-2 rounded-md font-semibold transition ${accountType === 'eoa' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600'}`}
                >
                    Main Account (EOA)
                </button>
            </div>
            
            {/* Render the ApprovalList with the selected address */}
            {selectedAddress ? (
                <div>
                    <p className="text-center text-sm text-gray-600 mb-2">
                        Showing approvals for: <strong className="font-mono bg-gray-100 p-1 rounded">{selectedAddress}</strong>
                    </p>
                    <ApprovalList ownerAddress={selectedAddress} />
                </div>
            ) : (
                <p className="text-center text-red-500 mt-4">
                    {accountType === 'smart' ? "Please set up your Smart Account to view its approvals." : "Main account not connected."}
                </p>
            )}
        </div>
    );
};

export default Home;

