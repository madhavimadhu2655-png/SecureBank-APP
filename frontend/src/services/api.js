import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('banking_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('banking_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
};

export const userAPI = {
  getProfile:    ()  => api.get('/user/profile'),
  getBalance:    ()  => api.get('/user/balance'),
  updateProfile: (d) => api.put('/user/profile', d),
};

export const transactionAPI = {
  transfer:   (data)   => api.post('/transactions/transfer', data),
  requestOTP: (data)   => api.post('/transactions/request-otp', data),
  getHistory: (params) => api.get('/transactions/history', { params }),
};

export const adminAPI = {
  getDashboard:    ()       => api.get('/admin/dashboard'),
  getUsers:        (params) => api.get('/admin/users', { params }),
  suspendUser:     (id, d)  => api.put(`/admin/users/${id}/suspend`, d),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getAlerts:       ()       => api.get('/admin/alerts'),
  resolveAlert:    (id, d)  => api.put(`/admin/transactions/${id}/resolve`, d),
};

export const walletAPI = {
  getWallet: ()     => api.get('/wallet'),
  addMoney:  (data) => api.post('/wallet/add', data),
  send:      (data) => api.post('/wallet/send', data),
  withdraw:  (data) => api.post('/wallet/withdraw', data),
};

export const investmentAPI = {
  getAll:     (params) => api.get('/investments', { params }),
  mutualFund: (data)   => api.post('/investments/mutual-fund', data),
  gold:       (data)   => api.post('/investments/gold', data),
  bookFD:     (data)   => api.post('/investments/fd', data),
  breakFD:    (id)     => api.post(`/investments/fd/${id}/break`),
};

export const billsAPI = {
  fetchBill:   (params) => api.get('/bills/fetch', { params }),
  recharge:    (data)   => api.post('/bills/recharge', data),
  electricity: (data)   => api.post('/bills/electricity', data),
  creditCard:  (data)   => api.post('/bills/credit-card', data),
  generic:     (data)   => api.post('/bills/generic', data),
};

export default api;
