import React from 'react';
import { useAutoRevoke } from '../hooks/useAutoRevoke';
import { useSmartAccount } from '../hooks/useSmartAccount';

const AutoRevokePage: React.FC = () => {
  const { smartAccount } = useSmartAccount();
  const { grant, status, authorizeAutoRevoke, revokeAuthorization } = useAutoRevoke();

  if (!smartAccount) {
    return (
      <div className="text-center mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
        <h2 className="text-xl font-bold text-yellow-800">Smart Account Required</h2>
        <p className="mt-2 text-yellow-700">Please connect your wallet and set up your Smart Account to enable auto-revocation.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white border rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-2 text-center">Auto-Revoke Service</h2>
      <p className="text-gray-600 text-center mb-6">
        Authorize your Smart Account to automatically revoke new token approvals. This service runs in your browser while this page is open.
      </p>

      {grant ? (
        <div className="text-center">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Auto-Revoke is ACTIVE</h3>
            <p className="text-sm text-green-700 mt-1">
              Delegation expires: {new Date(Number(grant.expiry) * 1000).toLocaleString()}
            </p>
          </div>
          <button
            onClick={revokeAuthorization}
            className="mt-6 w-full px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
          >
            De-authorize and Stop
          </button>
        </div>
      ) : (
        <div className="text-center">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800">Auto-Revoke is INACTIVE</h3>
            <p className="text-sm text-gray-700 mt-1">
              Sign a message to grant your Smart Account permission to automatically revoke approvals on your behalf.
            </p>
          </div>
          <button
            onClick={authorizeAutoRevoke}
            className="mt-6 w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
          >
            Authorize Auto-Revoke
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t">
        <h4 className="font-semibold text-lg text-center">Live Status</h4>
        <div className="mt-2 text-center p-3 bg-gray-100 rounded-md font-mono text-sm text-gray-700">
          {status}
        </div>
      </div>
    </div>
  );
};

export default AutoRevokePage;