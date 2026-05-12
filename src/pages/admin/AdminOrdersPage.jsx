import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/ShopContext";
import { orderApi } from "../../lib/api";
import { useToasts } from "../../lib/store";
import {
    Package,
    Search,
    ChevronDown,
    ChevronUp,
    Loader2,
    ShoppingBag,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    Settings2,
    AlertCircle,
    RefreshCw,
    Filter,
    User,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

/* ── Status config ── */
const STATUS_CFG = {
    pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: Clock },
    confirmed: { label: "Confirmed", color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: CheckCircle2 },
    processing: { label: "Processing", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: Settings2 },
    shipped: { label: "Shipped", color: "#06b6d4", bg: "rgba(6,182,212,0.12)", icon: Truck },
    delivered: { label: "Delivered", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle2 },
    cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: XCircle },
};

const ALL_STATUSES = Object.keys(STATUS_CFG);

const STYLES = `
  .ao-wrap { max-width: 1400px; margin: 0 auto; padding: 12px 0 48px; }
  .ao-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; gap: 16px; flex-wrap: wrap; }
  .ao-title { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; color: var(--color-foreground); }
  .ao-subtitle { font-size: 14px; color: var(--color-muted-foreground); margin-top: 4px; }
  .ao-stats { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 32px; }
  .ao-stat { border: 1px solid var(--color-border); border-radius: 16px; padding: 14px 16px; background: var(--color-background); text-align: center; cursor: pointer; transition: all 0.2s; }
  .ao-stat.active { border-color: currentColor; box-shadow: 0 0 0 2px currentColor; }
  .ao-stat:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
  .ao-stat-count { font-size: 22px; font-weight: 800; }
  .ao-stat-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-muted-foreground); margin-top: 2px; }
  .ao-toolbar { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; }
  .ao-search { flex: 1; min-width: 220px; position: relative; }
  .ao-search input { width: 100%; padding: 10px 16px 10px 40px; border: 1.5px solid var(--color-border); border-radius: 12px; font-size: 14px; background: var(--color-background); color: var(--color-foreground); outline: none; transition: border-color 0.2s; box-sizing: border-box; }
  .ao-search input:focus { border-color: var(--color-foreground); }
  .ao-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--color-muted-foreground); pointer-events: none; }
  .ao-select { padding: 10px 14px; border: 1.5px solid var(--color-border); border-radius: 12px; font-size: 13px; background: var(--color-background); color: var(--color-foreground); cursor: pointer; outline: none; }
  .ao-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.18s; border: none; }
  .ao-btn-ghost { background: transparent; border: 1.5px solid var(--color-border); color: var(--color-foreground); }
  .ao-btn-ghost:hover { background: var(--color-surface); }
  .ao-table-wrap { border-radius: 20px; overflow-x: auto; border: 1px solid var(--color-border); box-shadow: 0 4px 32px rgba(0,0,0,0.05); background: var(--color-background); }
  .ao-table { width: 100%; border-collapse: collapse; }
  .ao-table thead tr { background: var(--color-surface); }
  .ao-table th { padding: 14px 20px; text-align: left; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; color: var(--color-muted-foreground); white-space: nowrap; }
  .ao-table th:last-child { text-align: right; }
  .ao-row { border-top: 1px solid var(--color-border); transition: background 0.15s; }
  .ao-row:hover { background: var(--color-surface); }
  .ao-row td { padding: 16px 20px; vertical-align: middle; }
  .ao-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
  .ao-expand-row td { padding: 0; background: var(--color-surface); }
  .ao-expand-body { padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .ao-item { display: flex; align-items: center; gap: 12px; }
  .ao-item-img { width: 52px; height: 60px; border-radius: 8px; object-fit: cover; background: var(--color-border); flex-shrink: 0; }
  .ao-item-img-fallback { width: 52px; height: 60px; border-radius: 8px; background: var(--color-border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ao-item-name { font-size: 13px; font-weight: 600; color: var(--color-foreground); }
  .ao-item-sub { font-size: 12px; color: var(--color-muted-foreground); }
  .ao-status-select { padding: 7px 12px; border-radius: 10px; border: 1.5px solid var(--color-border); font-size: 12px; font-weight: 600; background: var(--color-background); color: var(--color-foreground); cursor: pointer; outline: none; transition: border-color 0.2s; min-width: 130px; }
  .ao-status-select:focus { border-color: var(--color-foreground); }
  .ao-pagination { display: flex; align-items: center; justify-content: space-between; margin-top: 24px; gap: 12px; flex-wrap: wrap; }
  .ao-page-info { font-size: 13px; color: var(--color-muted-foreground); }
  .ao-page-btns { display: flex; gap: 8px; }
  .ao-page-btn { padding: 8px 14px; border-radius: 10px; border: 1.5px solid var(--color-border); background: var(--color-background); color: var(--color-foreground); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 6px; }
  .ao-page-btn:disabled { opacity: 0.4; cursor: default; }
  .ao-page-btn:not(:disabled):hover { background: var(--color-surface); }
  .spin { animation: ao-spin 1s linear infinite; }
  @keyframes ao-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @media (max-width: 1024px) { .ao-stats { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 640px) {
    .ao-wrap { padding: 24px 16px; }
    .ao-stats { grid-template-columns: repeat(2, 1fr); }
    .ao-title { font-size: 22px; }
    .hide-sm { display: none !important; }
  }
`;

/* ── Status Badge ── */
function Badge({ status }) {
    const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
    const Icon = cfg.icon;
    return (
        <span className="ao-badge" style={{ color: cfg.color, background: cfg.bg }}>
            <Icon size={11} />
            {cfg.label}
        </span>
    );
}

/* ── Inline Status Updater ── */
function StatusUpdater({ order, onUpdate }) {
    const [val, setVal] = useState(order.status);
    const [saving, setSaving] = useState(false);
    const push = useToasts((s) => s.push);

    const handleChange = async (e) => {
        const newStatus = e.target.value;
        setVal(newStatus);
        setSaving(true);
        try {
            const data = await orderApi.updateStatus(order._id, newStatus);
            onUpdate(data.order);
            push({ title: "Updated", message: `Order marked as ${newStatus}`, type: "success" });
        } catch (err) {
            setVal(order.status);
            push({ title: "Error", message: err.message, type: "error" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
                className="ao-status-select"
                value={val}
                onChange={handleChange}
                disabled={saving}
                style={{ color: STATUS_CFG[val]?.color }}
            >
                {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                        {STATUS_CFG[s].label}
                    </option>
                ))}
            </select>
            {saving && <Loader2 size={14} className="spin" style={{ opacity: 0.5 }} />}
        </div>
    );
}

/* ── Order Row ── */
function OrderRow({ order, onUpdate }) {
    const [open, setOpen] = useState(false);
    const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });

    return (
        <>
            <tr className="ao-row">
                <td>
                    <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "monospace" }}>
                        #{order._id.slice(-8).toUpperCase()}
                    </span>
                </td>
                <td className="hide-sm">
                    <div style={{ fontSize: 13 }}>
                        <div style={{ fontWeight: 600 }}>{order.user?.name || "—"}</div>
                        <div style={{ color: "var(--color-muted-foreground)", fontSize: 11 }}>{order.user?.email}</div>
                    </div>
                </td>
                <td className="hide-sm">
                    <span style={{ fontSize: 13, color: "var(--color-muted-foreground)" }}>{date}</span>
                </td>
                <td>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>
                        ₹{order.total?.toLocaleString("en-IN")}
                    </span>
                </td>
                <td>
                    <Badge status={order.status} />
                </td>
                <td>
                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                        <StatusUpdater order={order} onUpdate={onUpdate} />
                        <button
                            onClick={() => setOpen((v) => !v)}
                            style={{
                                background: "none", border: "1.5px solid var(--color-border)",
                                borderRadius: 8, padding: "6px 8px", cursor: "pointer",
                                color: "var(--color-muted-foreground)", display: "flex", alignItems: "center",
                            }}
                        >
                            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                    </div>
                </td>
            </tr>

            {open && (
                <tr className="ao-expand-row">
                    <td colSpan={6}>
                        <div className="ao-expand-body">
                            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-muted-foreground)", marginBottom: 4 }}>
                                Order Items
                            </div>
                            {order.items.map((item, i) => {
                                const product = item.product;
                                const img = product?.images?.[0];
                                return (
                                    <div key={i} className="ao-item">
                                        {img ? (
                                            <img src={img} alt={product?.name} className="ao-item-img" />
                                        ) : (
                                            <div className="ao-item-img-fallback">
                                                <ShoppingBag size={18} style={{ opacity: 0.35 }} />
                                            </div>
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <div className="ao-item-name">{product?.name || "Product"}</div>
                                            <div className="ao-item-sub">
                                                Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")} each
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: 13 }}>
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                        </div>
                                    </div>
                                );
                            })}
                            {order.address && (
                                <div style={{ fontSize: 12, color: "var(--color-muted-foreground)", marginTop: 8, paddingTop: 12, borderTop: "1px solid var(--color-border)" }}>
                                    <span style={{ fontWeight: 600, color: "var(--color-foreground)" }}>Delivery: </span>
                                    {order.address}
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

/* ── Main Page ── */
export default function AdminOrdersPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const push = useToasts((s) => s.push);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Guard: admin only
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            navigate("/");
        }
    }, [isAdmin, authLoading, navigate]);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await orderApi.getAllOrders({ status: filterStatus, page, limit: 15 });
            setOrders(data.orders);
            setTotal(data.total);
            setTotalPages(data.pages);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, page]);

    useEffect(() => {
        if (isAdmin) fetchOrders();
    }, [fetchOrders, isAdmin]);

    // Reset page when filter changes
    useEffect(() => { setPage(1); }, [filterStatus]);

    const handleUpdate = (updatedOrder) => {
        setOrders((prev) =>
            prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
    };

    // Client-side search filter
    const filtered = orders.filter((o) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            o._id.toLowerCase().includes(q) ||
            o.user?.name?.toLowerCase().includes(q) ||
            o.user?.email?.toLowerCase().includes(q)
        );
    });

    // Status counts from current fetch
    const countByStatus = orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
    }, {});

    if (authLoading) return null;
    if (!isAdmin) return null;

    return (
        <>
            <style>{STYLES}</style>
            <div className="ao-wrap">
                {/* Header */}
                <div className="ao-header">
                    <div>
                        <h1 className="ao-title">Order Management</h1>
                        <p className="ao-subtitle">
                            {total} total order{total !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        className="ao-btn ao-btn-ghost"
                        onClick={fetchOrders}
                        disabled={loading}
                    >
                        <RefreshCw size={14} className={loading ? "spin" : ""} />
                        Refresh
                    </button>
                </div>

                {/* Status Stat Pills */}
                <div className="ao-stats">
                    <div
                        className={`ao-stat ${filterStatus === "" ? "active" : ""}`}
                        style={{ color: "var(--color-foreground)" }}
                        onClick={() => setFilterStatus("")}
                    >
                        <div className="ao-stat-count">{total}</div>
                        <div className="ao-stat-label">All</div>
                    </div>
                    {ALL_STATUSES.map((s) => {
                        const cfg = STATUS_CFG[s];
                        return (
                            <div
                                key={s}
                                className={`ao-stat ${filterStatus === s ? "active" : ""}`}
                                style={{ color: cfg.color }}
                                onClick={() => setFilterStatus(s)}
                            >
                                <div className="ao-stat-count" style={{ color: cfg.color }}>
                                    {countByStatus[s] || 0}
                                </div>
                                <div className="ao-stat-label">{cfg.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Toolbar */}
                <div className="ao-toolbar">
                    <div className="ao-search">
                        <Search size={15} className="ao-search-icon" />
                        <input
                            type="text"
                            placeholder="Search by order ID, name or email…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="ao-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
                        <Loader2 size={36} className="spin" style={{ opacity: 0.35 }} />
                    </div>
                ) : error ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "64px 0", color: "#ef4444" }}>
                        <AlertCircle size={36} />
                        <p style={{ fontSize: 14 }}>{error}</p>
                        <button className="ao-btn ao-btn-ghost" onClick={fetchOrders}>Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "80px 0" }}>
                        <Package size={48} style={{ opacity: 0.2, margin: "0 auto 16px" }} />
                        <p style={{ fontWeight: 600, fontSize: 16 }}>No orders found</p>
                        <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", marginTop: 6 }}>
                            {search ? "Try a different search query." : "Orders will appear here once placed."}
                        </p>
                    </div>
                ) : (
                    <div className="ao-table-wrap">
                        <table className="ao-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th className="hide-sm">Customer</th>
                                    <th className="hide-sm">Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}>Update / Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((order) => (
                                    <OrderRow
                                        key={order._id}
                                        order={order}
                                        onUpdate={handleUpdate}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !loading && (
                    <div className="ao-pagination">
                        <span className="ao-page-info">
                            Page {page} of {totalPages}
                        </span>
                        <div className="ao-page-btns">
                            <button
                                className="ao-page-btn"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <button
                                className="ao-page-btn"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}