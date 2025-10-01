import React, { useState } from 'react';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { useAccount, useWriteContract } from 'wagmi';
import { encodeFunctionData, isAddress, getAddress, parseEther } from 'viem';
import { createPimlicoClient } from 'permissionless/clients/pimlico';
import { http } from "viem";

const erc20Abi = [ { inputs: [ { name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }, ], name: 'approve', outputs: [{ name: '', type: 'bool' }], stateMutability: 'nonpayable', type: 'function', } ] as const;

const PIMLICO_API_KEY = import.meta.env.VITE_PIMLICO_API_KEY;
const pimlicoClient = createPimlicoClient({
  transport: http(`https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${PIMLICO_API_KEY}`),
});

const ApproveERC20Page: React.FC = () => {
  const { smartAccount, bundlerClient } = useSmartAccount();
  const { address: eoaAddress } = useAccount();
  const { writeContractAsync } = useWriteContract();
  
  const [tokenAddress, setTokenAddress] = useState('');
  const [spenderAddress, setSpenderAddress] = useState('');
  const [approveAmount, setApproveAmount] = useState('100'); // Default to 100
  const [accountType, setAccountType] = useState<'smart' | 'eoa'>('smart');
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleApprove = async () => {
    let validatedTokenAddress: `0x${string}`;
    let validatedSpenderAddress: `0x${string}`;
    let amountAsBigInt: bigint;
    try {
      if (!isAddress(tokenAddress) || !isAddress(spenderAddress)) throw new Error('Invalid address format.');
      validatedTokenAddress = getAddress(tokenAddress);
      validatedSpenderAddress = getAddress(spenderAddress);
      amountAsBigInt = parseEther(approveAmount); // Converts "100" to 100000000000000000000
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
      return;
    }
    
    setStatus({ type: 'loading', message: `Preparing approval from ${accountType === 'smart' ? 'Smart Account' : 'Main Account'}...` });

    try {
      if (accountType === 'smart') {
        if (!smartAccount || !bundlerClient) throw new Error('Smart Account not ready.');
        const approveCallData = encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [validatedSpenderAddress, amountAsBigInt] });
        const fee = await pimlicoClient.getUserOperationGasPrice();
        const userOpHash = await bundlerClient.sendUserOperation({
          account: smartAccount,
          calls: [{ to: validatedTokenAddress, data: approveCallData, value: BigInt(0) }],
          maxFeePerGas: fee.fast.maxFeePerGas,
          maxPriorityFeePerGas: fee.fast.maxPriorityFeePerGas,
        });
        setStatus({ type: 'loading', message: `Approval sent! Waiting for confirmation... Hash: ${userOpHash}` });
        const { receipt } = await bundlerClient.waitForUserOperationReceipt({ hash: userOpHash });
        setStatus({ type: 'success', message: `Approval successful! Tx Hash: ${receipt.transactionHash}` });
      } else {
        const txHash = await writeContractAsync({
          address: validatedTokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [validatedSpenderAddress, amountAsBigInt],
        });
        setStatus({ type: 'success', message: `Approval successful! Tx Hash: ${txHash}` });
      }
    } catch (error: any) {
      console.error('Failed to send approval:', error);
      setStatus({ type: 'error', message: error.shortMessage || 'Transaction failed.' });
    }
  };

  if (!eoaAddress) return <div className="mt-8 text-center text-gray-600"><p>Please connect your wallet.</p></div>;

  return (
    <div className="mt-8 p-6 border rounded-lg shadow-md bg-white w-full max-w-2xl mx-auto text-left">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Create ERC20 Approval</h3>
      <div className="flex justify-center mb-4 p-1 bg-gray-200 rounded-lg">
        <button onClick={() => setAccountType('smart')} className={`w-1/2 p-2 rounded-md font-semibold transition ${accountType === 'smart' ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-600'}`} disabled={!smartAccount}>Smart Account</button>
        <button onClick={() => setAccountType('eoa')} className={`w-1/2 p-2 rounded-md font-semibold transition ${accountType === 'eoa' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-600'}`}>Main Account (EOA)</button>
      </div>
      <div className="flex flex-col gap-4">
        <input type="text" placeholder="Token Address" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value.trim())} className="p-2 border rounded-md"/>
        <input type="text" placeholder="Spender Address" value={spenderAddress} onChange={(e) => setSpenderAddress(e.target.value.trim())} className="p-2 border rounded-md"/>
        <input type="text" placeholder="Amount to Approve" value={approveAmount} onChange={(e) => setApproveAmount(e.target.value.trim())} className="p-2 border rounded-md"/>
        <button onClick={handleApprove} disabled={status.type === 'loading'} className={`px-6 py-3 rounded text-white font-bold transition ${status.type === 'loading' ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}>
          {status.type === 'loading' ? 'Processing...' : 'Approve Spender'}
        </button>
      </div>
      {status.message && ( <div className={`mt-4 p-3 rounded-md text-sm break-words ${ status.type === 'success' ? 'bg-green-100 text-green-800' : status.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800' }`}> {status.message} </div> )}
    </div>
  );
};

export default ApproveERC20Page;