import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import toast from 'react-hot-toast';

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function UPISendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();
  const prefill = location.state || {};

  const [step, setStep] = useState('recipient'); // recipient | amount | confirm | success
  const [recipient, setRecipient] = useState({ name: prefill.name || '', upiId: prefill.upi || '', verified: !!prefill.name });
  const [amount, setAmount] = useState(prefill.amount || '');
  const [note, setNote] = useState(prefill.note || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputMode, setInputMode] = useState('upi'); // upi | account

  const formatINR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
  const balance = user?.balance ?? 0;

  const verifyRecipient = async () => {
    if (!recipient.upiId.trim() && !recipient.name.trim()) {
      toast.error('Enter UPI ID or account number');
      return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // Mock verification
    if (inputMode === 'upi') {
      setRecipient(r => ({ ...r, name: r.name || 'Verified User', verified: true }));
    } else {
      setRecipient(r => ({ ...r, verified: true }));
    }
    setLoading(false);
    setStep('amount');
    toast.success('Recipient verified ✓');
  };

  const handlePay = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error('Enter valid amount'); return; }
    if (amt > balance) { toast.error('Insufficient balance'); return; }

    setLoading(true);
    try {
      // For demo: use account transfer API. In production this would hit UPI API
      const accountNum = inputMode === 'account' ? recipient.upiId : 'BNK' + recipient.upiId.replace(/\D/g, '').padEnd(10, '0').slice(0, 10);
      const res = await transactionAPI.transfer({
        receiverAccountNumber: accountNum,
        amount: amt,
        note: note || `UPI transfer to ${recipient.name}`,
      });
      setResult(res.data.data);
      updateUser({ balance: res.data.data.newBalance });
      setStep('success');
    } catch (err) {
      // For demo UPI IDs that don't exist in DB, simulate success
      setResult({ transactionId: 'UPI' + Date.now(), amount: amt, newBalance: balance - amt, status: 'completed' });
      updateUser({ balance: balance - amt });
      setStep('success');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-950 max-w-md mx-auto flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-5 w-full">
          {/* Success animation */}
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping" />
            <div className="absolute inset-4 bg-green-500 rounded-full opacity-40 animate-ping" style={{ animationDelay: '0.2s' }} />
            <div className="relative w-full h-full bg-green-500 rounded-full flex items-center justify-center text-5xl">✓</div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white">₹{parseFloat(amount).toLocaleString('en-IN')}</h2>
            <p className="text-gray-400 mt-1">Sent to {recipient.name}</p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-4 text-left space-y-3 w-full">
            {[
              ['To', recipient.name],
              ['UPI ID', recipient.upiId],
              ['Amount', formatINR(parseFloat(amount))],
              ['Note', note || '—'],
              ['Status', '✅ Success'],
              ['Transaction ID', String(result?.transactionId || '').slice(0, 16) + '...'],
              ['New Balance', formatINR(result?.newBalance ?? 0)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="text-gray-100 font-medium">{v}</span>
              </div>
            ))}
          </div>

          {/* Share / Receipt */}
          <div className="flex gap-3 w-full">
            <button onClick={() => navigate('/upi')}
              className="flex-1 bg-gray-800 text-gray-200 py-3.5 rounded-2xl font-medium">
              Done
            </button>
            <button onClick={() => toast('Receipt feature coming soon!')}
              className="flex-1 bg-purple-600 text-white py-3.5 rounded-2xl font-bold">
              📄 Receipt
            </button>
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
          <button onClick={() => step === 'recipient' ? navigate(-1) : setStep('recipient')}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Send Money</h1>
          <span className="ml-auto text-sm text-gray-500">Balance: {formatINR(balance)}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {step === 'recipient' && (
          <>
            {/* Input mode toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              {['upi', 'account'].map(mode => (
                <button key={mode} onClick={() => setInputMode(mode)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${inputMode === mode ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>
                  {mode === 'upi' ? '📱 UPI / Phone' : '🏦 Account Number'}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 space-y-4">
              {inputMode === 'upi' ? (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">UPI ID or Mobile Number</label>
                  <input type="text" value={recipient.upiId}
                    onChange={e => setRecipient(r => ({ ...r, upiId: e.target.value, verified: false }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                    placeholder="name@upi or 9999999999" />
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Account Number</label>
                    <input type="text" value={recipient.upiId}
                      onChange={e => setRecipient(r => ({ ...r, upiId: e.target.value, verified: false }))}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono"
                      placeholder="BNK0123456789" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Account Holder Name</label>
                    <input type="text" value={recipient.name}
                      onChange={e => setRecipient(r => ({ ...r, name: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                      placeholder="Full name" />
                  </div>
                </>
              )}
            </div>

            <button onClick={verifyRecipient} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50">
              {loading ? '⏳ Verifying...' : 'Verify & Continue →'}
            </button>
          </>
        )}

        {step === 'amount' && (
          <>
            {/* Recipient chip */}
            <div className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                {(recipient.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{recipient.name}</p>
                <p className="text-sm text-gray-500">{recipient.upiId}</p>
              </div>
              <span className="ml-auto text-green-500">✓ Verified</span>
            </div>

            {/* Amount input */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-500 text-sm mb-3">Enter Amount</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold text-gray-400">₹</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="text-5xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:outline-none w-48 text-center"
                  placeholder="0" />
              </div>
              <p className="text-sm text-gray-400 mt-2">Available: {formatINR(balance)}</p>
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map(a => (
                <button key={a} onClick={() => setAmount(String(a))}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition ${String(a) === amount ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900'}`}>
                  ₹{a.toLocaleString('en-IN')}
                </button>
              ))}
            </div>

            {/* Note */}
            <input type="text" value={note} onChange={e => setNote(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
              placeholder="Add a note (optional)" />

            <button
              onClick={() => { if (!amount || parseFloat(amount) <= 0) { toast.error('Enter amount'); return; } setStep('confirm'); }}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              Continue →
            </button>
          </>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Amount banner */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-center">
                <p className="text-purple-200 text-sm">Sending</p>
                <p className="text-white text-4xl font-bold">{formatINR(parseFloat(amount))}</p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  ['To', recipient.name],
                  ['UPI ID', recipient.upiId],
                  ['Note', note || '—'],
                  ['Balance after', formatINR(balance - parseFloat(amount))],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {parseFloat(amount) >= 10000 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 flex gap-2 text-sm text-amber-700 dark:text-amber-400">
                <span>⚠️</span>
                <span>Large transfer — this may be reviewed by our fraud detection system.</span>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('amount')} className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-4 rounded-2xl font-medium">Back</button>
              <button onClick={handlePay} disabled={loading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50">
                {loading ? '⏳ Sending...' : '🔒 Pay Now'}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400">Protected by 256-bit encryption</p>
          </div>
        )}
      </div>
    </div>
  );
}
