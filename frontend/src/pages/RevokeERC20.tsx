import React, { useState } from 'react';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { encodeFunctionData, isAddress, getAddress } from 'viem';

const entryPointAbi = [
  {
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'key', type: 'uint192' },
    ],
    name: 'getNonce',
    outputs: [{ name: 'nonce', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const smartAccountAbi = [
  {
    inputs: [
      { name: 'target', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'data', type: 'bytes' },
    ],
    name: 'execute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

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

const RevokeERC20Page: React.FC = () => {
  const { smartAccount, bundlerClient, publicClient } = useSmartAccount();

  const [tokenAddress, setTokenAddress] = useState('');
  const [spenderAddress, setSpenderAddress] = useState('');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleRevoke = async () => {
    if (!smartAccount || !bundlerClient || !publicClient) {
      setStatus({ type: 'error', message: 'Clients not ready. Please ensure your wallet is connected.' });
      return;
    }

    let validatedTokenAddress: `0x${string}`;
    let validatedSpenderAddress: `0x${string}`;
    try {
      if (!isAddress(tokenAddress)) {
        throw new Error('Invalid token address: Must be a valid 40-character hex address');
      }
      if (!isAddress(spenderAddress)) {
        throw new Error('Invalid spender address: Must be a valid 40-character hex address');
      }
      validatedTokenAddress = getAddress(tokenAddress) as `0x${string}`;
      validatedSpenderAddress = getAddress(spenderAddress) as `0x${string}`;
      console.log('Validated Token Address:', validatedTokenAddress);
      console.log('Validated Spender Address:', validatedSpenderAddress);
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message || 'Invalid address format' });
      return;
    }

    setStatus({ type: 'loading', message: 'Preparing transaction...' });

    try {
      console.log('SmartAccount:', smartAccount);
      const entryPointAddress = smartAccount.entryPoint.address;
      console.log('EntryPoint Address:', entryPointAddress);

      // Fetch nonce with error handling
      let nonce: bigint;
      try {
        nonce = await publicClient.readContract({
          address: entryPointAddress as `0x${string}`,
          abi: entryPointAbi,
          functionName: 'getNonce',
          args: [smartAccount.address as `0x${string}`, BigInt(0)],
        });
      } catch (error: any) {
        console.error('Failed to fetch nonce:', error);
        setStatus({ type: 'error', message: 'Failed to fetch nonce from EntryPoint. Check RPC connection.' });
        return;
      }

      // Handle initCode with robust fallback
      let initCode: `0x${string}` = '0x'; // Assume deployed if check fails
      try {
        const isDeployed = await smartAccount.isDeployed();
        if (!isDeployed) {
          try {
            const factoryArgs = await smartAccount.getFactoryArgs();
            if (factoryArgs && factoryArgs.factory && factoryArgs.initData) {
              initCode = `0x${factoryArgs.factory.slice(2)}${factoryArgs.initData.slice(2)}` as `0x${string}`;
            } else {
              console.warn('Factory args incomplete, using default initCode');
            }
          } catch (factoryError: any) {
            console.warn('Failed to get factory args, assuming account is deployed. Error:', factoryError);
          }
        }
      } catch (deployError: any) {
        console.warn('Deployment check failed, assuming account is deployed. Error:', deployError);
      }
      console.log('InitCode:', initCode);

      const callData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [validatedSpenderAddress, BigInt(0)],
      });

      const executeCallData = encodeFunctionData({
        abi: smartAccountAbi,
        functionName: 'execute',
        args: [validatedTokenAddress, BigInt(0), callData],
      });

      const userOp = {
        sender: smartAccount.address as `0x${string}`,
        nonce,
        initCode,
        callData: executeCallData,
        paymasterAndData: '0x' as `0x${string}`,
        callGasLimit: BigInt(0),
        verificationGasLimit: BigInt(0),
        preVerificationGas: BigInt(0),
        maxFeePerGas: BigInt(0),
        maxPriorityFeePerGas: BigInt(0),
        signature: '0x' as `0x${string}`,
      };

      console.log('UserOperation before estimation:', userOp); // Debug log

      // Manually construct estimation params without factory or factoryData
      const estimationParams = {
        userOperation: {
          sender: userOp.sender,
          nonce: userOp.nonce,
          initCode: userOp.initCode,
          callData: userOp.callData, // Explicitly set callData
          paymasterAndData: userOp.paymasterAndData,
          callGasLimit: userOp.callGasLimit,
          verificationGasLimit: userOp.verificationGasLimit,
          preVerificationGas: userOp.preVerificationGas,
          maxFeePerGas: userOp.maxFeePerGas,
          maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
          signature: userOp.signature,
        },
        entryPoint: entryPointAddress as `0x${string}`,
        account: smartAccount,
      };

      console.log('Estimation params:', estimationParams); // Debug log

      if (!bundlerClient) throw new Error('Bundler client not available');
      const gasLimits = await bundlerClient.estimateUserOperationGas(estimationParams);
      const gasPrice = await publicClient.estimateFeesPerGas();

      userOp.callGasLimit = gasLimits.callGasLimit;
      userOp.verificationGasLimit = gasLimits.verificationGasLimit;
      userOp.preVerificationGas = gasLimits.preVerificationGas;
      userOp.maxFeePerGas = gasPrice.maxFeePerGas!;
      userOp.maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas!;
      
      console.log('Signing UserOperation:', userOp);

      const signature = await smartAccount.signUserOperation(userOp);
      userOp.signature = signature;

      const userOpHash = await bundlerClient.sendUserOperation({
        userOperation: userOp,
        entryPoint: entryPointAddress as `0x${string}`,
      });

      setStatus({ type: 'loading', message: `Transaction sent! Waiting for confirmation... Hash: ${userOpHash}` });
      console.log('UserOperation sent. Hash:', userOpHash);

      const { receipt } = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      setStatus({ type: 'success', message: `Revocation successful! Transaction Hash: ${receipt.transactionHash}` });
      console.log('Transaction confirmed:', receipt.transactionHash);
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