// components/auto/AuthorizationCard.tsx
import React from 'react';

type Grant = { expiry: bigint; } | null;

interface Props {
  grant: Grant;
  onAuthorize: () => void;
  onRevoke: () => void;
}

const AuthorizationCard: React.FC<Props> = ({ grant, onAuthorize, onRevoke }) => {
  const isActive = !!grant;

  return (
    <div className={`p-4 rounded-lg border flex items-center justify-between ${isActive ? 'bg-green-900/50 border-green-700' : 'bg-gray-800 border-gray-700'}`}>
      <div>
        <h3 className={`font-bold ${isActive ? 'text-green-300' : 'text-gray-300'}`}>
          Service Status: {isActive ? 'ONLINE' : 'OFFLINE'}
        </h3>
        <p className={`text-xs mt-1 ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
          {isActive
            ? `System is actively monitoring for new approvals.`
            : 'Authorize to begin monitoring.'
          }
        </p>
      </div>
      <button
        onClick={isActive ? onRevoke : onAuthorize}
        className={`w-28 px-4 py-2 font-bold rounded-3xl text-white transition-colors ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
      >
        {isActive ? 'Shutdown' : 'Authorize'}
      </button>
    </div>
  );
};

export default AuthorizationCard;