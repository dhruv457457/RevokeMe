// utils/fetchApprovals.ts
import { isAddress } from 'viem';

const INDEXER_URL = import.meta.env.VITE_INDEXER_URL as string;

// The Approval type should match all fields returned by the query
export interface Approval {
  id: string;
  tokenAddress: `0x${string}`;
  spender: `0x${string}`;
  owner: `0x${string}` | null;
  amount: string;
  blockTimestamp?: string | null; // Added this back
}

export const fetchApprovals = async (address: string): Promise<Approval[]> => {
    if (!isAddress(address)) {
        throw new Error("Invalid address provided to fetchApprovals");
    }

    // THIS QUERY IS NOW CORRECT and matches your working version.
    const query = {
        query: `
            query GetApprovals($addr: String!) {
              Approval(
                where: { 
                  _or: [
                    { owner: { _eq: $addr }},
                    { spender: { _eq: $addr }}
                  ],
                  amount: { _gt: "0" } 
                },
                order_by: { blockTimestamp: desc }
              ) {
                id owner spender tokenAddress amount blockTimestamp
              }
            }
        `,
        variables: { addr: address.toLowerCase() },
    };

    const response = await fetch(INDEXER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
    });

    if (!response.ok) {
        throw new Error("Failed to fetch from indexer");
    }

    const result = await response.json();
    const raw = result?.data?.Approval ?? [];

    // Also, ensure we filter out any lingering zero-amount approvals client-side as a fallback
    return raw.filter((a: Approval) => {
      try { return BigInt(a.amount) > 0n; }
      catch { return false; }
    });
};