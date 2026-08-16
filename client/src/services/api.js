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
  if (isHostedStatic) {
    const mockData = await mockFallback();
    return { data: mockData };
  }

  try {
    const res = await apiPromise();
    if (res && res.data && typeof res.data === 'object') {
      return res;
    }
    throw new Error('Non-JSON response from API');
  } catch (err) {
    const mockData = await mockFallback();
    return { data: mockData };
  }
}

// ── AUTH APIs ──
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

// ── DASHBOARD & ANALYTICS APIs ──
export const fetchDashboardApi = async () => {
  return safeCall(
    () => API.get('/dashboard'),
    () => mockStore.mockGetDashboard()
  );
};

export const fetchAnalyticsApi = async () => {
  return safeCall(
    () => API.get('/analytics'),
    () => {
      const dash = mockStore.mockGetDashboard();
      return {
        trends: dash.trends || [],
        metrics: dash.metrics || {},
        icici: dash.icici || [],
        slice: dash.slice || []
      };
    }
  );
};

// ── CUSTOMERS APIs ──
export const fetchCustomersApi = async (filter = {}) => {
  return safeCall(
    () => API.get('/customers', { params: filter }),
    () => mockStore.mockGetCustomers(filter)
  );
};

export const fetchCustomerByIdApi = async (id) => {
  return safeCall(
    () => API.get(`/customers/${id}`),
    () => mockStore.mockGetCustomerById(id)
  );
};

export const saveCustomerApi = async (data) => {
  return safeCall(
    () => (data.id ? API.put(`/customers/${data.id}`, data) : API.post('/customers', data)),
    () => mockStore.mockSaveCustomer(data)
  );
};

export const deleteCustomerApi = async (id) => {
  return safeCall(
    () => API.delete(`/customers/${id}`),
    () => mockStore.mockDeleteCustomer(id)
  );
};

// ── CREDITS APIs ──
export const fetchCreditsApi = async (filter = {}) => {
  return safeCall(
    () => API.get('/credits', { params: filter }),
    () => mockStore.mockGetCredits(filter)
  );
};

export const saveCreditApi = async (data) => {
  return safeCall(
    () => (data.id ? API.put(`/credits/${data.id}`, data) : API.post('/credits', data)),
    () => mockStore.mockSaveCredit(data)
  );
};

// ── PAYMENTS & TRANSACTIONS APIs ──
export const fetchTransactionsApi = async (filter = {}) => {
  return safeCall(
    () => API.get('/payments/transactions', { params: filter }),
    () => mockStore.mockGetTransactions(filter)
  );
};

export const recordPaymentApi = async (data) => {
  return safeCall(
    () => API.post('/payments/record', data),
    () => mockStore.mockRecordPayment(data)
  );
};

export const voidTransactionApi = async (id, reason) => {
  return safeCall(
    () => API.post(`/payments/void/${id}`, { reason }),
    () => mockStore.mockVoidTransaction(id, reason)
  );
};

// ── STATEMENT API ──
export const fetchCustomerStatementApi = async (customerId, fromDate, toDate) => {
  return safeCall(
    () => API.get(`/statements/${customerId}`, { params: { fromDate, toDate } }),
    () => mockStore.mockGetCustomerStatement(customerId, fromDate, toDate)
  );
};

// ── AUDIT LOGS API ──
export const fetchAuditLogsApi = async () => {
  return safeCall(
    () => API.get('/audit'),
    () => mockStore.mockGetAuditLogs()
  );
};

// ── ICICI PAYMENTS (PRESERVED) ──
export const fetchICICIPaymentsApi = async () => {
  return safeCall(
    () => API.get('/icici/payments'),
    () => mockStore.mockGetICICIPayments()
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
      const dup = { ...item, id: undefined, billing_month: new Date().toISOString().slice(0, 7) };
      return mockStore.mockSaveICICIPayment(dup);
    }
  );
};

// ── SLICE PAYMENTS (PRESERVED) ──
export const fetchSlicePaymentsApi = async () => {
  return safeCall(
    () => API.get('/slice/payments'),
    () => mockStore.mockGetSlicePayments()
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
      const dup = { ...item, id: undefined, month: new Date().toISOString().slice(0, 7) };
      return mockStore.mockSaveSlicePayment(dup);
    }
  );
};
