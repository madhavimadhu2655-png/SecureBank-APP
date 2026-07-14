import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Mock contacts — in production, use the Web Contacts API or ask for device permission
const MOCK_CONTACTS = [
  { id: 1,  name: 'Aarav Sharma',   phone: '9876543210', onApp: true,  upi: 'aarav@upi',   avatar: 'AS', color: '#7C3AED' },
  { id: 2,  name: 'Bhavna Patel',   phone: '9123456780', onApp: true,  upi: 'bhavna@ybl',  avatar: 'BP', color: '#DB2777' },
  { id: 3,  name: 'Chetan Kumar',   phone: '9988776655', onApp: false, upi: null,           avatar: 'CK', color: '#0284C7' },
  { id: 4,  name: 'Deepa Nair',     phone: '9871234560', onApp: true,  upi: 'deepa@oksbi',  avatar: 'DN', color: '#059669' },
  { id: 5,  name: 'Farhan Sheikh',  phone: '9001234567', onApp: true,  upi: 'farhan@upi',   avatar: 'FS', color: '#DC2626' },
  { id: 6,  name: 'Geeta Rao',      phone: '9700012345', onApp: false, upi: null,           avatar: 'GR', color: '#D97706' },
  { id: 7,  name: 'Harish Menon',   phone: '9600098765', onApp: true,  upi: 'harish@upi',   avatar: 'HM', color: '#0891B2' },
  { id: 8,  name: 'Isha Verma',     phone: '9500012345', onApp: true,  upi: 'isha@paytm',   avatar: 'IV', color: '#7C3AED' },
  { id: 9,  name: 'Jatin Malhotra', phone: '9400056789', onApp: false, upi: null,           avatar: 'JM', color: '#4B5563' },
  { id: 10, name: 'Kavitha Reddy',  phone: '9300023456', onApp: true,  upi: 'kavitha@upi',  avatar: 'KR', color: '#BE185D' },
  { id: 11, name: 'Lalit Singh',    phone: '9200078901', onApp: false, upi: null,           avatar: 'LS', color: '#4B5563' },
  { id: 12, name: 'Meena Joshi',    phone: '9100034567', onApp: true,  upi: 'meena@upi',    avatar: 'MJ', color: '#065F46' },
];

export default function ContactsSyncPage() {
  const navigate = useNavigate();
  const [synced, setSynced]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [contacts, setContacts] = useState([]);

  const syncContacts = async () => {
    setLoading(true);
    // In production: use navigator.contacts.select() Web API
    // For demo: show mock contacts after delay
    await new Promise(r => setTimeout(r, 1500));
    setContacts(MOCK_CONTACTS);
    setSynced(true);
    setLoading(false);
    toast.success(`${MOCK_CONTACTS.length} contacts synced!`);
  };

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );
  const onApp  = filtered.filter(c => c.onApp);
  const notApp = filtered.filter(c => !c.onApp);

  const ContactRow = ({ c }) => (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: c.color }}>
        {c.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.name}</p>
        <p className="text-xs text-gray-500">+91 {c.phone}</p>
        {c.onApp && <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">{c.upi}</p>}
      </div>
      {c.onApp ? (
        <button onClick={() => navigate('/upi/send', { state: { upi: c.upi, name: c.name } })}
          className="flex-shrink-0 bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
          Pay
        </button>
      ) : (
        <button onClick={() => toast('Invite sent!')}
          className="flex-shrink-0 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-xs font-medium px-3 py-1.5 rounded-full">
          Invite
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <h1 className="font-bold text-gray-900 dark:text-white text-lg">Contacts</h1>
        </div>
        {synced && (
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none"
            placeholder="🔍  Search contacts..." />
        )}
      </div>

      {!synced ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <div className="text-7xl mb-6">📱</div>
          <h2 className="font-bold text-gray-900 dark:text-white text-xl mb-2">Find friends on SecureBank</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
            Sync your contacts to see who's already on SecureBank and pay them instantly with one tap.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-400 mb-8 text-left">
            🔒 Your contacts are never shared or stored on our servers. We only check which numbers are registered.
          </div>
          <button onClick={syncContacts} disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50">
            {loading ? '⏳ Syncing contacts...' : '📱 Sync Contacts'}
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          {/* On app */}
          {onApp.length > 0 && (
            <>
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">On SecureBank ({onApp.length})</p>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">✓ Ready to pay</span>
              </div>
              <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {onApp.map(c => <ContactRow key={c.id} c={c} />)}
              </div>
            </>
          )}

          {/* Not on app */}
          {notApp.length > 0 && (
            <>
              <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Invite to SecureBank ({notApp.length})</p>
              </div>
              <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                {notApp.map(c => <ContactRow key={c.id} c={c} />)}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
