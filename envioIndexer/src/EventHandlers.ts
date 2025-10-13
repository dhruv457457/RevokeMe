import { ERC20, Approval } from "generated";

ERC20.Approval.handler(
  async ({ event, context }) => {
    const owner = event.params.owner.toLowerCase();
    const spender = event.params.spender.toLowerCase();
    const tokenAddress = event.srcAddress.toLowerCase();

    const approvalId = `${tokenAddress}-${owner}-${spender}`;

    const approvalEntity: Approval = {
      id: approvalId,
      tokenAddress,
      owner,
      spender,
      amount: event.params.value,
      blockTimestamp: BigInt(event.block.timestamp),
    };

    context.Approval.set(approvalEntity);
  },
  { wildcard: true }
);
