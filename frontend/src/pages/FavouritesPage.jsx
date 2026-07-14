import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const INITIAL_FAVS = [
  { id: 1, name: 'Ravi Kumar',   upi: 'ravi@upi',    phone: '9876543210', avatar: 'RK', color: '#7C3AED', pinned: true  },
  { id: 2, name: 'Priya Sharma', upi: 'priya@upi',   phone: '9123456789', avatar: 'PS', color: '#DB2777', pinned: true  },
  { id: 3, name: 'Arjun Das',    upi: 'arjun@upi',   phone: '9988776655', avatar: 'AD', color: '#0284C7', pinned: false },
  { id: 4, name: 'Meena Patel',  upi: 'meena@ybl',   phone: '9871234560', avatar: 'MP', color: '#059669', pinned: false },
  { id: 5, name: 'Kiran Rao',    upi: 'kiran@oksbi', phone: '9001234567', avatar: 'KR', color: '#DC2626', pinned: false },
];

export default function FavouritesPage() {
  const navigate = useNavigate();
  const [favs, setFavs]     = useState(INITIAL_FAVS);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', upi: '', phone: '' });

  const filtered = favs.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.upi.toLowerCase().includes(search.toLowerCase()) ||
    f.phone.includes(search)
  );
  const pinned   = filtered.filter(f => f.pinned);
  const others   = filtered.filter(f => !f.pinned);

  const togglePin = (id) => {
    setFavs(prev => prev.map(f => f.id === id ? { ...f, pinned: !f.pinned } : f));
    toast.success(favs.find(f => f.id === id)?.pinned ? 'Unpinned' : 'Pinned to top!');
  };
  const removeFav = (id) => { setFavs(prev => prev.filter(f => f.id !== id)); toast.success('Removed from favourites'); };

  const addContact = () => {
    if (!newContact.name || !newContact.upi) { toast.error('Name and UPI ID are required'); return; }
    const colors = ['#7C3AED','#DB2777','#0284C7','#059669','#DC2626','#D97706'];
    setFavs(prev => [...prev, {
      id: Date.now(), ...newContact,
      avatar: newContact.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase(),
      color: colors[Math.floor(Math.random() * colors.length)],
      pinned: false,
    }]);
    setNewContact({ name: '', upi: '', phone: '' });
    setShowAdd(false);
    toast.success('Contact added!');
  };

  const ContactCard = ({ f }) => (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: f.color }}>
        {f.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{f.name}</p>
          {f.pinned && <span className="text-xs">📌</span>}
        </div>
        <p className="text-xs text-gray-500 font-mono">{f.upi}</p>
        {f.phone && <p className="text-xs text-gray-400">+91 {f.phone}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => navigate('/upi/send', { state: { upi: f.upi, name: f.name } })}
          className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 text-base">
          💸
        </button>
        <div className="relative group">
          <button className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-500 text-base">⋯</button>
          <div className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-10 hidden group-focus-within:block">
            <button onClick={() => togglePin(f.id)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
              {f.pinned ? '📌 Unpin' : '📌 Pin to top'}
            </button>
            <button onClick={() => removeFav(f.id)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">
              🗑️ Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Favourites</h1>
          <button onClick={() => setShowAdd(true)} className="ml-auto text-purple-600 dark:text-purple-400 text-sm font-medium">+ Add</button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none"
          placeholder="🔍  Search contacts..." />
      </div>

      <div className="space-y-1">
        {pinned.length > 0 && (
          <>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">📌 Pinned</p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {pinned.map(f => <ContactCard key={f.id} f={f} />)}
            </div>
          </>
        )}
        {others.length > 0 && (
          <>
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">All Contacts</p>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {others.map(f => <ContactCard key={f.id} f={f} />)}
            </div>
          </>
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <span className="text-5xl mb-3">⭐</span>
            <p className="text-sm">No favourites found</p>
          </div>
        )}
      </div>

      {/* Add contact bottom sheet */}
      {showAdd && (
        <div style={{ minHeight: 400, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          className="fixed inset-0 z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-5" />
            <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Add to Favourites</h2>
            <div className="space-y-3">
              {[
                { key: 'name',  label: 'Full Name',    placeholder: 'e.g. Ravi Kumar',   type: 'text' },
                { key: 'upi',   label: 'UPI ID',       placeholder: 'name@upi',          type: 'text' },
                { key: 'phone', label: 'Phone (optional)', placeholder: '9876543210',     type: 'tel'  },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="text-xs text-gray-500 block mb-1.5">{label}</label>
                  <input type={type} value={newContact[key]} onChange={e => setNewContact(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-purple-500 text-sm"
                    placeholder={placeholder} />
                </div>
              ))}
              <button onClick={addContact} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition mt-2">
                Add Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
