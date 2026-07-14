import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const UserNav = [
  { to: '/upi',              label: 'Home',        icon: '🏠' },
  { to: '/upi/send',         label: 'Send',         icon: '💸' },
  { to: '/history',          label: 'History',      icon: '📋' },
  { to: '/wallet',           label: 'Wallet',       icon: '👛' },
  { to: '/analytics',        label: 'Analytics',    icon: '📊' },
  { to: '/rewards',          label: 'Rewards',      icon: '🎁' },
  { to: '/mutual-funds',     label: 'Invest',       icon: '📈' },
  { to: '/gold',             label: 'Gold',         icon: '🪙' },
  { to: '/fd',               label: 'FD',           icon: '🏦' },
  { to: '/bnpl',             label: 'Pay Later',    icon: '💳' },
  { to: '/split',            label: 'Split Bill',   icon: '🤝' },
  { to: '/favourites',       label: 'Favourites',   icon: '⭐' },
  { to: '/contacts',         label: 'Contacts',     icon: '📱' },
  { to: '/notifications',    label: 'Notifications',icon: '🔔' },
  { to: '/profile',          label: 'Profile',      icon: '👤' },
];

const AdminNav = [
  { to: '/admin',            label: 'Overview',     icon: '📊' },
  { to: '/admin/users',      label: 'Users',        icon: '👥' },
  { to: '/admin/alerts',     label: 'Fraud Alerts', icon: '🚨' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = user?.role === 'admin' ? AdminNav : UserNav;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Bottom nav items for mobile (most used)
  const mobileNav = user?.role === 'admin' ? AdminNav : [
    { to: '/upi',           label: 'Home',    icon: '🏠' },
    { to: '/history',       label: 'History', icon: '📋' },
    { to: '/upi/qr-scanner',label: 'Scan',   icon: '📷' },
    { to: '/wallet',        label: 'Wallet',  icon: '👛' },
    { to: '/profile',       label: 'Profile', icon: '👤' },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────────────── */}
      <aside className={`
        hidden lg:flex flex-col
        w-64 xl:w-72 flex-shrink-0
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        fixed left-0 top-0 bottom-0 z-30
      `}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">S</div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">SecureBank</p>
            <p className="text-xs text-gray-400">Digital Banking</p>
          </div>
          {user?.role === 'admin' && (
            <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Admin</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`}>
                <span className="text-base w-5 text-center flex-shrink-0">{icon}</span>
                <span className="flex-1">{label}</span>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggle}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-xs font-medium">
              {dark ? '☀️' : '🌙'} {dark ? 'Light' : 'Dark'}
            </button>
            <button onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition text-xs font-medium">
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE OVERLAY SIDEBAR ───────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-72 bg-white dark:bg-gray-900 flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">S</div>
                <span className="font-bold text-gray-900 dark:text-white">SecureBank</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">✕</button>
            </div>
            <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
              {nav.map(({ to, label, icon }) => {
                const active = isActive(to);
                return (
                  <Link key={to} to={to} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}>
                    <span className="text-base w-5 text-center">{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3 px-2 py-2 mb-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { toggle(); setSidebarOpen(false); }}
                  className="flex-1 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
                  {dark ? '☀️ Light' : '🌙 Dark'}
                </button>
                <button onClick={logout}
                  className="flex-1 py-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 text-xs font-medium">
                  🚪 Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-64 xl:ml-72 min-w-0">

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">SecureBank</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={toggle} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
              {dark ? '☀️' : '🌙'}
            </button>
            <button onClick={() => navigate('/notifications')}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm">
              🔔
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 py-2 flex items-center justify-around safe-area-inset-bottom">
        {mobileNav.map(({ to, label, icon }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all min-w-[52px] ${
                active ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'
              }`}>
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
