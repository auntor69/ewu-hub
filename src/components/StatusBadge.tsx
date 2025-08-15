import React from 'react';
import { cn } from '../lib/utils';
import { BookingStatus, PenaltyStatus } from '../lib/types';

interface StatusBadgeProps {
  status: BookingStatus | PenaltyStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusStyles = (status: BookingStatus | PenaltyStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-purple-100 text-purple-800 border-purple-200',
      arrived: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      no_show: 'bg-red-100 text-red-800 border-red-200',
      waived: 'bg-green-100 text-green-800 border-green-200',
      paid: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return styles[status] || styles.pending;
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusStyles(status),
        className
      )}
    >
      {formatStatus(status)}
    </span>
  );
}