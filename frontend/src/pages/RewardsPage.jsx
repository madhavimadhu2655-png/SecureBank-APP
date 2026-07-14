import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SCRATCH_CARDS = [
  { id: 1, reward: '₹25',    type: 'cashback', color: 'from-purple-500 to-indigo-600',  scratched: false, trigger: 'Paid electricity bill' },
  { id: 2, reward: '₹50',    type: 'cashback', color: 'from-green-500 to-emerald-600',  scratched: false, trigger: 'Mobile recharge done' },
  { id: 3, reward: 'Better luck next time', type: 'none', color: 'from-gray-400 to-gray-500', scratched: false, trigger: 'UPI transfer' },
  { id: 4, reward: '5% off',  type: 'offer',   color: 'from-orange-500 to-red-500',     scratched: true,  trigger: 'Bill payment', wonAmount: '₹30' },
];

const REWARDS_HISTORY = [
  { id: 1, title: 'Mobile Recharge Cashback',  amount: 25,  date: '2 days ago',  type: 'credit', status: 'Credited' },
  { id: 2, title: 'Electricity Bill Cashback', amount: 50,  date: '5 days ago',  type: 'credit', status: 'Credited' },
  { id: 3, title: 'Festival Bonus',            amount: 100, date: '1 week ago',  type: 'credit', status: 'Credited' },
  { id: 4, title: 'Referral Bonus',            amount: 200, date: '2 weeks ago', type: 'credit', status: 'Credited' },
  { id: 5, title: 'Redeemed — Bank Transfer',  amount: -150,date: '3 weeks ago', type: 'debit',  status: 'Redeemed' },
];

const OFFERS = [
  { id: 1, title: '5% Cashback on Jio Recharge',     desc: 'Min recharge ₹199',      expiry: '3 days left',  color: 'bg-blue-50 dark:bg-blue-900/10',   border: 'border-blue-200 dark:border-blue-800',   emoji: '📱' },
  { id: 2, title: '₹30 Off on Electricity Bill',     desc: 'Min bill amount ₹500',   expiry: '5 days left',  color: 'bg-yellow-50 dark:bg-yellow-900/10', border: 'border-yellow-200 dark:border-yellow-800', emoji: '⚡' },
  { id: 3, title: 'Flat ₹100 on First Credit Card',  desc: 'For new users only',      expiry: '7 days left',  color: 'bg-red-50 dark:bg-red-900/10',     border: 'border-red-200 dark:border-red-800',     emoji: '💳' },
  { id: 4, title: '10x Reward Points on Shopping',   desc: 'Selected merchants only', expiry: '2 days left',  color: 'bg-purple-50 dark:bg-purple-900/10', border: 'border-purple-200 dark:border-purple-800', emoji: '🛒' },
  { id: 5, title: '₹50 Cashback on DTH Recharge',   desc: 'Min ₹299',               expiry: '10 days left', color: 'bg-green-50 dark:bg-green-900/10',  border: 'border-green-200 dark:border-green-800',  emoji: '📡' },
];

// Scratch card canvas component
const ScratchCard = ({ card, onScratched }) => {
  const canvasRef = useRef(null);
  const [isScratching, setIsScratching] = useState(false);
  const [revealed, setRevealed] = useState(card.scratched);
  const [scratchPct, setScratchPct] = useState(0);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 - 8);
    ctx.font = '12px sans-serif';
    ctx.fillText('🤞 Good luck!', canvas.width / 2, canvas.height / 2 + 12);
  };

  React.useEffect(() => { initCanvas(); }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const scratch = (e) => {
    if (!isScratching || revealed) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
    ctx.fill();

    // Check how much is scratched
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 4) { if (pixels[i] === 0) transparent++; }
    const pct = (transparent / (pixels.length / 4)) * 100;
    setScratchPct(pct);
    if (pct > 40 && !revealed) {
      setRevealed(true);
      onScratched(card.id);
    }
  };

  return (
    <div className={`bg-gradient-to-br ${card.color} rounded-2xl overflow-hidden relative`} style={{ height: 140 }}>
      {/* Content underneath */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
        <p className="text-xs opacity-80 mb-1">You won!</p>
        <p className="text-2xl font-bold">{card.reward}</p>
        {card.type === 'cashback' && <p className="text-xs opacity-80 mt-1">Instant cashback</p>}
      </div>

      {/* Scratch overlay */}
      {!revealed ? (
        <canvas
          ref={canvasRef}
          width={200} height={140}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none' }}
          onMouseDown={() => setIsScratching(true)}
          onMouseUp={() => setIsScratching(false)}
          onMouseMove={scratch}
          onTouchStart={() => setIsScratching(true)}
          onTouchEnd={() => setIsScratching(false)}
          onTouchMove={scratch}
        />
      ) : (
        <div className="absolute bottom-2 right-2">
          <span className="text-white text-xs opacity-70">✓ Scratched</span>
        </div>
      )}

      {/* Trigger label */}
      <div className="absolute top-2 left-2 bg-white/20 rounded-full px-2 py-0.5">
        <p className="text-white text-xs">{card.trigger}</p>
      </div>
    </div>
  );
};

export default function RewardsPage() {
  const navigate = useNavigate();
  const [tab, setTab]     = useState('scratch');
  const [cards, setCards] = useState(SCRATCH_CARDS);
  const [points]          = useState(875);
  const totalCashback     = REWARDS_HISTORY.filter(r => r.type === 'credit').reduce((s, r) => s + r.amount, 0);

  const handleScratched = (id) => {
    setCards(prev => prev.map(c => c.id === id ? { ...c, scratched: true } : c));
    const card = cards.find(c => c.id === id);
    if (card?.type !== 'none') toast.success(`🎉 ${card?.reward} won! Credited to your account.`);
    else toast('Better luck next time!', { icon: '🎯' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">←</button>
          <h1 className="font-bold text-white text-lg">Rewards & Cashback</h1>
        </div>

        {/* Points summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Reward Points', val: points.toLocaleString('en-IN'), icon: '⭐' },
            { label: 'Total Cashback', val: `₹${totalCashback}`, icon: '💰' },
            { label: 'Scratch Cards', val: cards.filter(c => !c.scratched).length, icon: '🃏' },
          ].map(({ label, val, icon }) => (
            <div key={label} className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-white font-bold text-sm">{val}</p>
              <p className="text-purple-200 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 mx-4 mt-4 rounded-xl p-1">
        {[
          { k: 'scratch', label: '🃏 Scratch Cards' },
          { k: 'offers',  label: '🎁 Offers' },
          { k: 'history', label: '📋 History' },
        ].map(({ k, label }) => (
          <button key={k} onClick={() => setTab(k)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition ${tab === k ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {tab === 'scratch' && (
          <>
            <p className="text-xs text-gray-500">Scratch to reveal your reward! Swipe your finger on the card.</p>
            <div className="grid grid-cols-2 gap-3">
              {cards.filter(c => !c.scratched).map(card => (
                <ScratchCard key={card.id} card={card} onScratched={handleScratched} />
              ))}
            </div>
            {cards.filter(c => !c.scratched).length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">🎉</p>
                <p className="text-sm font-medium">All cards scratched!</p>
                <p className="text-xs mt-1">Make payments to earn more scratch cards</p>
              </div>
            )}
            {cards.filter(c => c.scratched).length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Already Scratched</p>
                <div className="grid grid-cols-2 gap-3 opacity-60">
                  {cards.filter(c => c.scratched).map(card => (
                    <div key={card.id} className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 flex flex-col items-center justify-center`} style={{ height: 100 }}>
                      <p className="text-white font-bold">{card.reward}</p>
                      <p className="text-white/70 text-xs mt-1">✓ Claimed</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {tab === 'offers' && (
          <div className="space-y-3">
            {OFFERS.map(offer => (
              <div key={offer.id} className={`${offer.color} border ${offer.border} rounded-2xl p-4 flex items-start gap-3`}>
                <span className="text-3xl flex-shrink-0">{offer.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{offer.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{offer.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">⏰ {offer.expiry}</span>
                    <button onClick={() => toast.success('Offer activated!')}
                      className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-medium">
                      Activate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'history' && (
          <>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {REWARDS_HISTORY.map((r, i) => (
                <div key={r.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < REWARDS_HISTORY.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${r.type === 'credit' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    {r.type === 'credit' ? '💰' : '💸'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400">{r.date}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${r.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {r.type === 'credit' ? '+' : ''}₹{Math.abs(r.amount)}
                    </p>
                    <p className="text-xs text-gray-400">{r.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => toast('Transfer to bank account coming soon!')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-2xl transition">
              💸 Redeem ₹{totalCashback} to Bank Account
            </button>
          </>
        )}
      </div>
    </div>
  );
}
