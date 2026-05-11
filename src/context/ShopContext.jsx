import React, { createContext, useContext, useState, useEffect } from "react";
import { productApi, authApi } from "../lib/api";
import { useToasts } from "../lib/store";

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const pushToast = useToasts((s) => s.push);

  // Paginated fetch with filters
  const fetchProducts = async ({
    page = 1,
    limit = 20,
    filters = {},
    append = false,
  } = {}) => {
    try {
      setLoading(true);
      const data = await productApi.getAll({ page, limit, filters });
      const productsArr = data.products || data.data || [];
      const mappedProducts = productsArr.map((p) => ({ ...p, id: p._id }));
      setProducts((prev) =>
        append ? [...prev, ...mappedProducts] : mappedProducts,
      );
      // Optionally: set total/pages if you want to track for infinite scroll
    } catch (error) {
      console.error("Error fetching products:", error);
      pushToast({
        title: "Error",
        message: "Failed to load products",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const data = await authApi.login(credentials);
      setToken(data.token);
      setUser(data.user);
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
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    pushToast({
      title: "Logged Out",
      message: "You have been logged out",
      type: "info",
    });
  };

  const checkAuth = async () => {
    if (!token) return;
    try {
      const data = await authApi.getMe();
      setUser(data.user || data);
    } catch (error) {
      logout();
    }
  };

  useEffect(() => {
    fetchProducts();
    if (token) checkAuth();
  }, [token]);

  const value = {
    products,
    loading,
    user,
    token,
    login,
    logout,
    fetchProducts,
    refreshProducts: fetchProducts,
    isAdmin: user?.role === "admin" || user?.isAdmin, // Adjust based on backend schema
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within ShopProvider");
  return context;
};
