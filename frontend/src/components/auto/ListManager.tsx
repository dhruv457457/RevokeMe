// components/auto/ListManager.tsx
import React, { useState } from 'react';
import { isAddress, getAddress } from 'viem';

interface Props {
  title: string;
  list: string[];
  onAdd: (address: string) => void;
  onRemove: (address: string) => void;
}

const ListManager: React.FC<Props> = ({ title, list, onAdd, onRemove }) => {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (isAddress(input)) {
      onAdd(getAddress(input));
      setInput('');
    } else {
      alert("Invalid address provided.");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">{title}</label>
      <div className="mt-1 flex rounded-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter spender address to trust..."
          className="flex-1 min-w-0 block w-full px-3 py-2 bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500 rounded-l-md focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
        />
        <button onClick={handleAdd} className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition-colors">Add</button>
      </div>
      <div className="mt-2 bg-black rounded-md p-2 h-24 overflow-y-auto space-y-1">
        {list.length === 0 && <p className="text-xs text-gray-500 text-center pt-2">No trusted spenders added.</p>}
        {list.map(addr => (
          <div key={addr} className="flex justify-between items-center bg-gray-700/50 px-2 py-1 rounded">
            <span className="font-mono text-xs text-gray-300">{addr}</span>
            <button onClick={() => onRemove(addr)} className="text-red-500 hover:text-red-400 font-bold text-lg leading-none transition-colors">&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListManager;