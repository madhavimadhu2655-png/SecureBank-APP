import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import Layout from '../components/common/Layout';

const LARGE_THRESHOLD = 10000;

export default function TransferPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('form');   // 'form' | 'confirm' | 'otp' | 'success'
  const [form, setForm] = useState({ receiverAccountNumber: '', amount: '', note: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [otp, setOtp] = useState('');
  const [mockOtp, setMockOtp] = useState('');

  const validate = () => {
    const e = {};
    if (!form.receiverAccountNumber.trim()) e.receiverAccountNumber = 'Account number required';
    else if (!/^BNK\d{10}$/.test(form.receiverAccountNumber.trim()))
      e.receiverAccountNumber = 'Format: BNK followed by 10 digits';
    const amt = parseFloat(form.amount);
    if (!form.amount) e.amount = 'Amount is required';
    else if (isNaN(amt) || amt < 0.01) e.amount = 'Minimum transfer is $0.01';
    else if (amt > user.balance) e.amount = `Insufficient funds (balance: $${user.balance.toFixed(2)})`;
    else if (amt > 1000000) e.amount = 'Maximum $1,000,000 per transfer';
    return e;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    const amt = parseFloat(form.amount);

    // Large transfer — request OTP first
    if (amt >= LARGE_THRESHOLD && !otp) {
      setLoading(true);
      try {
        const res = await transactionAPI.requestOTP({ amount: amt });
        setMockOtp(res.data.data.otp); // Demo: show OTP to user
        setStep('otp');
        toast('OTP sent! (Demo: check below)', { icon: '📱' });
      } catch (err) {
        toast.error('Failed to send OTP');
      } finally {
        setLoading(false);
      }
      return;
    }

    await submitTransfer();
  };

  const submitTransfer = async () => {
    setLoading(true);
    try {
      const res = await transactionAPI.transfer({
        receiverAccountNumber: form.receiverAccountNumber.trim(),
        amount: parseFloat(form.amount),
        note: form.note.trim(),
        ...(otp && { otpCode: otp }),
      });
      const data = res.data.data;
      setResult(data);
      updateUser({ balance: data.newBalance });
      setStep('success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Transfer failed. Please try again.';
      toast.error(msg);
      if (err.response?.data?.requiresOtp) {
        setStep('otp');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('form');
    setForm({ receiverAccountNumber: '', amount: '', note: '' });
    setErrors({});
    setOtp('');
    setMockOtp('');
    setResult(null);
  };

  const formatUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
  const hc = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }));
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }));
  };

  return (
    <Layout>
      <div className="max-w-lg mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Send Money</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Balance: <span className="font-semibold text-gray-700 dark:text-gray-300">{formatUSD(user?.balance ?? 0)}</span>
          </p>
        </div>

        {/* ── Step indicator ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-6">
          {['form', 'confirm', 'success'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 text-xs font-medium ${
                step === s || (step === 'otp' && s === 'confirm')
                  ? 'text-blue-600 dark:text-blue-400'
                  : s === 'success' && step === 'success'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  step === s ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                  {i + 1}
                </div>
                {['Details', 'Confirm', 'Done'][i]}
              </div>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />}
            </React.Fragment>
          ))}
        </div>

        {/* ── FORM STEP ─────────────────────────────────────────────── */}
        {step === 'form' && (
          <div className="card p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Recipient Account Number</label>
              <input type="text" className={`input-field font-mono ${errors.receiverAccountNumber ? 'border-red-400' : ''}`}
                placeholder="BNK0123456789" value={form.receiverAccountNumber} onChange={hc('receiverAccountNumber')} />
              {errors.receiverAccountNumber && <p className="mt-1 text-xs text-red-500">{errors.receiverAccountNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                <input type="number" step="0.01" min="0.01" className={`input-field pl-7 ${errors.amount ? 'border-red-400' : ''}`}
                  placeholder="0.00" value={form.amount} onChange={hc('amount')} />
              </div>
              {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
              {parseFloat(form.amount) >= LARGE_THRESHOLD && (
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ OTP verification required for transfers ≥ {formatUSD(LARGE_THRESHOLD)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Note (optional)</label>
              <input type="text" className="input-field" maxLength={200}
                placeholder="e.g. Rent payment" value={form.note} onChange={hc('note')} />
            </div>

            <button onClick={handleFormSubmit} className="btn-primary w-full py-2.5">Continue</button>
          </div>
        )}

        {/* ── CONFIRM STEP ──────────────────────────────────────────── */}
        {step === 'confirm' && (
          <div className="card p-6 space-y-4 animate-slide-up">
            <h2 className="font-semibold text-gray-900 dark:text-white">Confirm transfer</h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3 text-sm">
              {[
                ['To account', form.receiverAccountNumber],
                ['Amount', formatUSD(parseFloat(form.amount))],
                ['Note', form.note || '—'],
                ['New balance', formatUSD(user.balance - parseFloat(form.amount))],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{k}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="btn-secondary flex-1">Back</button>
              <button onClick={handleConfirm} disabled={loading} className="btn-primary flex-1">
                {loading ? 'Processing...' : parseFloat(form.amount) >= LARGE_THRESHOLD ? 'Send OTP' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        )}

        {/* ── OTP STEP ──────────────────────────────────────────────── */}
        {step === 'otp' && (
          <div className="card p-6 space-y-4 animate-slide-up">
            <h2 className="font-semibold text-gray-900 dark:text-white">Enter OTP</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              An OTP has been sent to your registered contact. Enter it below to confirm this large transfer.
            </p>
            {mockOtp && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400">
                🧪 Demo OTP: <span className="font-mono font-bold">{mockOtp}</span>
              </div>
            )}
            <input type="text" maxLength={6} className="input-field text-center font-mono text-xl tracking-widest"
              placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} />
            <div className="flex gap-3">
              <button onClick={() => setStep('confirm')} className="btn-secondary flex-1">Back</button>
              <button onClick={submitTransfer} disabled={loading || otp.length < 6} className="btn-primary flex-1">
                {loading ? 'Verifying...' : 'Verify & Transfer'}
              </button>
            </div>
          </div>
        )}

        {/* ── SUCCESS STEP ──────────────────────────────────────────── */}
        {step === 'success' && result && (
          <div className="card p-6 text-center animate-slide-up">
            <div className="text-5xl mb-4">{result.isFlagged ? '⚠️' : '✅'}</div>
            <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
              {result.isFlagged ? 'Transfer Under Review' : 'Transfer Successful!'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
              {result.isFlagged
                ? 'This transfer has been flagged for security review. Funds are held pending approval.'
                : `${formatUSD(result.amount)} sent to ${result.receiver?.name}`}
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-left space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID</span>
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300">{result.transactionId?.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">New Balance</span>
                <span className="font-semibold text-green-600">{formatUSD(result.newBalance)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={reset} className="btn-secondary flex-1">New Transfer</button>
              <button onClick={() => navigate('/history')} className="btn-primary flex-1">View History</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
