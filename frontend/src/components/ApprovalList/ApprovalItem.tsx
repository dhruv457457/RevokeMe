// ApprovalItem.tsx
import React from 'react';

interface ApprovalItemProps {
  token: string;
  spender: string;
  amount: string;
  onRevoke: () => void;
}

const ApprovalItem: React.FC<ApprovalItemProps> = ({ token, spender, amount, onRevoke }) => (
  <div className="approval-item">
    <span>Token: {token}</span>
    <span>Spender: {spender}</span>
    <span>Amount: {amount}</span>
    <button onClick={onRevoke}>Revoke</button>
  </div>
);

export default ApprovalItem;
