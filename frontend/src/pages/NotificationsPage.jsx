import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, subHours, subDays, subMinutes } from 'date-fns';

const NOTIFS = [
  { id: 1,  type: 'credit',  icon: '💚', title: 'Money Received',          body: 'Ravi Kumar sent you ₹500',              time: subMinutes(new Date(), 5),  read: false, tag: 'Payment' },
  { id: 2,  type: 'debit',   icon: '🔴', title: 'Payment Sent',            body: 'You paid ₹299 for mobile recharge',     time: subMinutes(new Date(), 45), read: false, tag: 'Payment' },
  { id: 3,  type: 'offer',   icon: '🎁', title: '₹50 Cashback Credited!',  body: 'Your electricity bill cashback is ready',time: subHours(new Date(), 2),  read: false, tag: 'Reward' },
  { id: 4,  type: 'alert',   icon: '⚠️', title: 'Large Transaction Alert', body: 'A transfer of ₹12,000 was made',       time: subHours(new Date(), 5),  read: true,  tag: 'Security' },
  { id: 5,  type: 'credit',  icon: '💚', title: 'Salary Credited',         body: '₹45,000 received from employer',        time: subDays(new Date(), 1),   read: true,  tag: 'Payment' },
  { id: 6,  type: 'bill',    icon: '📅', title: 'Bill Due Reminder',       body: 'Electricity bill ₹1,240 due in 3 days', time: subDays(new Date(), 1),   read: true,  tag: 'Reminder' },
  { id: 7,  type: 'offer',   icon: '🎯', title: 'New Offer Available',     body: 'Get 5% cashback on Jio recharge',       time: subDays(new Date(), 2),   read: true,  tag: 'Offer' },
  { id: 8,  type: 'security',icon: '🔐', title: 'Login from new device',   body: 'New login detected on Chrome, Windows', time: subDays(new Date(), 3),   read: true,  tag: 'Security' },
  { id: 9,  type: 'debit',   icon: '🔴', title: 'Credit Card Bill Paid',   body: 'HDFC card bill ₹8,450 paid',            time: subDays(new Date(), 4),   read: true,  tag: 'Payment' },
  { id: 10, type: 'offer',   icon: '🃏', title: 'Scratch Card Won!',       body: 'You won ₹25 cashback — tap to claim',  time: subDays(new Date(), 5),   read: true,  tag: 'Reward' },
];

const TAG_COLORS = {
  Payment:  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Reward:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  Security: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  Reminder: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  Offer:    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};

const formatTime = (date) => {
  const diff = Date.now() - date;
  if (diff < 60000)   return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)return `${Math.floor(diff / 3600000)}h ago`;
  return format(date, 'MMM d');
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState(NOTIFS);
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Payment', 'Reward', 'Security', 'Reminder', 'Offer'];
  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifs(prev => prev.filter(n => n.id !== id));

  const filtered = filter === 'All' ? notifs : notifs.filter(n => n.tag === filter);
  const today    = filtered.filter(n => Date.now() - n.time < 86400000);
  const earlier  = filtered.filter(n => Date.now() - n.time >= 86400000);

  const NotifItem = ({ n }) => (
    <div onClick={() => markRead(n.id)}
      className={`flex items-start gap-3 px-4 py-4 transition cursor-pointer ${!n.read ? 'bg-purple-50/60 dark:bg-purple-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${!n.read ? 'bg-white dark:bg-gray-800 shadow-sm' : 'bg-gray-100 dark:bg-gray-800'}`}>
        {n.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className={`text-sm ${!n.read ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>{n.title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[n.tag]}`}>{n.tag}</span>
              <span className="text-xs text-gray-400">{formatTime(n.time)}</span>
            </div>
          </div>
          <button onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
            className="text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 text-lg flex-shrink-0 mt-0.5">✕</button>
        </div>
      </div>
      {!n.read && <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-2" />}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 px-4 pt-12 pb-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">←</button>
          <div className="flex-1">
            <h1 className="font-bold text-gray-900 dark:text-white text-lg">Notifications</h1>
            {unreadCount > 0 && <p className="text-xs text-gray-500">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-purple-600 dark:text-purple-400 text-sm font-medium">Mark all read</button>
          )}
        </div>
        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <span className="text-5xl mb-3">🔔</span>
          <p className="text-sm">No notifications</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {today.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today</p>
              </div>
              {today.map(n => <NotifItem key={n.id} n={n} />)}
            </>
          )}
          {earlier.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Earlier</p>
              </div>
              {earlier.map(n => <NotifItem key={n.id} n={n} />)}
            </>
          )}
        </div>
      )}
    </div>
  );
}
