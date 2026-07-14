import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

// Session timeout: auto-logout after 15 minutes of inactivity
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('banking_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  // ─── Session timeout reset on any user activity ──────────────────────────
  const resetSessionTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (token) {
      timeoutRef.current = setTimeout(() => {
        toast('Session expired due to inactivity.', { icon: '⏱' });
        logout();
      }, SESSION_TIMEOUT_MS);
    }
  }, [token]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetSessionTimer));
    resetSessionTimer();
    return () => {
      events.forEach(e => window.removeEventListener(e, resetSessionTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetSessionTimer]);

  // ─── Restore session on refresh ─────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await authAPI.getMe();
        setUser(res.data.data.user);
      } catch {
        // Token invalid or expired — clear storage
        localStorage.removeItem('banking_token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('banking_token', newToken);
    setToken(newToken);
    setUser(userData);
    resetSessionTimer();
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('banking_token', newToken);
    setToken(newToken);
    setUser(userData);
    resetSessionTimer();
    return userData;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('banking_token');
    setToken(null);
    setUser(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    navigate('/login', { replace: true });
  }, [navigate]);

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
