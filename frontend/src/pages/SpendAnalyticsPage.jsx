import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { key: 'food',      label: 'Food & Dining',   icon: '🍔', color: '#EF4444' },
  { key: 'bills',     label: 'Bills & Recharge', icon: '⚡', color: '#F59E0B' },
  { key: 'shopping',  label: 'Shopping',         icon: '🛒', color: '#8B5CF6' },
  { key: 'transport', label: 'Transport',        icon: '🚇', color: '#3B82F6' },
  { key: 'health',    label: 'Health',           icon: '🏥', color: '#10B981' },
  { key: 'transfer',  label: 'Transfers',        icon: '💸', color: '#6366F1' },
  { key: 'other',     label: 'Other',            icon: '📦', color: '#94A3B8' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Generate mock monthly data
const genMonthData = () => Array.from({ length: 6 }, (_, i) => ({
  month: MONTHS[(new Date().getMonth() - 5 + i + 12) % 12],
  spent: Math.floor(3000 + Math.random() * 12000),
  received: Math.floor(5000 + Math.random() * 20000),
}));

const genCategoryData = (total) => {
  const splits = [0.3, 0.2, 0.18, 0.12, 0.08, 0.07, 0.05];
  return CATEGORIES.map((c, i) => ({ ...c, amount: Math.floor(total * splits[i]) }));
};

export default function SpendAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('overview'); // overview | category | monthly
  const [period, setPeriod] = useState('month'); // week | month | year
  const [monthData] = useState(genMonthData);
  const canvasRef = useRef(null);

  const totalSpent = monthData[monthData.length - 1].spent;
  const totalReceived = monthData[monthData.length - 1].received;
  const categories = genCategoryData(totalSpent);
  const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  // Draw bar chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    ctx.clearRect(0, 0, W, H);

    const maxVal = Math.max(...monthData.map(m => Math.max(m.spent, m.received)));
    const barW = 18, gap = (W - 60) / monthData.length;
    const chartH = H - 40;

    monthData.forEach((m, i) => {
      const x = 30 + i * gap + gap / 2;
      const spentH = (m.spent / maxVal) * chartH;
      const recvH  = (m.received / maxVal) * chartH;

      // Received bar (green)
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.roundRect(x - barW - 2, chartH - recvH + 10, barW, recvH, [3, 3, 0, 0]);
      ctx.fill();

      // Spent bar (red)
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(x + 2, chartH - spentH + 10, barW, spentH, [3, 3, 0, 0]);
      ctx.fill();

      // Month label
      ctx.fillStyle = dark ? '#9CA3AF' : '#6B7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(m.month, x + barW / 2, H - 4);
    });
  }, [monthData]);

  const savingsRate = Math.round(((totalReceived - totalSpent) / totalReceived) * 100);
  const maxCat = Math.max(...categories.map(c => c.amount));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Spend Analytics</h1>
        </div>
        {/* Period selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {['week','month','year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize ${period === p ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Spent', val: totalSpent, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', icon: '📤' },
            { label: 'Received',    val: totalReceived, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10', icon: '📥' },
            { label: 'Saved',       val: savingsRate + '%', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/10', icon: '💰', noFormat: true },
          ].map(({ label, val, color, bg, icon, noFormat }) => (
            <div key={label} className={`${bg} rounded-2xl p-3 text-center`}>
              <div className="text-xl mb-1">{icon}</div>
              <p className={`font-bold text-sm ${color}`}>{noFormat ? val : formatINR(val)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Income vs Spending</p>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block"></span>Income</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block"></span>Spent</span>
            </div>
          </div>
          <canvas ref={canvasRef} width={340} height={160} style={{ width: '100%' }} />
        </div>

        {/* Category breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Spending by Category</p>
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{cat.icon}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{cat.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatINR(cat.amount)}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(cat.amount / maxCat) * 100}%`, background: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-3">💡 Insights</p>
          <div className="space-y-2">
            {[
              { icon: '🍔', text: `Food spending is ${Math.round((categories[0].amount / totalSpent) * 100)}% of your budget — highest category`, color: 'bg-red-50 dark:bg-red-900/10' },
              { icon: '📈', text: `You saved ${savingsRate}% this month — ${savingsRate > 20 ? 'great job! 🎉' : 'try to save more next month'}`, color: 'bg-green-50 dark:bg-green-900/10' },
              { icon: '⚡', text: 'Your bill payments are on track — no late fees detected', color: 'bg-blue-50 dark:bg-blue-900/10' },
            ].map(({ icon, text, color }, i) => (
              <div key={i} className={`${color} rounded-xl p-3 flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300`}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
