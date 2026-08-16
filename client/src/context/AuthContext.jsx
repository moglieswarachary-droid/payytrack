import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, fetchMeApi } from '../services/api';
import { initMockStore } from '../services/mockStore';

const AuthContext = createContext();

const DEFAULT_DEMO_USER = {
  id: 'usr_demo_001',
  name: 'Rohan Sharma',
  email: 'demo@fintech.local'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Check if previously logged in
    try {
      const savedUser = localStorage.getItem('paytrack_user');
      if (savedUser) return JSON.parse(savedUser);
      if (localStorage.getItem('fintech_token')) return DEFAULT_DEMO_USER;
    } catch {
      return null;
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('fintech_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initMockStore();
  }, []);

  // Instant demo login with zero authentication barriers
  const demoLogin = () => {
    initMockStore();
    const tokenVal = `paytrack_demo_token_${Date.now()}`;
    localStorage.setItem('fintech_token', tokenVal);
    localStorage.setItem('paytrack_user', JSON.stringify(DEFAULT_DEMO_USER));
    setToken(tokenVal);
    setUser(DEFAULT_DEMO_USER);
    return DEFAULT_DEMO_USER;
  };

  const login = async (email, password) => {
    // If demo credentials or requested, immediately log in
    if (!email || email.toLowerCase() === 'demo@fintech.local') {
      return demoLogin();
    }

    try {
      const res = await loginApi({ email, password });
      const userData = res?.data?.user || {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0] || 'User',
        email
      };
      const tokenVal = res?.data?.token || `paytrack_token_${Date.now()}`;
      localStorage.setItem('fintech_token', tokenVal);
      localStorage.setItem('paytrack_user', JSON.stringify(userData));
      setToken(tokenVal);
      setUser(userData);
      return userData;
    } catch {
      // Fallback: immediate local login
      const userData = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0] || 'User',
        email
      };
      const tokenVal = `paytrack_token_${Date.now()}`;
      localStorage.setItem('fintech_token', tokenVal);
      localStorage.setItem('paytrack_user', JSON.stringify(userData));
      setToken(tokenVal);
      setUser(userData);
      return userData;
    }
  };

  const register = async (name, email, password) => {
    const userData = {
      id: `usr_${Date.now()}`,
      name: name || 'User',
      email: email || 'user@example.com'
    };
    const tokenVal = `paytrack_token_${Date.now()}`;
    localStorage.setItem('fintech_token', tokenVal);
    localStorage.setItem('paytrack_user', JSON.stringify(userData));
    setToken(tokenVal);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('fintech_token');
    localStorage.removeItem('paytrack_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
