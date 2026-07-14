import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', logo: '🏦', color: 'bg-blue-600' },
  { id: 'icici', name: 'ICICI Bank', logo: '🏛️', color: 'bg-orange-600' },
  { id: 'sbi', name: 'SBI Card', logo: '🏢', color: 'bg-blue-800' },
  { id: 'axis', name: 'Axis Bank', logo: '🔷', color: 'bg-purple-600' },
  { id: 'kotak', name: 'Kotak', logo: '🔴', color: 'bg-red-600' },
  { id: 'amex', name: 'Amex', logo: '💳', color: 'bg-blue-500' },
  { id: 'yes', name: 'Yes Bank', logo: '🟢', color: 'bg-green-600' },
  { id: 'rbl', name: 'RBL Bank', logo: '🟡', color: 'bg-yellow-600' },
];

export default function CreditCardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState('select'); // select | enter | confirm | success
  const [selectedBank, setSelectedBank] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [billData, setBillData] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const fetchBill = async () => {
    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast.error('Enter valid 16-digit card number');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    // Mock bill data
    const mockBill = {
      cardHolder: user?.name,
      cardNumber: cardNumber,
      bank: BANKS.find(b => b.id === selectedBank)?.name,
      totalDue: 12450,
      minDue: 450,
      dueDate: '2026-05-05',
      lastStatement: 15200,
      availableLimit: 87550,
      totalLimit: 100000,
    };
    setBillData(mockBill);
    setPayAmount(String(mockBill.totalDue));
    setLoading(false);
    setStep('confirm');
  };

  const handlePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
    toast.success('Credit card bill paid!');
  };

  const formatCard = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 text-left space-y-3">
            {[
              ['Bank', billData?.bank],
              ['Card Number', `•••• •••• •••• ${cardNumber.replace(/\s/g, '').slice(-4)}`],
              ['Amount Paid', formatINR(parseFloat(payAmount))],
              ['Payment Date', new Date().toLocaleDateString('en-IN')],
              ['Reference', 'REF' + Date.now()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/upi')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-xl text-gray-800 dark:text-gray-200 font-medium">Home</button>
            <button onClick={() => { setStep('select'); setCardNumber(''); setBillData(null); setSelectedBank(null); }}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold">Pay Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => step === 'select' ? navigate(-1) : setStep('select')}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Credit Card Payment</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {step === 'select' && (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Select your card issuer</p>
            <div className="grid grid-cols-2 gap-3">
              {BANKS.map(bank => (
                <button key={bank.id} onClick={() => { setSelectedBank(bank.id); setStep('enter'); }}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-400 transition">
                  <div className={`w-10 h-10 ${bank.color} rounded-xl flex items-center justify-center text-white text-lg`}>
                    {bank.logo}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{bank.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'enter' && (
          <div className="space-y-4">
            {/* Selected bank */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <div className={`w-10 h-10 ${BANKS.find(b => b.id === selectedBank)?.color} rounded-xl flex items-center justify-center text-white`}>
                {BANKS.find(b => b.id === selectedBank)?.logo}
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{BANKS.find(b => b.id === selectedBank)?.name}</span>
              <button onClick={() => setStep('select')} className="ml-auto text-purple-600 text-sm">Change</button>
            </div>

            {/* Card number input */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700">
              <label className="text-sm text-gray-500 dark:text-gray-400 block mb-3">Credit Card Number</label>
              <input type="text" value={cardNumber}
                onChange={e => setCardNumber(formatCard(e.target.value))}
                className="w-full text-2xl font-mono font-bold tracking-widest text-gray-900 dark:text-white bg-transparent focus:outline-none"
                placeholder="0000 0000 0000 0000" maxLength={19} />
              {/* Card visual */}
              <div className="mt-4 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-4 text-white">
                <p className="text-xs opacity-70 mb-4">Credit Card</p>
                <p className="font-mono text-lg tracking-widest mb-4">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
                <p className="text-sm font-medium">{user?.name?.toUpperCase()}</p>
              </div>
            </div>

            <button onClick={fetchBill} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50">
              {loading ? '⏳ Fetching bill...' : 'Fetch Bill Details →'}
            </button>
          </div>
        )}

        {step === 'confirm' && billData && (
          <div className="space-y-4">
            {/* Bill summary */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{billData.bank}</p>
                  <p className="text-sm text-gray-500 font-mono">•••• •••• •••• {billData.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                </div>
                <span className="text-2xl">💳</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                  <p className="text-red-500 text-xs mb-1">Total Due</p>
                  <p className="font-bold text-red-600 dark:text-red-400 text-lg">{formatINR(billData.totalDue)}</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3">
                  <p className="text-yellow-600 text-xs mb-1">Minimum Due</p>
                  <p className="font-bold text-yellow-700 dark:text-yellow-400 text-lg">{formatINR(billData.minDue)}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {[
                  ['Due Date', new Date(billData.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                  ['Available Limit', formatINR(billData.availableLimit)],
                  ['Total Limit', formatINR(billData.totalLimit)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount options */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Pay Amount</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { label: 'Total Due', val: billData.totalDue },
                  { label: 'Min Due', val: billData.minDue },
                  { label: 'Custom', val: null },
                ].map(({ label, val }) => (
                  <button key={label}
                    onClick={() => setPayAmount(val ? String(val) : '')}
                    className={`py-2 rounded-xl text-xs font-medium border transition ${String(val) === payAmount ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                    {label}
                    {val && <div className="text-xs mt-0.5 font-bold">{formatINR(val)}</div>}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-semibold"
                  placeholder="Enter amount" />
              </div>
            </div>

            <button onClick={handlePay} disabled={loading || !payAmount || parseFloat(payAmount) <= 0 || parseFloat(payAmount) > (user?.balance ?? 0)}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Processing...' : `Pay ${payAmount ? formatINR(parseFloat(payAmount)) : ''}`}
            </button>
            {parseFloat(payAmount) > (user?.balance ?? 0) && (
              <p className="text-center text-red-500 text-sm">Insufficient balance in your account</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
