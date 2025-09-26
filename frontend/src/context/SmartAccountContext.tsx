// SmartAccountContext.tsx
import React, { createContext, useContext, useState } from 'react';

const SmartAccountContext = createContext(null);

export const useSmartAccountContext = () => useContext(SmartAccountContext);

export const SmartAccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  return (
    <SmartAccountContext.Provider value={{ account, setAccount }}>
      {children}
    </SmartAccountContext.Provider>
  );
};
