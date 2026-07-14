import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const WALLET_TXN = [
  { id:1, type:'credit', desc:'Added from HDFC Bank',      amount:2000,  date:'Today, 10:23 AM',   icon:'🏦' },
  { id:2, type:'debit',  desc:'Paid at Big Bazaar',        amount:450,   date:'Today, 9:15 AM',    icon:'🛒' },
  { id:3, type:'credit', desc:'Cashback received',         amount:25,    date:'Yesterday',         icon:'🎁' },
  { id:4, type:'debit',  desc:'Mobile Recharge - Jio',    amount:299,   date:'Yesterday',         icon:'📱' },
  { id:5, type:'credit', desc:'Money received from Ravi',  amount:500,   date:'2 days ago',        icon:'💸' },
  { id:6, type:'debit',  desc:'Electricity Bill - BESCOM', amount:1240,  date:'3 days ago',        icon:'⚡' },
];

const ADD_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function WalletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [walletBal, setWalletBal] = useState(1250.50);
  const [tab, setTab]       = useState('home');   // home | add | send | history
  const [addAmt, setAddAmt] = useState('');
  const [sendData, setSendData] = useState({ to:'', amount:'' });
  const [loading, setLoading] = useState(false);
  const [showBal, setShowBal] = useState(true);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:2 }).format(n);

  const handleAdd = async () => {
    const amt = parseFloat(addAmt);
    if (!amt || amt < 10) { toast.error('Minimum add ₹10'); return; }
    if (amt > 10000) { toast.error('Maximum add ₹10,000 at once'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setWalletBal(b => b + amt);
    setLoading(false);
    setAddAmt('');
    setTab('home');
    toast.success(`₹${amt} added to wallet!`);
  };

  const handleSend = async () => {
    const amt = parseFloat(sendData.amount);
    if (!sendData.to) { toast.error('Enter recipient'); return; }
    if (!amt || amt <= 0) { toast.error('Enter amount'); return; }
    if (amt > walletBal) { toast.error('Insufficient wallet balance'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setWalletBal(b => b - amt);
    setLoading(false);
    setSendData({ to:'', amount:'' });
    setTab('home');
    toast.success(`₹${amt} sent from wallet!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-5 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">←</button>
              <h1 className="text-white font-bold text-lg">SecureWallet</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-400/30 text-green-200 px-2 py-1 rounded-full font-medium">✓ KYC Verified</span>
            </div>
          </div>

          {/* Balance card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-5 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm">Wallet Balance</p>
              <button onClick={() => setShowBal(s => !s)} className="text-white/70 text-sm">{showBal ? '👁' : '🙈'}</button>
            </div>
            <p className="text-white text-4xl font-bold tracking-tight">
              {showBal ? formatINR(walletBal) : '₹ ••••••'}
            </p>
            <p className="text-white/50 text-xs mt-1">Max limit: ₹10,000 · Used: {Math.round((walletBal/10000)*100)}%</p>
            {/* Limit bar */}
            <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/70 rounded-full" style={{ width:`${Math.min((walletBal/10000)*100,100)}%` }} />
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label:'Add Money', icon:'➕', action:() => setTab('add') },
              { label:'Send',      icon:'📤', action:() => setTab('send') },
              { label:'History',   icon:'📋', action:() => setTab('history') },
              { label:'Withdraw',  icon:'🏦', action:() => toast('Withdraw to bank coming soon!') },
            ].map(({ label, icon, action }) => (
              <button key={label} onClick={action}
                className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl hover:bg-white/30 transition">
                  {icon}
                </div>
                <span className="text-white/80 text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-10 relative z-10 pb-4">

        {/* Home tab */}
        {tab === 'home' && (
          <div className="space-y-4">
            {/* Recent transactions */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
                <p className="font-bold text-gray-900 dark:text-white">Recent Transactions</p>
                <button onClick={() => setTab('history')} className="text-purple-600 dark:text-purple-400 text-sm font-medium">See all</button>
              </div>
              {WALLET_TXN.slice(0,4).map((t, i) => (
                <div key={t.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < 3 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${t.type==='credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{t.desc}</p>
                    <p className="text-xs text-gray-400">{t.date}</p>
                  </div>
                  <p className={`font-bold text-sm flex-shrink-0 ${t.type==='credit' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                    {t.type==='credit' ? '+' : '-'}{formatINR(t.amount)}
                  </p>
                </div>
              ))}
            </div>

            {/* Wallet perks */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl p-4 border border-purple-100 dark:border-purple-800">
              <p className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Wallet Perks</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { icon:'⚡', label:'Instant Pay', desc:'No PIN needed under ₹500' },
                  { icon:'🎁', label:'Cashback',    desc:'Earn on every payment' },
                  { icon:'🔒', label:'Safe',        desc:'NPCI regulated wallet' },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="bg-white/70 dark:bg-white/5 rounded-2xl p-3">
                    <p className="text-xl mb-1">{icon}</p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Money tab */}
        {tab === 'add' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900 dark:text-white">Add Money to Wallet</p>
              <button onClick={() => setTab('home')} className="text-gray-400 text-lg">✕</button>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">₹</span>
              <input type="number" value={addAmt} onChange={e => setAddAmt(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl pl-9 pr-4 py-4 text-3xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 text-center"
                placeholder="0" />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ADD_AMOUNTS.map(a => (
                <button key={a} onClick={() => setAddAmt(String(a))}
                  className={`py-2.5 rounded-2xl text-sm font-semibold border-2 transition ${String(a)===addAmt ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                  +₹{a}
                </button>
              ))}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 text-xs text-blue-700 dark:text-blue-400 flex gap-2">
              <span>💳</span>
              <span>Money will be deducted from your linked bank account (HDFC •••4521)</span>
            </div>

            <button onClick={handleAdd} disabled={loading || !addAmt || parseFloat(addAmt) < 10}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Adding...' : `Add ${addAmt ? formatINR(parseFloat(addAmt)) : ''} to Wallet`}
            </button>
          </div>
        )}

        {/* Send Money tab */}
        {tab === 'send' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-900 dark:text-white">Send from Wallet</p>
              <button onClick={() => setTab('home')} className="text-gray-400 text-lg">✕</button>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-3 flex items-center gap-3">
              <span className="text-lg">👛</span>
              <div>
                <p className="text-xs text-gray-500">Available in wallet</p>
                <p className="font-bold text-purple-700 dark:text-purple-400">{formatINR(walletBal)}</p>
              </div>
            </div>
            {[
              { key:'to', label:'To (UPI ID / Phone)', placeholder:'name@upi or 9876543210' },
              { key:'amount', label:'Amount (₹)', placeholder:'0', type:'number' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">{label}</label>
                <input type={type||'text'} value={sendData[key]} onChange={e => setSendData(p => ({...p,[key]:e.target.value}))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-semibold"
                  placeholder={placeholder} />
              </div>
            ))}
            <button onClick={handleSend} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Sending...' : 'Send from Wallet'}
            </button>
          </div>
        )}

        {/* History tab */}
        {tab === 'history' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
              <p className="font-bold text-gray-900 dark:text-white">Wallet History</p>
              <button onClick={() => setTab('home')} className="text-gray-400 text-sm">✕ Close</button>
            </div>
            {WALLET_TXN.map((t, i) => (
              <div key={t.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < WALLET_TXN.length-1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${t.type==='credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                  {t.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.desc}</p>
                  <p className="text-xs text-gray-400">{t.date}</p>
                </div>
                <p className={`font-bold text-sm ${t.type==='credit' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                  {t.type==='credit' ? '+' : '-'}{formatINR(t.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
