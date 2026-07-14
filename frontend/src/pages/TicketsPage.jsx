import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const MOVIES = [
  { id:1, title:'Fighter 2',         genre:'Action',  lang:'Hindi',  rating:8.2, duration:'2h 45m', img:'🎬', price:250, times:['10:00 AM','1:30 PM','4:00 PM','7:30 PM','10:00 PM'] },
  { id:2, title:'Kalki 2898 - Part 2',genre:'Sci-Fi', lang:'Telugu', rating:8.7, duration:'2h 58m', img:'🚀', price:300, times:['11:00 AM','2:30 PM','6:00 PM','9:30 PM'] },
  { id:3, title:'Animal Returns',    genre:'Thriller',lang:'Hindi',  rating:7.5, duration:'2h 20m', img:'🐅', price:220, times:['10:30 AM','1:00 PM','4:30 PM','8:00 PM'] },
  { id:4, title:'Pushpa 3',          genre:'Action',  lang:'Telugu', rating:9.0, duration:'3h 10m', img:'🌺', price:280, times:['9:30 AM','1:00 PM','5:00 PM','9:00 PM'] },
];

const EVENTS = [
  { id:5, title:'AR Rahman Live',   type:'Concert',   date:'Apr 20', venue:'KSCA Stadium, Bangalore',    price:1500, img:'🎵' },
  { id:6, title:'IPL: RCB vs MI',   type:'Cricket',   date:'Apr 22', venue:'Chinnaswamy Stadium',        price:999,  img:'🏏' },
  { id:7, title:'Comedy Night Show', type:'Comedy',   date:'Apr 25', venue:'Phoenix Marketcity, Pune',   price:599,  img:'😂' },
  { id:8, title:'Sunburn Festival',  type:'Music Fest',date:'Apr 28', venue:'Vagator Beach, Goa',        price:2500, img:'🎉' },
];

const SEATS = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 10 }, (_, col) => ({
    id: `${String.fromCharCode(65+row)}${col+1}`,
    row: String.fromCharCode(65+row),
    col: col+1,
    status: Math.random() > 0.7 ? 'booked' : 'available',
    type: row < 2 ? 'premium' : row < 5 ? 'normal' : 'economy',
  }))
).flat();

export default function TicketsPage() {
  const navigate   = useNavigate();
  const [tab, setTab]       = useState('movies');
  const [selected, setSelected] = useState(null);
  const [step, setStep]     = useState('list');    // list | showtime | seats | confirm | success
  const [showTime, setShowTime] = useState(null);
  const [seats, setSeats]   = useState(SEATS);
  const [selSeats, setSelSeats] = useState([]);
  const [loading, setLoading]   = useState(false);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
  const toggleSeat = (id) => {
    const seat = seats.find(s => s.id === id);
    if (seat.status === 'booked') return;
    if (selSeats.includes(id)) { setSelSeats(prev => prev.filter(s => s !== id)); return; }
    if (selSeats.length >= 6) { toast.error('Max 6 seats per booking'); return; }
    setSelSeats(prev => [...prev, id]);
  };

  const totalAmt = selSeats.length * (selected?.price || 0);

  const handleBook = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSeats(prev => prev.map(s => selSeats.includes(s.id) ? { ...s, status: 'booked' } : s));
    setStep('success');
    toast.success('Tickets booked!');
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-950 max-w-md mx-auto flex items-center justify-center p-6">
        <div className="w-full space-y-5 text-center">
          <div className="text-6xl animate-bounce">{selected?.img || '🎟'}</div>
          <h2 className="text-2xl font-bold text-white">Booking Confirmed!</h2>
          <div className="bg-gray-900 rounded-2xl p-5 text-left space-y-3 border border-gray-700">
            <p className="font-bold text-white text-center text-lg">{selected?.title}</p>
            <div className="border-t border-dashed border-gray-700 pt-3 space-y-2">
              {[
                ['Showtime',    showTime],
                ['Seats',       selSeats.join(', ')],
                ['Tickets',     `${selSeats.length} × ${formatINR(selected?.price)}`],
                ['Total Paid',  formatINR(totalAmt)],
                ['Booking ID',  'BK' + Date.now()],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-gray-400">{k}</span>
                  <span className="text-gray-100 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="bg-purple-900/30 rounded-xl p-3 text-center">
              <p className="text-purple-300 text-xs">📱 Show this at the theater counter</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setStep('list'); setSelected(null); setSelSeats([]); setShowTime(null); }}
              className="flex-1 bg-gray-800 text-gray-200 py-3.5 rounded-2xl font-medium">Home</button>
            <button onClick={() => toast('Download ticket feature!')}
              className="flex-1 bg-purple-600 text-white py-3.5 rounded-2xl font-bold">⬇️ Download</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step === 'list' ? navigate(-1) : setStep(s => s === 'showtime' ? 'list' : s === 'seats' ? 'showtime' : s === 'confirm' ? 'seats' : 'list')}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">
            {step === 'list' ? 'Movies & Events' : step === 'showtime' ? 'Select Showtime' : step === 'seats' ? 'Select Seats' : 'Confirm Booking'}
          </h1>
        </div>
        {step === 'list' && (
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {[{k:'movies',l:'🎬 Movies'},{k:'events',l:'🎪 Events'}].map(({k,l}) => (
              <button key={k} onClick={() => setTab(k)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab===k ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500'}`}>{l}</button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {step === 'list' && tab === 'movies' && (
          <div className="space-y-3">
            {MOVIES.map(m => (
              <button key={m.id} onClick={() => { setSelected(m); setStep('showtime'); }}
                className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex gap-4 text-left hover:border-purple-300 transition">
                <div className="w-16 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">{m.img}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white">{m.title}</p>
                  <p className="text-xs text-gray-500">{m.genre} · {m.lang} · {m.duration}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full font-medium">★ {m.rating}</span>
                    <span className="text-xs text-gray-500">From {formatINR(m.price)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.times.slice(0,3).map(t => (
                      <span key={t} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded font-mono">{t}</span>
                    ))}
                    {m.times.length > 3 && <span className="text-xs text-gray-400">+{m.times.length-3} more</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'list' && tab === 'events' && (
          <div className="space-y-3">
            {EVENTS.map(e => (
              <button key={e.id} onClick={() => { setSelected(e); setSelSeats(['E1']); setStep('confirm'); }}
                className="w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex gap-3 text-left hover:border-purple-300 transition">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">{e.img}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{e.title}</p>
                  <p className="text-xs text-gray-500">{e.type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">📅 {e.date} · 📍 {e.venue}</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mt-1">From {formatINR(e.price)}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {step === 'showtime' && selected && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex gap-4">
              <div className="text-4xl">{selected.img}</div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{selected.title}</p>
                <p className="text-xs text-gray-500">{selected.genre} · {selected.duration}</p>
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today · Select Showtime</p>
            <div className="grid grid-cols-3 gap-3">
              {selected.times?.map(t => (
                <button key={t} onClick={() => { setShowTime(t); setStep('seats'); }}
                  className={`py-3 rounded-xl border-2 text-sm font-semibold transition ${showTime===t ? 'border-purple-600 bg-purple-600 text-white' : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:border-purple-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'seats' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-gray-200 dark:bg-gray-800 rounded-t-3xl h-3 mx-8 mb-6 flex items-center justify-center">
                <span className="text-xs text-gray-400 absolute mt-6">SCREEN</span>
              </div>
              <div className="flex flex-col gap-1 items-center">
                {['A','B','C','D','E','F','G','H'].map(row => (
                  <div key={row} className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 w-4">{row}</span>
                    {Array.from({length:10}, (_,c) => {
                      const seat = seats.find(s => s.row===row && s.col===c+1);
                      const isSel = selSeats.includes(seat?.id);
                      return (
                        <button key={c} onClick={() => toggleSeat(seat?.id)}
                          className={`w-7 h-6 rounded-sm text-xs transition ${seat?.status==='booked' ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : isSel ? 'bg-purple-600' : seat?.type==='premium' ? 'bg-yellow-200 dark:bg-yellow-900/50 hover:bg-yellow-300' : seat?.type==='normal' ? 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'}`}/>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
                {[['bg-gray-300 dark:bg-gray-700','Booked'],['bg-purple-600','Selected'],['bg-yellow-200','Premium'],['bg-blue-100','Normal'],['bg-gray-100','Economy']].map(([cls,lbl]) => (
                  <div key={lbl} className="flex items-center gap-1"><div className={`w-4 h-3 rounded-sm ${cls}`}/>{lbl}</div>
                ))}
              </div>
            </div>
            {selSeats.length > 0 && (
              <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-gray-500">{selSeats.length} seat(s) · {selSeats.join(', ')}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatINR(totalAmt)}</span>
                </div>
                <button onClick={() => setStep('confirm')} className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-2xl">Proceed →</button>
              </div>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex gap-3 items-center">
                <span className="text-4xl">{selected.img}</span>
                <div>
                  <p className="font-bold text-lg">{selected.title}</p>
                  {showTime && <p className="text-purple-200 text-sm">Today · {showTime}</p>}
                </div>
              </div>
              <div className="p-4 space-y-2">
                {[
                  ['Seats',     selSeats.join(', ')],
                  ['Tickets',   `${selSeats.length} × ${formatINR(selected?.price || 0)}`],
                  ['Convenience Fee', formatINR(selSeats.length * 30)],
                  ['Total',     formatINR(totalAmt + selSeats.length * 30)],
                ].map(([k,v]) => (
                  <div key={k} className={`flex justify-between text-sm ${k==='Total' ? 'font-bold text-base pt-2 border-t border-gray-100 dark:border-gray-800' : ''}`}>
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-900 dark:text-gray-100">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={handleBook} disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50">
              {loading ? '⏳ Booking...' : `🎟 Book & Pay ${formatINR(totalAmt + selSeats.length * 30)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
