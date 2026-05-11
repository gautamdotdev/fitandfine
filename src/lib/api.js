const API_URL = import.meta.env.VITE_API_URL;

export const api = async (endpoint, options = {}) => {
  // Read token inside function so it's always fresh
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    signal: options.signal,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    throw error;
  }

  return data;
};

// Paginated & filterable fetch with cursor support
export const fetchProducts = async ({
  page,
  cursor,
  limit = 20,
  filters = {},
  signal,
} = {}) => {
  const queryParams = { ...filters, limit };
  if (cursor) queryParams.cursor = cursor;
  if (page) queryParams.page = page;

  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  });

  return api(`/products?${params.toString()}`, { signal });
};

export const productApi = {
  getAll: (params = {}) => fetchProducts(params),
  getOne: (id) => api(`/products/${id}`),
  create: (formData) => api("/products", { method: "POST", body: formData }),
  update: (id, data) =>
    api(`/products/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: (id) => api(`/products/${id}`, { method: "DELETE" }),
};

export const authApi = {
  login: (credentials) =>
    api("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) =>
    api("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => api("/auth/me"),
};

export const orderApi = {
  // Create order
  create: (data) =>
    api("/orders/create", { method: "POST", body: JSON.stringify(data) }),

  // Get logged-in user's own orders
  getMyOrders: () => api("/orders/my"),

  // Admin: get all orders
  getAllOrders: ({ status, page = 1, limit = 20 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    if (status) params.append("status", status);
    return api(`/orders/all?${params.toString()}`);
  },

  // Admin: update order status
  updateStatus: (orderId, status) =>
    api(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  // Public tracking via UUID
  track: (uuid) => api(`/orders/track/${uuid}`),
};