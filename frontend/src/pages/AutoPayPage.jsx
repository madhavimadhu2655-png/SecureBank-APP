import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, addMonths } from 'date-fns';
import toast from 'react-hot-toast';

const MANDATES = [
  { id: 1, name: 'Netflix Subscription',    upi: 'netflix@razorpay', amount: 649,   freq: 'Monthly',  nextDate: addDays(new Date(), 8),  status: 'active',   category: '🎬' },
  { id: 2, name: 'Amazon Prime',            upi: 'amazon@apl',       amount: 179,   freq: 'Monthly',  nextDate: addDays(new Date(), 15), status: 'active',   category: '📦' },
  { id: 3, name: 'Gym Membership',          upi: 'gym@upi',          amount: 2500,  freq: 'Monthly',  nextDate: addDays(new Date(), 22), status: 'paused',   category: '💪' },
  { id: 4, name: 'Insurance Premium',       upi: 'lic@upi',          amount: 5000,  freq: 'Quarterly',nextDate: addMonths(new Date(), 2),status: 'active',   category: '🛡️' },
];

const FREQ_OPTIONS = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'];

export default function AutoPayPage() {
  const navigate    = useNavigate();
  const [mandates, setMandates] = useState(MANDATES);
  const [showNew, setShowNew]   = useState(false);
  const [form, setForm]         = useState({ name: '', upi: '', amount: '', freq: 'Monthly', startDate: format(new Date(), 'yyyy-MM-dd'), maxAmount: '' });
  const [loading, setLoading]   = useState(false);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const monthly   = mandates.filter(m => m.status === 'active').reduce((s, m) => {
    const mul = m.freq === 'Monthly' ? 1 : m.freq === 'Quarterly' ? 1/3 : m.freq === 'Yearly' ? 1/12 : m.freq === 'Weekly' ? 4 : 30;
    return s + m.amount * mul;
  }, 0);

  const toggle = (id) => {
    setMandates(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'paused' : 'active' } : m));
    const m = mandates.find(m => m.id === id);
    toast.success(`${m.name} ${m.status === 'active' ? 'paused' : 'resumed'}`);
  };

  const revoke = (id) => {
    const m = mandates.find(m => m.id === id);
    if (!confirm(`Cancel auto-pay for ${m.name}?`)) return;
    setMandates(prev => prev.filter(m => m.id !== id));
    toast.success('Auto-pay cancelled');
  };

  const createMandate = async () => {
    if (!form.name || !form.upi || !form.amount) { toast.error('Fill required fields'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setMandates(prev => [...prev, {
      id: Date.now(), name: form.name, upi: form.upi, amount: parseFloat(form.amount),
      freq: form.freq, nextDate: new Date(form.startDate), status: 'active', category: '📅',
    }]);
    setLoading(false);
    setShowNew(false);
    setForm({ name: '', upi: '', amount: '', freq: 'Monthly', startDate: format(new Date(), 'yyyy-MM-dd'), maxAmount: '' });
    toast.success('Auto-pay mandate created!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Auto-Pay</h1>
          <button onClick={() => setShowNew(true)} className="ml-auto text-purple-600 dark:text-purple-400 font-medium text-sm">+ Add</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active',       val: mandates.filter(m => m.status === 'active').length, color: 'text-green-600 dark:text-green-400' },
            { label: 'Paused',       val: mandates.filter(m => m.status === 'paused').length,  color: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Monthly Total',val: formatINR(monthly), color: 'text-purple-600 dark:text-purple-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              <p className={`font-bold text-sm ${color}`}>{val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {mandates.map(m => (
          <div key={m.id} className={`bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden ${m.status === 'active' ? 'border-gray-200 dark:border-gray-700' : 'border-gray-200 dark:border-gray-700 opacity-70'}`}>
            <div className="flex items-center gap-3 p-4">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">{m.category}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{m.name}</p>
                <p className="text-xs text-gray-500 font-mono">{m.upi}</p>
                <p className="text-xs text-gray-400 mt-0.5">{m.freq} · Next: {format(m.nextDate, 'MMM d, yyyy')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 dark:text-white">{formatINR(m.amount)}</p>
                <button onClick={() => toggle(m.id)}
                  className={`mt-1 w-10 h-5 rounded-full relative transition-colors flex-shrink-0 ${m.status === 'active' ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${m.status === 'active' ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
            <div className={`flex border-t ${m.status === 'active' ? 'border-gray-100 dark:border-gray-800' : 'border-gray-100 dark:border-gray-800'}`}>
              <div className={`flex-1 px-4 py-2 text-xs font-medium ${m.status === 'active' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10' : 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10'}`}>
                {m.status === 'active' ? '✅ Auto-debit active' : '⏸ Paused'}
              </div>
              <button onClick={() => revoke(m.id)} className="px-4 py-2 text-xs text-red-500 border-l border-gray-100 dark:border-gray-800 hover:bg-red-50 dark:hover:bg-red-900/10 transition">
                Cancel
              </button>
            </div>
          </div>
        ))}

        {mandates.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📅</p>
            <p className="text-sm">No auto-pay mandates set up</p>
          </div>
        )}
      </div>

      {/* New mandate bottom sheet */}
      {showNew && (
        <div style={{ minHeight: 500, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          className="fixed inset-0 z-50" onClick={() => setShowNew(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-5" />
            <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">New Auto-Pay Mandate</h2>
            <div className="space-y-3">
              {[
                { key: 'name',   label: 'Service Name',  placeholder: 'e.g. Netflix',  type: 'text'   },
                { key: 'upi',    label: 'UPI ID',         placeholder: 'merchant@upi',  type: 'text'   },
                { key: 'amount', label: 'Amount (₹)',     placeholder: '0',             type: 'number' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1">{label} *</label>
                  <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                    placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Frequency</label>
                <select value={form.freq} onChange={e => setForm(p => ({ ...p, freq: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none">
                  {FREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none" />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400">
                ℹ️ By setting up auto-pay, you authorize SecureBank to automatically deduct the above amount on the specified schedule. You can pause or cancel anytime.
              </div>
              <button onClick={createMandate} disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition">
                {loading ? '⏳ Setting up...' : '✅ Create Auto-Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
