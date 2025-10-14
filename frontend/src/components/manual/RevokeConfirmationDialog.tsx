// src/components/manual/RevokeConfirmationDialog.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Approval } from '../../utils/fetchApprovals';
import Spinner from '../shared/Spinner'; 

interface Props {
  isOpen: boolean;
  isRevoking: boolean;
  approval: Approval | null;
  batchCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

const RevokeConfirmationDialog: React.FC<Props> = ({ isOpen, isRevoking, approval, batchCount, onClose, onConfirm }) => {
  const isBatch = batchCount > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-[#0C0C0E] border border-[#333336] rounded-3xl shadow-2xl w-full max-w-xl p-8 text-white relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
           
            <div className="relative z-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-red-900/30 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-2xl font-bold mb-2">Confirm Revoke</h3>
              <p className="text-gray-400 mb-6">
                {isBatch ? `Are you sure you want to revoke ${batchCount} approvals?` : 'Are you sure you want to revoke this approval?'}
              </p>
              
              {!isBatch && approval && (
                <div className="bg-[#1A1A1D] border border-[#333336] rounded-lg p-4 text-left space-y-2 mb-8 font-mono text-sm">
                  <div>
                    <span className="text-gray-500">Token:</span>
                    <span className="text-gray-200 ml-2 truncate block">{approval.tokenAddress}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Spender:</span>
                    <span className="text-gray-200 ml-2 truncate block">{approval.spender}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-center space-x-4">
                <button
                  onClick={onClose}
                  disabled={isRevoking}
                  className="px-8 py-3 w-36 rounded-3xl cursor-pointer font-semibold bg-[#333336] hover:bg-[#444447] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isRevoking}
                  className="px-8 py-3 w-36 rounded-3xl cursor-pointer font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center disabled:bg-red-800"
                >
                  {isRevoking ? <Spinner /> : 'Revoke'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RevokeConfirmationDialog;