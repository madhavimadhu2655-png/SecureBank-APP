import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Layout from '../components/common/Layout';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing]     = useState(false);
  const [name, setName]           = useState(user?.name || '');
  const [loading, setLoading]     = useState(false);
  const [showPin, setShowPin]     = useState(false);
  const [pin, setPin]             = useState(['','','','','','']);
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();

  const saveProfile = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setLoading(true);
    try {
      await userAPI.updateProfile({ name: name.trim() });
      updateUser({ name: name.trim() });
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const handlePinInput = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const p = [...pin]; p[i] = v; setPin(p);
    if (v && i < 5) document.getElementById(`pin-${i+1}`)?.focus();
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon:'🏦', label:'Bank Accounts',     to:'/accounts',         right:`${1} linked` },
        { icon:'👛', label:'Digital Wallet',     to:'/wallet',           right:'' },
        { icon:'💳', label:'Pay Later (BNPL)',   to:'/bnpl',             right:'' },
        { icon:'📊', label:'Spend Analytics',    to:'/analytics',        right:'' },
      ]
    },
    {
      title: 'Investments',
      items: [
        { icon:'📈', label:'Mutual Funds',       to:'/mutual-funds',     right:'' },
        { icon:'🪙', label:'Digital Gold',       to:'/gold',             right:'2.45g held' },
        { icon:'🏦', label:'Fixed Deposits',     to:'/fd',               right:'2 active' },
      ]
    },
    {
      title: 'Settings',
      items: [
        { icon:'🔐', label:'UPI PIN',            action:() => setShowPin(true), right:'Change' },
        { icon:'🔔', label:'Notifications',      to:'/notifications',    right:'' },
        { icon:'🌐', label:'Language',           to:'/settings/language',right:'English' },
        { icon:'🛡️', label:'Privacy & Security', to:'#',                 right:'' },
        { icon:'❓', label:'Help & Support',     to:'#',                 right:'' },
      ]
    }
  ];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <button onClick={() => setEditing(e => !e)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition">
            {editing ? '✕ Cancel' : '✏️ Edit'}
          </button>
        </div>

        {/* ── PROFILE CARD ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {initials}
              </div>
              {editing && (
                <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs border-2 border-white dark:border-gray-900">
                  📷
                </button>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-gray-900 dark:text-white font-bold text-lg focus:outline-none focus:border-purple-500 mb-2" />
              ) : (
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              )}
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <p className="text-sm text-gray-400 font-mono mt-0.5">{user?.accountNumber}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2.5 py-1 rounded-full font-medium">✅ KYC Verified</span>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2.5 py-1 rounded-full font-medium">
                  {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                </span>
              </div>
              {editing && (
                <button onClick={saveProfile} disabled={loading}
                  className="mt-3 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-sm transition disabled:opacity-50">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>

            {/* UPI ID box */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center sm:text-right w-full sm:w-auto flex-shrink-0">
              <p className="text-xs text-gray-400 mb-1">UPI ID</p>
              <p className="font-mono font-bold text-gray-900 dark:text-gray-100 text-sm">{user?.accountNumber}@securebank</p>
              <button onClick={() => { navigator.clipboard?.writeText(user?.accountNumber + '@securebank'); toast.success('Copied!'); }}
                className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium hover:underline">
                📋 Copy
              </button>
            </div>
          </div>
        </div>

        {/* ── MENU SECTIONS GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {menuSections.map(section => (
            <div key={section.title} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{section.title}</p>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {section.items.map(({ icon, label, to, action, right }) => (
                  to ? (
                    <Link key={label} to={to}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
                      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
                      {right && <span className="text-xs text-gray-400">{right}</span>}
                      <span className="text-gray-300 dark:text-gray-600 text-lg">›</span>
                    </Link>
                  ) : (
                    <button key={label} onClick={action}
                      className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition text-left">
                      <span className="text-lg w-6 text-center flex-shrink-0">{icon}</span>
                      <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{label}</span>
                      {right && <span className="text-xs text-gray-400">{right}</span>}
                      <span className="text-gray-300 dark:text-gray-600 text-lg">›</span>
                    </button>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-semibold py-4 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition">
          🚪 Sign Out
        </button>
        <p className="text-center text-xs text-gray-400">SecureBank v2.0 · Build 2026.04</p>
      </div>

      {/* UPI PIN modal */}
      {showPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPin(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg text-center mb-1">Change UPI PIN</h2>
            <p className="text-sm text-gray-500 text-center mb-6">Enter your new 6-digit UPI PIN</p>
            <div className="flex justify-center gap-3 mb-6">
              {pin.map((p, i) => (
                <input key={i} id={`pin-${i}`} type="password" maxLength={1} value={p}
                  onChange={e => handlePinInput(i, e.target.value)}
                  className="w-12 h-12 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-center text-xl font-bold text-gray-900 dark:text-white focus:outline-none focus:border-purple-500" />
              ))}
            </div>
            <button onClick={() => { toast.success('UPI PIN updated!'); setShowPin(false); setPin(['','','','','','']); }}
              disabled={pin.some(p => !p)}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition">
              Set PIN
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
