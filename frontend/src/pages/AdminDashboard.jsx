import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const KpiCard = ({ label, value, icon, color, sub }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</span>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${color}`}>
        {icon}
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getDashboard(), adminAPI.getAlerts()])
      .then(([statsRes, alertsRes]) => {
        setStats(statsRes.data.data);
        setRecentAlerts(alertsRes.data.data.flaggedTransactions.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatUSD = (n) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  if (loading) return <Layout><LoadingSpinner /></Layout>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {stats?.flaggedCount > 0 && (
            <Link to="/admin/alerts"
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition">
              🚨 {stats.flaggedCount} Alert{stats.flaggedCount !== 1 ? 's' : ''}
            </Link>
          )}
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total Users"
            value={stats?.totalUsers?.toLocaleString() ?? '—'}
            icon="👥"
            color="bg-blue-100 dark:bg-blue-900/30"
            sub="Registered accounts"
          />
          <KpiCard
            label="Total Volume"
            value={formatUSD(stats?.totalVolume ?? 0)}
            icon="💰"
            color="bg-green-100 dark:bg-green-900/30"
            sub="Completed transfers"
          />
          <KpiCard
            label="Today's Transactions"
            value={stats?.todayTransactions?.toLocaleString() ?? '—'}
            icon="📊"
            color="bg-purple-100 dark:bg-purple-900/30"
            sub="Across all accounts"
          />
          <KpiCard
            label="Flagged Alerts"
            value={stats?.flaggedCount ?? 0}
            icon="🚨"
            color={stats?.flaggedCount > 0 ? 'bg-red-100 dark:bg-red-900/30' : 'bg-gray-100 dark:bg-gray-800'}
            sub="Require review"
          />
        </div>

        {/* Quick nav cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              to: '/admin/users',
              title: 'User Management',
              desc: 'View, search, and suspend user accounts.',
              icon: '👥',
              color: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20',
            },
            {
              to: '/admin/alerts',
              title: 'Fraud Alerts',
              desc: 'Review flagged transactions and suspicious activity.',
              icon: '🚨',
              color: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/20',
            },
          ].map(({ to, title, desc, icon, color }) => (
            <Link key={to} to={to}
              className={`card p-5 transition-all duration-150 border ${color}`}>
              <div className="flex items-start gap-4">
                <span className="text-3xl">{icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent flagged transactions */}
        {recentAlerts.length > 0 && (
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Alerts</h2>
              <Link to="/admin/alerts" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                View all →
              </Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {recentAlerts.map(tx => (
                <div key={tx._id} className="px-5 py-4 flex items-center gap-4">
                  <span className="text-xl flex-shrink-0">🚨</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tx.sender?.name} → {tx.receiver?.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{tx.flagReason}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400">
                      ${tx.amount?.toLocaleString()}
                    </p>
                    <span className="badge-danger text-xs">flagged</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System health */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">System Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'API Status',      status: 'Operational', color: 'badge-success' },
              { label: 'Database',        status: 'Connected',   color: 'badge-success' },
              { label: 'Fraud Engine',    status: 'Active',      color: 'badge-success' },
            ].map(({ label, status, color }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                <span className={color}>{status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
