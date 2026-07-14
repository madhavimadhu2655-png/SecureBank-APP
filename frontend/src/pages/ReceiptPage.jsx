import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ReceiptPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const receiptRef = useRef(null);

  // Accept receipt data from navigation state OR use demo data
  const tx = location.state?.tx || {
    transactionId: 'UPI' + Date.now(),
    amount: 1500,
    senderName: 'You',
    receiverName: 'Ravi Kumar',
    receiverUpi: 'ravi@upi',
    note: 'Lunch payment',
    status: 'completed',
    createdAt: new Date().toISOString(),
    type: 'UPI Transfer',
  };

  const formatINR = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);
  const txDate    = format(new Date(tx.createdAt), 'EEEE, MMMM d yyyy');
  const txTime    = format(new Date(tx.createdAt), 'h:mm a');

  const handleShare = async () => {
    const text = `SecureBank Payment Receipt\n\nAmount: ${formatINR(tx.amount)}\nTo: ${tx.receiverName}\nUPI: ${tx.receiverUpi}\nDate: ${txDate} ${txTime}\nTxn ID: ${tx.transactionId}\nStatus: ✅ Success`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Payment Receipt', text }); }
      catch {}
    } else {
      await navigator.clipboard?.writeText(text);
      toast.success('Receipt copied to clipboard!');
    }
  };

  const steps = [
    { label: 'Payment Initiated',  time: txTime,                                                        done: true },
    { label: 'Bank Authorization', time: format(new Date(new Date(tx.createdAt).getTime() + 2000), 'h:mm:ss a'), done: true },
    { label: 'UPI Processing',     time: format(new Date(new Date(tx.createdAt).getTime() + 4000), 'h:mm:ss a'), done: true },
    { label: 'Payment Successful', time: format(new Date(new Date(tx.createdAt).getTime() + 6000), 'h:mm:ss a'), done: true },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 max-w-md mx-auto pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Receipt</h1>
          <button onClick={handleShare} className="ml-auto text-purple-600 dark:text-purple-400 text-sm font-medium">📤 Share</button>
        </div>
      </div>

      <div className="p-4" ref={receiptRef}>
        {/* Receipt card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm">
          {/* Success banner */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">✓</div>
            <p className="text-white font-bold text-3xl">{formatINR(tx.amount)}</p>
            <p className="text-green-100 text-sm mt-1">Payment Successful</p>
          </div>

          {/* Tear effect */}
          <div className="flex">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full -mt-1.5 mx-0.5" />
            ))}
          </div>

          <div className="p-5 space-y-4">
            {/* From → To */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">From</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{tx.senderName}</p>
              </div>
              <div className="text-2xl text-gray-400">→</div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">To</p>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{tx.receiverName}</p>
                <p className="text-xs text-gray-400 font-mono">{tx.receiverUpi}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              {[
                ['Transaction ID', tx.transactionId?.slice(0, 20) + '...', true],
                ['Payment Type',   tx.type || 'UPI Transfer', false],
                ['Note',           tx.note || '—', false],
                ['Date',           txDate, false],
                ['Time',           txTime, false],
                ['Status',         '✅ Successful', false],
              ].map(([k, v, mono]) => (
                <div key={k} className="flex justify-between items-start gap-4">
                  <span className="text-sm text-gray-500 flex-shrink-0">{k}</span>
                  <span className={`text-sm font-medium text-gray-900 dark:text-gray-100 text-right ${mono ? 'font-mono text-xs' : ''}`}>{v}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-gray-200 dark:border-gray-700" />

            {/* Payment timeline */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Timeline</p>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${s.done ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      {s.done ? '✓' : ''}
                    </div>
                    <div className="flex-1 flex justify-between">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{s.label}</span>
                      <span className="text-xs text-gray-400">{s.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SecureBank watermark */}
            <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-400">🏦 SecureBank · Secured by 256-bit encryption</p>
              <p className="text-xs text-gray-300 dark:text-gray-600 mt-0.5">This is an electronically generated receipt</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button onClick={() => navigate('/upi')} className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3.5 rounded-2xl">
            Home
          </button>
          <button onClick={handleShare} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl transition">
            📤 Share Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
