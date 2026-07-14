import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addMonths, addDays, format } from 'date-fns';
import toast from 'react-hot-toast';

const FD_RATES = [
  { months:3,  rate:6.50, label:'3 Months'  },
  { months:6,  rate:7.00, label:'6 Months'  },
  { months:9,  rate:7.10, label:'9 Months'  },
  { months:12, rate:7.50, label:'1 Year',    popular:true },
  { months:24, rate:7.75, label:'2 Years'   },
  { months:36, rate:7.90, label:'3 Years'   },
  { months:60, rate:8.00, label:'5 Years'   },
];

const MY_FDS = [
  { id:1, bank:'SBI',  amount:50000, rate:7.5, months:12, startDate:'2025-04-01', status:'active' },
  { id:2, bank:'HDFC', amount:25000, rate:7.0, months:6,  startDate:'2025-10-01', status:'active' },
];

export default function FDPage() {
  const navigate  = useNavigate();
  const [tab, setTab]       = useState('create');
  const [amount, setAmount] = useState('');
  const [selTenure, setSelTenure] = useState(FD_RATES[3]);
  const [bank, setBank]     = useState('SBI');
  const [step, setStep]     = useState('form');
  const [loading, setLoading] = useState(false);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);

  const calcMaturity = (amt, rate, months) => {
    const principal = parseFloat(amt) || 0;
    const r = rate / 100 / 4; // quarterly compounding
    const n = months / 3;
    return principal * Math.pow(1+r, n);
  };

  const maturityAmt   = calcMaturity(amount, selTenure.rate, selTenure.months);
  const interestEarned = maturityAmt - (parseFloat(amount) || 0);
  const maturityDate   = format(addMonths(new Date(), selTenure.months), 'MMM d, yyyy');

  const handleBook = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
    toast.success('Fixed Deposit booked successfully!');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto flex items-center justify-center p-6">
        <div className="text-center w-full space-y-4">
          <div className="text-6xl">🏦</div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">✅</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">FD Booked!</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 text-left space-y-2 border border-gray-200 dark:border-gray-700">
            {[
              ['Bank',           bank],
              ['Principal',      formatINR(parseFloat(amount))],
              ['Interest Rate',  `${selTenure.rate}% p.a.`],
              ['Tenure',         selTenure.label],
              ['Maturity Amount',formatINR(maturityAmt)],
              ['Maturity Date',  maturityDate],
              ['FD No',          'FD' + Date.now()],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/upi')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-medium">Home</button>
            <button onClick={() => { setStep('form'); setAmount(''); setTab('my'); }} className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold">My FDs</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Fixed Deposits</h1>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[{k:'create',l:'➕ New FD'},{k:'my',l:'📋 My FDs'}].map(({k,l}) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab===k?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm':'text-gray-500'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tab === 'create' && (
          <>
            {/* Bank selector */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Select Bank</p>
              <div className="flex gap-2">
                {['SBI','HDFC','ICICI','Axis'].map(b => (
                  <button key={b} onClick={() => setBank(b)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${bank===b?'bg-blue-600 text-white border-blue-600':'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900'}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount input */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Deposit Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-3.5 text-2xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                  placeholder="10,000" min={1000} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Minimum ₹1,000</p>

              {/* Quick amounts */}
              <div className="flex gap-2 mt-3">
                {[10000,25000,50000,100000].map(a => (
                  <button key={a} onClick={() => setAmount(String(a))}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium border transition ${String(a)===amount?'bg-blue-600 text-white border-blue-600':'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    {a >= 100000 ? '₹1L' : `₹${a/1000}K`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tenure */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tenure & Interest Rate</p>
              <div className="grid grid-cols-2 gap-2">
                {FD_RATES.map(t => (
                  <button key={t.months} onClick={() => setSelTenure(t)}
                    className={`relative p-3 rounded-xl border-2 text-left transition ${selTenure.months===t.months?'border-blue-500 bg-blue-50 dark:bg-blue-900/20':'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
                    {t.popular && <span className="absolute top-1 right-1 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">Popular</span>}
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{t.label}</p>
                    <p className="text-blue-600 dark:text-blue-400 font-bold">{t.rate}% p.a.</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Maturity preview */}
            {amount && parseFloat(amount) >= 1000 && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white">
                <p className="text-sm opacity-80 mb-3">Maturity Summary</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label:'Principal', val: formatINR(parseFloat(amount)) },
                    { label:'Interest',  val: formatINR(interestEarned) },
                    { label:'Maturity',  val: formatINR(maturityAmt) },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-white/15 rounded-xl p-2.5">
                      <p className="font-bold text-sm">{val}</p>
                      <p className="text-xs opacity-70">{label}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs opacity-70 mt-2 text-center">Matures on {maturityDate} · Quarterly compounding</p>
              </div>
            )}

            <button onClick={handleBook}
              disabled={loading || !amount || parseFloat(amount) < 1000}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Booking FD...' : `Book FD — ${amount ? formatINR(parseFloat(amount)) : '₹0'}`}
            </button>
          </>
        )}

        {tab === 'my' && (
          <div className="space-y-3">
            {MY_FDS.map(fd => {
              const maturity = calcMaturity(fd.amount, fd.rate, fd.months);
              const matDate  = format(addMonths(new Date(fd.startDate), fd.months), 'MMM yyyy');
              const interest = maturity - fd.amount;
              return (
                <div key={fd.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center gap-3">
                    <span className="text-3xl">🏦</span>
                    <div>
                      <p className="font-bold">{fd.bank} Bank</p>
                      <p className="text-blue-200 text-sm">{fd.rate}% p.a. · {fd.months} months</p>
                    </div>
                    <span className="ml-auto text-xs bg-green-400/30 text-green-200 px-2 py-0.5 rounded-full font-medium">Active</span>
                  </div>
                  <div className="p-4 grid grid-cols-3 gap-3 text-center">
                    {[
                      { label:'Principal', val: formatINR(fd.amount) },
                      { label:'Interest',  val: formatINR(interest) },
                      { label:'Maturity',  val: matDate },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5">
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{val}</p>
                        <p className="text-xs text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex border-t border-gray-100 dark:border-gray-800">
                    <button onClick={() => toast('FD details page!')} className="flex-1 py-2.5 text-xs font-medium text-blue-600 dark:text-blue-400">View Details</button>
                    <button onClick={() => toast('Premature withdrawal will incur penalty of 0.5%')} className="flex-1 py-2.5 text-xs font-medium text-red-500 border-l border-gray-100 dark:border-gray-800">Break FD</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
