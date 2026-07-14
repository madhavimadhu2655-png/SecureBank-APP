import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const MERCHANTS = [
  { id:1,  name:'Café Coffee Day',    cat:'Food',        lat:12.9716, lng:77.5946, dist:'120m', logo:'☕', rating:4.2, upi:'ccd@upi',      open:true  },
  { id:2,  name:'Big Bazaar',         cat:'Grocery',     lat:12.9726, lng:77.5956, dist:'250m', logo:'🛒', rating:4.0, upi:'bigbazaar@fbl', open:true  },
  { id:3,  name:'Apollo Pharmacy',    cat:'Medicine',    lat:12.9706, lng:77.5936, dist:'180m', logo:'💊', rating:4.5, upi:'apollo@upi',    open:true  },
  { id:4,  name:'McDonald\'s',        cat:'Food',        lat:12.9736, lng:77.5966, dist:'550m', logo:'🍔', rating:4.1, upi:'mcdonalds@upi', open:true  },
  { id:5,  name:'BPCL Petrol Pump',   cat:'Fuel',        lat:12.9696, lng:77.5926, dist:'700m', logo:'⛽', rating:3.9, upi:'bpcl@upi',      open:true  },
  { id:6,  name:'Reliance Digital',   cat:'Electronics', lat:12.9746, lng:77.5976, dist:'400m', logo:'📱', rating:4.3, upi:'reliance@upi',  open:false },
  { id:7,  name:'Domino\'s Pizza',    cat:'Food',        lat:12.9686, lng:77.5916, dist:'320m', logo:'🍕', rating:4.4, upi:'dominos@upi',   open:true  },
  { id:8,  name:'Max Fashion',        cat:'Shopping',    lat:12.9756, lng:77.5986, dist:'600m', logo:'👗', rating:4.0, upi:'max@upi',       open:true  },
];

const CATS = ['All','Food','Grocery','Medicine','Fuel','Electronics','Shopping'];

export default function NearbyMapPage() {
  const navigate    = useNavigate();
  const [filter, setFilter]       = useState('All');
  const [selected, setSelected]   = useState(null);
  const [viewMode, setViewMode]   = useState('list'); // list | map
  const [locGranted, setLocGranted] = useState(false);
  const mapRef = useRef(null);

  const filtered = MERCHANTS.filter(m => filter === 'All' || m.cat === filter);

  // Simplified map using inline SVG dots
  const MapView = () => (
    <div className="relative bg-gray-200 dark:bg-gray-800 rounded-2xl overflow-hidden" style={{ height: 320 }}>
      {/* Simple grid map background */}
      <svg width="100%" height="100%" className="absolute inset-0">
        {/* Grid lines */}
        {Array.from({length:8}).map((_,i) => (
          <g key={i}>
            <line x1={i*50} y1="0" x2={i*50} y2="320" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
            <line x1="0" y1={i*40} x2="400" y2={i*40} stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          </g>
        ))}
        {/* Roads */}
        <line x1="0" y1="160" x2="400" y2="160" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
        <line x1="200" y1="0" x2="200" y2="320" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
        <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>
        <line x1="100" y1="0" x2="100" y2="320" stroke="rgba(255,255,255,0.15)" strokeWidth="2"/>

        {/* Merchant pins */}
        {filtered.map((m, i) => {
          const x = 60 + (i % 4) * 80 + (i > 3 ? 20 : 0);
          const y = i < 4 ? 100 : 220;
          return (
            <g key={m.id} onClick={() => setSelected(m)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={selected?.id === m.id ? 22 : 18}
                fill={m.open ? '#7C3AED' : '#9CA3AF'}
                stroke="white" strokeWidth="2"
                style={{ filter: selected?.id === m.id ? 'drop-shadow(0 4px 8px rgba(124,58,237,0.6))' : 'none', transition: 'all 0.2s' }}/>
              <text x={x} y={y+5} textAnchor="middle" fontSize="14" style={{ userSelect: 'none' }}>{m.logo}</text>
            </g>
          );
        })}

        {/* You are here */}
        <circle cx="200" cy="160" r="10" fill="#EF4444" stroke="white" strokeWidth="2"/>
        <circle cx="200" cy="160" r="20" fill="rgba(239,68,68,0.2)"/>
        <text x="200" y="185" textAnchor="middle" fontSize="10" fill="rgba(239,68,68,0.8)">You</text>
      </svg>

      {/* Selected merchant popup */}
      {selected && (
        <div className="absolute bottom-3 left-3 right-3 bg-white dark:bg-gray-900 rounded-2xl p-3 shadow-lg flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{selected.logo}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{selected.name}</p>
            <p className="text-xs text-gray-500">★ {selected.rating} · {selected.dist}</p>
          </div>
          <button onClick={() => navigate('/merchant', { state: { merchant: selected } })}
            className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0">Pay</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Nearby Merchants</h1>
          <div className="ml-auto flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {[{k:'list',icon:'≡'},{k:'map',icon:'🗺'}].map(({k,icon}) => (
              <button key={k} onClick={() => setViewMode(k)}
                className={`w-8 h-7 rounded-md text-sm transition ${viewMode===k ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}>
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATS.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${filter===c ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{filtered.length} merchants found</span>
          <span className="text-purple-600 dark:text-purple-400 text-xs">📍 Within 1 km</span>
        </div>

        {viewMode === 'map' && <MapView />}

        <div className="space-y-3">
          {filtered.map(m => (
            <div key={m.id} onClick={() => setSelected(m)}
              className={`bg-white dark:bg-gray-900 rounded-2xl border-2 p-4 flex items-center gap-3 cursor-pointer transition ${selected?.id === m.id ? 'border-purple-500' : 'border-transparent border border-gray-200 dark:border-gray-700 hover:border-gray-300'}`}>
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">{m.logo}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{m.name}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${m.open ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {m.open ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{m.cat} · {m.dist} away</p>
                <p className="text-xs text-yellow-500 mt-0.5">★ {m.rating}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); navigate('/merchant'); }}
                className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex-shrink-0">
                Pay
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
