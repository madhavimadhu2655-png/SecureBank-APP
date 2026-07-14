import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import toast from 'react-hot-toast';

const BNPL_LIMIT = 15000;
const USED = 4500;
const AVAILABLE = BNPL_LIMIT - USED;

const TXNS = [
  { id:1, desc:'Swiggy Order',          amount:450,  date:'Today',     status:'unpaid',  dueDate: addDays(new Date(), 15) },
  { id:2, desc:'Myntra — Kurti ×2',     amount:1299, date:'Yesterday', status:'unpaid',  dueDate: addDays(new Date(), 14) },
  { id:3, desc:'Zomato Order',          amount:380,  date:'2 days ago',status:'unpaid',  dueDate: addDays(new Date(), 13) },
  { id:4, desc:'BigBasket Grocery',     amount:2371, date:'3 days ago',status:'paid',    dueDate: new Date() },
];

const PLANS = [
  { label:'Pay in 3 months', months:3,  interest:0,   badge:'0% Interest', badgeColor:'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  { label:'Pay in 6 months', months:6,  interest:1.5, badge:'1.5%/mo',     badgeColor:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  { label:'Pay in 12 months',months:12, interest:1.8, badge:'1.8%/mo',     badgeColor:'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
];

export default function BNPLPage() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('home');
  const [used, setUsed]         = useState(USED);
  const [available, setAvailable] = useState(AVAILABLE);
  const [step, setStep]         = useState('main');
  const [buyAmt, setBuyAmt]     = useState('');
  const [selPlan, setSelPlan]   = useState(PLANS[0]);
  const [loading, setLoading]   = useState(false);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
  const usedPct   = (used / BNPL_LIMIT) * 100;
  const unpaidTotal = TXNS.filter(t => t.status==='unpaid').reduce((s,t) => s+t.amount, 0);
  const emi = (amt, months, rate) => {
    if (!rate) return amt / months;
    const r = rate / 100;
    return amt * r * Math.pow(1+r,months) / (Math.pow(1+r,months)-1);
  };

  const handleActivate = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    toast.success('SecurePay Later activated! ₹15,000 limit added.');
    setStep('main');
  };

  const handleBuy = async () => {
    const amt = parseFloat(buyAmt);
    if (!amt || amt <= 0) { toast.error('Enter amount'); return; }
    if (amt > available) { toast.error('Exceeds available limit'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setUsed(u => u + amt);
    setAvailable(a => a - amt);
    setLoading(false);
    setBuyAmt('');
    setStep('main');
    toast.success(`₹${amt} added to your BNPL bill!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">←</button>
            <div>
              <h1 className="text-white font-bold text-lg">SecurePay Later</h1>
              <p className="text-indigo-200 text-xs">Buy now, pay next month</p>
            </div>
          </div>

          {/* Credit limit card */}
          <div className="bg-white/15 rounded-3xl p-5 border border-white/20">
            <div className="flex justify-between mb-3">
              <div>
                <p className="text-indigo-200 text-xs">Total Limit</p>
                <p className="text-white text-2xl font-bold">{formatINR(BNPL_LIMIT)}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-200 text-xs">Available</p>
                <p className="text-green-300 text-2xl font-bold">{formatINR(available)}</p>
              </div>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full" style={{ width:`${usedPct}%` }}/>
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-indigo-200">
              <span>Used: {formatINR(used)}</span>
              <span>{usedPct.toFixed(0)}% used</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 mx-4 mt-4 rounded-xl p-1">
        {[{k:'home',l:'🏠 Overview'},{k:'use',l:'💳 Use Now'},{k:'bill',l:'📄 My Bill'}].map(({k,l}) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${tab===k?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm':'text-gray-500'}`}>{l}</button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {tab === 'home' && (
          <>
            {/* Due alert */}
            {unpaidTotal > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="font-semibold text-orange-700 dark:text-orange-400 text-sm">Payment Due</p>
                  <p className="text-xs text-orange-600 dark:text-orange-500">{formatINR(unpaidTotal)} due by {format(addDays(new Date(),15), 'MMM d')}</p>
                </div>
                <button onClick={() => setTab('bill')} className="bg-orange-500 text-white text-xs font-bold px-3 py-2 rounded-xl">Pay Now</button>
              </div>
            )}

            {/* How it works */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-bold text-gray-900 dark:text-white text-sm mb-3">How SecurePay Later works</p>
              <div className="space-y-3">
                {[
                  { step:'1', title:'Shop & Pay Later',    desc:'Use at any UPI merchant without paying now' },
                  { step:'2', title:'Get Your Bill',       desc:'Single consolidated bill on 1st of each month' },
                  { step:'3', title:'Pay in Full or EMI',  desc:'Pay full amount or convert to easy EMIs' },
                ].map(({ step:s, title, desc }) => (
                  <div key={s} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-sm flex-shrink-0">{s}</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon:'0️⃣', label:'0% interest', desc:'Pay in full' },
                { icon:'📅', label:'30-day cycle', desc:'Monthly bill' },
                { icon:'⚡', label:'Instant',      desc:'No docs needed' },
              ].map(({ icon, label, desc }) => (
                <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 text-center">
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-xs">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'use' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-3 flex items-center gap-3 border border-indigo-200 dark:border-indigo-800">
              <span className="text-xl">💳</span>
              <div>
                <p className="text-xs text-gray-500">Available credit</p>
                <p className="font-bold text-indigo-700 dark:text-indigo-400">{formatINR(available)}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Amount to use (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input type="number" value={buyAmt} onChange={e => setBuyAmt(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-3.5 text-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                    placeholder="0" max={available} />
                </div>
                {parseFloat(buyAmt) > available && <p className="text-xs text-red-500 mt-1">Exceeds available limit of {formatINR(available)}</p>}
              </div>

              {/* EMI plans */}
              {buyAmt && parseFloat(buyAmt) > 0 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Choose Payment Plan</p>
                  <div className="space-y-2">
                    {PLANS.map(plan => (
                      <button key={plan.months} onClick={() => setSelPlan(plan)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition ${selPlan?.months===plan.months ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{plan.label}</p>
                          <p className="text-xs text-gray-400">{formatINR(emi(parseFloat(buyAmt), plan.months, plan.interest))}/month</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.badgeColor}`}>{plan.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleBuy} disabled={loading || !buyAmt || parseFloat(buyAmt)<=0 || parseFloat(buyAmt)>available}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Processing...' : 'Use SecurePay Later →'}
            </button>
          </div>
        )}

        {tab === 'bill' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900 dark:text-white">Bill for {format(new Date(), 'MMMM yyyy')}</p>
              <p className="text-sm font-bold text-orange-600">Due: {format(addDays(new Date(),15), 'MMM d')}</p>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
              {TXNS.map((t,i) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.status==='paid' ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.desc}</p>
                    <p className="text-xs text-gray-400">{t.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{formatINR(t.amount)}</p>
                    <p className={`text-xs ${t.status==='paid' ? 'text-green-500' : 'text-orange-500'}`}>{t.status==='paid' ? 'Paid' : 'Unpaid'}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-4 bg-gray-50 dark:bg-gray-800">
                <p className="font-bold text-gray-900 dark:text-white">Total Due</p>
                <p className="font-bold text-orange-600 text-lg">{formatINR(unpaidTotal)}</p>
              </div>
            </div>

            {unpaidTotal > 0 && (
              <>
                <div className="space-y-2">
                  {PLANS.map(plan => {
                    const monthlyEmi = emi(unpaidTotal, plan.months, plan.interest);
                    return (
                      <button key={plan.months} onClick={() => setSelPlan(plan)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition ${selPlan?.months===plan.months ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{plan.label}</p>
                          <p className="text-xs text-gray-400">{formatINR(monthlyEmi)}/month</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.badgeColor}`}>{plan.badge}</span>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => { toast.success(`Bill of ${formatINR(unpaidTotal)} paid via ${selPlan?.label}!`); }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition">
                  💳 Pay {formatINR(unpaidTotal)} Now
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
