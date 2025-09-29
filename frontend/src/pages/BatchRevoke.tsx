import React, { useState } from 'react';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { revocationModuleAddress, revocationModuleAbi } from '../lib/contracts/contracts';
import { encodeFunctionData, isAddress } from 'viem';

// Define a type for a single approval pair
type Approval = {
  token: string;
  spender: string;
};

const BatchRevokePage: React.FC = () => {
  const { smartAccount, bundlerClient } = useSmartAccount();
  
  // State to hold the list of approvals to revoke
  const [approvals, setApprovals] = useState<Approval[]>([{ token: '', spender: '' }]);
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  // Function to handle changes in the input fields
  const handleInputChange = (index: number, field: keyof Approval, value: string) => {
    const newApprovals = [...approvals];
    newApprovals[index][field] = value;
    setApprovals(newApprovals);
  };

  // Function to add a new, empty approval row to the list
  const addApprovalRow = () => {
    setApprovals([...approvals, { token: '', spender: '' }]);
  };

  // Function to remove an approval row from the list
  const removeApprovalRow = (index: number) => {
    const newApprovals = approvals.filter((_, i) => i !== index);
    setApprovals(newApprovals);
  };

  const handleBatchRevoke = async () => {
    if (!smartAccount || !bundlerClient) {
      setStatus({ type: 'error', message: 'Smart account or bundler not ready.' });
      return;
    }

    // Validate all addresses before proceeding
    for (const approval of approvals) {
      if (!isAddress(approval.token) || !isAddress(approval.spender)) {
        setStatus({ type: 'error', message: 'All fields must contain valid addresses.' });
        return;
      }
    }

    setStatus({ type: 'loading', message: 'Preparing batch transaction...' });

    try {
      // Separate the tokens and spenders into two arrays for the contract call
      const tokens = approvals.map(a => a.token);
      const spenders = approvals.map(a => a.spender);

      // Encode the function call to `batchRevokeERC20(address[], address[])`
      const callData = encodeFunctionData({
        abi: revocationModuleAbi,
        functionName: 'batchRevokeERC20',
        args: [tokens, spenders],
      });

      // Construct the UserOperation
      const userOperation = {
        to: revocationModuleAddress,
        value: BigInt(0),
        data: callData,
      };

      // Send the UserOperation to the bundler
      const userOpHash = await bundlerClient.sendUserOperation({
        userOperation,
        entryPoint: smartAccount.entryPoint,
      });
      
      setStatus({ type: 'success', message: `Batch transaction sent! UserOp Hash: ${userOpHash}` });
    } catch (error: any) {
      console.error('Failed to send batch UserOperation:', error);
      setStatus({ type: 'error', message: error.message || 'Failed to send transaction.' });
    }
  };

  if (!smartAccount) {
    return null; // Don't render if the smart account isn't set up
  }

  return (
    <div className="mt-8 p-6 border rounded-lg shadow-md bg-white w-full max-w-2xl mx-auto text-left">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Batch Revoke ERC20 Approvals</h3>
      
      {approvals.map((approval, index) => (
        <div key={index} className="flex items-center gap-2 mb-2 p-2 border rounded">
          <div className="flex-grow flex flex-col gap-2">
            <input
              type="text"
              placeholder={`Token Address #${index + 1}`}
              value={approval.token}
              onChange={(e) => handleInputChange(index, 'token', e.target.value)}
              className="p-2 border rounded-md w-full"
            />
            <input
              type="text"
              placeholder={`Spender Address #${index + 1}`}
              value={approval.spender}
              onChange={(e) => handleInputChange(index, 'spender', e.target.value)}
              className="p-2 border rounded-md w-full"
            />
          </div>
          <button onClick={() => removeApprovalRow(index)} className="bg-red-500 text-white p-2 rounded h-10 w-10">
            &times;
          </button>
        </div>
      ))}
      
      <div className="flex justify-between items-center mt-4">
        <button onClick={addApprovalRow} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
          + Add More
        </button>
        <button
          onClick={handleBatchRevoke}
          disabled={status.type === 'loading' || approvals.length === 0}
          className={`px-6 py-3 rounded text-white font-bold transition ${
            status.type === 'loading' ? 'bg-gray-500 cursor-wait' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {status.type === 'loading' ? 'Revoking...' : `Revoke ${approvals.length} Approvals`}
        </button>
      </div>

      {status.message && (
        <div className={`mt-4 p-2 rounded-md text-sm ${
          status.type === 'success' ? 'bg-green-100 text-green-800' :
          status.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {status.message}
        </div>
      )}
    </div>
  );
};

export default BatchRevokePage;