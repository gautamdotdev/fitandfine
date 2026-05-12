import React, { useState, useMemo, useEffect } from "react";
import { useShop, useAuth } from "../../context/ShopContext";
import { productApi } from "../../lib/api";
import { useToasts } from "../../lib/store";
import { useNavigate } from "react-router-dom";
import {
  Plus, Edit2, Trash2, Tag, Star, Box,
  Search, Filter, TrendingUp, Package, AlertTriangle,
  LayoutGrid, LayoutList, X, Loader2, CheckCircle2,
  AlertCircle, Download, Info, ChevronDown,
} from "lucide-react";

/* ─── Styles ─── */
const STYLES = `
  .admp-page { font-family: 'DM Sans', sans-serif; }
  .admp-heading { font-size: 26px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.5px; }
  .admp-sub { font-size: 13px; color: #888; margin: 0 0 24px; }

  /* Toolbar */
  .admp-toolbar {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px; flex-wrap: wrap;
  }
  .admp-search {
    flex: 1; min-width: 220px; max-width: 340px;
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #e8e6e0;
    border-radius: 10px; padding: 9px 14px;
    transition: border-color 0.2s;
  }
  .admp-search:focus-within { border-color: #1a1a1a; }
  .admp-search input { background: none; border: none; outline: none; font-size: 13px; width: 100%; font-family: 'DM Sans', sans-serif; }
  .admp-search input::placeholder { color: #bbb; }

  .admp-filter-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 14px; border-radius: 10px;
    border: 1.5px solid #e8e6e0; background: #fff;
    font-size: 13px; font-weight: 500; cursor: pointer;
    transition: all 0.15s; font-family: 'DM Sans', sans-serif;
    color: #444;
  }
  .admp-filter-btn:hover { border-color: #1a1a1a; }
  .admp-filter-btn.active { border-color: #1a1a1a; background: #1a1a1a; color: #fff; }

  .admp-view-toggle {
    display: flex; border: 1.5px solid #e8e6e0;
    border-radius: 10px; overflow: hidden; background: #fff;
  }
  .admp-view-btn {
    padding: 8px 12px; border: none; cursor: pointer;
    transition: all 0.15s; display: flex; align-items: center;
    background: transparent; color: #888;
  }
  .admp-view-btn.active { background: #1a1a1a; color: #fff; }

  /* Status tabs */
  .admp-tabs { display: flex; gap: 2px; margin-bottom: 16px; }
  .admp-tab {
    padding: 7px 14px; border-radius: 8px; font-size: 12.5px;
    font-weight: 600; cursor: pointer; border: none;
    background: none; transition: all 0.15s;
    color: #888; font-family: 'DM Sans', sans-serif;
  }
  .admp-tab.active { background: #1a1a1a; color: #fff; }
  .admp-tab:hover:not(.active) { background: #f0ede6; color: #1a1a1a; }

  /* Table */
  .admp-table-wrap {
    background: #fff; border: 1px solid #e8e6e0;
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  }
  .admp-table { width: 100%; border-collapse: collapse; }
  .admp-table thead tr { background: #faf9f7; }
  .admp-table th {
    padding: 12px 16px; text-align: left;
    font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
    font-weight: 700; color: #bbb; white-space: nowrap;
  }
  .admp-table th:last-child { text-align: right; }
  .admp-table td { padding: 14px 16px; vertical-align: middle; border-top: 1px solid #f5f3ef; }
  .admp-row { transition: background 0.12s; }
  .admp-row:hover td { background: #faf9f7; }
  .admp-row.selected td { background: #f0f0ff; }
  .admp-row.selected:hover td { background: #e8e8ff; }

  /* Checkbox */
  .admp-checkbox {
    width: 16px; height: 16px; border-radius: 5px;
    border: 1.5px solid #d0cdc6; cursor: pointer;
    appearance: none; background: #fff;
    display: inline-flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.12s;
    position: relative;
  }
  .admp-checkbox:checked {
    background: #7c3aed; border-color: #7c3aed;
  }
  .admp-checkbox:checked::after {
    content: ''; position: absolute;
    width: 4px; height: 7px;
    border: 1.5px solid #fff; border-top: none; border-left: none;
    transform: rotate(45deg) translate(-1px, -1px);
  }

  /* Status badges */
  .admp-status {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12px; font-weight: 600; padding: 4px 10px;
    border-radius: 20px; white-space: nowrap;
  }
  .admp-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

  /* Action buttons */
  .admp-action-btn {
    padding: 7px; border-radius: 8px;
    border: 1.5px solid #e8e6e0; background: transparent;
    cursor: pointer; transition: all 0.15s;
    display: flex; align-items: center; justify-content: center; color: #666;
  }
  .admp-action-btn:hover { border-color: #1a1a1a; background: #f5f4f0; color: #1a1a1a; }
  .admp-action-btn.danger:hover { border-color: #ef4444; background: #fef2f2; color: #ef4444; }

  /* Add button */
  .admp-add-btn {
    display: flex; align-items: center; gap: 7px;
    background: #7c3aed; color: #fff;
    padding: 10px 18px; border-radius: 10px;
    font-weight: 700; cursor: pointer; border: none;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s; box-shadow: 0 4px 12px rgba(124,58,237,0.3);
    white-space: nowrap;
  }
  .admp-add-btn:hover { background: #6d28d9; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(124,58,237,0.35); }

  /* Bulk bar */
  .admp-bulk-bar {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: #1a1a1a; color: #fff; border-radius: 14px;
    padding: 14px 20px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    z-index: 200; white-space: nowrap;
    animation: bulkIn 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes bulkIn {
    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  .admp-bulk-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 9px;
    border: 1.5px solid rgba(255,255,255,0.2); background: transparent;
    color: #fff; font-size: 12.5px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
  }
  .admp-bulk-btn:hover { background: rgba(255,255,255,0.12); }
  .admp-bulk-btn.del { border-color: #ef4444; color: #fca5a5; }
  .admp-bulk-btn.del:hover { background: rgba(239,68,68,0.15); }

  /* Grid view */
  .admp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 16px; }
  .admp-grid-card {
    background: #fff; border: 1px solid #e8e6e0;
    border-radius: 14px; overflow: hidden; cursor: pointer;
    transition: box-shadow 0.2s, transform 0.2s;
  }
  .admp-grid-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
  .admp-grid-card.selected { border-color: #7c3aed; box-shadow: 0 0 0 2px rgba(124,58,237,0.2); }

  /* Pagination */
  .admp-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px; }
  .admp-page-btn {
    padding: 8px 18px; border-radius: 9px;
    border: 1.5px solid #e8e6e0; background: #fff;
    font-size: 13px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
    color: #444;
  }
  .admp-page-btn:hover:not(:disabled) { border-color: #1a1a1a; }
  .admp-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .admp-page-info { font-size: 13px; font-weight: 600; color: #666; padding: 0 8px; }

  /* Confirm Modal */
  .admp-confirm-backdrop {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,0.45); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: fadeIn 0.2s ease;
  }
  .admp-confirm-modal {
    background: #fff; border-radius: 20px;
    padding: 28px; width: 100%; max-width: 400px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    animation: modalIn 0.25s cubic-bezier(0.16,1,0.3,1);
    position: relative;
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.92) translateY(16px) }
    to { opacity: 1; transform: scale(1) translateY(0) }
  }

  @media (max-width: 900px) { .hide-md { display: none !important; } }
  @media (max-width: 640px) {
    .admp-toolbar { flex-wrap: wrap; }
    .admp-search { max-width: 100%; width: 100%; }
    .hide-sm { display: none !important; }
    .admp-add-btn span { display: none; }
    .admp-bulk-bar { width: calc(100% - 32px); border-radius: 12px; flex-wrap: wrap; justify-content: center; }
  }
`;

function StatusBadge({ p }) {
  if (p.stock === 0)
    return <span className="admp-status" style={{ background: "#fff7ed", color: "#d97706" }}>
      <span className="admp-status-dot" style={{ background: "#f59e0b" }} />Out Stock
    </span>;
  if (p.stock <= 5)
    return <span className="admp-status" style={{ background: "#fef2f2", color: "#dc2626" }}>
      <span className="admp-status-dot" style={{ background: "#ef4444" }} />Low Stock
    </span>;
  if (!p.salePrice && !p.newArrival)
    return <span className="admp-status" style={{ background: "#f8f8f8", color: "#888" }}>
      <span className="admp-status-dot" style={{ background: "#aaa" }} />Draft
    </span>;
  return <span className="admp-status" style={{ background: "#ecfdf5", color: "#059669" }}>
    <span className="admp-status-dot" style={{ background: "#10b981" }} />Published
  </span>;
}

function ConfirmModal({ product, loading, onConfirm, onCancel }) {
  if (!product) return null;
  return (
    <div className="admp-confirm-backdrop" onClick={onCancel}>
      <div className="admp-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fef2f2", border: "1.5px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Trash2 size={20} color="#ef4444" />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Delete Product?</h3>
        <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
          "<strong>{product.name}</strong>" will be permanently removed from your catalog.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} disabled={loading} style={{ flex: 1, padding: "11px", borderRadius: 10, border: "1.5px solid #e8e6e0", background: "transparent", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1.4, padding: "11px", borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: loading ? 0.7 : 1 }}>
            {loading ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Deleting…</> : <><Trash2 size={13} />Delete</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

const TABS = ["All", "Active", "Drafts", "Archived"];

export default function AdminProductsPage() {
  const { products, loading, fetchProducts, hasMore, total, setProducts, invalidateCache, backgroundTasks } = useShop();
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const pushToast = useToasts((s) => s.push);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [tab, setTab] = useState("All");
  const [viewMode, setViewMode] = useState("table");
  const [selected, setSelected] = useState(new Set());
  const [confirmProduct, setConfirmProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isAdmin) fetchProducts({ page, limit: 20, append: false });
  }, [page, isAdmin, fetchProducts]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.slug?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCat === "All" || p.category === filterCat;
      const matchTab = tab === "All" ? true : tab === "Active" ? (p.stock > 0) : tab === "Drafts" ? (!p.salePrice && !p.newArrival) : false;
      return matchSearch && matchCat && matchTab;
    });
  }, [products, search, filterCat, tab]);

  // Select all on current page
  const allSelected = filtered.length > 0 && filtered.every((p) => selected.has(p._id));
  const someSelected = filtered.some((p) => selected.has(p._id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((p) => n.delete(p._id)); return n; });
    } else {
      setSelected((prev) => { const n = new Set(prev); filtered.forEach((p) => n.add(p._id)); return n; });
    }
  };
  const toggleOne = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const confirmDelete = async () => {
    if (!confirmProduct) return;
    setDeletingId(confirmProduct._id);
    try {
      await productApi.delete(confirmProduct._id);
      setProducts((prev) => prev.filter((p) => p._id !== confirmProduct._id));
      invalidateCache();
      pushToast({ title: "Deleted", message: "Product removed.", type: "success" });
      setConfirmProduct(null);
      setSelected((prev) => { const n = new Set(prev); n.delete(confirmProduct._id); return n; });
    } catch (error) {
      pushToast({ title: "Error", message: error.message, type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const bulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.size} product(s)?`)) return;
    for (const id of selected) {
      try {
        await productApi.delete(id);
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch { }
    }
    invalidateCache();
    setSelected(new Set());
    pushToast({ message: `${selected.size} products deleted`, type: "success" });
  };

  if (authLoading) return <div style={{ padding: "60px 0", textAlign: "center", color: "#aaa", fontSize: 14 }}>Verifying credentials…</div>;
  if (!isAdmin) return <div style={{ padding: "60px 0", textAlign: "center" }}><AlertTriangle size={28} color="#ef4444" style={{ marginBottom: 12 }} /><p style={{ fontWeight: 700 }}>Access Denied</p></div>;

  return (
    <>
      <style>{STYLES}</style>

      <ConfirmModal
        product={confirmProduct}
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => !deletingId && setConfirmProduct(null)}
      />

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="admp-bulk-bar">
          <span style={{ fontSize: 13, fontWeight: 700 }}>{selected.size} Selected</span>
          <button className="admp-bulk-btn" onClick={() => { /* export stub */ pushToast({ message: "Export coming soon", type: "success" }); }}>
            <Download size={13} /> Export
          </button>
          <button className="admp-bulk-btn" onClick={() => pushToast({ message: "Bulk edit coming soon", type: "success" })}>
            <Edit2 size={13} /> Edit Info
          </button>
          <button className="admp-bulk-btn del" onClick={bulkDelete}>
            <Trash2 size={13} /> Delete
          </button>
          <button onClick={() => setSelected(new Set())} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="admp-page">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 className="admp-heading">Products</h1>
            <p className="admp-sub">{total || products.length} products · Manage catalog, stock & visibility</p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <button className="admp-filter-btn" onClick={() => pushToast({ message: "Export coming soon", type: "success" })}>
              <Download size={14} /> <span>Export</span>
            </button>
            <button className="admp-add-btn" onClick={() => navigate("/admin/products/add")}>
              <Plus size={16} /> <span>Add product</span>
            </button>
          </div>
        </div>

        {/* Background tasks */}
        {backgroundTasks?.length > 0 && (
          <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {backgroundTasks.map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: "#fff", borderRadius: 12, border: "1px solid #e8e6e0", fontSize: 13 }}>
                {task.status === "processing"
                  ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite", color: "#888", flexShrink: 0 }} />
                  : task.status === "success"
                    ? <CheckCircle2 size={16} style={{ color: "#10b981", flexShrink: 0 }} />
                    : <AlertCircle size={16} style={{ color: "#ef4444", flexShrink: 0 }} />}
                <span style={{ fontWeight: 600 }}>{task.type === "create" ? "Adding" : "Updating"} "{task.name}"</span>
                <span style={{ color: "#aaa", marginLeft: "auto", fontSize: 12 }}>{task.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Status tabs */}
        <div className="admp-tabs">
          {TABS.map((t) => (
            <button key={t} className={`admp-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="admp-toolbar">

          <button className="admp-filter-btn" style={{ gap: 6 }}>
            <Filter size={13} /> Filter
            <ChevronDown size={12} />
          </button>

          {/* Category filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.slice(0, 5).map((cat) => (
              <button
                key={cat}
                className={`admp-filter-btn${filterCat === cat ? " active" : ""}`}
                onClick={() => setFilterCat(cat)}
                style={{ padding: "7px 12px", fontSize: 12 }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="admp-view-toggle" style={{ marginLeft: "auto" }}>
            {[["table", LayoutList], ["grid", LayoutGrid]].map(([mode, Icon]) => (
              <button key={mode} className={`admp-view-btn${viewMode === mode ? " active" : ""}`} onClick={() => setViewMode(mode)}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* ── TABLE VIEW ── */}
        {viewMode === "table" && (
          <div className="admp-table-wrap">
            <div style={{ overflowX: "auto" }}>
              <table className="admp-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        className="admp-checkbox"
                        checked={allSelected}
                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                        onChange={toggleAll}
                      />
                    </th>
                    <th>Product Name</th>
                    <th className="hide-md">ID & Create Date</th>
                    <th>Price</th>
                    <th className="hide-sm">Stock</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const isSel = selected.has(p._id);
                    return (
                      <tr key={p._id} className={`admp-row${isSel ? " selected" : ""}`}>
                        <td onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="admp-checkbox" checked={isSel} onChange={() => toggleOne(p._id)} />
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate(`/admin/products/edit/${p._id}`)}>
                            <div style={{ position: "relative", flexShrink: 0 }}>
                              <img
                                src={p.images?.[0]?.url || p.images?.[0] || ""}
                                alt={p.name}
                                style={{ width: 44, height: 54, objectFit: "cover", borderRadius: 9, display: "block", background: "#f0ede6" }}
                              />
                              {p.stock <= 5 && p.stock > 0 && (
                                <span style={{ position: "absolute", top: -4, right: -4, background: "#f59e0b", color: "#fff", fontSize: 8, padding: "1px 4px", borderRadius: 20, fontWeight: 800 }}>LOW</span>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13.5, lineHeight: 1.3 }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{p.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="hide-md">
                          <div style={{ fontFamily: "DM Mono, monospace", fontSize: 12, color: "#888", fontWeight: 500 }}>#{p._id?.slice(-7)?.toUpperCase()}</div>
                          <div style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>
                            {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>₹{p.price?.toLocaleString("en-IN")}</div>
                          {p.salePrice && <div style={{ fontSize: 11, color: "#b45309", fontWeight: 600, marginTop: 2 }}>Sell Price ₹{p.salePrice?.toLocaleString("en-IN")}</div>}
                        </td>
                        <td className="hide-sm">
                          <span style={{ fontWeight: 700, fontSize: 13, color: p.stock <= 5 ? "#ef4444" : "#1a1a1a" }}>{p.stock?.toLocaleString() ?? "—"}</span>
                          {p.stock > 0 && <span style={{ fontSize: 11, color: "#bbb", marginLeft: 3 }}>units</span>}
                        </td>
                        <td><StatusBadge p={p} /></td>
                        <td>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                            <button className="admp-action-btn" onClick={() => navigate(`/admin/products/edit/${p._id}`)} title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button className="admp-action-btn danger" onClick={() => setConfirmProduct(p)} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "60px", textAlign: "center", color: "#bbb" }}>
                        <Package size={32} style={{ margin: "0 auto 10px", opacity: 0.3, display: "block" }} />
                        <div style={{ fontSize: 14 }}>No products found</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (
          <div className="admp-grid">
            {filtered.map((p) => {
              const isSel = selected.has(p._id);
              return (
                <div key={p._id} className={`admp-grid-card${isSel ? " selected" : ""}`}>
                  <div style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden" }}>
                    <img src={p.images?.[0]?.url || p.images?.[0] || ""} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", top: 8, left: 8 }}>
                      <input type="checkbox" className="admp-checkbox" checked={isSel} onChange={() => toggleOne(p._id)} onClick={(e) => e.stopPropagation()} />
                    </div>
                    {p.salePrice && <span style={{ position: "absolute", top: 8, right: 8, background: "#7c3aed", color: "#fff", fontSize: 9, padding: "3px 7px", borderRadius: 20, fontWeight: 800 }}>SALE</span>}
                    {p.stock === 0 && <span style={{ position: "absolute", bottom: 8, left: 8, background: "#ef4444", color: "#fff", fontSize: 9, padding: "3px 7px", borderRadius: 20, fontWeight: 800 }}>OUT OF STOCK</span>}
                  </div>
                  <div style={{ padding: "12px 12px 14px" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#bbb", marginBottom: 8 }}>{p.category}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: 14 }}>₹{p.price?.toLocaleString("en-IN")}</span>
                        {p.salePrice && <div style={{ fontSize: 10, color: "#b45309", fontWeight: 600 }}>₹{p.salePrice?.toLocaleString("en-IN")}</div>}
                      </div>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button className="admp-action-btn" onClick={() => navigate(`/admin/products/edit/${p._id}`)} title="Edit"><Edit2 size={13} /></button>
                        <button className="admp-action-btn danger" onClick={() => setConfirmProduct(p)} title="Delete"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        <div className="admp-pagination">
          <button className="admp-page-btn" disabled={page === 1 || loading} onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0 }); }}>Previous</button>
          <span className="admp-page-info">Page {page}</span>
          <button className="admp-page-btn" disabled={!hasMore || loading} onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0 }); }}>Next</button>
        </div>

        {filtered.length > 0 && (
          <div style={{ textAlign: "center", fontSize: 12, color: "#bbb", marginTop: 8 }}>
            Showing {filtered.length} of {total || products.length} products
          </div>
        )}
      </div>
    </>
  );
}