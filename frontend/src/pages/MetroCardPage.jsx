import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';

const CITIES = [
  { id:'delhi',   name:'Delhi Metro (DMRC)',        color:'bg-blue-600',   zones:['Zone 1','Zone 2','Zone 3','Zone 4'] },
  { id:'mumbai',  name:'Mumbai Metro',               color:'bg-red-600',    zones:['Line 1','Line 2A','Line 7'] },
  { id:'bangalore',name:'Namma Metro (BMRCL)',      color:'bg-green-600',  zones:['Purple Line','Green Line'] },
  { id:'chennai', name:'Chennai Metro',              color:'bg-orange-600', zones:['Corridor 1','Corridor 2'] },
  { id:'kolkata', name:'Kolkata Metro',              color:'bg-blue-800',   zones:['North-South','East-West'] },
  { id:'hyderabad',name:'Hyderabad Metro (HMR)',    color:'bg-purple-600', zones:['Red Line','Blue Line','Green Line'] },
  { id:'pune',    name:'Pune Metro',                 color:'bg-teal-600',   zones:['Line 1','Line 2'] },
  { id:'kochi',   name:'Kochi Metro',                color:'bg-cyan-600',   zones:['Main Line'] },
];

const RECHARGE_AMOUNTS = [50, 100, 200, 500, 1000];

export default function MetroCardPage() {
  const navigate = useNavigate();
  const [city, setCity]         = useState(null);
  const [cardNo, setCardNo]     = useState('');
  const [amount, setAmount]     = useState('');
  const [cardData, setCardData] = useState(null);
  const [step, setStep]         = useState('city');  // city | card | amount | success
  const [loading, setLoading]   = useState(false);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);

  const fetchCard = async () => {
    if (cardNo.replace(/\s/g,'').length < 8) { toast.error('Enter valid card number'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setCardData({ balance: Math.floor(50 + Math.random() * 300), cardNo, holder: 'Card Holder', expiry: '12/2028' });
    setLoading(false);
    setStep('amount');
  };

  const handlePay = async () => {
    if (!amount || parseFloat(amount) < 50) { toast.error('Minimum recharge ₹50'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setStep('success');
    toast.success('Metro card recharged!');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => step === 'city' ? navigate(-1) : setStep(s => s === 'card' ? 'city' : s === 'amount' ? 'card' : 'city')}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">←</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Metro Card Recharge</h1>
            <p className="text-sm text-gray-500">Top up your smart card instantly</p>
          </div>
        </div>

        {/* City selection */}
        {step === 'city' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Select Your City</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {CITIES.map(c => (
                <button key={c.id} onClick={() => { setCity(c); setStep('card'); }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition">
                  <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center text-white text-xl`}>🚇</div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">{c.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Card number */}
        {step === 'card' && city && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
            <div className={`${city.color} rounded-2xl p-5 text-white`}>
              <p className="text-sm opacity-80">{city.name}</p>
              <p className="text-2xl font-bold mt-1">Smart Card</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Card / Pass Number</label>
              <input type="text" value={cardNo} onChange={e => setCardNo(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-mono text-lg focus:outline-none focus:border-purple-500"
                placeholder="Enter your card number" />
            </div>
            <button onClick={fetchCard} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition">
              {loading ? '⏳ Fetching card...' : 'Proceed →'}
            </button>
          </div>
        )}

        {/* Amount selection */}
        {step === 'amount' && cardData && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className={`w-12 h-12 ${city?.color} rounded-xl flex items-center justify-center text-white text-2xl`}>🚇</div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{city?.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{cardData.cardNo}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-400">Current Balance</p>
                  <p className="font-bold text-green-600 dark:text-green-400">{formatINR(cardData.balance)}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-500 mb-3">Select Recharge Amount</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                {RECHARGE_AMOUNTS.map(a => (
                  <button key={a} onClick={() => setAmount(String(a))}
                    className={`py-3 rounded-xl text-sm font-bold border-2 transition ${String(a)===amount ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    ₹{a}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-3 text-gray-900 dark:text-white font-semibold focus:outline-none focus:border-purple-500"
                  placeholder="Or enter custom amount" />
              </div>
            </div>
            <button onClick={handlePay} disabled={loading || !amount || parseFloat(amount) < 50}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Processing...' : `Recharge ${amount ? formatINR(parseFloat(amount)) : ''}`}
            </button>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center space-y-4">
            <div className="text-6xl">🚇</div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">✅</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Metro Card Recharged!</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-2">
              {[['Metro',formatINR(parseFloat(amount))],['Card No',cardData?.cardNo],['New Balance',formatINR((cardData?.balance || 0) + parseFloat(amount))],['Txn ID','METRO'+Date.now()]].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm"><span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span></div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/upi')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-xl text-gray-700 dark:text-gray-300 font-medium">Home</button>
              <button onClick={() => { setStep('city'); setCardNo(''); setAmount(''); setCardData(null); }} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold">Recharge Again</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
