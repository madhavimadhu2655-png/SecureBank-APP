import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const BANKS = [
  { id: 'sbi',    name: 'State Bank of India', short: 'SBI',   color: '#1a3a6b', logo: '🏦' },
  { id: 'hdfc',   name: 'HDFC Bank',           short: 'HDFC',  color: '#004C8F', logo: '🏛️' },
  { id: 'icici',  name: 'ICICI Bank',          short: 'ICICI', color: '#F37021', logo: '🏢' },
  { id: 'axis',   name: 'Axis Bank',           short: 'Axis',  color: '#97144D', logo: '🔷' },
  { id: 'kotak',  name: 'Kotak Mahindra',      short: 'Kotak', color: '#EF4D23', logo: '🔴' },
  { id: 'pnb',    name: 'Punjab National Bank',short: 'PNB',   color: '#FF6600', logo: '🏗️' },
  { id: 'bob',    name: 'Bank of Baroda',      short: 'BOB',   color: '#F26522', logo: '🟠' },
  { id: 'canara', name: 'Canara Bank',         short: 'Canara',color: '#006633', logo: '🟢' },
  { id: 'union',  name: 'Union Bank',          short: 'Union', color: '#003087', logo: '🔵' },
  { id: 'yes',    name: 'Yes Bank',            short: 'Yes',   color: '#00549A', logo: '✅' },
];

const LINKED = [
  { id: 'sbi', accountNo: '••••••4521', ifsc: 'SBIN0001234', type: 'Savings', balance: 12450, isDefault: true },
];

export default function BankAccountsPage() {
  const navigate = useNavigate();
  const [linked, setLinked] = useState(LINKED);
  const [showAdd, setShowAdd] = useState(false);
  const [step, setStep]   = useState('select'); // select | verify | success
  const [selected, setSelected] = useState(null);
  const [mobileOtp, setMobileOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleAdd = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    const bank = BANKS.find(b => b.id === selected);
    setLinked(prev => [...prev, {
      id: selected,
      accountNo: '••••••' + Math.floor(1000 + Math.random() * 9000),
      ifsc: bank.short.toUpperCase() + '0' + Math.floor(100000 + Math.random() * 900000),
      type: 'Savings',
      balance: Math.floor(5000 + Math.random() * 50000),
      isDefault: false,
    }]);
    setStep('success');
    toast.success(`${bank.name} linked successfully!`);
  };

  const setDefault = (id) => {
    setLinked(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
    toast.success('Default account updated');
  };

  const removeAccount = (id) => {
    if (linked.find(a => a.id === id)?.isDefault) { toast.error("Can't remove default account"); return; }
    setLinked(prev => prev.filter(a => a.id !== id));
    toast.success('Account removed');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Bank Accounts</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Linked accounts */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Linked Accounts</p>
          <div className="space-y-3">
            {linked.map(acc => {
              const bank = BANKS.find(b => b.id === acc.id);
              return (
                <div key={acc.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: bank?.color + '20' }}>
                      {bank?.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{bank?.name}</p>
                        {acc.isDefault && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">Default</span>}
                      </div>
                      <p className="text-sm text-gray-500 font-mono">{acc.accountNo} · {acc.type}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">{formatINR(acc.balance)}</p>
                    </div>
                  </div>
                  <div className="flex border-t border-gray-100 dark:border-gray-800">
                    {!acc.isDefault && (
                      <button onClick={() => setDefault(acc.id)} className="flex-1 py-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition">Set Default</button>
                    )}
                    <button onClick={() => removeAccount(acc.id)} className={`${acc.isDefault ? 'w-full' : 'flex-1 border-l border-gray-100 dark:border-gray-800'} py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition`}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add bank button */}
        {!showAdd ? (
          <button onClick={() => { setShowAdd(true); setStep('select'); }}
            className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl py-5 flex flex-col items-center gap-2 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition">
            <span className="text-3xl">➕</span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Add Bank Account</span>
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">
                {step === 'select' ? 'Select your bank' : step === 'verify' ? 'Verify account' : 'Account linked!'}
              </p>
              <button onClick={() => { setShowAdd(false); setStep('select'); setSelected(null); }} className="text-gray-400 text-lg">✕</button>
            </div>

            {step === 'select' && (
              <div className="p-4 grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {BANKS.filter(b => !linked.find(l => l.id === b.id)).map(bank => (
                  <button key={bank.id} onClick={() => { setSelected(bank.id); setStep('verify'); }}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition ${selected === bank.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                    <span className="text-xl">{bank.logo}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{bank.short}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 'verify' && (
              <div className="p-4 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-400">
                  📱 We'll send an OTP to your registered mobile number to verify your {BANKS.find(b => b.id === selected)?.name} account.
                </div>
                <input type="text" maxLength={6} value={mobileOtp} onChange={e => setMobileOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  placeholder="------" />
                <p className="text-center text-xs text-gray-400">Demo OTP: <span className="font-bold text-purple-600">123456</span></p>
                <button onClick={handleAdd} disabled={mobileOtp !== '123456' || loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition">
                  {loading ? '⏳ Linking...' : 'Link Account'}
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="p-6 text-center space-y-3">
                <div className="text-5xl">🎉</div>
                <p className="font-bold text-gray-900 dark:text-white">Account Linked!</p>
                <button onClick={() => { setShowAdd(false); setStep('select'); setSelected(null); setMobileOtp(''); }}
                  className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl">Done</button>
              </div>
            )}
          </div>
        )}

        {/* UPI ID section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your UPI IDs</p>
          <div className="space-y-2">
            {linked.map(acc => {
              const bank = BANKS.find(b => b.id === acc.id);
              return (
                <div key={acc.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-mono text-gray-900 dark:text-gray-100">user@{acc.id}</p>
                    <p className="text-xs text-gray-500">{bank?.name}</p>
                  </div>
                  {acc.isDefault && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Active</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
