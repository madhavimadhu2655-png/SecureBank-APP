import React from 'react';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const map = {
    completed: 'badge-success',
    pending:   'badge-warning',
    failed:    'badge-danger',
    flagged:   'badge-danger',
  };
  return <span className={map[status] || 'badge-info'}>{status}</span>;
};

export default function TransactionRow({ tx, currentUserId, showFull = false }) {
  const isSender = String(tx.sender?._id || tx.sender) === String(currentUserId);
  const counterparty = isSender ? tx.receiver : tx.sender;
  const sign = isSender ? '-' : '+';
  const amountColor = isSender
    ? 'text-red-600 dark:text-red-400'
    : 'text-green-600 dark:text-green-400';

  const formatUSD = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const formattedDate = tx.createdAt
    ? format(new Date(tx.createdAt), showFull ? 'MMM d, yyyy h:mm a' : 'MMM d')
    : '—';

  if (!showFull) {
    // Compact version for dashboard
    return (
      <div className="flex items-center gap-3 px-5 py-4">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
          ${isSender ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
          {isSender ? '↑' : '↓'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {isSender ? 'Sent to' : 'From'} {counterparty?.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-400">{formattedDate}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-sm font-semibold ${amountColor}`}>
            {sign}{formatUSD(tx.amount)}
          </p>
          <StatusBadge status={tx.status} />
        </div>
      </div>
    );
  }

  // Full version for history page (grid layout matching header)
  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Counterparty */}
      <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0
          ${isSender ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
          {isSender ? '↑' : '↓'}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {counterparty?.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-400 font-mono truncate">
            {counterparty?.accountNumber}
          </p>
        </div>
      </div>

      {/* Amount */}
      <div className={`col-span-6 sm:col-span-2 text-right text-sm font-semibold ${amountColor}`}>
        {sign}{formatUSD(tx.amount)}
      </div>

      {/* Status */}
      <div className="col-span-6 sm:col-span-2 flex sm:justify-center">
        <StatusBadge status={tx.status} />
        {tx.isFlagged && <span className="ml-1 text-xs">🚨</span>}
      </div>

      {/* Note */}
      <div className="col-span-6 sm:col-span-2 text-xs text-gray-400 truncate">
        {tx.note || '—'}
      </div>

      {/* Date */}
      <div className="col-span-6 sm:col-span-2 text-right text-xs text-gray-400">
        {formattedDate}
      </div>
    </div>
  );
}
