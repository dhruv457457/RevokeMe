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
    <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-600'}`}></span>
            <span className={`text-sm font-medium ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
                {isActive ? 'Service Online' : 'Service Offline'}
            </span>
        </div>
      <button
        onClick={isActive ? onRevoke : onAuthorize}
        className={`w-32 px-4 py-2 text-sm font-bold rounded-lg text-white transition-all duration-300 cursor-pointer transform ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'}`}
      >
        {isActive ? 'Shutdown' : 'Authorize'}
      </button>
    </div>
  );
};

export default AuthorizationCard;