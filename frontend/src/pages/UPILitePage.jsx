import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LITE_LIMIT   = 2000;  // Max balance
const TXN_LIMIT    = 500;   // Max per transaction

const LITE_TXNS = [
  { id:1, desc:'Auto-rickshaw fare',    amount:40,  time:'10:23 AM', icon:'🛺' },
  { id:2, desc:'Tea & snacks',          amount:25,  time:'9:15 AM',  icon:'☕' },
  { id:3, desc:'Newspaper',             amount:15,  time:'8:00 AM',  icon:'📰' },
  { id:4, desc:'Bus ticket',            amount:20,  time:'Yesterday',icon:'🚌' },
  { id:5, desc:'Parking fee',           amount:50,  time:'Yesterday',icon:'🅿️' },
];

export default function UPILitePage() {
  const navigate = useNavigate();
  const [liteBalance, setLiteBalance] = useState(850);
  const [enabled, setEnabled]         = useState(true);
  const [addAmt, setAddAmt]           = useState('');
  const [payAmt, setPayAmt]           = useState('');
  const [payTo, setPayTo]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [tab, setTab]                 = useState('pay');

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);

  const handleAdd = async () => {
    const amt = parseFloat(addAmt);
    if (!amt || amt < 10) { toast.error('Minimum ₹10'); return; }
    if (liteBalance + amt > LITE_LIMIT) { toast.error(`Max balance is ${formatINR(LITE_LIMIT)}`); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLiteBalance(b => b + amt);
    setLoading(false);
    setAddAmt('');
    toast.success(`₹${amt} added to UPI Lite`);
  };

  const handlePay = async () => {
    const amt = parseFloat(payAmt);
    if (!payTo) { toast.error('Enter UPI ID'); return; }
    if (!amt || amt <= 0) { toast.error('Enter amount'); return; }
    if (amt > TXN_LIMIT) { toast.error(`UPI Lite limit is ${formatINR(TXN_LIMIT)} per transaction`); return; }
    if (amt > liteBalance) { toast.error('Insufficient UPI Lite balance'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // UPI Lite is faster — no PIN!
    setLiteBalance(b => b - amt);
    setLoading(false);
    setPayAmt('');
    setPayTo('');
    toast.success(`⚡ Paid ${formatINR(amt)} instantly — no PIN needed!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-cyan-500 to-blue-600 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">←</button>
            <div>
              <h1 className="text-white font-bold text-lg">UPI Lite</h1>
              <p className="text-cyan-100 text-xs">Pay small amounts instantly — no PIN!</p>
            </div>
          </div>

          {/* Balance card */}
          <div className="bg-white/20 rounded-3xl p-5 border border-white/30">
            <div className="flex items-center justify-between mb-3">
              <p className="text-cyan-100 text-sm">UPI Lite Balance</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${enabled ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                  {enabled ? '● Active' : '○ Disabled'}
                </span>
              </div>
            </div>
            <p className="text-white text-4xl font-bold">{formatINR(liteBalance)}</p>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-cyan-200 mb-1">
                <span>Balance</span>
                <span>Max {formatINR(LITE_LIMIT)}</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white/70 rounded-full" style={{ width:`${(liteBalance/LITE_LIMIT)*100}%` }}/>
              </div>
            </div>
          </div>

          {/* Key info */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label:'Per Txn Limit', val:`₹${TXN_LIMIT}` },
              { label:'Max Balance',   val:`₹${LITE_LIMIT}` },
              { label:'PIN Required',  val:'No PIN! ⚡' },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="text-white font-bold text-xs">{val}</p>
                <p className="text-cyan-200/70 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 mx-4 mt-4 rounded-xl p-1">
        {[{k:'pay',l:'⚡ Pay'},{k:'add',l:'➕ Add Money'},{k:'history',l:'📋 History'}].map(({k,l}) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${tab===k?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm':'text-gray-500'}`}>{l}</button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {/* Enable/Disable toggle */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">UPI Lite</p>
            <p className="text-xs text-gray-400">Payments under ₹500 without PIN</p>
          </div>
          <button onClick={() => { setEnabled(e => !e); toast(enabled ? 'UPI Lite disabled' : 'UPI Lite enabled! ⚡'); }}
            className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {tab === 'pay' && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl px-3 py-2">
                <span>⚡</span><span>No PIN needed — instant payment!</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">UPI ID / Phone</label>
                <input value={payTo} onChange={e => setPayTo(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="name@upi or phone" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Amount (max ₹{TXN_LIMIT})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input type="number" max={TXN_LIMIT} value={payAmt} onChange={e => setPayAmt(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-3.5 text-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="0" />
                </div>
                {parseFloat(payAmt) > TXN_LIMIT && (
                  <p className="text-xs text-red-500 mt-1">⚠️ Max ₹{TXN_LIMIT} per UPI Lite transaction. Use regular UPI for larger amounts.</p>
                )}
              </div>

              {/* Quick amounts */}
              <div className="flex gap-2">
                {[10, 20, 50, 100, 200, 500].map(a => (
                  <button key={a} onClick={() => setPayAmt(String(a))}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition ${String(a)===payAmt ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    ₹{a}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handlePay} disabled={loading || !enabled || !payTo || !payAmt || parseFloat(payAmt)<=0 || parseFloat(payAmt)>TXN_LIMIT || parseFloat(payAmt)>liteBalance}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⚡ Processing...' : `⚡ Pay Instantly — No PIN`}
            </button>
          </>
        )}

        {tab === 'add' && (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 text-sm text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex gap-2">
              <span>ℹ️</span>
              <span>Adding money to UPI Lite deducts from your linked bank account. Max balance: {formatINR(LITE_LIMIT)}</span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input type="number" value={addAmt} onChange={e => setAddAmt(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl pl-8 pr-4 py-4 text-3xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 text-center"
                placeholder="0" max={LITE_LIMIT - liteBalance} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[100, 200, 500, 750, 1000, 1500].map(a => (
                <button key={a} onClick={() => setAddAmt(String(Math.min(a, LITE_LIMIT - liteBalance)))}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition ${String(a)===addAmt?'bg-blue-600 text-white border-blue-600':'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900'}`}>
                  ₹{a}
                </button>
              ))}
            </div>
            <button onClick={handleAdd} disabled={loading || !addAmt || parseFloat(addAmt) < 10}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Adding...' : `Add ${addAmt ? formatINR(parseFloat(addAmt)) : ''} to UPI Lite`}
            </button>
          </div>
        )}

        {tab === 'history' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's UPI Lite Transactions</p>
            </div>
            {LITE_TXNS.map((t, i) => (
              <div key={t.id} className={`flex items-center gap-3 px-4 py-3.5 ${i<LITE_TXNS.length-1?'border-b border-gray-50 dark:border-gray-800':''}`}>
                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-full flex items-center justify-center text-lg flex-shrink-0">{t.icon}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.desc}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1"><span>⚡</span>{t.time}</p>
                </div>
                <p className="font-bold text-red-500 text-sm">-{formatINR(t.amount)}</p>
              </div>
            ))}
            <div className="px-4 py-3 bg-cyan-50 dark:bg-cyan-900/20">
              <p className="text-xs text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                <span>⚡</span> All UPI Lite transactions are instant and PIN-free
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
