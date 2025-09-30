import React, { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { encodeFunctionData, isAddress, getAddress } from 'viem';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { http } from "viem";

// ABI for the ERC20 approve function
const erc20Abi = [
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

// ✅ Reads the API key from your .env file
// Make sure your .env file has: VITE_PIMLICO_API_KEY="your_actual_key"
const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY;

const pimlicoClient = createPimlicoClient({
  transport: http(`https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`),
});

const RevokeERC20Page: React.FC = () => {
  const { address: eoaAddress } = useAccount();
  const { smartAccount, bundlerClient } = useSmartAccount();
  const { writeContractAsync } = useWriteContract();

  const [tokenAddress, setTokenAddress] = useState('');
  const [spenderAddress, setSpenderAddress] = useState('');
  const [accountType, setAccountType] = useState<'smart' | 'eoa'>('smart');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleRevoke = async () => {
    if (accountType === 'smart') {
      await handleRevokeFromSmartAccount();
    } else {
      await handleRevokeFromEOA();
    }
  };

  const handleRevokeFromEOA = async () => {
    setStatus({ type: 'loading', message: 'Preparing transaction for Main Account...' });
    try {
      if (!isAddress(tokenAddress) || !isAddress(spenderAddress)) {
        throw new Error('Please enter valid Ethereum addresses for both fields.');
      }
      const validatedTokenAddress = getAddress(tokenAddress);
      const validatedSpenderAddress = getAddress(spenderAddress);

      if (eoaAddress && validatedTokenAddress.toLowerCase() === eoaAddress.toLowerCase()) {
          throw new Error("The token address cannot be the same as your main account address.");
      }

      const txHash = await writeContractAsync({
        address: validatedTokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [validatedSpenderAddress, BigInt(0)],
      });

      setStatus({ type: 'success', message: `Revocation successful! Transaction Hash: ${txHash}` });
    } catch (error: any) {
      console.error("EOA revoke failed:", error);
      setStatus({ type: 'error', message: error.shortMessage || "Transaction failed or was rejected." });
    }
  };
  
  const handleRevokeFromSmartAccount = async () => {
    if (!smartAccount || !bundlerClient) {
      setStatus({ type: 'error', message: 'Smart Account not ready.' });
      return;
    }
    // ✅ Updated check for the environment variable
    if (!PIMLICO_API_KEY) {
        setStatus({ type: 'error', message: "Pimlico API key is missing. Please check your .env file." });
        return;
    }

    setStatus({ type: 'loading', message: 'Preparing UserOperation for Smart Account...' });
    try {
      if (!isAddress(tokenAddress) || !isAddress(spenderAddress)) {
        throw new Error('Please enter valid Ethereum addresses.');
      }
      const validatedTokenAddress = getAddress(tokenAddress);
      const validatedSpenderAddress = getAddress(spenderAddress);

      const fee = await pimlicoClient.getUserOperationGasPrice();
      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [{
          to: validatedTokenAddress,
          data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [validatedSpenderAddress, BigInt(0)] }),
          value: BigInt(0),
        }],
        maxFeePerGas: fee.fast.maxFeePerGas,
        maxPriorityFeePerGas: fee.fast.maxPriorityFeePerGas,
      });
      setStatus({ type: 'loading', message: `Transaction sent! Waiting for confirmation... Hash: ${userOpHash}` });
      const { receipt } = await bundlerClient.waitForUserOperationReceipt({ hash: userOpHash });
      setStatus({ type: 'success', message: `Revocation successful! Transaction Hash: ${receipt.transactionHash}` });
    } catch (error: any) {
      console.error('Smart Account revoke failed:', error);
      setStatus({ type: 'error', message: error.shortMessage || 'UserOperation failed.' });
    }
  };

  return (
    <div className="mt-8 p-6 border rounded-lg shadow-md bg-white w-full max-w-2xl mx-auto text-left">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Revoke ERC20 Approval</h3>

      <div className="flex justify-center mb-6 p-1 bg-gray-200 rounded-lg">
        <button 
          onClick={() => setAccountType('smart')} 
          className={`w-1/2 p-2 rounded-md font-semibold transition ${accountType === 'smart' ? 'bg-purple-600 text-white shadow' : 'bg-transparent text-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed`} 
          disabled={!smartAccount}
        >
          Smart Account
        </button>
        <button 
          onClick={() => setAccountType('eoa')} 
          className={`w-1/2 p-2 rounded-md font-semibold transition ${accountType === 'eoa' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-600'}`}
        >
          Main Account (EOA)
        </button>
      </div>
      
      <div className="flex flex-col gap-4">
        {!smartAccount && accountType === 'smart' && 
          <p className="text-center text-red-500 bg-red-50 p-3 rounded-md">Please set up your Smart Account first to use this option.</p>
        }
        <p className="text-sm text-gray-600">
          Managing approvals for: <strong className="font-mono bg-gray-100 p-1 rounded">{accountType === 'smart' ? smartAccount?.address : eoaAddress}</strong>
        </p>
        <input type="text" placeholder="Token Address (e.g., 0x...)" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value.trim())} className="p-2 border rounded-md focus:ring-2 focus:ring-purple-500"/>
        <input type="text" placeholder="Spender Address (e.g., 0x...)" value={spenderAddress} onChange={(e) => setSpenderAddress(e.target.value.trim())} className="p-2 border rounded-md focus:ring-2 focus:ring-purple-500"/>
        <button onClick={handleRevoke} disabled={status.type === 'loading' || (accountType === 'smart' && !smartAccount)} className={`px-6 py-3 rounded text-white font-bold transition ${status.type === 'loading' ? 'bg-gray-500 cursor-wait animate-pulse' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>
          {status.type === 'loading' ? 'Processing...' : `Revoke from ${accountType === 'smart' ? 'Smart Account' : 'Main Account'}`}
        </button>
      </div>

      {status.message && ( <div className={`mt-4 p-3 rounded-md text-sm break-words ${ status.type === 'success' ? 'bg-green-100 text-green-800' : status.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800' }`}> {status.message} </div> )}
    </div>
  );
};

export default RevokeERC20Page;

