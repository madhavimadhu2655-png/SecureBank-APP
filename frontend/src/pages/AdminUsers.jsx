import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import Layout from '../components/common/Layout';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [suspending, setSuspending] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminAPI.getUsers({ page, limit: 15, ...(search && { search }) })
      .then(res => {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleSuspend = async (user, suspend) => {
    if (!confirm(`${suspend ? 'Suspend' : 'Unsuspend'} ${user.name}?`)) return;
    setSuspending(user._id);
    try {
      await adminAPI.suspendUser(user._id, { suspend, reason: 'Admin action' });
      toast.success(`${user.name} ${suspend ? 'suspended' : 'unsuspended'}`);
      fetchUsers();
    } catch {
      toast.error('Action failed');
    } finally {
      setSuspending(null);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const formatUSD = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto animate-fade-in space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {pagination.totalCount} account{pagination.totalCount !== 1 ? 's' : ''} registered
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              className="input-field w-64"
              placeholder="Search name, email, account…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                className="btn-secondary px-3 py-2 text-sm">Clear</button>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {/* Table head */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Email / Account</div>
            <div className="col-span-2 text-right">Balance</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <LoadingSpinner />
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🔍</p>
                <p className="text-sm">No users found{search ? ` for "${search}"` : ''}</p>
              </div>
            ) : (
              users.map(user => (
                <div key={user._id}
                  className="grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  {/* Name + avatar */}
                  <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 text-sm font-semibold flex-shrink-0">
                      {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.role === 'admin' ? '👑 Admin' : 'User'}</p>
                    </div>
                  </div>

                  {/* Email / account */}
                  <div className="col-span-7 md:col-span-3 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                    <p className="text-xs font-mono text-gray-400">{user.accountNumber}</p>
                  </div>

                  {/* Balance */}
                  <div className="col-span-5 md:col-span-2 text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {formatUSD(user.balance)}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(user.createdAt)}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-6 md:col-span-2 flex justify-start md:justify-center">
                    {user.isSuspended
                      ? <span className="badge-danger">Suspended</span>
                      : <span className="badge-success">Active</span>}
                  </div>

                  {/* Actions */}
                  <div className="col-span-6 md:col-span-2 flex justify-end md:justify-center">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleSuspend(user, !user.isSuspended)}
                        disabled={suspending === user._id}
                        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                          user.isSuspended
                            ? 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20'
                            : 'border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20'
                        }`}
                      >
                        {suspending === user._id ? '…' : user.isSuspended ? 'Unsuspend' : 'Suspend'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
