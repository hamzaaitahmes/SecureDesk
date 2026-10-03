import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshUser();
    const expire = () => setUser(null);
    window.addEventListener('securedesk:session-expired', expire);
    return () => window.removeEventListener('securedesk:session-expired', expire);
  }, []);

  async function login(credentials) {
    const { data } = await api.post('/auth/login', credentials);
    setUser(data.data.user);
    return data.data.user;
  }

  async function register(values) {
    const { data } = await api.post('/auth/register', values);
    setUser(data.data.user);
  }

  async function logout() {
    try { await api.post('/auth/logout'); } finally { setUser(null); }
  }

  const value = useMemo(() => ({ user, loading, login, register, logout, refreshUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

