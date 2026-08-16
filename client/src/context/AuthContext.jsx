import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authLib from '../lib/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    return authLib.initializeAuth();
  });

  const [loading, setLoading] = useState(false);

  // Sync session on mount
  useEffect(() => {
    const session = authLib.initializeAuth();
    if (session.isAuthenticated && session.currentUser) {
      setAuthState(session);
    }
  }, []);

  const loginAsDemo = () => {
    setLoading(true);
    try {
      const session = authLib.loginAsDemo();
      setAuthState(session);
      return session.currentUser;
    } catch (err) {
      console.error('Failed to log in as demo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const session = await authLib.login(email, password);
      setAuthState(session);
      return session.currentUser;
    } catch (err) {
      console.error('Failed to log in:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const session = await authLib.register(name, email, password);
      setAuthState(session);
      return session.currentUser;
    } catch (err) {
      console.error('Failed to register:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authLib.logout();
    setAuthState({
      currentUser: null,
      isAuthenticated: false,
      authMode: null,
      token: null
    });
  };

  const value = {
    user: authState.currentUser,
    currentUser: authState.currentUser,
    isAuthenticated: authState.isAuthenticated,
    authMode: authState.authMode,
    token: authState.token,
    loading,
    login,
    loginAsDemo,
    demoLogin: loginAsDemo, // alias for backwards compatibility
    register,
    logout
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
