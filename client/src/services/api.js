import axios from 'axios';
import * as mockStore from './mockStore';

const API = axios.create({
  baseURL: '/api',
  timeout: 5000,
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

// Helper wrapper that attempts API call, falling back to mockStore if unavailable
async function safeCall(apiPromise, mockFallback) {
  try {
    const res = await apiPromise();
    // Validate response is JSON and not an HTML SPA fallback page
    if (res.data && typeof res.data === 'object') {
      return res;
    }
    throw new Error('Non-JSON response from API');
  } catch (err) {
    // Graceful fallback to mock store
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

export const fetchICICIPaymentByIdApi = (id) => API.get(`/icici/payments/${id}`);

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

export const duplicateICICIPaymentApi = (id) => API.post(`/icici/payments/${id}/duplicate`);

// Slice Payments APIs
export const fetchSlicePaymentsApi = async () => {
  return safeCall(
    () => API.get('/slice/payments'),
    () => mockStore.mockGetSlicePayments()
  );
};

export const fetchSlicePaymentByIdApi = (id) => API.get(`/slice/payments/${id}`);

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

export const duplicateSlicePaymentApi = (id) => API.post(`/slice/payments/${id}/duplicate`);

// Analytics & Reports
export const fetchAnalyticsApi = async () => {
  return safeCall(
    () => API.get('/analytics'),
    () => mockStore.mockGetAnalytics()
  );
};

export const fetchReportsApi = (params) => API.get('/reports', { params });

// Settings & Audit
export const fetchSettingsApi = async () => {
  return safeCall(
    () => API.get('/settings'),
    () => mockStore.mockGetSettings()
  );
};

export const updateSettingsApi = (data) => API.put('/settings', data);

export const resetDemoDataApi = async () => {
  return safeCall(
    () => API.post('/settings/reset-demo'),
    () => mockStore.mockResetDemo()
  );
};

export const clearAllDataApi = () => API.post('/settings/clear-all');
export const fetchAuditLogsApi = () => API.get('/audit');

export default API;
