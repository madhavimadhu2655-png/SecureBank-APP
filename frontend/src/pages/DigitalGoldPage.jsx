import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const GOLD_PRICE_PER_GRAM = 7245; // INR per gram (live-simulated)

export default function DigitalGoldPage() {
  const navigate = useNavigate();
  const [tab, setTab]       = useState('buy');   // buy | sell | holdings
  const [mode, setMode]     = useState('rupee'); // rupee | gram
  const [input, setInput]   = useState('');
  const [goldHeld, setGoldHeld] = useState(2.456); // grams held
  const [goldPrice, setGoldPrice] = useState(GOLD_PRICE_PER_GRAM);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]     = useState('main'); // main | confirm | success
  const [lastTxn, setLastTxn] = useState(null);
  const [priceChange] = useState(+0.34); // percentage change today

  // Simulate live price fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setGoldPrice(p => p + (Math.random()-0.5) * 2);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:2 }).format(n);
  const grams  = mode === 'rupee' ? (parseFloat(input)||0) / goldPrice : parseFloat(input)||0;
  const rupees = mode === 'gram'  ? (parseFloat(input)||0) * goldPrice : parseFloat(input)||0;
  const holdingValue = goldHeld * goldPrice;
  const investedValue = goldHeld * 6800; // mock avg buy price
  const gainValue = holdingValue - investedValue;
  const gainPct   = ((gainValue / investedValue)*100).toFixed(1);

  const handleTransaction = async () => {
    const g = parseFloat(grams.toFixed(4));
    const r = parseFloat(rupees.toFixed(2));
    if (!g || g <= 0) { toast.error('Enter valid amount'); return; }
    if (tab === 'sell' && g > goldHeld) { toast.error('Insufficient gold holdings'); return; }
    if (tab === 'buy' && g < 0.001) { toast.error('Minimum buy 0.001g'); return; }
    setLoading(true);
    await new Promise(res => setTimeout(res, 1500));
    if (tab === 'buy')  setGoldHeld(h => parseFloat((h+g).toFixed(4)));
    else                setGoldHeld(h => parseFloat((h-g).toFixed(4)));
    setLastTxn({ type: tab, grams: g, rupees: r, price: goldPrice });
    setLoading(false);
    setStep('success');
    toast.success(`Gold ${tab === 'buy' ? 'purchased' : 'sold'} successfully!`);
  };

  if (step === 'success' && lastTxn) {
    return (
      <div className="min-h-screen bg-gray-950 max-w-md mx-auto flex items-center justify-center p-6">
        <div className="text-center w-full space-y-5">
          <div className="text-6xl animate-bounce">🪙</div>
          <h2 className="text-2xl font-bold text-white">{lastTxn.type==='buy' ? 'Gold Purchased!' : 'Gold Sold!'}</h2>
          <div className="bg-gray-900 rounded-2xl p-5 text-left space-y-3 border border-gray-700">
            {[
              ['Transaction', lastTxn.type==='buy' ? 'Buy Digital Gold' : 'Sell Digital Gold'],
              ['Gold', `${lastTxn.grams.toFixed(4)}g of 24K Gold`],
              ['Amount', formatINR(lastTxn.rupees)],
              ['Rate',   `${formatINR(lastTxn.price)}/gram`],
              ['Time',   new Date().toLocaleTimeString('en-IN')],
              ['Status', '✅ Successful'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-100 font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">Your gold is stored in MMTC-PAMP certified vaults. 99.9% purity guaranteed.</p>
          <div className="flex gap-3">
            <button onClick={() => { setStep('main'); setInput(''); setTab('holdings'); }}
              className="flex-1 bg-gray-800 text-gray-200 py-3.5 rounded-2xl font-medium">View Holdings</button>
            <button onClick={() => { setStep('main'); setInput(''); setTab('buy'); }}
              className="flex-1 bg-yellow-500 text-gray-900 py-3.5 rounded-2xl font-bold">Buy More</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Gold Header */}
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 px-5 pt-12 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center text-white">←</button>
            <h1 className="text-white font-bold text-lg">Digital Gold</h1>
            <span className="ml-auto text-xs bg-black/20 text-white px-2 py-1 rounded-full">24K • 99.9% Pure</span>
          </div>

          {/* Live price */}
          <div className="bg-black/20 rounded-2xl p-4">
            <p className="text-yellow-100 text-xs mb-1">Live Gold Price</p>
            <div className="flex items-end gap-3">
              <p className="text-white text-3xl font-bold">{formatINR(goldPrice)}<span className="text-base font-normal opacity-70">/gram</span></p>
              <span className={`text-sm font-semibold mb-1 ${priceChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange)}% today
              </span>
            </div>
          </div>

          {/* Holdings summary */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label:'You Hold', val: `${goldHeld.toFixed(4)}g` },
              { label:'Value',    val: formatINR(holdingValue) },
              { label:'P&L',      val: `+${gainPct}%` },
            ].map(({ label, val }) => (
              <div key={label} className="bg-black/15 rounded-xl p-2.5 text-center">
                <p className="text-white font-bold text-sm">{val}</p>
                <p className="text-yellow-100/70 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 mx-4 mt-4 rounded-xl p-1">
        {[{k:'buy',l:'🪙 Buy'},{k:'sell',l:'💵 Sell'},{k:'holdings',l:'📊 Holdings'}].map(({k,l}) => (
          <button key={k} onClick={() => { setTab(k); setInput(''); setStep('main'); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab===k?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm':'text-gray-500'}`}>{l}</button>
        ))}
      </div>

      <div className="p-4 space-y-4">

        {(tab === 'buy' || tab === 'sell') && step === 'main' && (
          <>
            {tab === 'sell' && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 flex items-center gap-3">
                <span className="text-2xl">🪙</span>
                <div>
                  <p className="text-xs text-gray-500">Available to sell</p>
                  <p className="font-bold text-amber-700 dark:text-amber-400">{goldHeld.toFixed(4)}g = {formatINR(holdingValue)}</p>
                </div>
              </div>
            )}

            {/* Mode toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {[{k:'rupee',l:'₹ In Rupees'},{k:'gram',l:'⚖️ In Grams'}].map(({k,l}) => (
                <button key={k} onClick={() => { setMode(k); setInput(''); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${mode===k?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm':'text-gray-500'}`}>{l}</button>
              ))}
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">
                  {mode==='rupee' ? '₹' : 'g'}
                </span>
                <input type="number" value={input} onChange={e => setInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-9 pr-4 py-4 text-3xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-yellow-500 text-center"
                  placeholder="0" step={mode==='gram' ? '0.001' : '1'} />
              </div>

              {/* Conversion display */}
              {input && parseFloat(input) > 0 && (
                <div className="flex items-center justify-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                  <span className="text-2xl">🪙</span>
                  <div className="text-center">
                    <p className="font-bold text-amber-700 dark:text-amber-400">
                      {mode==='rupee' ? `${grams.toFixed(4)}g of 24K Gold` : `${formatINR(rupees)}`}
                    </p>
                    <p className="text-xs text-gray-400">at {formatINR(goldPrice)}/gram</p>
                  </div>
                </div>
              )}

              {/* Quick amounts */}
              {mode === 'rupee' && (
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {[500,1000,2000,5000].map(a => (
                    <button key={a} onClick={() => setInput(String(a))}
                      className={`py-2 rounded-xl text-xs font-medium border transition ${String(a)===input?'bg-yellow-500 text-white border-yellow-500':'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      ₹{a}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 text-xs text-gray-500 space-y-1.5">
              <div className="flex justify-between"><span>Gold Rate</span><span className="font-medium">{formatINR(goldPrice)}/gram</span></div>
              <div className="flex justify-between"><span>GST (3%)</span><span className="font-medium">{formatINR(rupees * 0.03)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100 text-sm border-t border-gray-100 dark:border-gray-800 pt-1.5">
                <span>Total</span>
                <span>{formatINR(tab==='buy' ? rupees*1.03 : rupees*0.97)}</span>
              </div>
            </div>

            <button onClick={() => setStep('confirm')}
              disabled={!input || parseFloat(input) <= 0 || (tab==='sell' && grams > goldHeld)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-gray-900 font-bold py-4 rounded-2xl transition">
              {tab==='buy' ? `🪙 Buy Gold` : `💵 Sell Gold`} →
            </button>
          </>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-5 text-center text-gray-900">
                <p className="text-sm opacity-70">{tab==='buy' ? 'You are buying' : 'You are selling'}</p>
                <p className="text-4xl font-bold">{grams.toFixed(4)}g</p>
                <p className="text-sm opacity-70">of 24K Digital Gold</p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  ['Gold rate',    formatINR(goldPrice) + '/gram'],
                  ['Grams',        grams.toFixed(4) + 'g'],
                  ['Sub-total',    formatINR(rupees)],
                  [tab==='buy'?'GST (3%)':'Making charges', formatINR(rupees * 0.03)],
                  ['Total', formatINR(tab==='buy' ? rupees*1.03 : rupees*0.97)],
                ].map(([k,v]) => (
                  <div key={k} className={`flex justify-between text-sm ${k==='Total'?'font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-800':''}`}>
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-900 dark:text-gray-100">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">Gold stored in MMTC-PAMP vaults · 99.9% purity · 24/7 accessible</p>
            <div className="flex gap-3">
              <button onClick={() => setStep('main')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-4 rounded-2xl text-gray-700 dark:text-gray-300 font-medium">Back</button>
              <button onClick={handleTransaction} disabled={loading}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-gray-900 font-bold py-4 rounded-2xl transition">
                {loading ? '⏳ Processing...' : `Confirm ${tab==='buy'?'Buy':'Sell'}`}
              </button>
            </div>
          </div>
        )}

        {tab === 'holdings' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-5 text-gray-900">
              <p className="text-sm opacity-70">Total Holdings</p>
              <p className="text-3xl font-bold">{goldHeld.toFixed(4)} grams</p>
              <p className="text-sm opacity-70">≈ {formatINR(holdingValue)}</p>
              <div className="flex gap-4 mt-3">
                <div>
                  <p className="text-xs opacity-60">Invested</p>
                  <p className="font-semibold">{formatINR(investedValue)}</p>
                </div>
                <div>
                  <p className="text-xs opacity-60">Gain</p>
                  <p className="font-semibold text-green-700">+{formatINR(gainValue)} (+{gainPct}%)</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
              <p className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Why Digital Gold?</p>
              <div className="space-y-2">
                {[
                  { icon:'🔐', text:'Stored in MMTC-PAMP certified vaults' },
                  { icon:'💰', text:'Start with just ₹1 — no minimum weight' },
                  { icon:'📦', text:'Convert to physical gold coins anytime' },
                  { icon:'📈', text:'Hedge against inflation and currency risk' },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-base">{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => toast('Delivery request for physical gold placed!')}
              className="w-full border-2 border-yellow-400 text-yellow-600 dark:text-yellow-400 font-bold py-3.5 rounded-2xl hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition">
              📦 Request Physical Delivery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
