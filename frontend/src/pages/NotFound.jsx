import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFound() {
  const { user } = useAuth();
  const home = user?.role === 'admin' ? '/admin' : user ? '/dashboard' : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center p-8 animate-fade-in">
        <p className="text-7xl mb-4">🏦</p>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          This page doesn't exist in our vaults.
        </p>
        <Link to={home} className="btn-primary px-6 py-2.5">
          Back to safety
        </Link>
      </div>
    </div>
  );
}
