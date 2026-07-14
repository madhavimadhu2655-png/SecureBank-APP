import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const PLANS = [
  { id:1, name:'SecureCare Basic',    company:'Star Health',     premium:8999,  cover:300000,  features:['Hospitalization','Day Care','Pre/Post Hospitalization'],           color:'from-blue-500 to-cyan-500',   popular:false },
  { id:2, name:'SecureCare Plus',     company:'HDFC Ergo',       premium:14999, cover:500000,  features:['All Basic+','Maternity','OPD Cover','Mental Health'],              color:'from-purple-600 to-indigo-600',popular:true  },
  { id:3, name:'SecureCare Family',   company:'Niva Bupa',       premium:22999, cover:1000000, features:['Entire Family','Critical Illness','International Cover','Dental'],  color:'from-green-500 to-emerald-600',popular:false },
  { id:4, name:'SecureCare Senior',   company:'Care Health',     premium:35999, cover:500000,  features:['Age 60+','Pre-existing Diseases','Ambulance','Home Care'],         color:'from-orange-500 to-red-500',   popular:false },
];

const MY_POLICIES = [
  { id:1, name:'SecureCare Plus',  company:'HDFC Ergo', cover:500000, premium:14999, renewal:'Jun 15, 2026', members:3, status:'active' },
];

export default function InsurancePage() {
  const navigate = useNavigate();
  const [tab, setTab]         = useState('plans');
  const [selected, setSelected] = useState(null);
  const [step, setStep]       = useState('list');  // list | form | confirm | success
  const [form, setForm]       = useState({ name:'', dob:'', mobile:'', members:1 });
  const [loading, setLoading] = useState(false);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);

  const handleBuy = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep('success');
    toast.success('Policy purchased!');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto flex items-center justify-center p-6">
        <div className="text-center w-full space-y-4">
          <div className="text-6xl">🛡️</div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto">✅</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Policy Activated!</h2>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 text-left space-y-2 border border-gray-200 dark:border-gray-700">
            {[['Plan', selected?.name],['Company', selected?.company],['Cover', formatINR(selected?.cover)],['Premium', formatINR(selected?.premium) + '/yr'],['Policy No', 'POL'+Date.now()]].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/upi')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-medium">Home</button>
            <button onClick={() => { setTab('policies'); setStep('list'); }} className="flex-1 bg-purple-600 text-white py-3 rounded-2xl font-bold">View Policy</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step === 'list' ? navigate(-1) : setStep('list')} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Health Insurance</h1>
        </div>
        {step === 'list' && (
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {[{k:'plans',l:'🛡️ Buy Plans'},{k:'policies',l:'📋 My Policies'}].map(({k,l}) => (
              <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab===k?'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm':'text-gray-500'}`}>{l}</button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {step === 'list' && tab === 'plans' && (
          <>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex gap-3">
              <span className="text-2xl">🛡️</span>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Why Health Insurance?</p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Medical costs are rising. A ₹5 lakh cover can protect your savings from unexpected hospital bills.</p>
              </div>
            </div>

            {PLANS.map(plan => (
              <div key={plan.id} className={`relative bg-white dark:bg-gray-900 rounded-2xl border-2 overflow-hidden ${selected?.id === plan.id ? 'border-purple-500' : 'border-gray-200 dark:border-gray-700'}`}>
                {plan.popular && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Most Popular</div>}
                <div className={`bg-gradient-to-r ${plan.color} p-4 text-white`}>
                  <p className="font-bold text-lg">{plan.name}</p>
                  <p className="text-sm opacity-80">{plan.company}</p>
                  <div className="flex items-end gap-2 mt-2">
                    <p className="text-2xl font-bold">{formatINR(plan.premium)}<span className="text-sm opacity-80">/year</span></p>
                    <p className="text-sm opacity-80">· Cover: {formatINR(plan.cover)}</p>
                  </div>
                </div>
                <div className="p-4">
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="text-green-500 flex-shrink-0">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => { setSelected(plan); setStep('form'); }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition">
                    Buy Now →
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {step === 'list' && tab === 'policies' && (
          <>
            {MY_POLICIES.map(p => (
              <div key={p.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center gap-3">
                  <span className="text-3xl">🛡️</span>
                  <div>
                    <p className="font-bold">{p.name}</p>
                    <p className="text-purple-200 text-sm">{p.company}</p>
                  </div>
                  <span className="ml-auto text-xs bg-green-400 text-green-900 px-2 py-0.5 rounded-full font-bold">Active</span>
                </div>
                <div className="p-4 space-y-3">
                  {[['Sum Insured', formatINR(p.cover)],['Annual Premium', formatINR(p.premium)],['Members Covered', p.members],['Renewal Date', p.renewal]].map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex border-t border-gray-100 dark:border-gray-800">
                  <button className="flex-1 py-3 text-sm text-purple-600 dark:text-purple-400 font-medium">View Details</button>
                  <button onClick={() => toast.success('Claim process started!')} className="flex-1 py-3 text-sm text-green-600 dark:text-green-400 font-medium border-l border-gray-100 dark:border-gray-800">File Claim</button>
                  <button onClick={() => toast.success('Renewed!')} className="flex-1 py-3 text-sm text-blue-600 dark:text-blue-400 font-medium border-l border-gray-100 dark:border-gray-800">Renew</button>
                </div>
              </div>
            ))}
          </>
        )}

        {step === 'form' && selected && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <h2 className="font-bold text-gray-900 dark:text-white">Personal Details</h2>
              {[{k:'name',l:'Full Name',p:'Enter your full name',t:'text'},{k:'dob',l:'Date of Birth',p:'',t:'date'},{k:'mobile',l:'Mobile Number',p:'9876543210',t:'tel'}].map(({k,l,p,t}) => (
                <div key={k}>
                  <label className="text-xs text-gray-500 block mb-1.5">{l}</label>
                  <input type={t} value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                    placeholder={p} />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Members to Cover</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setForm(f => ({...f, members: Math.max(1, f.members-1)}))} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-xl font-bold">−</button>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white w-8 text-center">{form.members}</span>
                  <button onClick={() => setForm(f => ({...f, members: Math.min(6, f.members+1)}))} className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 text-xl font-bold">+</button>
                </div>
              </div>
            </div>
            <button onClick={() => setStep('confirm')} disabled={!form.name || !form.dob || !form.mobile}
              className="w-full bg-purple-600 disabled:opacity-50 text-white font-bold py-4 rounded-2xl">Review & Pay →</button>
          </div>
        )}

        {step === 'confirm' && selected && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className={`bg-gradient-to-r ${selected.color} p-4 text-white text-center`}>
                <p className="font-bold text-lg">{selected.name}</p>
                <p className="text-3xl font-bold mt-1">{formatINR(selected.premium)}<span className="text-base">/year</span></p>
              </div>
              <div className="p-4 space-y-2">
                {[['Insured', form.name],['Sum Insured', formatINR(selected.cover)],['Members', form.members],['Start Date', new Date().toLocaleDateString('en-IN')],['GST (18%)', formatINR(selected.premium * 0.18)],['Total', formatINR(selected.premium * 1.18)]].map(([k,v]) => (
                  <div key={k} className={`flex justify-between text-sm ${k==='Total'?'font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-800':''}`}>
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-900 dark:text-gray-100">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleBuy} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition">
              {loading ? '⏳ Processing...' : `🛡️ Buy Policy ${formatINR(selected.premium * 1.18)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
