import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TransactionRow from '../components/dashboard/TransactionRow';

const StatCard = ({ label, value, sub, color = 'blue', icon }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      <span className="text-xl">{icon}</span>
    </div>
    <p className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function UserDashboard() {
  const { user, updateUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionAPI.getHistory({ page: 1, limit: 5 })
      .then(res => setTransactions(res.data.data.transactions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            Account: <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{user?.accountNumber}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Available Balance"
            value={formatCurrency(user?.balance ?? 0)}
            sub="Updated just now"
            color="blue"
            icon="💰"
          />
          <StatCard
            label="Recent Transactions"
            value={transactions.length}
            sub="Last 5 shown below"
            color="green"
            icon="📋"
          />
          <StatCard
            label="Account Status"
            value="Active"
            sub="All systems normal"
            color="green"
            icon="✅"
          />
        </div>

        {/* Quick actions */}
        <div className="card p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { to: '/transfer', label: 'Send Money', icon: '💸', color: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
              { to: '/history',  label: 'View History', icon: '📊', color: 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400' },
            ].map(({ to, label, icon, color }) => (
              <Link key={to} to={to}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl transition-all duration-150 ${color}`}>
                <span className="text-2xl">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="card">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
            <Link to="/history" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <LoadingSpinner />
            ) : transactions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-3xl mb-2">📭</p>
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              transactions.map(tx => (
                <TransactionRow key={tx._id} tx={tx} currentUserId={user?._id || user?.id} />
              ))
            )}
          </div>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <span className="text-base mt-0.5">🔒</span>
          <p>SecureBank will never ask for your password via email or phone. Session auto-expires after 15 minutes of inactivity.</p>
        </div>
      </div>
    </Layout>
  );
}
