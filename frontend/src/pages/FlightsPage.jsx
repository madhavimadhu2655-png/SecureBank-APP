import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';

const CITIES = ['Delhi (DEL)','Mumbai (BOM)','Bangalore (BLR)','Chennai (MAA)','Kolkata (CCU)','Hyderabad (HYD)','Pune (PNQ)','Ahmedabad (AMD)','Goa (GOI)','Jaipur (JAI)','Kochi (COK)','Lucknow (LKO)'];

const MOCK_FLIGHTS = [
  { id:1, airline:'IndiGo',        code:'6E-201', dep:'06:00', arr:'08:10', dur:'2h 10m', price:3499,  stops:'Non-stop', logo:'💙' },
  { id:2, airline:'Air India',     code:'AI-131', dep:'08:30', arr:'10:55', dur:'2h 25m', price:4899,  stops:'Non-stop', logo:'🔴' },
  { id:3, airline:'Vistara',       code:'UK-815', dep:'11:00', arr:'13:30', dur:'2h 30m', price:5299,  stops:'Non-stop', logo:'🟣' },
  { id:4, airline:'SpiceJet',      code:'SG-112', dep:'14:15', arr:'16:55', dur:'2h 40m', price:3199,  stops:'Non-stop', logo:'🟠' },
  { id:5, airline:'IndiGo',        code:'6E-505', dep:'17:00', arr:'20:30', dur:'3h 30m', price:2899,  stops:'1 stop',   logo:'💙' },
  { id:6, airline:'Air India',     code:'AI-443', dep:'20:00', arr:'22:15', dur:'2h 15m', price:5599,  stops:'Non-stop', logo:'🔴' },
];

export default function FlightsPage() {
  const navigate = useNavigate();
  const [trip, setTrip]         = useState('oneway');
  const [from, setFrom]         = useState('Delhi (DEL)');
  const [to, setTo]             = useState('Mumbai (BOM)');
  const [date, setDate]         = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [returnDate, setReturn] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [passengers, setPass]   = useState(1);
  const [cls, setCls]           = useState('Economy');
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [step, setStep]         = useState('search');
  const [loading, setLoading]   = useState(false);
  const [booked, setBooked]     = useState(null);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
  const swap = () => { const t = from; setFrom(to); setTo(t); };

  const search = async () => {
    if (from === to) { toast.error('Origin and destination cannot be same'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setResults(MOCK_FLIGHTS.map(f => ({ ...f, price: Math.round(f.price * (0.9 + Math.random()*0.3)) * passengers })));
    setSearched(true);
    setLoading(false);
  };

  const book = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setBooked({ ...selected, pnr: 'PNR' + Math.random().toString(36).slice(2,8).toUpperCase() });
    setLoading(false);
    setStep('success');
    toast.success('Flight booked!');
  };

  if (step === 'success' && booked) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white text-center">
              <div className="text-5xl mb-2">✈️</div>
              <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
              <p className="text-sky-100 mt-1">PNR: <span className="font-mono font-bold">{booked.pnr}</span></p>
            </div>
            <div className="p-6 space-y-3">
              {[['Flight',`${booked.airline} ${booked.code}`],['Route',`${from} → ${to}`],['Date',format(new Date(date),'EEEE, MMM d yyyy')],['Departure',booked.dep],['Arrival',booked.arr],['Passengers',passengers],['Class',cls],['Total Paid',formatINR(booked.price)]].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800 pb-2">
                  <span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
                </div>
              ))}
            </div>
            <div className="p-4 flex gap-3">
              <button onClick={() => navigate('/upi')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300">Home</button>
              <button onClick={() => { setStep('search'); setSearched(false); setSelected(null); }} className="flex-1 bg-sky-600 text-white py-3 rounded-xl font-bold">Book Again</button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg">←</button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Flights ✈️</h1>
            <p className="text-sm text-gray-500">Domestic flights across India</p>
          </div>
        </div>

        {/* Search form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
          {/* Trip type */}
          <div className="flex gap-2">
            {['oneway','roundtrip'].map(t => (
              <button key={t} onClick={() => setTrip(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition capitalize ${trip===t ? 'bg-sky-600 text-white border-sky-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {t === 'oneway' ? 'One Way' : 'Round Trip'}
              </button>
            ))}
          </div>

          {/* From / To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">From</label>
              <select value={from} onChange={e => setFrom(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={swap}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-1 sm:top-auto sm:bottom-3 w-8 h-8 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-500 hover:border-sky-400 transition z-10">
              ⇄
            </button>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">To</label>
              <select value={to} onChange={e => setTo(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 font-medium">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Dates + passengers + class */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Departure</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm" />
            </div>
            {trip === 'roundtrip' && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Return</label>
                <input type="date" value={returnDate} onChange={e => setReturn(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm" />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Passengers</label>
              <select value={passengers} onChange={e => setPass(parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm">
                {[1,2,3,4,5,6].map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Class</label>
              <select value={cls} onChange={e => setCls(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500 text-sm">
                {['Economy','Business','First'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button onClick={search} disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition">
            {loading ? '⏳ Searching flights...' : '🔍 Search Flights'}
          </button>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900 dark:text-white">{results.length} flights found</p>
              <p className="text-sm text-gray-500">{from.split('(')[0].trim()} → {to.split('(')[0].trim()} · {format(new Date(date), 'MMM d')}</p>
            </div>
            {results.map(f => (
              <div key={f.id}
                onClick={() => setSelected(f)}
                className={`bg-white dark:bg-gray-900 rounded-2xl border-2 p-4 cursor-pointer transition ${selected?.id===f.id ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{f.logo}</span>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{f.airline}</p>
                      <p className="text-xs text-gray-400">{f.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{f.dep}</p>
                      <p className="text-xs text-gray-400">{from.split('(')[1]?.replace(')','')}</p>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-xs text-gray-400">{f.dur}</p>
                      <div className="flex items-center gap-1"><div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/><span className="text-gray-300 text-xs">✈</span><div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"/></div>
                      <p className="text-xs text-gray-400">{f.stops}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{f.arr}</p>
                      <p className="text-xs text-gray-400">{to.split('(')[1]?.replace(')','')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sky-600 dark:text-sky-400 text-xl">{formatINR(f.price)}</p>
                    <p className="text-xs text-gray-400">{passengers} pax · {cls}</p>
                    {selected?.id === f.id && (
                      <button onClick={book} disabled={loading}
                        className="mt-2 bg-sky-600 text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-50 transition hover:bg-sky-700">
                        {loading ? '⏳' : 'Book Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
