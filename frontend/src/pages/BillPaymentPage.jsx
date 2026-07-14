import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const BILL_CONFIG = {
  electricity: {
    title: 'Electricity Bill',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
    label: 'Consumer / CA Number',
    providers: ['BESCOM', 'TNEB', 'MSEDCL', 'UPPCL', 'KSEB', 'PSPCL', 'WBSEDCL', 'TSSPDCL'],
    placeholder: 'Enter consumer number',
  },
  water: {
    title: 'Water Bill',
    icon: '🌊',
    color: 'from-blue-500 to-cyan-500',
    label: 'Connection Number',
    providers: ['BMC', 'CMWSSB', 'HMWSSB', 'BWSSB', 'NMMC', 'PCMC'],
    placeholder: 'Enter connection number',
  },
  gas: {
    title: 'Gas / LPG Bill',
    icon: '🛢️',
    color: 'from-orange-500 to-red-500',
    label: 'BP Number / LPG ID',
    providers: ['Indane', 'HP Gas', 'Bharat Gas'],
    placeholder: 'Enter BP number',
  },
  broadband: {
    title: 'Broadband / Internet',
    icon: '📶',
    color: 'from-blue-600 to-indigo-600',
    label: 'Account / Customer ID',
    providers: ['JioFiber', 'Airtel Xstream', 'BSNL Broadband', 'ACT Fibernet', 'Excitel', 'Hathway'],
    placeholder: 'Enter account ID',
  },
  dth: {
    title: 'DTH / Cable TV',
    icon: '📡',
    color: 'from-purple-500 to-pink-500',
    label: 'Subscriber ID',
    providers: ['Tata Play', 'Dish TV', 'Airtel Digital TV', 'Sun Direct', 'DD Free Dish'],
    placeholder: 'Enter subscriber ID',
  },
};

export default function BillPaymentPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const config = BILL_CONFIG[type] || BILL_CONFIG.electricity;

  const [provider, setProvider] = useState('');
  const [accountId, setAccountId] = useState('');
  const [billData, setBillData] = useState(null);
  const [step, setStep] = useState('form'); // form | bill | success
  const [loading, setLoading] = useState(false);

  const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const fetchBill = async () => {
    if (!provider || !accountId.trim()) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1300));
    setBillData({
      consumerName: user?.name,
      accountId,
      provider,
      billAmount: Math.floor(Math.random() * 3000) + 500,
      billDate: new Date(Date.now() - 15 * 86400000).toLocaleDateString('en-IN'),
      dueDate: new Date(Date.now() + 10 * 86400000).toLocaleDateString('en-IN'),
      units: type === 'electricity' ? Math.floor(Math.random() * 200) + 50 : null,
      billPeriod: 'March 2026',
    });
    setLoading(false);
    setStep('bill');
  };

  const handlePay = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
    toast.success(`${config.title} paid successfully!`);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto flex items-center justify-center p-6">
        <div className="text-center space-y-4 w-full">
          <div className="text-6xl animate-bounce">{config.icon}</div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">✅</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Bill Paid Successfully!</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 text-left space-y-2">
            {[
              ['Service', config.title],
              ['Provider', billData?.provider],
              ['Account', billData?.accountId],
              ['Amount', formatINR(billData?.billAmount)],
              ['Date', new Date().toLocaleDateString('en-IN')],
              ['Txn Ref', 'BILL' + Date.now()],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/upi')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-xl text-gray-800 dark:text-gray-200 font-medium">Home</button>
            <button onClick={() => { setStep('form'); setProvider(''); setAccountId(''); setBillData(null); }}
              className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold">Pay Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-10">
      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${config.color} px-4 pt-12 pb-8`}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step === 'form' ? navigate(-1) : setStep('form')}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">←</button>
          <h1 className="text-white font-bold text-lg">{config.title}</h1>
        </div>
        <div className="text-5xl">{config.icon}</div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {step === 'form' && (
          <>
            {/* Provider select */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-3">
                Select Provider
              </label>
              <div className="grid grid-cols-2 gap-2">
                {config.providers.map(p => (
                  <button key={p} onClick={() => setProvider(p)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all ${provider === p ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-300'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Account ID */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
                {config.label}
              </label>
              <input type="text" value={accountId} onChange={e => setAccountId(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 text-lg font-mono"
                placeholder={config.placeholder} />
            </div>

            <button onClick={fetchBill} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50">
              {loading ? '⏳ Fetching bill...' : 'Fetch Bill →'}
            </button>
          </>
        )}

        {step === 'bill' && billData && (
          <>
            {/* Bill details */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className={`bg-gradient-to-r ${config.color} p-4 text-white`}>
                <p className="text-sm opacity-80">{billData.provider}</p>
                <p className="font-bold text-lg">{billData.consumerName}</p>
                <p className="text-sm opacity-80 font-mono">{billData.accountId}</p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Bill Amount</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatINR(billData.billAmount)}</span>
                </div>
                {[
                  ['Bill Period', billData.billPeriod],
                  ['Bill Date', billData.billDate],
                  ['Due Date', billData.dueDate],
                  ...(billData.units ? [['Units Consumed', `${billData.units} units`]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cashback offer */}
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-3 flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Get ₹25 cashback</p>
                <p className="text-xs text-green-600 dark:text-green-500">Pay now and earn reward points</p>
              </div>
            </div>

            <button onClick={handlePay} disabled={loading || billData.billAmount > (user?.balance ?? 0)}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Processing payment...' : `Pay ${formatINR(billData.billAmount)}`}
            </button>
            {billData.billAmount > (user?.balance ?? 0) && (
              <p className="text-center text-red-500 text-sm">Insufficient account balance</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
