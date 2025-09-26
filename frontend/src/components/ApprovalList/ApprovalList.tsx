// ApprovalList.tsx
import React from 'react';
import ApprovalItem from './ApprovalItem';

interface Approval {
  token: string;
  spender: string;
  amount: string;
}

interface ApprovalListProps {
  approvals: Approval[];
  onRevoke: (index: number) => void;
}

const ApprovalList: React.FC<ApprovalListProps> = ({ approvals, onRevoke }) => (
  <div className="approval-list">
    {approvals.map((approval, idx) => (
      <ApprovalItem
        key={idx}
        token={approval.token}
        spender={approval.spender}
        amount={approval.amount}
        onRevoke={() => onRevoke(idx)}
      />
    ))}
  </div>
);

export default ApprovalList;
