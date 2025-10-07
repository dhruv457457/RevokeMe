// src/components/auto/ListManager.tsx
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
      <label className="block text-md font-medium text-gray-300 mb-3">{title}</label>
      <div className="mt-1 flex rounded-lg shadow-sm">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter spender address to trust..."
          className="flex-1 min-w-0 block w-full px-4 py-2 bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-500 rounded-l-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
        />
        <button 
          onClick={handleAdd} 
          className="px-5 py-2 border border-transparent text-sm font-medium rounded-r-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition-colors"
        >
          Add
        </button>
      </div>
      <div className="mt-3 bg-black rounded-lg p-3 h-28 overflow-y-auto space-y-2 shadow-inner">
        {list.length === 0 && (
          <p className="text-sm text-gray-500 text-center pt-2">
            No trusted spenders added.
          </p>
        )}
        {list.map(addr => (
          <div key={addr} className="flex justify-between items-center bg-gray-800/50 px-3 py-2 rounded-md">
            <span className="font-mono text-sm text-gray-300">{addr}</span>
            <button 
              onClick={() => onRemove(addr)} 
              className="text-red-500 hover:text-red-400 font-bold text-xl leading-none transition-colors transform hover:scale-110"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListManager;