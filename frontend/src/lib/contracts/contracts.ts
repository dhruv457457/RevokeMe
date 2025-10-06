// ../lib/contracts/contracts.ts
export const revocationModuleAddress = '0x48C801c7a52DfD092686ba97781E198A80dEa566' as `0x${string}`;
export const revocationModuleFactoryAddress = '0x3833502FF256aa1D9B19Aea5a62Aa86B4283Ce75' as `0x${string}`;

export const revocationModuleAbi = [
  {
    inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'agentAddress', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'enabled', type: 'bool' },
    ],
    name: 'AgentUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'token', type: 'address' },
      { indexed: true, internalType: 'address', name: 'spender', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'success', type: 'bool' },
      { indexed: false, internalType: 'bytes', name: 'returnData', type: 'bytes' },
    ],
    name: 'ERC20Revoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'token', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'bool', name: 'success', type: 'bool' },
      { indexed: false, internalType: 'bytes', name: 'returnData', type: 'bytes' },
    ],
    name: 'ERC721ApprovalRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'token', type: 'address' },
      { indexed: true, internalType: 'address', name: 'operator', type: 'address' },
      { indexed: false, internalType: 'bool', name: 'success', type: 'bool' },
      { indexed: false, internalType: 'bytes', name: 'returnData', type: 'bytes' },
    ],
    name: 'OperatorRevoked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
    ],
    name: 'OwnerTransferred',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'agent',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address[]', name: 'tokens', type: 'address[]' },
      { internalType: 'address[]', name: 'spenders', type: 'address[]' },
    ],
    name: 'batchRevokeERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'operator', type: 'address' },
    ],
    name: 'revokeERC1155Operator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'revokeERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    name: 'revokeERC721Approval',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'address', name: 'operator', type: 'address' },
    ],
    name: 'revokeERC721Operator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_agent', type: 'address' },
      { internalType: 'bool', name: '_enabled', type: 'bool' },
    ],
    name: 'setAgent',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  { stateMutability: 'payable', type: 'receive' },
];

export const revocationModuleFactoryAbi=[
	{
		"inputs": [],
		"name": "createModule",
		"outputs": [
			{
				"internalType": "address",
				"name": "moduleAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "moduleAddress",
				"type": "address"
			}
		],
		"name": "ModuleCreated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "getModule",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]