import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import toast from 'react-hot-toast';

const RECENT_PAYMENTS = [
  { id: 1, name: 'Ravi Kumar',       upi: 'ravi@upi',       amount: 500,   note: 'Lunch',          date: new Date(Date.now() - 86400000) },
  { id: 2, name: 'Mobile Recharge',  upi: 'jio@recharge',   amount: 239,   note: 'Jio prepaid',    date: new Date(Date.now() - 2 * 86400000) },
  { id: 3, name: 'Electricity Bill', upi: 'bescom@bill',    amount: 1240,  note: 'March bill',     date: new Date(Date.now() - 3 * 86400000) },
  { id: 4, name: 'Priya Sharma',     upi: 'priya@upi',      amount: 2000,  note: 'Rent share',     date: new Date(Date.now() - 5 * 86400000) },
  { id: 5, name: 'Netflix',          upi: 'netflix@razorpay',amount: 649,  note: 'Subscription',   date: new Date(Date.now() - 7 * 86400000) },
];

const SCHEDULES = [
  { id: 1, name: 'Rent Payment',    upi: 'landlord@upi',  amount: 12000, freq: 'Monthly',   next: addMonths(new Date(), 1), active: true },
  { id: 2, name: 'Netflix',         upi: 'netflix@rzp',   amount: 649,   freq: 'Monthly',   next: addDays(new Date(), 8),   active: true },
  { id: 3, name: 'Savings SIP',     upi: 'mf@upi',        amount: 5000,  freq: 'Monthly',   next: addDays(new Date(), 15),  active: false },
];

export default function RepeatPaymentPage() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState('repeat'); // repeat | schedule
  const [schedules, setSchedules] = useState(SCHEDULES);
  const [showNew, setShowNew]     = useState(false);
  const [newSched, setNewSched]   = useState({ name: '', upi: '', amount: '', freq: 'Monthly' });

  const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const toggleSchedule = (id) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
    const s = schedules.find(s => s.id === id);
    toast.success(`${s?.name} ${s?.active ? 'paused' : 'resumed'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Payments</h1>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {['repeat','schedule'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>
              {t === 'repeat' ? '🔁 Repeat' : '📅 Scheduled'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'repeat' && (
        <div className="p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Payments — tap to repeat</p>
          {RECENT_PAYMENTS.map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-lg flex-shrink-0">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{p.note} · {format(p.date, 'MMM d')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900 dark:text-white">{formatINR(p.amount)}</p>
                <button onClick={() => navigate('/upi/send', { state: { upi: p.upi, name: p.name, amount: String(p.amount), note: p.note } })}
                  className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-0.5">Repeat →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'schedule' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled Payments</p>
            <button onClick={() => setShowNew(true)} className="text-purple-600 dark:text-purple-400 text-sm font-medium">+ New</button>
          </div>

          {schedules.map(s => (
            <div key={s.id} className={`bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden ${s.active ? 'border-purple-200 dark:border-purple-800' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-center gap-3 p-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg ${s.active ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  📅
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.freq} · Next: {format(s.next, 'MMM d, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">{formatINR(s.amount)}</p>
                  {/* Toggle switch */}
                  <button onClick={() => toggleSchedule(s.id)}
                    className={`mt-1 w-10 h-5 rounded-full transition-colors relative ${s.active ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${s.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
              <div className={`px-4 py-2 text-xs font-medium border-t ${s.active ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900 text-purple-700 dark:text-purple-400' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 text-gray-500'}`}>
                {s.active ? '✅ Active — will auto-pay on next due date' : '⏸ Paused — tap toggle to resume'}
              </div>
            </div>
          ))}

          {/* New schedule form */}
          {showNew && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-purple-200 dark:border-purple-800 p-4 space-y-3">
              <p className="font-semibold text-gray-900 dark:text-white">New Scheduled Payment</p>
              {[
                { key: 'name',   label: 'Payment Name', placeholder: 'e.g. Netflix', type: 'text' },
                { key: 'upi',    label: 'UPI ID',        placeholder: 'name@upi',    type: 'text' },
                { key: 'amount', label: 'Amount (₹)',    placeholder: '0',            type: 'number' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1">{label}</label>
                  <input type={type} value={newSched[key]} onChange={e => setNewSched(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                    placeholder={placeholder} />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 block mb-1">Frequency</label>
                <select value={newSched.freq} onChange={e => setNewSched(p => ({ ...p, freq: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none">
                  {['Daily','Weekly','Monthly','Yearly'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowNew(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-sm font-medium">Cancel</button>
                <button onClick={() => {
                  if (!newSched.name || !newSched.upi || !newSched.amount) { toast.error('Fill all fields'); return; }
                  setSchedules(prev => [...prev, { id: Date.now(), ...newSched, amount: parseFloat(newSched.amount), next: addMonths(new Date(), 1), active: true }]);
                  setNewSched({ name: '', upi: '', amount: '', freq: 'Monthly' });
                  setShowNew(false);
                  toast.success('Schedule created!');
                }} className="flex-1 bg-purple-600 text-white py-3 rounded-xl text-sm font-bold">Create</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
