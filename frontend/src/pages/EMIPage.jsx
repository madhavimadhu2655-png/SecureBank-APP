import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addMonths } from 'date-fns';

const ACTIVE_EMIS = [
  { id:1, name:'iPhone 15 Pro',         bank:'HDFC',   principal:80000, emi:7200,  paid:3,  total:12, startDate:'2025-10-01', rate:13 },
  { id:2, name:'Home Loan - Flat 4B',   bank:'SBI',    principal:4500000,emi:38500,paid:14, total:240,startDate:'2024-07-01', rate:8.5 },
  { id:3, name:'Personal Loan',         bank:'ICICI',  principal:200000,emi:9500,  paid:7,  total:24, startDate:'2025-04-01', rate:14 },
];

export default function EMIPage() {
  const navigate = useNavigate();
  const [tab, setTab]       = useState('active');   // active | calculator
  const [principal, setPrincipal] = useState('');
  const [rate, setRate]     = useState('');
  const [tenure, setTenure] = useState('');
  const [emiResult, setEmiResult] = useState(null);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);

  const calcEMI = () => {
    const P = parseFloat(principal);
    const r = parseFloat(rate) / 12 / 100;
    const n = parseInt(tenure);
    if (!P || !r || !n) return;
    const emi   = P * r * Math.pow(1+r, n) / (Math.pow(1+r, n) - 1);
    const total = emi * n;
    const interest = total - P;
    setEmiResult({ emi: Math.round(emi), total: Math.round(total), interest: Math.round(interest), principal: P });
  };

  useEffect(() => {
    if (principal && rate && tenure) calcEMI();
    else setEmiResult(null);
  }, [principal, rate, tenure]);

  const EMICard = ({ emi }) => {
    const remaining = emi.total - emi.paid;
    const pct       = (emi.paid / emi.total) * 100;
    const nextDue   = addMonths(new Date(emi.startDate), emi.paid);

    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{emi.name}</p>
              <p className="text-xs text-gray-500">{emi.bank} · {emi.rate}% p.a.</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-purple-600 dark:text-purple-400">{formatINR(emi.emi)}<span className="text-xs text-gray-400">/mo</span></p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{emi.paid} paid</span>
              <span>{remaining} remaining</span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width:`${pct}%` }}/>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label:'Principal', val: formatINR(emi.principal) },
              { label:'Next Due',  val: format(nextDue, 'MMM d') },
              { label:'Tenure',    val: `${emi.total}m` },
            ].map(({ label, val }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{val}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex border-t border-gray-100 dark:border-gray-800">
          <button className="flex-1 py-2.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition">Pay EMI Now</button>
          <button className="flex-1 py-2.5 text-xs font-medium text-gray-500 border-l border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition">View Schedule</button>
        </div>
      </div>
    );
  };

  const totalMonthly = ACTIVE_EMIS.reduce((s, e) => s + e.emi, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">EMI Tracker</h1>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[{k:'active',l:'📋 Active EMIs'},{k:'calculator',l:'🧮 Calculator'}].map(({k,l}) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab===k ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tab === 'active' && (
          <>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4 text-white">
              <p className="text-sm opacity-80">Total Monthly EMI</p>
              <p className="text-3xl font-bold">{formatINR(totalMonthly)}</p>
              <p className="text-sm opacity-70 mt-1">{ACTIVE_EMIS.length} active loans</p>
            </div>
            {ACTIVE_EMIS.map(e => <EMICard key={e.id} emi={e} />)}
          </>
        )}

        {tab === 'calculator' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              {[
                { label:'Loan Amount (₹)', key:'principal', state:principal, set:setPrincipal, placeholder:'e.g. 500000' },
                { label:'Interest Rate (% p.a.)', key:'rate', state:rate, set:setRate, placeholder:'e.g. 10.5' },
                { label:'Tenure (months)', key:'tenure', state:tenure, set:setTenure, placeholder:'e.g. 24' },
              ].map(({ label, key, state, set, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">{label}</label>
                  <input type="number" value={state} onChange={e => set(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-semibold"
                    placeholder={placeholder} />
                </div>
              ))}
            </div>

            {emiResult && (
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-5 text-white">
                <p className="text-sm opacity-80 mb-1">Monthly EMI</p>
                <p className="text-4xl font-bold mb-4">{formatINR(emiResult.emi)}</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label:'Principal', val: formatINR(emiResult.principal) },
                    { label:'Interest',  val: formatINR(emiResult.interest) },
                    { label:'Total',     val: formatINR(emiResult.total) },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-white/15 rounded-xl p-2.5">
                      <p className="font-bold text-sm">{val}</p>
                      <p className="text-xs opacity-70 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Pie-chart style bar */}
                <div className="mt-4">
                  <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                    <div className="bg-white rounded-l-full" style={{ width:`${(emiResult.principal/emiResult.total)*100}%` }}/>
                    <div className="bg-white/40 rounded-r-full flex-1"/>
                  </div>
                  <div className="flex justify-between text-xs mt-1 opacity-70">
                    <span>Principal {Math.round((emiResult.principal/emiResult.total)*100)}%</span>
                    <span>Interest {Math.round((emiResult.interest/emiResult.total)*100)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick presets */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Presets</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label:'Home Loan',     p:'5000000', r:'8.5', t:'240' },
                  { label:'Car Loan',      p:'800000',  r:'9',   t:'60'  },
                  { label:'Personal Loan', p:'300000',  r:'14',  t:'36'  },
                  { label:'Education',     p:'1000000', r:'10',  t:'84'  },
                ].map(({ label, p, r, t }) => (
                  <button key={label} onClick={() => { setPrincipal(p); setRate(r); setTenure(t); }}
                    className="text-left p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="text-xs text-gray-400">₹{parseInt(p).toLocaleString('en-IN')} · {t}m · {r}%</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
