import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';

const PROVIDERS = [
  { id:'indane', name:'Indane Gas',    logo:'🟠', color:'bg-orange-500', distributor:'Indane Distributor, Sector 12' },
  { id:'hp',     name:'HP Gas',        logo:'🔵', color:'bg-blue-500',   distributor:'HP Hindustan Gas, MG Road' },
  { id:'bharat', name:'Bharat Gas',    logo:'🔴', color:'bg-red-500',    distributor:'Bharat Petroleum, Anna Nagar' },
];

export default function GasPage() {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [bpNo, setBpNo]         = useState('');
  const [mobile, setMobile]     = useState('');
  const [data, setData]         = useState(null);
  const [step, setStep]         = useState('select'); // select | details | confirm | success
  const [loading, setLoading]   = useState(false);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);

  const fetchDetails = async () => {
    if (!bpNo.trim() || bpNo.trim().length < 8) { toast.error('Enter valid BP number (min 8 digits)'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setData({
      name: 'Customer Name',
      bpNo,
      mobile,
      provider: PROVIDERS.find(p => p.id === provider),
      cylinderType: '14.2 KG',
      price: 850 + Math.floor(Math.random() * 100),
      deliveryDate: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' }),
      subsidyApplicable: Math.random() > 0.5,
      subsidyAmount: 150,
      bookingCount: Math.floor(Math.random() * 3) + 1,
      maxAllowed: 3,
    });
    setLoading(false);
    setStep('confirm');
  };

  const handleBook = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1300));
    setLoading(false);
    setStep('success');
    toast.success('LPG cylinder booked!');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => step === 'select' ? navigate(-1) : setStep(s => s === 'details' ? 'select' : s === 'confirm' ? 'details' : 'select')}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">←</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gas / LPG Booking 🛢️</h1>
            <p className="text-sm text-gray-500">Book your cooking gas cylinder</p>
          </div>
        </div>

        {step === 'select' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Select Gas Provider</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PROVIDERS.map(p => (
                  <button key={p.id} onClick={() => { setProvider(p.id); setStep('details'); }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition">
                    <div className={`w-14 h-14 ${p.color} rounded-2xl flex items-center justify-center text-3xl shadow-sm`}>{p.logo}</div>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{p.name}</p>
                    <p className="text-xs text-gray-400 text-center">{p.distributor}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Info card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <p className="font-semibold">📋 Before you book</p>
              <p>• Maximum 3 cylinders per month allowed</p>
              <p>• Delivery within 2-3 working days</p>
              <p>• Subsidy credited to linked bank account</p>
            </div>
          </div>
        )}

        {step === 'details' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className={`w-12 h-12 ${PROVIDERS.find(p=>p.id===provider)?.color} rounded-xl flex items-center justify-center text-2xl`}>
                {PROVIDERS.find(p=>p.id===provider)?.logo}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{PROVIDERS.find(p=>p.id===provider)?.name}</p>
                <p className="text-xs text-gray-400">{PROVIDERS.find(p=>p.id===provider)?.distributor}</p>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">BP Number / LPG ID *</label>
              <input type="text" value={bpNo} onChange={e => setBpNo(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-mono focus:outline-none focus:border-purple-500"
                placeholder="Enter your 17-digit BP number" />
              <p className="text-xs text-gray-400 mt-1">Find on your gas passbook or last booking receipt</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Registered Mobile Number</label>
              <input type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g,'').slice(0,10))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                placeholder="9876543210" />
            </div>
            <button onClick={fetchDetails} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition">
              {loading ? '⏳ Fetching details...' : 'Get Booking Details →'}
            </button>
          </div>
        )}

        {step === 'confirm' && data && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className={`${data.provider?.color} p-4 text-white`}>
                <p className="text-lg font-bold">{data.provider?.name}</p>
                <p className="text-sm opacity-80">{data.cylinderType} Cylinder</p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  ['Customer', data.name],
                  ['BP Number', data.bpNo],
                  ['Cylinder Price', formatINR(data.price)],
                  ...(data.subsidyApplicable ? [['Subsidy (PAHAL)', `-${formatINR(data.subsidyAmount)}`]] : []),
                  ['You Pay', formatINR(data.subsidyApplicable ? data.price : data.price)],
                  ['Delivery by', data.deliveryDate],
                  ['Bookings this month', `${data.bookingCount} of ${data.maxAllowed} used`],
                ].map(([k,v]) => (
                  <div key={k} className={`flex justify-between text-sm pb-2 border-b border-gray-50 dark:border-gray-800 ${k==='You Pay' ? 'font-bold text-base' : ''}`}>
                    <span className="text-gray-500">{k}</span>
                    <span className={`${k==='Subsidy (PAHAL)' ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'} font-semibold`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleBook} disabled={loading || data.bookingCount >= data.maxAllowed}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              {loading ? '⏳ Booking cylinder...' : data.bookingCount >= data.maxAllowed ? '⚠️ Monthly limit reached' : `🛢️ Book Cylinder — ${formatINR(data.price)}`}
            </button>
          </div>
        )}

        {step === 'success' && data && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center space-y-4">
            <div className="text-6xl animate-bounce">🛢️</div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">✅</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Cylinder Booked!</h2>
            <p className="text-gray-500 text-sm">Delivery expected by {data.deliveryDate}</p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-2">
              {[['Provider', data.provider?.name],['BP Number', data.bpNo],['Amount Paid', formatINR(data.price)],['Booking Ref', 'GAS'+Date.now()]].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm"><span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span></div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/upi')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300">Home</button>
              <button onClick={() => { setStep('select'); setBpNo(''); setMobile(''); setData(null); setProvider(null); }} className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold">Book Again</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
