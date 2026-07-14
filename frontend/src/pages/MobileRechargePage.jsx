import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const OPERATORS = [
  { id: 'jio', name: 'Jio', logo: '🔵', color: 'bg-blue-50 border-blue-200' },
  { id: 'airtel', name: 'Airtel', logo: '🔴', color: 'bg-red-50 border-red-200' },
  { id: 'vi', name: 'Vi', logo: '🟣', color: 'bg-purple-50 border-purple-200' },
  { id: 'bsnl', name: 'BSNL', logo: '🟤', color: 'bg-orange-50 border-orange-200' },
];

const PLANS = {
  jio: [
    { id: 1, amount: 149, validity: '24 Days', data: '1GB/day', calls: 'Unlimited', sms: '100/day', tag: null },
    { id: 2, amount: 239, validity: '28 Days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', tag: 'Popular' },
    { id: 3, amount: 299, validity: '28 Days', data: '2GB/day', calls: 'Unlimited', sms: '100/day', tag: null },
    { id: 4, amount: 399, validity: '56 Days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', tag: 'Best Value' },
    { id: 5, amount: 599, validity: '84 Days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', tag: null },
    { id: 6, amount: 2999, validity: '365 Days', data: '2GB/day', calls: 'Unlimited', sms: '100/day', tag: 'Annual' },
  ],
  airtel: [
    { id: 1, amount: 155, validity: '24 Days', data: '1GB/day', calls: 'Unlimited', sms: '100/day', tag: null },
    { id: 2, amount: 265, validity: '28 Days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', tag: 'Popular' },
    { id: 3, amount: 359, validity: '28 Days', data: '2.5GB/day', calls: 'Unlimited', sms: '100/day', tag: 'Best Value' },
    { id: 4, amount: 499, validity: '56 Days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', tag: null },
  ],
  vi: [
    { id: 1, amount: 149, validity: '28 Days', data: '1GB/day', calls: 'Unlimited', sms: '100/day', tag: null },
    { id: 2, amount: 249, validity: '28 Days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', tag: 'Popular' },
    { id: 3, amount: 299, validity: '28 Days', data: '2GB/day', calls: 'Unlimited', sms: '100/day', tag: null },
  ],
  bsnl: [
    { id: 1, amount: 107, validity: '25 Days', data: '1GB/day', calls: 'Unlimited', sms: '100/day', tag: null },
    { id: 2, amount: 187, validity: '28 Days', data: '2GB/day', calls: 'Unlimited', sms: '100/day', tag: 'Popular' },
    { id: 3, amount: 397, validity: '60 Days', data: '2GB/day', calls: 'Unlimited', sms: '100/day', tag: null },
  ],
};

export default function MobileRechargePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [operator, setOperator] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState('form'); // form | plans | confirm | success
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const plans = operator ? PLANS[operator] || [] : [];
  const balance = user?.balance ?? 0;

  const detectOperator = (num) => {
    if (num.startsWith('6') || num.startsWith('7') || num.startsWith('8') || num.startsWith('9')) {
      const rand = ['jio', 'airtel', 'vi', 'bsnl'][Math.floor(Math.random() * 4)];
      setOperator(rand);
    }
  };

  const handlePhoneChange = (v) => {
    const cleaned = v.replace(/\D/g, '').slice(0, 10);
    setPhone(cleaned);
    if (cleaned.length === 10) detectOperator(cleaned);
    else setOperator(null);
  };

  const handleRecharge = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
    toast.success('Recharge successful!');
  };

  const amount = selectedPlan?.amount || parseFloat(customAmount) || 0;
  const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-5xl mx-auto animate-bounce">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recharge Successful!</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 text-left space-y-2 w-full">
            {[
              ['Mobile Number', `+91 ${phone}`],
              ['Operator', OPERATORS.find(o => o.id === operator)?.name],
              ['Plan', `${selectedPlan?.data} for ${selectedPlan?.validity}`],
              ['Amount Paid', formatINR(amount)],
              ['Transaction ID', 'TXN' + Date.now()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => navigate('/upi')} className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-medium">Home</button>
            <button onClick={() => { setStep('form'); setPhone(''); setOperator(null); setSelectedPlan(null); }}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold">Recharge Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Mobile Recharge</h1>
        </div>

        {/* Phone input */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
          <span className="text-gray-400 font-medium">+91</span>
          <div className="w-px h-5 bg-gray-300 dark:bg-gray-600" />
          <input type="tel" value={phone} onChange={e => handlePhoneChange(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white text-lg font-semibold focus:outline-none tracking-wider"
            placeholder="Enter mobile number" />
          {phone.length === 10 && <span className="text-green-500">✓</span>}
        </div>

        {/* Detected operator */}
        {operator && (
          <div className="flex items-center gap-2 mt-3">
            <span>{OPERATORS.find(o => o.id === operator)?.logo}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{OPERATORS.find(o => o.id === operator)?.name} — Prepaid detected</span>
            <button className="ml-auto text-purple-600 text-xs font-medium">Change</button>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {!operator ? (
          /* Operator selection */
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400">Select operator manually:</p>
            <div className="grid grid-cols-2 gap-3">
              {OPERATORS.map(op => (
                <button key={op.id} onClick={() => setOperator(op.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${operator === op.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
                  <span className="text-2xl">{op.logo}</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">{op.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Custom amount */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Or enter custom amount</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input type="number" value={customAmount} onChange={e => { setCustomAmount(e.target.value); setSelectedPlan(null); }}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-8 pr-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter amount" />
              </div>
            </div>

            {/* Plans */}
            <div>
              <p className="font-bold text-gray-900 dark:text-white mb-3">Recommended Plans</p>
              <div className="space-y-3">
                {plans.map(plan => (
                  <button key={plan.id} onClick={() => { setSelectedPlan(plan); setCustomAmount(''); }}
                    className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${selectedPlan?.id === plan.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">₹{plan.amount}</span>
                          {plan.tag && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">{plan.tag}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{plan.validity} validity</p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-blue-600 dark:text-blue-400 font-medium">{plan.data}</p>
                        <p className="text-gray-400">{plan.calls} calls</p>
                        <p className="text-gray-400">{plan.sms} SMS</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky bottom pay button */}
      {(selectedPlan || parseFloat(customAmount) > 0) && phone.length === 10 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-gray-500">Recharging +91 {phone}</span>
            <span className="font-bold text-gray-900 dark:text-white">{formatINR(amount)}</span>
          </div>
          <button onClick={handleRecharge} disabled={loading || amount > balance}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
            {loading ? '⏳ Processing...' : amount > balance ? 'Insufficient Balance' : `Recharge ₹${amount}`}
          </button>
        </div>
      )}
    </div>
  );
}
