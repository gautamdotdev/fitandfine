import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/ShopContext.jsx";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return null; // Or a spinner

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }

  if (adminOnly && !isAdmin) {
    // If user is logged in but not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
}
