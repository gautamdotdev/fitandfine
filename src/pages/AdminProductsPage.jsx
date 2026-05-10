import React, { useState, useMemo } from "react";
import { useShop } from "../context/ShopContext";
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
} from "lucide-react";

/* ─── Injected Responsive Styles ─── */
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
  .adm-cards { display: grid; gap: 16px; }
  .adm-card { border: 1px solid var(--color-border); border-radius: 16px; padding: 16px; background: var(--color-background); transition: box-shadow 0.2s; }
  .adm-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); }

  /* Stat card hover */
  .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }

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
  }
`;

function InjectStyles() {
  return <style>{STYLES}</style>;
}

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
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
        <div
          style={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  const { products, refreshProducts, isAdmin } = useShop();
  const navigate = useNavigate();
  const pushToast = useToasts((s) => s.push);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'
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

  /* ── Filtered list ── */
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
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "2rem",
            marginBottom: 8,
          }}
        >
          Access Denied
        </h2>
        <p style={{ color: "var(--color-muted-foreground)" }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    setDeletingId(id);
    try {
      await productApi.delete(id);
      pushToast({
        title: "Deleted",
        message: "Product removed from catalog.",
        type: "success",
      });
      refreshProducts();
    } catch (error) {
      pushToast({ title: "Error", message: error.message, type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  /* ── Product Row ── */
  const ProductRow = ({ p }) => (
    <tr className="adm-row" key={p._id}>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img
              src={
                p.images?.[0]?.url ||
                p.images?.[0] ||
                "https://via.placeholder.com/60"
              }
              alt={p.name}
              style={{
                width: 52,
                height: 64,
                objectFit: "cover",
                borderRadius: 10,
                display: "block",
              }}
            />
            {p.stock <= 5 && (
              <span
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
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
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
              {p.name}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-muted-foreground)",
                marginTop: 3,
              }}
            >
              {p.slug}
            </div>
            {/* tags visible on mobile */}
            <div
              className="hide-md"
              style={{
                display: "flex",
                gap: 5,
                marginTop: 6,
                flexWrap: "wrap",
              }}
            >
              {p.newArrival && (
                <span
                  className="adm-badge"
                  style={{ background: "#fef9ec", color: "#b45309" }}
                >
                  <Tag size={10} />
                  New
                </span>
              )}
              {p.isBestseller && (
                <span
                  className="adm-badge"
                  style={{ background: "#fefce8", color: "#854d0e" }}
                >
                  <Star size={10} />
                  Best
                </span>
              )}
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
          <div
            style={{
              fontSize: 11,
              marginTop: 2,
              color: "var(--color-gold, #b45309)",
              fontWeight: 600,
            }}
          >
            Sale ₹{p.salePrice?.toLocaleString("en-IN")}
          </div>
        )}
      </td>
      <td className="hide-sm">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {p.newArrival && (
            <span
              className="adm-badge"
              style={{
                background: "#fef9ec",
                color: "#b45309",
                border: "1px solid #fde68a",
              }}
            >
              <Tag size={10} />
              New
            </span>
          )}
          {p.isBestseller && (
            <span
              className="adm-badge"
              style={{
                background: "#fefce8",
                color: "#854d0e",
                border: "1px solid #fef08a",
              }}
            >
              <Star size={10} />
              Best
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
            <Box size={10} />
            {p.stock}
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
            onClick={() => handleDelete(p._id)}
            disabled={deletingId === p._id}
            title="Delete"
            style={{
              color: "#ef4444",
              opacity: deletingId === p._id ? 0.5 : 1,
            }}
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
      <div
        style={{
          position: "relative",
          aspectRatio: "4/5",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <img
          src={
            p.images?.[0]?.url ||
            p.images?.[0] ||
            "https://via.placeholder.com/200"
          }
          alt={p.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {p.stock <= 5 && (
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "#ef4444",
              color: "#fff",
              fontSize: 9,
              padding: "3px 8px",
              borderRadius: 20,
              fontWeight: 800,
            }}
          >
            LOW STOCK
          </span>
        )}
        {p.salePrice && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "var(--color-gold, #b45309)",
              color: "#fff",
              fontSize: 9,
              padding: "3px 8px",
              borderRadius: 20,
              fontWeight: 800,
            }}
          >
            SALE
          </span>
        )}
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
        {p.name}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--color-muted-foreground)",
          marginBottom: 8,
        }}
      >
        {p.category}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontWeight: 800, fontSize: 15 }}>
            ₹{p.price?.toLocaleString("en-IN")}
          </span>
          {p.salePrice && (
            <div
              style={{
                fontSize: 10,
                color: "var(--color-gold, #b45309)",
                fontWeight: 600,
              }}
            >
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
            onClick={() => handleDelete(p._id)}
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
      <InjectStyles />
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
            <p
              style={{
                color: "var(--color-muted-foreground)",
                marginTop: 8,
                fontSize: 14,
              }}
            >
              {totalProducts} products · Manage catalog, stock & visibility
            </p>
          </div>
          <div
            className="adm-header-actions"
            style={{ display: "flex", gap: 10 }}
          >
            <button
              onClick={() => navigate("/admin/products/add")}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
              }}
            >
              <Plus size={18} /> Add Product
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="adm-stats">
          <StatCard
            icon={Package}
            label="Total"
            value={totalProducts}
            accent="#6366f1"
            sub="Products in catalog"
          />
          <StatCard
            icon={AlertTriangle}
            label="Low Stock"
            value={lowStock}
            accent="#ef4444"
            sub="≤5 units remaining"
          />
          <StatCard
            icon={Tag}
            label="On Sale"
            value={onSale}
            accent="#f59e0b"
            sub="Active discounts"
          />
          <StatCard
            icon={Star}
            label="Bestsellers"
            value={bestSellers}
            accent="#10b981"
            sub="Top performers"
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="adm-toolbar">
          {/* Search */}
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
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-foreground)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </div>

          {/* Category filter pills */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <SlidersHorizontal
              size={14}
              style={{ color: "var(--color-muted-foreground)" }}
            />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 20,
                  border: "1.5px solid",
                  borderColor:
                    filterCat === cat
                      ? "var(--color-foreground)"
                      : "var(--color-border)",
                  background:
                    filterCat === cat
                      ? "var(--color-foreground)"
                      : "transparent",
                  color:
                    filterCat === cat
                      ? "var(--color-background)"
                      : "var(--color-foreground)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              border: "1.5px solid var(--color-border)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            {[
              ["table", LayoutList],
              ["grid", LayoutGrid],
            ].map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "8px 12px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  background:
                    viewMode === mode
                      ? "var(--color-foreground)"
                      : "transparent",
                  color:
                    viewMode === mode
                      ? "var(--color-background)"
                      : "var(--color-muted-foreground)",
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
          <div
            className="adm-table-wrap"
            style={{ background: "var(--color-background)" }}
          >
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
                  {filtered.map((p) => (
                    <ProductRow key={p._id} p={p} />
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "72px 24px",
                          textAlign: "center",
                          color: "var(--color-muted-foreground)",
                        }}
                      >
                        <Package
                          size={36}
                          style={{
                            margin: "0 auto 12px",
                            opacity: 0.3,
                            display: "block",
                          }}
                        />
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
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {filtered.map((p) => (
              <ProductGridCard key={p._id} p={p} />
            ))}
            {filtered.length === 0 && (
              <div
                style={{
                  gridColumn: "1/-1",
                  padding: "72px 24px",
                  textAlign: "center",
                  color: "var(--color-muted-foreground)",
                }}
              >
                <Package
                  size={36}
                  style={{
                    margin: "0 auto 12px",
                    opacity: 0.3,
                    display: "block",
                  }}
                />
                No products found.
              </div>
            )}
          </div>
        )}

        {/* ── Footer count ── */}
        {filtered.length > 0 && (
          <div
            style={{
              textAlign: "center",
              marginTop: 24,
              fontSize: 12,
              color: "var(--color-muted-foreground)",
              fontWeight: 500,
            }}
          >
            Showing {filtered.length} of {totalProducts} products
          </div>
        )}
      </div>
    </>
  );
}
