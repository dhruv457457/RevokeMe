import React, { useState } from 'react';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { encodeFunctionData, isAddress, getAddress, parseEther } from 'viem';
import { createPimlicoClient } from 'permissionless/clients/pimlico'; // To get gas prices
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

// You can get an API key from https://dashboard.pimlico.io/
const PIMLICO_API_KEY = "pim_cuRXPkkzbAreAN4tvMnpAY";
const pimlicoClient = createPimlicoClient({
  transport: http(`https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`),
});
const RevokeERC20Page: React.FC = () => {
  const { smartAccount, bundlerClient } = useSmartAccount();

  const [tokenAddress, setTokenAddress] = useState('');
  const [spenderAddress, setSpenderAddress] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleRevoke = async () => {
    if (!smartAccount || !bundlerClient) {
      setStatus({ type: 'error', message: 'Clients not ready. Please ensure your wallet is connected.' });
      return;
    }

    // 1. Validate the addresses
    let validatedTokenAddress: `0x${string}`;
    let validatedSpenderAddress: `0x${string}`;
    try {
      if (!isAddress(tokenAddress) || !isAddress(spenderAddress)) {
        throw new Error('Please enter valid Ethereum addresses for both fields.');
      }
      validatedTokenAddress = getAddress(tokenAddress);
      validatedSpenderAddress = getAddress(spenderAddress);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
      return;
    }

    setStatus({ type: 'loading', message: 'Preparing transaction...' });

    try {
      // 2. Encode the function call you want to make (approve spender for 0 tokens)
      const approveCallData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [validatedSpenderAddress, 0n], // 0n is BigInt(0)
      });
      
      // 3. (Optional but Recommended) Get up-to-date gas prices
      const fee = await pimlicoClient.getUserOperationGasPrice();

      // 4. Send the User Operation using the simplified API
      // This single function handles nonce, gas estimation, initCode, signing, and sending.
      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [
          {
            to: validatedTokenAddress,
            data: approveCallData,
            value: 0n, // No ETH is being sent, only calling a function
          }
        ],
        // Pass the fetched gas prices
        maxFeePerGas: fee.fast.maxFeePerGas,
        maxPriorityFeePerGas: fee.fast.maxPriorityFeePerGas,
      });

      setStatus({ type: 'loading', message: `Transaction sent! Waiting for confirmation... Hash: ${userOpHash}` });

      // 5. Wait for the receipt
      const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      setStatus({ type: 'success', message: `Revocation successful! Transaction Hash: ${receipt.transactionHash}` });
    } catch (error: any) {
      console.error('Failed to send UserOperation:', error);
      const message = error.shortMessage || error.message || 'An unknown error occurred.';
      setStatus({ type: 'error', message });
    }
  };

  if (!smartAccount) {
    return (
      <div className="mt-8 text-center text-gray-600">
        <p>Please connect your wallet and set up your Smart Account to use revocation features.</p>
      </div>
    );
  }

  // --- JSX for the component (unchanged) ---
  return (
    <div className="mt-8 p-6 border rounded-lg shadow-md bg-white w-full max-w-2xl mx-auto text-left">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Revoke ERC20 Approval</h3>
      <div className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Token Address (e.g., 0x...)"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value.trim())}
          className="p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          placeholder="Spender Address (e.g., 0x...)"
          value={spenderAddress}
          onChange={(e) => setSpenderAddress(e.target.value.trim())}
          className="p-2 border rounded-md focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleRevoke}
          disabled={status.type === 'loading'}
          className={`px-6 py-3 rounded text-white font-bold transition ${
            status.type === 'loading'
              ? 'bg-gray-500 cursor-wait animate-pulse'
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {status.type === 'loading' ? 'Processing...' : 'Revoke Approval'}
        </button>
      </div>
      {status.message && (
        <div className={`mt-4 p-3 rounded-md text-sm break-words ${
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

export default RevokeERC20Page;