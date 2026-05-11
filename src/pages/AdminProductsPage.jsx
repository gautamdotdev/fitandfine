import React, { useState, useMemo, useEffect } from "react";
import { useShop, useAuth } from "../context/ShopContext";
import { productApi } from "../lib/api";
import { useToasts } from "../lib/store";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Star,
  Box,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Package,
  AlertTriangle,
  LayoutGrid,
  LayoutList,
  X,
} from "lucide-react";

/* ─── Styles ─── */
const STYLES = `
  .adm-wrap { max-width: 1280px; margin: 0 auto; padding: 48px 24px; }
  .adm-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; gap: 16px; flex-wrap: wrap; }
  .adm-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .adm-toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
  .adm-search { flex: 1; min-width: 220px; }
  .adm-table-wrap { border-radius: 20px; overflow: hidden; border: 1px solid var(--color-border); box-shadow: 0 4px 32px rgba(0,0,0,0.05); }
  .adm-table { width: 100%; border-collapse: collapse; }
  .adm-table thead tr { background: var(--color-surface); }
  .adm-table th { padding: 16px 20px; text-align: left; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; color: var(--color-muted-foreground); white-space: nowrap; }
  .adm-table th:last-child { text-align: right; }
  .adm-table td { padding: 18px 20px; vertical-align: middle; }
  .adm-row { border-top: 1px solid var(--color-border); transition: background 0.15s; }
  .adm-row:hover { background: var(--color-surface); }
  .adm-action-btn { padding: 9px; border-radius: 10px; border: 1.5px solid var(--color-border); background: transparent; cursor: pointer; transition: all 0.18s; display: flex; align-items: center; justify-content: center; }
  .adm-action-btn:hover { border-color: var(--color-foreground); background: var(--color-surface); }
  .adm-action-btn.danger:hover { border-color: #ef4444; background: #fef2f2; color: #ef4444; }
  .adm-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; }
  .adm-card { border: 1px solid var(--color-border); border-radius: 16px; padding: 16px; background: var(--color-background); transition: box-shadow 0.2s; }
  .adm-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

  /* ── Confirm Modal ── */
  .confirm-backdrop {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: backdropIn 0.2s ease;
  }
  .confirm-modal {
    background: var(--color-background);
    border: 1px solid var(--color-border);
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.2);
    animation: modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
  }
  @keyframes backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  @media (max-width: 900px) {
    .adm-stats { grid-template-columns: repeat(2, 1fr); }
    .hide-md { display: none !important; }
  }
  @media (max-width: 640px) {
    .adm-wrap { padding: 24px 16px; }
    .adm-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .adm-header { flex-direction: column; }
    .adm-header-actions { width: 100%; }
    .adm-header-actions button { width: 100%; justify-content: center; }
    .hide-sm { display: none !important; }
    .confirm-modal { padding: 24px 20px; border-radius: 20px; }
  }
`;

/* ─── Delete Confirm Modal ─── */
function ConfirmDeleteModal({ product, onConfirm, onCancel, loading }) {
  if (!product) return null;
  return (
    <div className="confirm-backdrop" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Close btn */}
        <button
          onClick={onCancel}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "1.5px solid var(--color-border)",
            background: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-foreground)",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-foreground)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
        >
          <X size={14} strokeWidth={2.5} />
        </button>

        {/* Icon */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "16px",
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Trash2 size={24} color="#ef4444" />
        </div>

        {/* Title */}
        <h2
          style={{
            fontFamily: "var(--font-serif, Georgia)",
            fontSize: "1.4rem",
            fontWeight: 800,
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          Delete Product?
        </h2>

        {/* Product info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            marginBottom: 12,
          }}
        >
          {(product.images?.[0]?.url || product.images?.[0]) && (
            <img
              src={product.images?.[0]?.url || product.images?.[0]}
              alt={product.name}
              style={{
                width: 40,
                height: 48,
                objectFit: "cover",
                borderRadius: 8,
                flexShrink: 0,
              }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.name}
            </div>
            <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginTop: 2 }}>
              ₹{product.price?.toLocaleString("en-IN")}
              {product.category ? ` · ${product.category}` : ""}
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: 13,
            color: "var(--color-muted-foreground)",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          This action is permanent and cannot be undone. The product will be removed from your catalog immediately.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            style={{
              flex: 1,
              padding: "13px",
              borderRadius: 12,
              border: "1.5px solid var(--color-border)",
              background: "transparent",
              color: "var(--color-foreground)",
              fontSize: 13,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.15s",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            style={{
              flex: 1.4,
              padding: "13px",
              borderRadius: 12,
              border: "none",
              background: "#ef4444",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Yes, Delete
              </>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, accent, sub }) {
  return (
    <div
      className="stat-card"
      style={{
        background: "var(--color-background)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--color-muted-foreground)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "10px",
            background: accent + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} color={accent} />
        </span>
      </div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: 800,
          lineHeight: 1,
          fontFamily: "var(--font-serif, Georgia)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}>{sub}</div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function AdminProductsPage() {
  const { products, loading, fetchProducts, nextCursor, hasMore, total, setProducts, invalidateCache } = useShop();
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const pushToast = useToasts((s) => s.push);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [viewMode, setViewMode] = useState("table");

  // Initial Fetch & Page Change
  useEffect(() => {
    if (isAdmin) {
      fetchProducts({ page, limit: 20, append: false });
    }
  }, [page, isAdmin, fetchProducts]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Confirm modal state
  const [confirmProduct, setConfirmProduct] = useState(null); // product object | null
  const [deletingId, setDeletingId] = useState(null);

  /* ── Stats ── */
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock <= 5).length;
  const onSale = products.filter((p) => p.salePrice).length;
  const bestSellers = products.filter((p) => p.isBestseller).length;

  /* ── Categories ── */
  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [products]);

  /* ── Filtered ── */
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.slug?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "All" || p.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [products, search, filterCat]);

  /* ── Delete handlers ── */
  const requestDelete = (product) => setConfirmProduct(product);

  const cancelDelete = () => {
    if (deletingId) return; // don't close while deleting
    setConfirmProduct(null);
  };

  const confirmDelete = async () => {
    if (!confirmProduct) return;
    setDeletingId(confirmProduct._id);
    try {
      await productApi.delete(confirmProduct._id);
      
      // Optimistic/Local State Update
      setProducts((prev) => prev.filter((p) => p._id !== confirmProduct._id));
      invalidateCache(); // Clear cache to ensure fresh data elsewhere
      
      pushToast({ title: "Deleted", message: "Product removed from catalog.", type: "success" });
      setConfirmProduct(null);
    } catch (error) {
      pushToast({ title: "Error", message: error.message, type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Access guard ── */
  if (authLoading) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <p style={{ color: "var(--color-muted-foreground)", fontSize: "14px", fontWeight: 500 }}>
          Verifying credentials...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "#fef2f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <AlertTriangle size={28} color="#ef4444" />
        </div>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem", marginBottom: 8 }}>
          Access Denied
        </h2>
        <p style={{ color: "var(--color-muted-foreground)" }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  /* ── Product Row ── */
  const ProductRow = ({ p }) => (
    <tr className="adm-row">
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={p.images?.[0]?.url || p.images?.[0] || "https://via.placeholder.com/60"}
              alt={p.name}
              style={{ width: 52, height: 64, objectFit: "cover", borderRadius: 10, display: "block" }}
            />
            {p.stock <= 5 && (
              <span
                style={{
                  position: "absolute",
                  top: -5, right: -5,
                  background: "#ef4444",
                  color: "#fff",
                  fontSize: 8,
                  padding: "2px 5px",
                  borderRadius: 20,
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                }}
              >
                LOW
              </span>
            )}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{p.name}</div>
            <div style={{ fontSize: 11, color: "var(--color-muted-foreground)", marginTop: 3 }}>
              {p.slug}
            </div>
          </div>
        </div>
      </td>
      <td className="hide-md">
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            background: "var(--color-surface)",
            padding: "5px 12px",
            borderRadius: 8,
            border: "1px solid var(--color-border)",
          }}
        >
          {p.category}
        </span>
      </td>
      <td>
        <div style={{ fontWeight: 800, fontSize: 15 }}>
          ₹{p.price?.toLocaleString("en-IN")}
        </div>
        {p.salePrice && (
          <div style={{ fontSize: 11, marginTop: 2, color: "var(--color-gold, #b45309)", fontWeight: 600 }}>
            Sale ₹{p.salePrice?.toLocaleString("en-IN")}
          </div>
        )}
      </td>
      <td className="hide-sm">
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {p.newArrival && (
            <span className="adm-badge" style={{ background: "#fef9ec", color: "#b45309", border: "1px solid #fde68a" }}>
              <Tag size={10} /> New
            </span>
          )}
          {p.isBestseller && (
            <span className="adm-badge" style={{ background: "#fefce8", color: "#854d0e", border: "1px solid #fef08a" }}>
              <Star size={10} /> Best
            </span>
          )}
          <span
            className="adm-badge"
            style={{
              background: p.stock <= 5 ? "#fef2f2" : "var(--color-surface)",
              color: p.stock <= 5 ? "#ef4444" : "var(--color-muted-foreground)",
              border: `1px solid ${p.stock <= 5 ? "#fecaca" : "var(--color-border)"}`,
            }}
          >
            <Box size={10} /> {p.stock}
          </span>
        </div>
      </td>
      <td style={{ textAlign: "right" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            className="adm-action-btn"
            onClick={() => navigate(`/admin/products/edit/${p._id}`)}
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            className="adm-action-btn danger"
            onClick={() => requestDelete(p)}
            title="Delete"
            style={{ color: "#ef4444" }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );

  /* ── Product Grid Card ── */
  const ProductGridCard = ({ p }) => (
    <div className="adm-card">
      <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 12, overflow: "hidden", marginBottom: 12 }}>
        <img
          src={p.images?.[0]?.url || p.images?.[0] || "https://via.placeholder.com/200"}
          alt={p.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {p.stock <= 5 && (
          <span
            style={{
              position: "absolute", top: 8, left: 8,
              background: "#ef4444", color: "#fff",
              fontSize: 9, padding: "3px 8px", borderRadius: 20, fontWeight: 800,
            }}
          >
            LOW STOCK
          </span>
        )}
        {p.salePrice && (
          <span
            style={{
              position: "absolute", top: 8, right: 8,
              background: "var(--color-gold, #b45309)", color: "#fff",
              fontSize: 9, padding: "3px 8px", borderRadius: 20, fontWeight: 800,
            }}
          >
            SALE
          </span>
        )}
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
      <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginBottom: 8 }}>
        {p.category}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>₹{p.price?.toLocaleString("en-IN")}</span>
          {p.salePrice && (
            <div style={{ fontSize: 10, color: "var(--color-gold, #b45309)", fontWeight: 600 }}>
              ₹{p.salePrice?.toLocaleString("en-IN")}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="adm-action-btn"
            onClick={() => navigate(`/admin/products/edit/${p._id}`)}
            title="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            className="adm-action-btn danger"
            onClick={() => requestDelete(p)}
            style={{ color: "#ef4444" }}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Delete Confirm Modal ── */}
      <ConfirmDeleteModal
        product={confirmProduct}
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className="adm-wrap">
        {/* ── Header ── */}
        <div className="adm-header">
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-muted-foreground)",
                marginBottom: 6,
              }}
            >
              Admin
            </div>
            <h1
              style={{
                fontFamily: "var(--font-serif, Georgia)",
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              Product Management
            </h1>
            <p style={{ color: "var(--color-muted-foreground)", marginTop: 8, fontSize: 14 }}>
              {totalProducts} products · Manage catalog, stock & visibility
            </p>
          </div>
          <div className="adm-header-actions" style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => navigate("/admin/products/add")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--color-foreground)",
                color: "var(--color-background)",
                padding: "13px 24px",
                borderRadius: 14,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                fontSize: 14,
                boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
            >
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="adm-stats">
          <StatCard icon={Package} label="Total" value={total} accent="#6366f1" sub="Products in catalog" />
          <StatCard icon={AlertTriangle} label="Low Stock" value={lowStock} accent="#ef4444" sub="≤5 units remaining" />
          <StatCard icon={Tag} label="On Sale" value={onSale} accent="#f59e0b" sub="Active discounts" />
          <StatCard icon={Star} label="Bestsellers" value={bestSellers} accent="#10b981" sub="Top performers" />
        </div>

        {/* ── Toolbar ── */}
        <div className="adm-toolbar">
          <div className="adm-search" style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-muted-foreground)",
              }}
            />
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = "var(--color-foreground)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              style={{
                width: "100%",
                padding: "11px 14px 11px 40px",
                borderRadius: 12,
                border: "1.5px solid var(--color-border)",
                background: "var(--color-surface)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
                fontFamily: "inherit",
                color: "var(--color-foreground)",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            <SlidersHorizontal size={14} style={{ color: "var(--color-muted-foreground)" }} />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  border: "1.5px solid",
                  borderColor: filterCat === cat ? "var(--color-foreground)" : "var(--color-border)",
                  background: filterCat === cat ? "var(--color-foreground)" : "transparent",
                  color: filterCat === cat ? "var(--color-background)" : "var(--color-foreground)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  fontFamily: "inherit",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              border: "1.5px solid var(--color-border)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {[["table", LayoutList], ["grid", LayoutGrid]].map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "8px 12px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  background: viewMode === mode ? "var(--color-foreground)" : "transparent",
                  color: viewMode === mode ? "var(--color-background)" : "var(--color-muted-foreground)",
                  transition: "all 0.18s",
                }}
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {/* ── Table View ── */}
        {viewMode === "table" && (
          <div className="adm-table-wrap" style={{ background: "var(--color-background)" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="hide-md">Category</th>
                    <th>Price</th>
                    <th className="hide-sm">Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => <ProductRow key={p._id} p={p} />)}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ padding: "72px 24px", textAlign: "center", color: "var(--color-muted-foreground)" }}>
                        <Package size={36} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} />
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Grid View ── */}
        {viewMode === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {filtered.map((p) => <ProductGridCard key={p._id} p={p} />)}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", padding: "72px 24px", textAlign: "center", color: "var(--color-muted-foreground)" }}>
                <Package size={36} style={{ margin: "0 auto 12px", opacity: 0.3, display: "block" }} />
                No products found.
              </div>
            )}
          </div>
        )}

        {/* ── Pagination ── */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: 16, 
          marginTop: 48,
          marginBottom: 24 
        }}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1 || loading}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1.5px solid var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-foreground)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: (page === 1 || loading) ? "not-allowed" : "pointer",
              opacity: (page === 1 || loading) ? 0.5 : 1,
              transition: "all 0.2s"
            }}
          >
            Previous
          </button>
          
          <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--color-foreground)" }}>
            Page {page}
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasMore || loading}
            style={{
              padding: "10px 20px",
              borderRadius: "10px",
              border: "1.5px solid var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-foreground)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: (!hasMore || loading) ? "not-allowed" : "pointer",
              opacity: (!hasMore || loading) ? 0.5 : 1,
              transition: "all 0.2s"
            }}
          >
            Next
          </button>
        </div>

        {/* ── Footer count ── */}
        {filtered.length > 0 && (
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "var(--color-muted-foreground)",
              fontWeight: 500,
            }}
          >
            Showing {filtered.length} of {total} products
          </div>
        )}
      </div>
    </>
  );
}