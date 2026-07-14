import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const FRIENDS = [
  { id: 1, name: 'Ravi Kumar',   upi: 'ravi@upi',   avatar: 'RK', color: '#7C3AED' },
  { id: 2, name: 'Priya Sharma', upi: 'priya@upi',  avatar: 'PS', color: '#DB2777' },
  { id: 3, name: 'Arjun Das',    upi: 'arjun@upi',  avatar: 'AD', color: '#0284C7' },
  { id: 4, name: 'Meena Patel',  upi: 'meena@ybl',  avatar: 'MP', color: '#059669' },
  { id: 5, name: 'Kiran Rao',    upi: 'kiran@upi',  avatar: 'KR', color: '#DC2626' },
];

const HISTORY = [
  { id: 1, title: 'Dinner at Barbeque Nation', total: 2800, paid: 'You',       people: 4, status: 'pending',  date: '2 days ago',  pending: 2 },
  { id: 2, title: 'Goa Trip Expenses',         total: 15000,paid: 'Ravi Kumar', people: 5, status: 'settled', date: '1 week ago',  pending: 0 },
  { id: 3, title: 'Office Farewell Party',     total: 3500, paid: 'You',       people: 8, status: 'pending', date: '3 days ago',  pending: 5 },
];

export default function SplitBillPage() {
  const navigate  = useNavigate();
  const [tab, setTab]                 = useState('new');
  const [step, setStep]               = useState('details');  // details | people | split | confirm | success
  const [title, setTitle]             = useState('');
  const [total, setTotal]             = useState('');
  const [selectedFriends, setSelFr]   = useState([]);
  const [splitMode, setSplitMode]     = useState('equal');    // equal | custom | percentage
  const [customAmts, setCustomAmts]   = useState({});
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState(null);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
  const totalPeople = selectedFriends.length + 1; // +1 for "you"
  const equalShare  = total ? Math.ceil(parseFloat(total) / totalPeople) : 0;

  const toggleFriend = (id) => {
    setSelFr(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const handleSend = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setResult({ requests: selectedFriends.length, amount: equalShare });
    setStep('success');
    toast.success('Payment requests sent!');
  };

  const customTotal = Object.values(customAmts).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step === 'details' ? navigate(-1) : setStep(s => s === 'people' ? 'details' : s === 'split' ? 'people' : s === 'confirm' ? 'split' : 'details')}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Split Bill</h1>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {['new', 'history'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>
              {t === 'new' ? '➕ New Split' : '📋 History'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'history' && (
        <div className="p-4 space-y-3">
          {HISTORY.map(h => (
            <div key={h.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{h.title}</p>
                  <p className="text-xs text-gray-500">{h.people} people · {h.date}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${h.status === 'settled' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>
                  {h.status === 'settled' ? '✅ Settled' : `⏳ ${h.pending} pending`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-gray-900 dark:text-white">{formatINR(h.total)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Per person</p>
                  <p className="font-bold text-gray-900 dark:text-white">{formatINR(Math.ceil(h.total / h.people))}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paid by</p>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{h.paid}</p>
                </div>
              </div>
              {h.status === 'pending' && (
                <button onClick={() => toast.success('Reminder sent!')}
                  className="w-full mt-3 border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 text-sm font-medium py-2 rounded-xl">
                  🔔 Send Reminder
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'new' && (
        <div className="p-4 space-y-4">
          {/* Step: Details */}
          {step === 'details' && (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">What's this for?</label>
                  <input value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                    placeholder="e.g. Dinner, Trip, Party..." />
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Total Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                    <input type="number" value={total} onChange={e => setTotal(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-3 text-gray-900 dark:text-white text-xl font-bold focus:outline-none focus:border-purple-500"
                      placeholder="0" />
                  </div>
                </div>
              </div>
              <button onClick={() => { if (!title || !total) { toast.error('Fill all fields'); return; } setStep('people'); }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition">
                Next: Choose People →
              </button>
            </>
          )}

          {/* Step: Select people */}
          {step === 'people' && (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold">Y</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">You</p>
                    <p className="text-xs text-green-500">Paid the bill</p>
                  </div>
                  <span className="ml-auto text-green-500 text-xl">✓</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">Select who to split with:</p>
                <div className="space-y-2">
                  {FRIENDS.map(f => {
                    const sel = selectedFriends.includes(f.id);
                    return (
                      <button key={f.id} onClick={() => toggleFriend(f.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition ${sel ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: f.color }}>{f.avatar}</div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{f.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{f.upi}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${sel ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                          {sel && '✓'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {selectedFriends.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-3 flex justify-between text-sm">
                  <span className="text-purple-700 dark:text-purple-400">{totalPeople} people · {formatINR(parseFloat(total))}</span>
                  <span className="font-bold text-purple-700 dark:text-purple-400">{formatINR(equalShare)} each</span>
                </div>
              )}
              <button onClick={() => { if (selectedFriends.length === 0) { toast.error('Select at least one person'); return; } setStep('split'); }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50"
                disabled={selectedFriends.length === 0}>
                Next: Split Method →
              </button>
            </>
          )}

          {/* Step: Split method */}
          {step === 'split' && (
            <>
              <div className="flex gap-2">
                {['equal','custom','percentage'].map(m => (
                  <button key={m} onClick={() => setSplitMode(m)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition capitalize ${splitMode === m ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    {m === 'equal' ? '⚖️ Equal' : m === 'custom' ? '✏️ Custom' : '📊 %'}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
                {[{ id: 0, name: 'You', avatar: 'Y', color: '#7C3AED' }, ...selectedFriends.map(id => FRIENDS.find(f => f.id === id))].map((person, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3.5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: person.color }}>
                      {person.avatar || person.name?.charAt(0)}
                    </div>
                    <p className="flex-1 font-medium text-gray-900 dark:text-gray-100 text-sm">{person.name}</p>
                    {splitMode === 'equal' ? (
                      <p className="font-bold text-gray-900 dark:text-white">{formatINR(equalShare)}</p>
                    ) : splitMode === 'custom' ? (
                      <div className="relative w-28">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                        <input type="number" value={customAmts[i] || ''} onChange={e => setCustomAmts(prev => ({ ...prev, [i]: e.target.value }))}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-7 pr-2 py-2 text-right text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                          placeholder="0" />
                      </div>
                    ) : (
                      <div className="relative w-20">
                        <input type="number" max="100" value={customAmts[i] || ''} onChange={e => setCustomAmts(prev => ({ ...prev, [i]: e.target.value }))}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-2 text-right text-sm font-bold text-gray-900 dark:text-white focus:outline-none pr-5"
                          placeholder="0" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {splitMode === 'custom' && (
                <div className={`p-3 rounded-xl text-sm text-center font-medium ${Math.abs(customTotal - parseFloat(total)) < 1 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                  {Math.abs(customTotal - parseFloat(total)) < 1 ? '✅ Amounts match!' : `⚠️ Difference: ${formatINR(parseFloat(total) - customTotal)}`}
                </div>
              )}

              <button onClick={() => setStep('confirm')} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition">
                Review & Send Requests →
              </button>
            </>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && (
            <>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white text-center">
                  <p className="text-sm opacity-80">{title}</p>
                  <p className="text-3xl font-bold">{formatINR(parseFloat(total))}</p>
                  <p className="text-sm opacity-80">Split {totalPeople} ways · {formatINR(equalShare)} each</p>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sending requests to:</p>
                  {selectedFriends.map(id => {
                    const f = FRIENDS.find(fr => fr.id === id);
                    return (
                      <div key={id} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ background: f.color }}>{f.avatar}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{f.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{f.upi}</p>
                        </div>
                        <p className="font-bold text-gray-900 dark:text-white">{formatINR(equalShare)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={handleSend} disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50">
                {loading ? '⏳ Sending requests...' : `📤 Send ${selectedFriends.length} Payment Requests`}
              </button>
            </>
          )}

          {/* Success */}
          {step === 'success' && result && (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl animate-bounce">🎉</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Requests Sent!</h2>
              <p className="text-gray-500 text-sm">{result.requests} people will receive a payment request for {formatINR(result.amount)} each</p>
              <div className="flex gap-3">
                <button onClick={() => { setStep('details'); setTitle(''); setTotal(''); setSelFr([]); setTab('history'); }}
                  className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3.5 rounded-2xl font-medium">View History</button>
                <button onClick={() => { setStep('details'); setTitle(''); setTotal(''); setSelFr([]); }}
                  className="flex-1 bg-purple-600 text-white py-3.5 rounded-2xl font-bold">New Split</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
