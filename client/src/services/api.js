import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
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

// Auth APIs
export const loginApi = (credentials) => API.post('/auth/login', credentials);
export const registerApi = (data) => API.post('/auth/register', data);
export const fetchMeApi = () => API.get('/auth/me');

// Dashboard API
export const fetchDashboardApi = () => API.get('/dashboard');

// ICICI Payments APIs
export const fetchICICIPaymentsApi = () => API.get('/icici/payments');
export const fetchICICIPaymentByIdApi = (id) => API.get(`/icici/payments/${id}`);
export const saveICICIPaymentApi = (data) => data.id ? API.put(`/icici/payments/${data.id}`, data) : API.post('/icici/payments', data);
export const deleteICICIPaymentApi = (id) => API.delete(`/icici/payments/${id}`);
export const duplicateICICIPaymentApi = (id) => API.post(`/icici/payments/${id}/duplicate`);

// Slice Payments APIs
export const fetchSlicePaymentsApi = () => API.get('/slice/payments');
export const fetchSlicePaymentByIdApi = (id) => API.get(`/slice/payments/${id}`);
export const saveSlicePaymentApi = (data) => data.id ? API.put(`/slice/payments/${data.id}`, data) : API.post('/slice/payments', data);
export const deleteSlicePaymentApi = (id) => API.delete(`/slice/payments/${id}`);
export const duplicateSlicePaymentApi = (id) => API.post(`/slice/payments/${id}/duplicate`);

// Analytics & Reports
export const fetchAnalyticsApi = () => API.get('/analytics');
export const fetchReportsApi = (params) => API.get('/reports', { params });

// Settings & Audit
export const fetchSettingsApi = () => API.get('/settings');
export const updateSettingsApi = (data) => API.put('/settings', data);
export const resetDemoDataApi = () => API.post('/settings/reset-demo');
export const clearAllDataApi = () => API.post('/settings/clear-all');
export const fetchAuditLogsApi = () => API.get('/audit');

export default API;
