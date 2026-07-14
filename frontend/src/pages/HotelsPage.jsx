import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';

const CITIES = ['Delhi','Mumbai','Bangalore','Chennai','Kolkata','Hyderabad','Pune','Goa','Jaipur','Kerala','Agra','Shimla'];

const HOTELS = [
  { id:1, name:'Taj Palace',           city:'Delhi',     stars:5, price:12000, rating:4.8, rooms:['Deluxe','Suite','Presidential'], img:'🏨', amenities:['Pool','Spa','Gym','WiFi','Restaurant'] },
  { id:2, name:'The Leela',            city:'Mumbai',    stars:5, price:15000, rating:4.9, rooms:['Deluxe','Premier','Suite'],      img:'🏩', amenities:['Pool','Spa','Gym','WiFi','Bar'] },
  { id:3, name:'ITC Grand Chola',      city:'Chennai',   stars:5, price:9500,  rating:4.7, rooms:['Superior','Deluxe','Suite'],     img:'🏰', amenities:['Pool','Spa','WiFi','Restaurant'] },
  { id:4, name:'Oberoi Udaivilas',     city:'Jaipur',    stars:5, price:35000, rating:5.0, rooms:['Courtyard','Premier','Suite'],   img:'🏯', amenities:['Pool','Spa','Boat','WiFi'] },
  { id:5, name:'Radisson Blu',         city:'Bangalore', stars:4, price:5500,  rating:4.3, rooms:['Standard','Deluxe','Suite'],     img:'🏢', amenities:['Pool','Gym','WiFi','Restaurant'] },
  { id:6, name:'Goa Marriott Resort',  city:'Goa',       stars:5, price:8500,  rating:4.6, rooms:['Ocean View','Suite','Villa'],    img:'🏖️', amenities:['Pool','Beach','Spa','WiFi','Bar'] },
  { id:7, name:'Hyatt Regency',        city:'Hyderabad', stars:5, price:7000,  rating:4.5, rooms:['Regency','Club','Suite'],        img:'🏣', amenities:['Pool','Gym','WiFi','Restaurant'] },
  { id:8, name:'Club Mahindra',        city:'Shimla',    stars:4, price:6000,  rating:4.2, rooms:['Studio','Apartment','Villa'],    img:'🏔️', amenities:['Restaurant','WiFi','Bonfire'] },
];

export default function HotelsPage() {
  const navigate = useNavigate();
  const [city, setCity]         = useState('Delhi');
  const [checkIn, setCheckIn]   = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 9), 'yyyy-MM-dd'));
  const [guests, setGuests]     = useState(2);
  const [rooms, setRooms]       = useState(1);
  const [results, setResults]   = useState([]);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);
  const [selRoom, setSelRoom]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState('search');
  const [booking, setBooking]   = useState(null);

  const formatINR = n => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000));

  const search = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const filtered = HOTELS.filter(h => h.city === city);
    setResults(filtered.length ? filtered : HOTELS.slice(0, 4));
    setSearched(true);
    setLoading(false);
  };

  const book = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setBooking({
      ...selected, selRoom,
      bookingId: 'HTL' + Math.random().toString(36).slice(2,8).toUpperCase(),
      total: selected.price * nights * rooms,
    });
    setLoading(false);
    setStep('success');
    toast.success('Hotel booked!');
  };

  if (step === 'success' && booking) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-600 p-6 text-white text-center">
              <div className="text-5xl mb-2">{booking.img}</div>
              <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
              <p className="text-pink-100 mt-1">ID: <span className="font-mono font-bold">{booking.bookingId}</span></p>
            </div>
            <div className="p-6 space-y-3">
              {[['Hotel',booking.name],['Room',booking.selRoom],['Check-in',format(new Date(checkIn),'EEE, MMM d yyyy')],['Check-out',format(new Date(checkOut),'EEE, MMM d yyyy')],['Nights',nights],['Guests',guests],['Total Paid',formatINR(booking.total)]].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm border-b border-gray-50 dark:border-gray-800 pb-2">
                  <span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900 dark:text-gray-100">{v}</span>
                </div>
              ))}
            </div>
            <div className="p-4 flex gap-3">
              <button onClick={() => navigate('/upi')} className="flex-1 bg-gray-200 dark:bg-gray-800 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300">Home</button>
              <button onClick={() => { setStep('search'); setSearched(false); setSelected(null); }} className="flex-1 bg-pink-600 text-white py-3 rounded-xl font-bold">Book Again</button>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hotels 🏨</h1>
            <p className="text-sm text-gray-500">Book hotels across India</p>
          </div>
        </div>

        {/* Search form */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">City</label>
              <select value={city} onChange={e => setCity(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 font-medium">
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Check-in</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Check-out</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 text-sm" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Guests</label>
                <select value={guests} onChange={e => setGuests(parseInt(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none text-sm">
                  {[1,2,3,4].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1.5">Rooms</label>
                <select value={rooms} onChange={e => setRooms(parseInt(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-3 text-gray-900 dark:text-white focus:outline-none text-sm">
                  {[1,2,3].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
          </div>
          <button onClick={search} disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition">
            {loading ? '⏳ Searching hotels...' : '🔍 Search Hotels'}
          </button>
        </div>

        {/* Results */}
        {searched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900 dark:text-white">{results.length} hotels in {city}</p>
              <p className="text-sm text-gray-500">{nights} night{nights>1?'s':''} · {guests} guest{guests>1?'s':''}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {results.map(h => (
                <div key={h.id} onClick={() => { setSelected(h); setSelRoom(h.rooms[0]); }}
                  className={`bg-white dark:bg-gray-900 rounded-2xl border-2 overflow-hidden cursor-pointer transition ${selected?.id===h.id ? 'border-pink-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex items-center gap-3">
                    <span className="text-4xl">{h.img}</span>
                    <div>
                      <p className="font-bold text-white">{h.name}</p>
                      <p className="text-gray-300 text-sm">{h.city} · {'⭐'.repeat(h.stars)}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-white font-bold text-lg">{formatINR(h.price)}<span className="text-gray-400 text-xs">/night</span></p>
                      <p className="text-gray-300 text-xs">Total: {formatINR(h.price * nights * rooms)}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-500 font-bold text-sm">★ {h.rating}</span>
                      <span className="text-gray-400 text-xs">Excellent</span>
                      <div className="flex gap-1 ml-auto flex-wrap justify-end">
                        {h.amenities.slice(0,3).map(a => (
                          <span key={a} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    </div>
                    {selected?.id === h.id && (
                      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Room Type</p>
                          <div className="flex flex-wrap gap-2">
                            {h.rooms.map(r => (
                              <button key={r} onClick={e => { e.stopPropagation(); setSelRoom(r); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${selRoom===r ? 'bg-pink-600 text-white border-pink-600' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button onClick={e => { e.stopPropagation(); book(); }} disabled={loading}
                          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition">
                          {loading ? '⏳ Booking...' : `Book for ${formatINR(h.price * nights * rooms)}`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
