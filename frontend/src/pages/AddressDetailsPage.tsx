import React from "react";
import { useParams, Link } from "react-router-dom";
import ApprovalList from "../components/ApprovalList"; // Your existing component
import Footer from "../components/Footer";

const AddressDetailsPage: React.FC = () => {
    const { address } = useParams<{ address: `0x${string}` }>();

    return (
        <div className="w-full text-white min-h-screen">
             <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="mb-8">
                    <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                        &larr; Back to Home
                    </Link>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Approvals For</h1>
                    <p className="font-mono text-lg text-gray-500 mt-1 break-all">{address}</p>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h3 className="text-xl font-semibold text-gray-200">
                           Active Token Approvals
                        </h3>
                    </div>
                     <div className="dashboard-card-content">
                        {address ? (
                            <ApprovalList ownerAddress={address} /> /* No limit prop */
                        ) : (
                            <div className="text-center p-8">Invalid address provided.</div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AddressDetailsPage;