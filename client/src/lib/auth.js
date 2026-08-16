// Centralized Authentication Library for PayTrack
import { initMockStore, mockLogin, mockRegister } from '../services/mockStore';
import { loginApi, registerApi } from '../services/api';

export const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@paytrack.app',
  name: 'Demo User (Rohan Sharma)',
  role: 'user',
  isDemo: true
};

const AUTH_STORAGE_KEY = 'paytrack_auth';
const TOKEN_KEY = 'fintech_token';
const USER_KEY = 'paytrack_user';

export function initializeAuth() {
  try {
    initMockStore();
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      if (parsed && parsed.currentUser && parsed.isAuthenticated) {
        return {
          currentUser: parsed.currentUser,
          isAuthenticated: true,
          authMode: parsed.authMode || 'demo',
          token: parsed.token || `token_${Date.now()}`
        };
      }
    }

    // Backwards compatibility check
    const legacyToken = localStorage.getItem(TOKEN_KEY);
    const legacyUser = localStorage.getItem(USER_KEY);
    if (legacyToken) {
      const user = legacyUser ? JSON.parse(legacyUser) : DEMO_USER;
      const session = {
        currentUser: user,
        isAuthenticated: true,
        authMode: user.isDemo ? 'demo' : 'local',
        token: legacyToken
      };
      saveSession(session);
      return session;
    }
  } catch (err) {
    console.error('Error initializing auth session:', err);
  }

  return {
    currentUser: null,
    isAuthenticated: false,
    authMode: null,
    token: null
  };
}

export function saveSession({ currentUser, isAuthenticated = true, authMode = 'demo', token = null }) {
  try {
    const tokenVal = token || `paytrack_token_${Date.now()}`;
    const sessionData = {
      currentUser,
      isAuthenticated,
      authMode,
      token: tokenVal,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    localStorage.setItem(TOKEN_KEY, tokenVal);
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    return sessionData;
  } catch (err) {
    console.error('Error saving auth session to localStorage:', err);
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Error clearing auth session:', err);
  }
}

export function loginAsDemo() {
  initMockStore();
  const session = {
    currentUser: DEMO_USER,
    isAuthenticated: true,
    authMode: 'demo',
    token: `demo_token_${Date.now()}`
  };
  saveSession(session);
  return session;
}

export async function login(email, password) {
  initMockStore();
  
  // Instant demo bypass if demo email is entered
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (
    !normalizedEmail ||
    normalizedEmail === 'demo@paytrack.app' ||
    normalizedEmail === 'demo@fintech.local'
  ) {
    return loginAsDemo();
  }

  try {
    const res = await loginApi({ email, password });
    const user = res?.data?.user || {
      id: `usr_${Date.now()}`,
      email,
      name: email.split('@')[0] || 'User',
      role: 'user',
      isDemo: false
    };
    const token = res?.data?.token || `token_${Date.now()}`;
    const session = {
      currentUser: user,
      isAuthenticated: true,
      authMode: 'api',
      token
    };
    saveSession(session);
    return session;
  } catch (err) {
    // If backend is offline or static hosting, create local session
    const user = {
      id: `usr_${Date.now()}`,
      email,
      name: email.split('@')[0] || 'User',
      role: 'user',
      isDemo: false
    };
    const session = {
      currentUser: user,
      isAuthenticated: true,
      authMode: 'local',
      token: `local_token_${Date.now()}`
    };
    saveSession(session);
    return session;
  }
}

export async function register(name, email, password) {
  initMockStore();
  try {
    const res = await registerApi({ name, email, password });
    const user = res?.data?.user || {
      id: `usr_${Date.now()}`,
      email: email || 'user@paytrack.app',
      name: name || 'User',
      role: 'user',
      isDemo: false
    };
    const token = res?.data?.token || `token_${Date.now()}`;
    const session = {
      currentUser: user,
      isAuthenticated: true,
      authMode: 'api',
      token
    };
    saveSession(session);
    return session;
  } catch (err) {
    const user = {
      id: `usr_${Date.now()}`,
      email: email || 'user@paytrack.app',
      name: name || 'User',
      role: 'user',
      isDemo: false
    };
    const session = {
      currentUser: user,
      isAuthenticated: true,
      authMode: 'local',
      token: `local_token_${Date.now()}`
    };
    saveSession(session);
    return session;
  }
}

export function logout() {
  clearSession();
}
