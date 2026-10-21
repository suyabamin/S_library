import React from 'react';
import { BorrowRequestStatus, BORROW_STATUS_LABELS } from '../../types';

interface StatusBadgeProps {
  status: BorrowRequestStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const meta = BORROW_STATUS_LABELS[status] || {
    label: status,
    color: 'text-gray-700',
    bg: 'bg-gray-100 border-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.bg} ${meta.color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {meta.label}
    </span>
  );
};
