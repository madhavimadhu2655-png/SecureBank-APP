import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const FUNDS = [
  { id:1, name:'Mirae Asset Large Cap Fund',    category:'Large Cap',  risk:'Low',    rating:5, nav:92.45,  returns:{ '1y':14.2, '3y':18.5, '5y':22.1 }, aum:'₹32,450 Cr',  minSip:500,  minLump:5000  },
  { id:2, name:'Axis Midcap Fund',              category:'Mid Cap',    risk:'Medium', rating:5, nav:78.32,  returns:{ '1y':22.1, '3y':28.4, '5y':31.2 }, aum:'₹21,200 Cr',  minSip:500,  minLump:5000  },
  { id:3, name:'SBI Small Cap Fund',            category:'Small Cap',  risk:'High',   rating:4, nav:145.67, returns:{ '1y':31.5, '3y':35.2, '5y':38.7 }, aum:'₹18,900 Cr',  minSip:500,  minLump:5000  },
  { id:4, name:'HDFC Balanced Advantage',       category:'Hybrid',     risk:'Low',    rating:4, nav:452.10, returns:{ '1y':12.8, '3y':15.6, '5y':17.4 }, aum:'₹58,700 Cr',  minSip:100,  minLump:1000  },
  { id:5, name:'Parag Parikh Flexi Cap',        category:'Flexi Cap',  risk:'Medium', rating:5, nav:68.90,  returns:{ '1y':19.4, '3y':24.1, '5y':27.8 }, aum:'₹42,100 Cr',  minSip:1000, minLump:10000 },
  { id:6, name:'Nippon India Liquid Fund',      category:'Liquid',     risk:'Very Low',rating:5,nav:5320.45,returns:{ '1y':7.1,  '3y':6.8,  '5y':6.5  }, aum:'₹29,800 Cr',  minSip:100,  minLump:1000  },
];

const MY_SIPS = [
  { id:1, fund:'Axis Midcap Fund',         amount:2000, date:5,  units:12.45, invested:24000, current:28560, status:'active' },
  { id:2, fund:'HDFC Balanced Advantage',  amount:1000, date:10, units:8.90,  invested:12000, current:13450, status:'active' },
];

const RISK_COLOR = {
  'Very Low': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  'Low':      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  'Medium':   'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  'High':     'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

// Simple sparkline generator
const Sparkline = ({ positive = true }) => {
  const points = Array.from({length:10}, (_,i) => {
    const base = 40 + (positive ? i * 3 : -i * 2);
    return `${i*22},${60 - base + (Math.random()-0.5)*10}`;
  }).join(' ');
  return (
    <svg width="100%" height="40" viewBox="0 0 200 60">
      <polyline points={points} fill="none" stroke={positive ? '#10B981' : '#EF4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default function MutualFundsPage() {
  const navigate = useNavigate();
  const [tab, setTab]           = useState('explore'); // explore | portfolio | sip
  const [selected, setSelected] = useState(null);
  const [step, setStep]         = useState('list');    // list | detail | invest | confirm | success
  const [mode, setMode]         = useState('sip');     // sip | lumpsum
  const [amount, setAmount]     = useState('');
  const [sipDate, setSipDate]   = useState(5);
  const [period, setPeriod]     = useState('3y');
  const [loading, setLoading]   = useState(false);
  const [filterRisk, setFilterRisk] = useState('All');

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);

  const totalInvested  = MY_SIPS.reduce((s,f) => s+f.invested, 0);
  const totalCurrent   = MY_SIPS.reduce((s,f) => s+f.current, 0);
  const totalGain      = totalCurrent - totalInvested;
  const gainPct        = ((totalGain / totalInvested)*100).toFixed(1);

  const filtered = filterRisk === 'All' ? FUNDS : FUNDS.filter(f => f.risk === filterRisk);

  const calcReturns = (amt, ret, yrs) => {
    const monthly = mode === 'sip' ? amt : 0;
    const lump    = mode === 'lumpsum' ? amt : 0;
    const r = ret / 100 / 12;
    const n = yrs * 12;
    const sipFV   = monthly * (Math.pow(1+r,n)-1) / r * (1+r);
    const lumpFV  = lump * Math.pow(1+r/12,n);
    return Math.round(sipFV + lumpFV);
  };

  const handleInvest = async () => {
    const amt = parseFloat(amount);
    const minAmt = mode === 'sip' ? selected?.minSip : selected?.minLump;
    if (!amt || amt < minAmt) { toast.error(`Minimum ${mode==='sip'?'SIP':'lumpsum'} is ₹${minAmt}`); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
    toast.success(mode==='sip' ? 'SIP started successfully!' : 'Investment placed!');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto flex items-center justify-center p-6">
        <div className="text-center w-full space-y-5">
          <div className="text-6xl animate-bounce">📈</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{mode==='sip' ? 'SIP Started!' : 'Investment Placed!'}</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 text-left space-y-2 border border-gray-200 dark:border-gray-700">
            {[
              ['Fund', selected?.name],
              ['Type', mode==='sip' ? `SIP - ₹${amount}/month` : `Lumpsum - ₹${amount}`],
              ['Date', mode==='sip' ? `Every ${sipDate}th` : new Date().toLocaleDateString('en-IN')],
              ['Folio No', 'FLO'+Date.now()],
              ['Status', '✅ Active'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-right max-w-[200px]">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setStep('list'); setSelected(null); setAmount(''); setTab('portfolio'); }}
              className="flex-1 bg-gray-200 dark:bg-gray-800 py-3.5 rounded-2xl text-gray-700 dark:text-gray-300 font-medium">Portfolio</button>
            <button onClick={() => { setStep('list'); setSelected(null); setAmount(''); }}
              className="flex-1 bg-green-600 text-white py-3.5 rounded-2xl font-bold">Invest More</button>
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
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Mutual Funds</h1>
          <span className="ml-auto text-xs text-gray-400">SEBI Regulated</span>
        </div>
        {step === 'list' && (
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {[{k:'explore',l:'🔍 Explore'},{k:'portfolio',l:'💼 Portfolio'},{k:'sip',l:'🔄 My SIPs'}].map(({k,l}) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${tab===k?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm':'text-gray-500'}`}>{l}</button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">

        {/* ── EXPLORE TAB ── */}
        {step === 'list' && tab === 'explore' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['All','Very Low','Low','Medium','High'].map(r => (
                <button key={r} onClick={() => setFilterRisk(r)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${filterRisk===r ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {r} Risk
                </button>
              ))}
            </div>
            <div className="space-y-3">
              {filtered.map(fund => (
                <button key={fund.id} onClick={() => { setSelected(fund); setStep('detail'); }}
                  className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-left hover:border-purple-300 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0 pr-3">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{fund.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{fund.category} · AUM {fund.aum}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-green-600 dark:text-green-400 text-sm">+{fund.returns['3y']}%</p>
                      <p className="text-xs text-gray-400">3Y returns</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_COLOR[fund.risk]}`}>{fund.risk} Risk</span>
                      <span className="text-xs text-yellow-500">{'★'.repeat(fund.rating)}</span>
                    </div>
                    <p className="text-xs text-gray-500">NAV ₹{fund.nav}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── PORTFOLIO TAB ── */}
        {step === 'list' && tab === 'portfolio' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-5 text-white">
              <p className="text-sm opacity-80 mb-1">Total Portfolio Value</p>
              <p className="text-3xl font-bold">{formatINR(totalCurrent)}</p>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <p className="text-xs opacity-70">Invested</p>
                  <p className="font-semibold">{formatINR(totalInvested)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-70">Gain</p>
                  <p className="font-semibold text-green-200">+{formatINR(totalGain)} ({gainPct}%)</p>
                </div>
              </div>
            </div>

            {MY_SIPS.map(sip => {
              const gain = sip.current - sip.invested;
              const gpct = ((gain/sip.invested)*100).toFixed(1);
              return (
                <div key={sip.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{sip.fund}</p>
                      <p className="text-xs text-gray-500 mt-0.5">SIP ₹{sip.amount}/mo · {sip.units} units</p>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <Sparkline positive />
                  <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                    {[
                      { label:'Invested', val: formatINR(sip.invested) },
                      { label:'Current',  val: formatINR(sip.current) },
                      { label:'Returns',  val: `+${gpct}%` },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
                        <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{val}</p>
                        <p className="text-xs text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SIP TAB ── */}
        {step === 'list' && tab === 'sip' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Your active SIP mandates</p>
            {MY_SIPS.map(sip => (
              <div key={sip.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{sip.fund}</p>
                    <p className="text-xs text-gray-400">Every {sip.date}th of the month</p>
                  </div>
                  <p className="font-bold text-purple-600 dark:text-purple-400 text-lg">{formatINR(sip.amount)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toast('SIP paused!')} className="flex-1 text-xs border border-yellow-300 dark:border-yellow-700 text-yellow-600 dark:text-yellow-400 py-2 rounded-xl font-medium">⏸ Pause</button>
                  <button onClick={() => toast('SIP cancelled!')} className="flex-1 text-xs border border-red-200 dark:border-red-800 text-red-500 py-2 rounded-xl font-medium">✕ Cancel</button>
                  <button onClick={() => toast('Step-up started!')} className="flex-1 text-xs border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 py-2 rounded-xl font-medium">📈 Step-up</button>
                </div>
              </div>
            ))}
            <button onClick={() => setTab('explore')} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl py-4 text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-purple-400 transition">
              + Start New SIP
            </button>
          </div>
        )}

        {/* ── FUND DETAIL ── */}
        {step === 'detail' && selected && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white">
                <p className="font-bold text-xl leading-tight">{selected.name}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-sm opacity-80">{selected.category}</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{selected.risk} Risk</span>
                </div>
              </div>
              <div className="p-4">
                <Sparkline positive />
                <div className="grid grid-cols-3 gap-3 mt-3 text-center">
                  {Object.entries(selected.returns).map(([k,v]) => (
                    <div key={k} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-2.5">
                      <p className="font-bold text-green-600 dark:text-green-400">+{v}%</p>
                      <p className="text-xs text-gray-400">{k} returns</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[['NAV', `₹${selected.nav}`],['AUM', selected.aum],['Min SIP', `₹${selected.minSip}`],['Min Lumpsum', `₹${selected.minLump}`]].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm py-2 border-b border-gray-50 dark:border-gray-800">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 text-xs text-amber-700 dark:text-amber-400 flex gap-2">
              <span>⚠️</span><span>Mutual fund investments are subject to market risks. Read all scheme-related documents carefully.</span>
            </div>
            <button onClick={() => setStep('invest')} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition">
              Invest Now →
            </button>
          </div>
        )}

        {/* ── INVEST STEP ── */}
        {step === 'invest' && selected && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {['sip','lumpsum'].map(m => (
                <button key={m} onClick={() => { setMode(m); setAmount(''); }}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition capitalize ${mode===m ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                  {m === 'sip' ? '🔄 Monthly SIP' : '💰 Lumpsum'}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                  {mode==='sip' ? 'Monthly SIP Amount (₹)' : 'Lumpsum Amount (₹)'}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-3.5 text-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                    placeholder={String(mode==='sip' ? selected.minSip : selected.minLump)} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Min: ₹{mode==='sip' ? selected.minSip : selected.minLump}</p>
              </div>

              {mode === 'sip' && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">SIP Date</label>
                  <div className="flex flex-wrap gap-2">
                    {[1,5,7,10,15,20,25,28].map(d => (
                      <button key={d} onClick={() => setSipDate(d)}
                        className={`w-9 h-9 rounded-full text-sm font-medium border transition ${sipDate===d ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Returns projection */}
              {amount && parseFloat(amount) > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Projected Returns</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[['1 Year',1],['3 Years',3],['5 Years',5]].map(([label,yrs]) => {
                      const val = calcReturns(parseFloat(amount), selected.returns[`${yrs}y`] || 15, yrs);
                      return (
                        <div key={label} className="bg-white/70 dark:bg-white/5 rounded-xl p-2.5">
                          <p className="font-bold text-green-600 dark:text-green-400 text-sm">{formatINR(val)}</p>
                          <p className="text-xs text-gray-400">{label}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">*Based on past performance. Not guaranteed.</p>
                </div>
              )}
            </div>

            <button onClick={() => setStep('confirm')} disabled={!amount || parseFloat(amount) < (mode==='sip' ? selected.minSip : selected.minLump)}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              Review Investment →
            </button>
          </div>
        )}

        {/* ── CONFIRM STEP ── */}
        {step === 'confirm' && selected && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white text-center">
                <p className="text-sm opacity-80">{mode==='sip' ? 'Monthly SIP' : 'Lumpsum Investment'}</p>
                <p className="text-3xl font-bold">{formatINR(parseFloat(amount))}</p>
                {mode==='sip' && <p className="text-sm opacity-80">Every {sipDate}th of the month</p>}
              </div>
              <div className="p-4 space-y-2">
                {[['Fund', selected.name],['Category', selected.category],['NAV', `₹${selected.nav}`],['Type', mode==='sip' ? 'SIP' : 'Lumpsum'],['Bank', 'HDFC •••4521']].map(([k,v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-right max-w-[200px]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('invest')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-4 rounded-2xl text-gray-700 dark:text-gray-300 font-medium">Back</button>
              <button onClick={handleInvest} disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
                {loading ? '⏳ Processing...' : `Confirm ${mode==='sip'?'SIP':'Investment'}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
