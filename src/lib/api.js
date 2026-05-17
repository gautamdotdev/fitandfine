const API_URL = import.meta.env.VITE_API_URL;

export const api = async (endpoint, options = {}) => {
  // Read token inside function so it's always fresh
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && !options.skipAuth && { Authorization: `Bearer ${token}` }),
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

export const authApi = {
  login: (credentials) =>
    api("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
  register: (data) =>
    api("/auth/register", { method: "POST", body: JSON.stringify(data) }),
  getMe: () => api("/auth/me"),
  updateMe: (data) =>
    api("/auth/me", { method: "PUT", body: JSON.stringify(data) }),
  logout: () => api("/auth/logout", { method: "POST" }),
  googleLogin: ({ idToken }) => {
    if (!idToken || idToken.trim() === "") {
      throw new Error("Google ID token is required");
    }
    return api("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
      skipAuth: true,
    });
  },
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
  getAdminAll: ({ signal, filters = {}, ...params } = {}) => {
    const queryParams = { ...filters, ...params };
    const urlParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) urlParams.append(key, value);
    });
    return api(`/products/admin/all?${urlParams.toString()}`, { signal });
  },
  getAdminOne: (id) => api(`/products/admin/${id}`),
  create: (formData) => api("/products", { method: "POST", body: formData }),
  update: (id, data) =>
    api(`/products/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  delete: (id) => api(`/products/${id}`, { method: "DELETE" }),
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
  updateStatus: (orderId, status, payment) =>
    api(`/orders/${orderId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, payment }),
    }),

  addPayment: (orderId, payment) =>
    api(`/orders/${orderId}/payments`, {
      method: "POST",
      body: JSON.stringify(payment),
    }),

  // Public tracking via UUID
  track: (uuid) => api(`/orders/track/${uuid}`),
};

export const adminApi = {
  dashboard: () => api("/admin/dashboard"),
  customers: () => api("/admin/customers"),
  getSiteSettings: () =>
    api("/admin/settings/site", { skipAuth: true, cache: "no-store" }),
  updateSiteSettings: (data) =>
    api("/admin/settings/site", { method: "PUT", body: data }),
  coupons: () => api("/admin/coupons"),
  saveCoupon: (data) =>
    api("/admin/coupons", { method: "POST", body: JSON.stringify(data) }),
  cancelCoupon: (code) =>
    api(`/admin/coupons/${encodeURIComponent(code)}/cancel`, {
      method: "PUT",
    }),
  deleteCoupon: (code) =>
    api(`/admin/coupons/${encodeURIComponent(code)}`, {
      method: "DELETE",
    }),
};

export const couponApi = {
  validate: (data) =>
    api("/coupons/validate", {
      method: "POST",
      body: JSON.stringify(data),
      skipAuth: true,
    }),
};

export const wishlistApi = {
  get: () => api("/wishlist"),
  remove: (product) =>
    api("/wishlist/remove", {
      method: "DELETE",
      body: JSON.stringify({ product }),
    }),
  add: (product) =>
    api("/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ product }),
    }),
};
