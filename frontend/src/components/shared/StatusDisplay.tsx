// components/shared/StatusDisplay.tsx
import React from 'react';

interface Props {
  status: {
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  };
}

const StatusDisplay: React.FC<Props> = ({ status }) => {
  if (!status.message) {
    return null;
  }

  const baseClasses = 'mb-4 p-3 rounded-md text-sm';
  const styles = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    loading: 'bg-blue-100 text-blue-800',
    idle: 'hidden',
  };

  return (
    <div className={`${baseClasses} ${styles[status.type]}`}>
      {status.message}
    </div>
  );
};

export default StatusDisplay;