const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // If body is FormData, don't set Content-Type (browser will set it with boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
};

export const productApi = {
  getAll: () => api('/products'),
  getOne: (id) => api(`/products/${id}`),
  create: (formData) => api('/products', { method: 'POST', body: formData }),
  update: (id, data) => api(`/products/${id}`, { method: 'PUT', body: data instanceof FormData ? data : JSON.stringify(data) }),
  delete: (id) => api(`/products/${id}`, { method: 'DELETE' }),
};

export const authApi = {
  login: (credentials) => api('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => api('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => api('/auth/me'),
};
