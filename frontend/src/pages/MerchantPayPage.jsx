import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const NEARBY_MERCHANTS = [
  { id: 1, name: 'Café Coffee Day',       category: 'Food & Drink',  upi: 'ccd@upi',      rating: 4.2, distance: '120m',  accepts: ['UPI','Cards'],  logo: '☕' },
  { id: 2, name: 'Big Bazaar',            category: 'Grocery',       upi: 'bigbazaar@fbl', rating: 4.0, distance: '250m',  accepts: ['UPI','Cards'],  logo: '🛒' },
  { id: 3, name: 'Reliance Digital',      category: 'Electronics',   upi: 'reliance@upi',  rating: 4.3, distance: '400m',  accepts: ['UPI'],          logo: '📱' },
  { id: 4, name: 'Apollo Pharmacy',       category: 'Medicine',      upi: 'apollo@upi',    rating: 4.5, distance: '180m',  accepts: ['UPI','Cards'],  logo: '💊' },
  { id: 5, name: 'McDonald\'s',           category: 'Food & Drink',  upi: 'mcdonalds@upi', rating: 4.1, distance: '550m',  accepts: ['UPI','Cards'],  logo: '🍔' },
  { id: 6, name: 'BPCL Petrol Pump',      category: 'Fuel',          upi: 'bpcl@upi',      rating: 3.9, distance: '700m',  accepts: ['UPI'],          logo: '⛽' },
];

const CATEGORIES = ['All', 'Food & Drink', 'Grocery', 'Electronics', 'Medicine', 'Fuel'];

export default function MerchantPayPage() {
  const navigate   = useNavigate();
  const [tab, setTab]             = useState('nearby');   // nearby | upi | history
  const [catFilter, setCatFilter] = useState('All');
  const [merchant, setMerchant]   = useState(null);
  const [amount, setAmount]       = useState('');
  const [note, setNote]           = useState('');
  const [upiInput, setUpiInput]   = useState('');
  const [step, setStep]           = useState('list');     // list | pay | confirm | success
  const [loading, setLoading]     = useState(false);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const filtered = NEARBY_MERCHANTS.filter(m => catFilter === 'All' || m.category === catFilter);

  const selectMerchant = (m) => { setMerchant(m); setStep('pay'); };

  const handlePay = async () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter amount'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
    toast.success('Payment successful!');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto flex items-center justify-center p-6">
        <div className="text-center w-full space-y-4">
          <div className="text-7xl animate-bounce">{merchant?.logo || '🏪'}</div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Paid!</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 text-left space-y-2 border border-gray-200 dark:border-gray-700">
            {[
              ['Merchant', merchant?.name || upiInput],
              ['Amount', formatINR(parseFloat(amount))],
              ['Category', merchant?.category || 'Merchant Payment'],
              ['Time', new Date().toLocaleTimeString('en-IN')],
              ['Txn ID', 'MER' + Date.now()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setStep('list'); setMerchant(null); setAmount(''); }} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-medium">Done</button>
            <button onClick={() => navigate('/receipt', { state: { tx: { amount: parseFloat(amount), receiverName: merchant?.name, receiverUpi: merchant?.upi, note, status: 'completed', createdAt: new Date(), transactionId: 'MER'+Date.now(), senderName: 'You', type: 'Merchant Payment' } } })}
              className="flex-1 bg-purple-600 text-white py-3 rounded-2xl font-bold">Receipt</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step === 'list' ? navigate(-1) : setStep('list')} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Pay at Store</h1>
        </div>
        {step === 'list' && (
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {['nearby','upi'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>
                {t === 'nearby' ? '📍 Nearby Merchants' : '🔢 Enter UPI ID'}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {step === 'list' && tab === 'nearby' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${catFilter === c ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {c}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500">📍 Showing merchants near you</p>
            <div className="space-y-3">
              {filtered.map(m => (
                <button key={m.id} onClick={() => selectMerchant(m)}
                  className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 hover:border-purple-300 dark:hover:border-purple-700 transition text-left">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">{m.logo}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.category} · {m.distance} away</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-yellow-500">★ {m.rating}</span>
                      {m.accepts.map(a => <span key={a} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">{a}</span>)}
                    </div>
                  </div>
                  <span className="text-purple-600 dark:text-purple-400 text-lg flex-shrink-0">›</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'list' && tab === 'upi' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Merchant UPI ID</label>
                <input value={upiInput} onChange={e => setUpiInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  placeholder="merchant@upi" />
              </div>
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-bold"
                    placeholder="0" />
                </div>
              </div>
            </div>
            <button onClick={() => { if (!upiInput || !amount) { toast.error('Fill all fields'); return; } setStep('confirm'); }}
              className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl">Pay →</button>
          </div>
        )}

        {step === 'pay' && merchant && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 text-center">
              <div className="text-5xl mb-3">{merchant.logo}</div>
              <p className="font-bold text-gray-900 dark:text-white text-lg">{merchant.name}</p>
              <p className="text-sm text-gray-500">{merchant.category}</p>
              <p className="text-xs text-gray-400 font-mono mt-1">{merchant.upi}</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Enter Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} autoFocus
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-4 text-gray-900 dark:text-white text-2xl font-bold focus:outline-none focus:border-purple-500 text-center"
                  placeholder="0" />
              </div>
              <input type="text" value={note} onChange={e => setNote(e.target.value)}
                className="w-full mt-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 text-sm"
                placeholder="Add note (optional)" />
            </div>
            <button onClick={handlePay} disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Processing...' : `🔒 Pay ${amount ? formatINR(parseFloat(amount)) : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
