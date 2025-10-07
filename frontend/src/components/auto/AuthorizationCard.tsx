// src/components/auto/AuthorizationCard.tsx
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
    <div className={`p-6 rounded-xl border flex items-center justify-between transition-all duration-300 ${isActive ? 'bg-green-900/50 border-green-700' : 'bg-gray-800 border-gray-700'}`}>
      <div>
        <h3 className={`font-bold text-lg ${isActive ? 'text-green-300' : 'text-gray-300'}`}>
          Service Status: {isActive ? 'ONLINE' : 'OFFLINE'}
        </h3>
        <p className={`text-sm mt-1 ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
          {isActive
            ? `System is actively monitoring for new approvals.`
            : 'Authorize to begin monitoring.'
          }
        </p>
      </div>
      <button
        onClick={isActive ? onRevoke : onAuthorize}
        className={`w-36 px-4 py-2 font-bold rounded-lg text-white transition-all duration-300 transform hover:scale-105 ${isActive ? 'bg-red-600 hover:bg-red-700 shadow-lg' : 'bg-purple-600 hover:bg-purple-700 shadow-lg'}`}
      >
        {isActive ? 'Shutdown' : 'Authorize'}
      </button>
    </div>
  );
};

export default AuthorizationCard;