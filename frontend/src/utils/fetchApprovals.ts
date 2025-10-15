import { isAddress } from 'viem';

const INDEXER_URL = import.meta.env.VITE_INDEXER_URL as string;

// --- Type Definitions ---
export interface Approval {
  id: string;
  tokenAddress: `0x${string}`;
  spender: `0x${string}`;
  owner: `0x${string}` | null;
  amount: string;
  blockTimestamp?: string | null;
}

export interface SpenderStats {
  spender: `0x${string}`;
  count: number;
}

// --- FIXED FUNCTION for Revoke Panel ---
// The GraphQL query now ONLY fetches by the 'owner' field.
export const fetchApprovalsByAddress = async (address: string): Promise<Approval[]> => {
    if (!isAddress(address)) {
        throw new Error("Invalid address provided.");
    }

    const query = {
        query: `
            query GetApprovalsForOwner($addr: String!) {
                Approval(
                    where: {
                        owner: { _eq: $addr },
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
    if (result.errors) {
        throw new Error(`GraphQL Error: ${result.errors[0].message}`);
    }

    return result?.data?.Approval ?? [];
};


// --- UNCHANGED: Function for Latest Global Approvals ---
export const fetchLatestGlobalApprovals = async (limit: number = 5): Promise<Approval[]> => {
  const query = {
    query: `
      query GetLatestApprovals($limit: Int!) {
        Approval(
          order_by: { blockTimestamp: desc },
          limit: $limit,
          where: { amount: { _gt: "0" } }
        ) {
          id owner spender tokenAddress amount blockTimestamp
        }
      }
    `,
    variables: { limit },
  };

  const response = await fetch(INDEXER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });

  if (!response.ok) throw new Error("Failed to fetch latest approvals from indexer");
  const result = await response.json();
  if (result.errors) throw new Error(`GraphQL Error: ${result.errors[0].message}`);
  return result?.data?.Approval ?? [];
};

// --- UNCHANGED: Function for Popular Spenders ---
export const fetchPopularSpenders = async (scanLimit: number = 1000, resultLimit: number = 5): Promise<SpenderStats[]> => {
  const query = {
    query: `
      query GetRecentApprovalsForSpenderScan($limit: Int!) {
        Approval(
          order_by: { blockTimestamp: desc },
          limit: $limit,
          where: { amount: { _gt: "0" } }
        ) {
          spender
        }
      }
    `,
    variables: { limit: scanLimit },
  };

  const response = await fetch(INDEXER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(query),
  });

  if (!response.ok) throw new Error("Failed to fetch data for spender analysis");
  const result = await response.json();
  if (result.errors) throw new Error(`GraphQL Error: ${result.errors[0].message}`);
  const approvals: { spender: `0x${string}` }[] = result?.data?.Approval ?? [];

  const spenderCounts = new Map<`0x${string}`, number>();
  for (const approval of approvals) {
    spenderCounts.set(approval.spender, (spenderCounts.get(approval.spender) || 0) + 1);
  }

  const sortedSpenders = Array.from(spenderCounts.entries())
    .map(([spender, count]) => ({ spender, count }))
    .sort((a, b) => b.count - a.count);

  return sortedSpenders.slice(0, resultLimit);
};