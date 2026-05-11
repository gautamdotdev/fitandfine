import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { productApi, authApi } from "../lib/api";
import { useToasts } from "../lib/store";

// ─── CACHE CONFIG ────────────────────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 60000; // 60 seconds

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const pushToast = useToasts((s) => s.push);

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      pushToast({
        title: "Success",
        message: "Logged in successfully",
        type: "success",
      });
      return data;
    } catch (error) {
      pushToast({
        title: "Login Failed",
        message: error.message,
        type: "error",
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    pushToast({
      title: "Logged Out",
      message: "You have been logged out",
      type: "info",
    });
  };

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.getMe();
      const userData = data.user || data;
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        logout();
      }
    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    token: localStorage.getItem("token"),
    loading,
    login,
    logout,
    isAdmin: user?.role === "admin" || user?.isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// ─── SHOP CONTEXT ─────────────────────────────────────────────────────────────
const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [backgroundTasks, setBackgroundTasks] = useState([]);
  
  const pushToast = useToasts((s) => s.push);
  
  // Refs for request management
  const abortControllerRef = useRef(null);
  const currentRequestKeyRef = useRef(null);

  const fetchProducts = async ({
    page = null,
    cursor = null,
    filters = {},
    limit = 20,
    append = false,
  } = {}) => {
    // 1. Create request key for deduplication & caching
    const requestKey = JSON.stringify({ page, cursor, filters, limit });
    
    // 2. Check Cache
    const cached = cache.get(requestKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL && !append) {
      setProducts(cached.data.products);
      setNextCursor(cached.data.nextCursor);
      setHasMore(cached.data.hasMore);
      return cached.data;
    }

    // 3. Deduplication: Skip if same request is already in-flight
    if (currentRequestKeyRef.current === requestKey) return;
    currentRequestKeyRef.current = requestKey;

    // 4. Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const response = await productApi.getAll({
        page,
        cursor,
        filters,
        limit,
        signal: abortControllerRef.current.signal,
      });

      const productsArr = response.products || [];
      const mappedProducts = productsArr.map((p) => ({ ...p, id: p._id }));

      setProducts((prev) => {
        if (!append) return mappedProducts;
        // 5. Dedup append
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = mappedProducts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      setNextCursor(response.nextCursor);
      setHasMore(response.hasMore);
      setTotal(response.total || 0);

      const result = {
        products: mappedProducts,
        total: response.total,
        nextCursor: response.nextCursor,
        hasMore: response.hasMore,
      };

      // 6. Store in Cache
      cache.set(requestKey, { data: result, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      if (error.name === "AbortError") return; // Silent for aborts
      
      console.error("Error fetching products:", error);
      pushToast({
        title: "Error",
        message: "Failed to load products",
        type: "error",
      });
    } finally {
      setLoading(false);
      currentRequestKeyRef.current = null;
    }
  };

  // Invalidate cache on mutations
  const invalidateCache = () => cache.clear();

  const saveProduct = async (id, data, metadata) => {
    const taskId = Date.now().toString();
    const newTask = {
      id: taskId,
      name: metadata.name,
      status: "processing",
      type: id ? "update" : "create",
      timestamp: new Date()
    };
    
    setBackgroundTasks(prev => [newTask, ...prev]);
    
    try {
      if (id) {
        await productApi.update(id, data);
      } else {
        await productApi.create(data);
      }
      
      // Success: Update task and refresh
      setBackgroundTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "success" } : t));
      invalidateCache();
      fetchProducts({ limit: 20, append: false });
      
      pushToast({ 
        title: "Success", 
        message: `${metadata.name} saved successfully.`, 
        type: "success" 
      });

      // Clear successful task after delay
      setTimeout(() => {
        setBackgroundTasks(prev => prev.filter(t => t.id !== taskId));
      }, 5000);

    } catch (error) {
      setBackgroundTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "error", error: error.message } : t));
      pushToast({ title: "Save Failed", message: error.message, type: "error" });
    }
  };

  const value = {
    products,
    loading,
    nextCursor,
    hasMore,
    total,
    backgroundTasks,
    fetchProducts,
    saveProduct,
    invalidateCache,
    setProducts,
    setBackgroundTasks,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};

