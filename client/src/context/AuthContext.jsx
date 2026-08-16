import React, { createContext, useContext, useState, useEffect } from 'react';
import { initMockStore, mockResetDemo } from '../services/mockStore';

const AuthContext = createContext();

const DEFAULT_USER = {
  id: 'demo-user',
  name: 'Rohan Sharma',
  email: 'demo@paytrack.app',
  role: 'user',
  isDemo: true
};

export function AuthProvider({ children }) {
  // Always active, no login barriers
  const [user, setUser] = useState(DEFAULT_USER);
  const [token] = useState('paytrack_active_session');

  useEffect(() => {
    initMockStore();
    localStorage.setItem('fintech_token', 'paytrack_active_session');
    localStorage.setItem('paytrack_user', JSON.stringify(DEFAULT_USER));
  }, []);

  const login = async () => DEFAULT_USER;
  const loginAsDemo = () => DEFAULT_USER;
  const demoLogin = () => DEFAULT_USER;
  const register = async () => DEFAULT_USER;

  const resetData = () => {
    mockResetDemo();
    window.location.reload();
  };

  const logout = () => {
    resetData();
  };

  const value = {
    user,
    currentUser: user,
    isAuthenticated: true,
    authMode: 'direct',
    token,
    loading: false,
    login,
    loginAsDemo,
    demoLogin,
    register,
    logout,
    resetData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
