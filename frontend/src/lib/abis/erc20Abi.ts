// lib/abis/erc20Abi.ts
export const erc20Abi = [
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