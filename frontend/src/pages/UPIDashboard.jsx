import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';

const QuickAction = ({ icon, label, to, color }) => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${color} hover:opacity-90 active:scale-95 transition-all duration-150`}>
      <span className="text-2xl lg:text-3xl">{icon}</span>
      <span className="text-xs font-semibold text-center leading-tight">{label}</span>
    </button>
  );
};

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 flex items-start justify-between">
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
    <div className="text-3xl opacity-80">{icon}</div>
  </div>
);

export default function UPIDashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    transactionAPI.getHistory({ page: 1, limit: 5 })
      .then(r => setTransactions(r.data.data.transactions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">

        {/* ── WELCOME HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Account: <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{user?.accountNumber}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/upi/qr-scanner"
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium text-sm transition">
              📷 Scan & Pay
            </Link>
            <Link to="/ai-assistant"
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm transition">
              🤖 AI Assistant
            </Link>
          </div>
        </div>

        {/* ── BALANCE + STATS GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Main balance card */}
          <div className="sm:col-span-2 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-200 text-sm font-medium">Available Balance</p>
                <button onClick={() => setShowBalance(s => !s)} className="text-purple-200 hover:text-white transition text-sm">
                  {showBalance ? '👁 Hide' : '🙈 Show'}
                </button>
              </div>
              <p className="text-4xl font-bold tracking-tight">
                {showBalance ? formatINR(user?.balance ?? 0) : '₹ ••••••'}
              </p>
              <p className="text-purple-200 text-xs mt-2">UPI: {user?.accountNumber}@securebank</p>
              <div className="flex gap-3 mt-4">
                <Link to="/upi/send"
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition">
                  💸 Send
                </Link>
                <Link to="/upi/request"
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition">
                  📥 Request
                </Link>
                <Link to="/history"
                  className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition">
                  📋 History
                </Link>
              </div>
            </div>
          </div>

          <StatCard label="Wallet Balance" value={formatINR(1250)} icon="👛" color="text-blue-600 dark:text-blue-400" sub="Tap to add money" />
          <StatCard label="Account Status"  value="Active"         icon="✅" color="text-green-600 dark:text-green-400" sub="All systems normal" />
        </div>

        {/* ── QUICK ACTIONS GRID ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="font-bold text-gray-900 dark:text-white text-base mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            <QuickAction icon="📱" label="Recharge"     to="/bills/recharge"     color="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" />
            <QuickAction icon="⚡" label="Electricity"  to="/bills/electricity"  color="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" />
            <QuickAction icon="🌊" label="Water"        to="/bills/water"        color="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400" />
            <QuickAction icon="🛢️" label="Gas/LPG"      to="/bills/gas"          color="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400" />
            <QuickAction icon="📡" label="DTH"          to="/bills/dth"          color="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" />
            <QuickAction icon="📶" label="Broadband"    to="/bills/broadband"    color="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400" />
            <QuickAction icon="💳" label="Credit Card"  to="/bills/credit-card"  color="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" />
            <QuickAction icon="🚇" label="Metro"        to="/bills/metro"        color="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400" />
            <QuickAction icon="✈️" label="Flights"      to="/bills/flights"      color="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400" />
            <QuickAction icon="🏨" label="Hotels"       to="/bills/hotels"       color="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400" />
            <QuickAction icon="🛡️" label="Insurance"   to="/insurance"          color="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" />
            <QuickAction icon="📈" label="Invest"       to="/mutual-funds"       color="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400" />
            <QuickAction icon="🪙" label="Gold"         to="/gold"               color="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" />
            <QuickAction icon="🎬" label="Tickets"      to="/tickets"            color="bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400" />
            <QuickAction icon="🤝" label="Split"        to="/split"              color="bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400" />
            <QuickAction icon="⋯" label="More"          to="/nearby"             color="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" />
          </div>
        </div>

        {/* ── TWO COLUMN ON DESKTOP ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent transactions */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
              <Link to="/history" className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium">View all →</Link>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? <LoadingSpinner /> : transactions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-3xl mb-2">📭</p>
                  <p className="text-sm">No transactions yet</p>
                </div>
              ) : transactions.map(tx => {
                const isSender = String(tx.sender?._id || tx.sender) === String(user?._id || user?.id);
                const other = isSender ? tx.receiver : tx.sender;
                return (
                  <div key={tx._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${isSender ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}>
                      {isSender ? '↑' : '↓'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{isSender ? 'Sent to' : 'From'} {other?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <p className={`font-bold text-sm ${isSender ? 'text-red-500' : 'text-green-500'}`}>
                      {isSender ? '-' : '+'}{formatINR(tx.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Offers + Links */}
          <div className="space-y-4">
            {/* Offers */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="font-bold text-gray-900 dark:text-white mb-3">Offers & Rewards</h2>
              <div className="space-y-3">
                {[
                  { emoji:'🎁', title:'5% Cashback on Jio Recharge', desc:'Min ₹199 · 3 days left', color:'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
                  { emoji:'⚡', title:'₹50 Off on Electricity Bill',  desc:'Min ₹500 · 5 days left', color:'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800' },
                  { emoji:'🃏', title:'Scratch Card Waiting!',        desc:'Pay and win rewards',     color:'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' },
                ].map(({ emoji, title, desc, color }) => (
                  <Link key={title} to="/rewards"
                    className={`flex items-center gap-3 p-3 rounded-xl border ${color} hover:opacity-90 transition`}>
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Security notice */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl text-sm text-amber-700 dark:text-amber-400">
              <span className="text-base mt-0.5 flex-shrink-0">🔒</span>
              <p>SecureBank will never ask for your password via email or phone. Session auto-expires after 15 minutes of inactivity.</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
