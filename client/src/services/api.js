import axios from 'axios';
import * as mockStore from './mockStore';

const API = axios.create({
  baseURL: '/api',
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('fintech_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

// Check if running on localhost with a dev server vs hosted static platform (e.g. Vercel)
const isHostedStatic = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

// Helper wrapper that attempts API call, falling back immediately on static hosts or on error
async function safeCall(apiPromise, mockFallback) {
  // If deployed to a static host (Vercel) where Express backend is not running, use local store directly
  if (isHostedStatic) {
    const mockData = await mockFallback();
    return { data: mockData };
  }

  try {
    const res = await apiPromise();
    // Validate response is JSON and not an HTML fallback page
    if (res && res.data && typeof res.data === 'object') {
      return res;
    }
    throw new Error('Non-JSON response from API');
  } catch (err) {
    // Graceful fallback to mock store for offline/demo reliability
    const mockData = await mockFallback();
    return { data: mockData };
  }
}

// Auth APIs
export const loginApi = async (credentials) => {
  return safeCall(
    () => API.post('/auth/login', credentials),
    () => mockStore.mockLogin(credentials.email, credentials.password)
  );
};

export const registerApi = async (data) => {
  return safeCall(
    () => API.post('/auth/register', data),
    () => mockStore.mockRegister(data.name, data.email)
  );
};

export const fetchMeApi = async () => {
  return safeCall(
    () => API.get('/auth/me'),
    () => mockStore.mockGetMe()
  );
};

// Dashboard API
export const fetchDashboardApi = async () => {
  return safeCall(
    () => API.get('/dashboard'),
    () => mockStore.mockGetDashboard()
  );
};

// ICICI Payments APIs
export const fetchICICIPaymentsApi = async () => {
  return safeCall(
    () => API.get('/icici/payments'),
    () => mockStore.mockGetICICIPayments()
  );
};

export const fetchICICIPaymentByIdApi = async (id) => {
  return safeCall(
    () => API.get(`/icici/payments/${id}`),
    () => {
      const list = mockStore.mockGetICICIPayments();
      return list.find(r => r.id === id) || null;
    }
  );
};

export const saveICICIPaymentApi = async (data) => {
  return safeCall(
    () => (data.id ? API.put(`/icici/payments/${data.id}`, data) : API.post('/icici/payments', data)),
    () => mockStore.mockSaveICICIPayment(data)
  );
};

export const deleteICICIPaymentApi = async (id) => {
  return safeCall(
    () => API.delete(`/icici/payments/${id}`),
    () => mockStore.mockDeleteICICIPayment(id)
  );
};

export const duplicateICICIPaymentApi = async (id) => {
  return safeCall(
    () => API.post(`/icici/payments/${id}/duplicate`),
    () => {
      const list = mockStore.mockGetICICIPayments();
      const item = list.find(r => r.id === id);
      if (!item) return null;
      const dup = { ...item, id: `icici_pay_${Date.now()}` };
      return mockStore.mockSaveICICIPayment(dup);
    }
  );
};

// Slice Payments APIs
export const fetchSlicePaymentsApi = async () => {
  return safeCall(
    () => API.get('/slice/payments'),
    () => mockStore.mockGetSlicePayments()
  );
};

export const fetchSlicePaymentByIdApi = async (id) => {
  return safeCall(
    () => API.get(`/slice/payments/${id}`),
    () => {
      const list = mockStore.mockGetSlicePayments();
      return list.find(r => r.id === id) || null;
    }
  );
};

export const saveSlicePaymentApi = async (data) => {
  return safeCall(
    () => (data.id ? API.put(`/slice/payments/${data.id}`, data) : API.post('/slice/payments', data)),
    () => mockStore.mockSaveSlicePayment(data)
  );
};

export const deleteSlicePaymentApi = async (id) => {
  return safeCall(
    () => API.delete(`/slice/payments/${id}`),
    () => mockStore.mockDeleteSlicePayment(id)
  );
};

export const duplicateSlicePaymentApi = async (id) => {
  return safeCall(
    () => API.post(`/slice/payments/${id}/duplicate`),
    () => {
      const list = mockStore.mockGetSlicePayments();
      const item = list.find(r => r.id === id);
      if (!item) return null;
      const dup = { ...item, id: `slice_pay_${Date.now()}` };
      return mockStore.mockSaveSlicePayment(dup);
    }
  );
};

// Analytics & Reports
export const fetchAnalyticsApi = async () => {
  return safeCall(
    () => API.get('/analytics'),
    () => mockStore.mockGetAnalytics()
  );
};

export const fetchReportsApi = async (params) => {
  return safeCall(
    () => API.get('/reports', { params }),
    () => {
      const icici = mockStore.mockGetICICIPayments();
      const slice = mockStore.mockGetSlicePayments();
      return { icici, slice };
    }
  );
};

// Settings & Audit
export const fetchSettingsApi = async () => {
  return safeCall(
    () => API.get('/settings'),
    () => mockStore.mockGetSettings()
  );
};

export const updateSettingsApi = async (data) => {
  return safeCall(
    () => API.put('/settings', data),
    () => data
  );
};

export const resetDemoDataApi = async () => {
  return safeCall(
    () => API.post('/settings/reset-demo'),
    () => mockStore.mockResetDemo()
  );
};

export const clearAllDataApi = async () => {
  return safeCall(
    () => API.post('/settings/clear-all'),
    () => {
      localStorage.removeItem('paytrack_icici');
      localStorage.removeItem('paytrack_slice');
      return { success: true };
    }
  );
};

export const fetchAuditLogsApi = async () => {
  return safeCall(
    () => API.get('/audit'),
    () => [
      {
        id: 'log_001',
        action: 'SYSTEM_INIT',
        details: 'PayTrack workspace active with demo records.',
        timestamp: new Date().toISOString()
      }
    ]
  );
};

export default API;
