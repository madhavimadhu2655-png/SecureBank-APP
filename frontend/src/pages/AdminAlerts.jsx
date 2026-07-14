import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminAlerts() {
  const [data, setData] = useState({ flaggedTransactions: [], criticalLogs: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('transactions');
  const [resolving, setResolving] = useState(null);

  const fetchAlerts = () => {
    setLoading(true);
    adminAPI.getAlerts()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load alerts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleResolve = async (txId, action) => {
    if (!confirm(`${action === 'approve' ? 'Approve' : 'Reject'} this transaction?`)) return;
    setResolving(txId);
    try {
      await adminAPI.resolveAlert(txId, { action });
      toast.success(`Transaction ${action}d`);
      fetchAlerts();
    } catch {
      toast.error('Failed to resolve alert');
    } finally {
      setResolving(null);
    }
  };

  const formatUSD = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const formatDt = (d) =>
    d ? format(new Date(d), 'MMM d, yyyy h:mm a') : '—';

  const { flaggedTransactions, criticalLogs, summary } = data;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto animate-fade-in space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fraud Alerts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Review and resolve suspicious activity
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Flagged Txns',      value: summary.totalFlagged ?? 0,  color: 'text-red-600 dark:text-red-400' },
            { label: 'Failed Txns',       value: summary.totalFailed ?? 0,   color: 'text-orange-600 dark:text-orange-400' },
            { label: 'Suspended Users',   value: summary.suspendedUsers ?? 0, color: 'text-purple-600 dark:text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
          {['transactions', 'logs'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab === 'transactions'
                ? `🚨 Flagged (${flaggedTransactions.length})`
                : `📋 Critical Logs (${criticalLogs.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card overflow-hidden">
          {loading ? (
            <LoadingSpinner />
          ) : activeTab === 'transactions' ? (
            flaggedTransactions.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-sm font-medium">No flagged transactions</p>
                <p className="text-xs mt-1">All clear — no suspicious activity detected</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* Column headers */}
                <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-3">From → To</div>
                  <div className="col-span-2 text-right">Amount</div>
                  <div className="col-span-4">Flag Reason</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>

                {flaggedTransactions.map(tx => (
                  <div key={tx._id} className="grid grid-cols-12 gap-3 px-5 py-4 items-start hover:bg-red-50/50 dark:hover:bg-red-900/5 transition-colors">
                    {/* Parties */}
                    <div className="col-span-12 md:col-span-3">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[80px]">
                          {tx.sender?.name}
                        </span>
                        <span className="text-gray-400 flex-shrink-0">→</span>
                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-[80px]">
                          {tx.receiver?.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                        {tx.sender?.accountNumber}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="col-span-4 md:col-span-2 text-right">
                      <p className="text-sm font-bold text-red-600 dark:text-red-400">
                        {formatUSD(tx.amount)}
                      </p>
                    </div>

                    {/* Reason */}
                    <div className="col-span-8 md:col-span-4">
                      <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                        ⚠️ {tx.flagReason || 'Suspicious activity'}
                      </p>
                    </div>

                    {/* Date */}
                    <div className="col-span-8 md:col-span-2 text-xs text-gray-400">
                      {formatDt(tx.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="col-span-4 md:col-span-1 flex flex-col gap-1.5 items-end">
                      <button
                        onClick={() => handleResolve(tx._id, 'approve')}
                        disabled={resolving === tx._id}
                        className="text-xs px-2.5 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 font-medium disabled:opacity-50 transition-colors w-full text-center"
                      >
                        {resolving === tx._id ? '…' : '✓ OK'}
                      </button>
                      <button
                        onClick={() => handleResolve(tx._id, 'reject')}
                        disabled={resolving === tx._id}
                        className="text-xs px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 font-medium disabled:opacity-50 transition-colors w-full text-center"
                      >
                        {resolving === tx._id ? '…' : '✗ Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Critical logs tab
            criticalLogs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-sm">No critical logs</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {criticalLogs.map(log => (
                  <div key={log._id} className="px-5 py-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-sm flex-shrink-0">
                      🔴
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{log.action}</p>
                        <span className="badge-danger text-xs">{log.severity}</span>
                        {!log.success && <span className="badge-warning text-xs">Failed</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {log.userId?.name || 'Unknown user'} · IP: {log.ipAddress}
                      </p>
                      {log.details && (
                        <p className="text-xs text-gray-400 mt-1 font-mono truncate">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 flex-shrink-0">{formatDt(log.createdAt)}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
}
