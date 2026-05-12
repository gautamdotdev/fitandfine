import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "..//../context/ShopContext";
import { orderApi } from "..//../lib/api";
import { useToasts } from "..//../lib/store";
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
  ChevronLeft,
  ChevronRight,
  MapPin,
  Check,
  SlidersHorizontal,
} from "lucide-react";

/* ── Status Config ── */
const S = {
  pending: {
    label: "Pending",
    hex: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    hex: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    hex: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    icon: Settings2,
  },
  shipped: {
    label: "Shipped",
    hex: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    hex: "#059669",
    bg: "#ecfdf5",
    border: "#a7f3d0",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    hex: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    icon: XCircle,
  },
};
const ALL = Object.keys(S);

/* ── Styles ── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .ao {
    font-family: 'DM Sans', system-ui, sans-serif;
  }

  .ao-wrap {
    max-width: 1400px;
    margin: 0 auto;
    padding: 12px 0 48px;
  }

  /* Header */
  .ao-hd {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }

  .ao-hd-eye {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-muted-foreground);
    margin-bottom: 6px;
  }

  .ao-hd-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: clamp(1.8rem, 3.5vw, 2.8rem);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--color-foreground);
  }

  .ao-hd-sub {
    margin-top: 8px;
    font-size: 13px;
    color: var(--color-muted-foreground);
    font-weight: 500;
  }

  .ao-refresh {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    border-radius: 12px;
    border: 1.5px solid var(--color-border);
    background: var(--color-background);
    color: var(--color-foreground);
    font-size: 13px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .ao-refresh:hover {
    background: var(--color-surface);
    border-color: var(--color-foreground);
  }

  .ao-refresh:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Stats */
  .ao-stats {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
    margin-bottom: 28px;
  }

  .ao-stat {
    background: var(--color-background);
    border: 1.5px solid var(--color-border);
    border-radius: 14px;
    padding: 16px 12px 12px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    position: relative;
    overflow: hidden;
    user-select: none;
  }

  .ao-stat::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2.5px;
    background: var(--s-color, transparent);
    border-radius: 2px 2px 0 0;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .ao-stat:hover {
    border-color: var(--s-color, var(--color-border));
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.07);
  }

  .ao-stat.on {
    border-color: var(--s-color, var(--color-border));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--s-color) 12%, transparent);
  }

  .ao-stat.on::after {
    opacity: 1;
  }

  .ao-stat-n {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
    color: var(--s-color, var(--color-foreground));
    margin-bottom: 4px;
  }

  .ao-stat-l {
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-muted-foreground);
  }

  /* Toolbar */
  .ao-bar {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .ao-search {
    flex: 1;
    min-width: 260px;
    position: relative;
  }

  .ao-search input {
    width: 100%;
    padding: 11px 16px 11px 42px;
    border: 1.5px solid var(--color-border);
    border-radius: 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    background: var(--color-background);
    color: var(--color-foreground);
    outline: none;
    transition: border-color 0.2s;
    box-sizing: border-box;
  }

  .ao-search input:focus {
    border-color: var(--color-foreground);
  }

  .ao-search-ic {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-muted-foreground);
    pointer-events: none;
  }

  /* Table */
  .ao-tbl-wrap {
    border: 1.5px solid var(--color-border);
    border-radius: 20px;
    overflow: hidden;
    background: var(--color-background);
    box-shadow: 0 4px 24px rgba(0,0,0,0.05);
  }

  /* Mobile cards */
  .ao-cards {
    display: none;
    flex-direction: column;
    gap: 12px;
  }

  .ao-mc {
    background: var(--color-background);
    border: 1.5px solid var(--color-border);
    border-radius: 18px;
    overflow: hidden;
    border-top: 3px solid var(--s-color, var(--color-border));
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }

  .ao-mc-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    gap: 10px;
    flex-wrap: wrap;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-surface);
  }

  .ao-mc-body {
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ao-mc-foot {
    padding: 0 16px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Animations */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spin {
    animation: spin 0.75s linear infinite;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .anim {
    animation: fadeUp 0.25s ease both;
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .ao-stats {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 900px) {
    .ao-tbl-wrap {
      display: none;
    }

    .ao-cards {
      display: flex;
    }

    .ao-stats {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (max-width: 640px) {
    .ao-wrap {
      padding: 0 0 48px;
    }

    .ao-hd {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
    }

    .ao-hd-sub {
      margin: 0;
      font-size: 13px;
      line-height: 1.4;
      flex: 1;
    }

    .ao-refresh {
      padding: 9px 13px;
      font-size: 12px;
      border-radius: 10px;
    }

    .ao-stats {
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .ao-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .ao-search,
    .ao-dd {
      min-width: 0;
      width: 100%;
    }

    .ao-dd-trigger {
      width: 100%;
    }

    .ao-dd-menu {
      left: 0;
      right: 0;
    }

    .ao-mc {
      border-radius: 16px;
    }

    .ao-mc-head,
    .ao-mc-body,
    .ao-mc-foot {
      padding-left: 14px;
      padding-right: 14px;
    }
  }

  @media (max-width: 400px) {
    .ao-stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }
`;

/* ══════════ Custom Dropdown (toolbar) ══════════ */
function FilterDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = value ? S[value] : null;

  return (
    <div className="ao-dd" ref={ref}>
      <div
        className={`ao-dd-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ao-dd-trigger-left">
          <SlidersHorizontal
            size={14}
            style={{ color: "var(--color-muted-foreground)", flexShrink: 0 }}
          />
          {current ? (
            <>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: current.hex,
                  flexShrink: 0,
                  display: "inline-block",
                }}
              />
              <span>{current.label}</span>
            </>
          ) : (
            <span
              style={{
                color: "var(--color-muted-foreground)",
                fontWeight: 500,
              }}
            >
              All Statuses
            </span>
          )}
        </span>
        <ChevronDown
          size={14}
          style={{
            color: "var(--color-muted-foreground)",
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </div>

      {open && (
        <div className="ao-dd-menu">
          <div
            className={`ao-dd-item ${!value ? "active" : ""}`}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-border)",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span>All Statuses</span>
            {!value && (
              <Check
                size={13}
                className="ao-dd-item-check"
                style={{ color: "var(--color-foreground)" }}
              />
            )}
          </div>
          <div className="ao-dd-sep" />
          {ALL.map((s) => (
            <div
              key={s}
              className={`ao-dd-item ${value === s ? "active" : ""}`}
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
            >
              <span
                className="ao-dd-item-dot"
                style={{ background: S[s].hex }}
              />
              <span>{S[s].label}</span>
              {value === s && (
                <Check
                  size={13}
                  className="ao-dd-item-check"
                  style={{ color: S[s].hex }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════ Row Status Dropdown ══════════ */
function RowStatusDropdown({ order, onUpdate }) {
  const [val, setVal] = useState(order.status);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const ref = useRef(null);
  const push = useToasts((s) => s.push);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = async (next) => {
    setOpen(false);
    if (next === val) return;
    setSaving(true);
    const prev = val;
    setVal(next);
    try {
      const data = await orderApi.updateStatus(order._id, next);
      onUpdate(data.order);
      push({
        title: "Status updated",
        message: `Order → ${next}`,
        type: "success",
      });
    } catch (err) {
      setVal(prev);
      push({ title: "Error", message: err.message, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const cfg = S[val] || S.pending;

  return (
    <div className="ao-row-dd" ref={ref}>
      <div
        className={`ao-row-trigger ${open ? "open" : ""}`}
        onClick={() => !saving && setOpen((v) => !v)}
        style={{ color: cfg.hex, opacity: saving ? 0.7 : 1 }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {saving ? (
            <Loader2 size={12} className="spin" />
          ) : (
            <span className="ao-row-dot" style={{ background: cfg.hex }} />
          )}
          {cfg.label}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: "var(--color-muted-foreground)",
            transition: "transform 0.15s",
            transform: open ? "rotate(180deg)" : "none",
            flexShrink: 0,
          }}
        />
      </div>
      {open && (
        <div className="ao-row-menu">
          {ALL.map((s) => (
            <div key={s} className="ao-row-item" onClick={() => select(s)}>
              <span className="ao-row-dot" style={{ background: S[s].hex }} />
              <span style={{ color: S[s].hex }}>{S[s].label}</span>
              {val === s && (
                <Check
                  size={12}
                  style={{ marginLeft: "auto", color: S[s].hex }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════ Badge ══════════ */
function Badge({ status }) {
  const cfg = S[status] || S.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="ao-badge"
      style={{ color: cfg.hex, background: cfg.bg, borderColor: cfg.border }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

/* ══════════ Items Panel ══════════ */
function ItemsPanel({ order }) {
  return (
    <div className="ao-panel">
      <div className="ao-panel-ttl">
        {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} in this
        order
      </div>
      <div className="ao-items">
        {order.items?.map((item, i) => {
          const p = item.product;
          const raw = p?.images?.[0];
          const src = typeof raw === "string" ? raw : raw?.url;
          return (
            <div key={i} className="ao-item">
              {src ? (
                <img src={src} alt={p?.name} className="ao-img" />
              ) : (
                <div className="ao-img-ph">
                  <ShoppingBag size={14} style={{ opacity: 0.3 }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ao-iname">{p?.name || "Product"}</div>
                <div className="ao-isub">
                  Qty {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}{" "}
                  each
                </div>
              </div>
              <div className="ao-itotal">
                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
              </div>
            </div>
          );
        })}
      </div>
      {order.address && (
        <div className="ao-addr">
          <MapPin size={12} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            <strong>Delivery — </strong>
            {order.address}
          </span>
        </div>
      )}
    </div>
  );
}

/* ══════════ Desktop Row ══════════ */
function OrderRow({ order, onUpdate }) {
  const [open, setOpen] = useState(false);
  const cfg = S[order.status] || S.pending;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="ao-tr">
      <td style={{ padding: 0 }}>
        <div className="ao-tr-inner" style={{ "--s-color": cfg.hex }}>
          <div className="ao-td">
            <span className="ao-oid">#{order._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="ao-td" style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {order.user?.name || "—"}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--color-muted-foreground)",
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {order.user?.email}
            </div>
          </div>
          <div
            className="ao-td ao-hide-date"
            style={{
              fontSize: 12,
              color: "var(--color-muted-foreground)",
              fontWeight: 500,
            }}
          >
            {date}
          </div>
          <div className="ao-td">
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
            >
              ₹{order.total?.toLocaleString("en-IN")}
            </span>
          </div>
          <div
            className="ao-td"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <RowStatusDropdown order={order} onUpdate={onUpdate} />
          </div>
          <div className="ao-td" style={{ paddingLeft: 0 }}>
            <button className="ao-tog" onClick={() => setOpen((v) => !v)}>
              {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>
        {open && <ItemsPanel order={order} />}
      </td>
    </tr>
  );
}

/* ══════════ Mobile Card ══════════ */
function MobileCard({ order, onUpdate }) {
  const [open, setOpen] = useState(false);
  const cfg = S[order.status] || S.pending;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="ao-mc anim" style={{ "--s-color": cfg.hex }}>
      <div className="ao-mc-head">
        <span className="ao-oid">#{order._id.slice(-8).toUpperCase()}</span>
        <Badge status={order.status} />
      </div>
      <div className="ao-mc-body">
        <div className="ao-mc-row">
          <span className="ao-mc-lbl">Customer</span>
          <span
            className="ao-mc-val"
            style={{
              maxWidth: "58%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {order.user?.name || "—"}
          </span>
        </div>
        <div className="ao-mc-row">
          <span className="ao-mc-lbl">Date</span>
          <span className="ao-mc-val">{date}</span>
        </div>
        <div className="ao-mc-row">
          <span className="ao-mc-lbl">Total</span>
          <span
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            ₹{order.total?.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
      <div className="ao-mc-foot">
        <RowStatusDropdown order={order} onUpdate={onUpdate} />
        <button className="ao-mc-det-btn" onClick={() => setOpen((v) => !v)}>
          {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {open ? "Hide" : "View"} items
        </button>
        {open && <ItemsPanel order={order} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function AdminOrdersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/");
  }, [isAdmin, authLoading, navigate]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderApi.getAllOrders({
        status: filterStatus,
        page,
        limit: 15,
      });
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
  useEffect(() => {
    setPage(1);
  }, [filterStatus]);

  const handleUpdate = (u) =>
    setOrders((prev) => prev.map((o) => (o._id === u._id ? u : o)));

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q)
    );
  });

  const byStatus = orders.reduce((a, o) => {
    a[o.status] = (a[o.status] || 0) + 1;
    return a;
  }, {});

  if (authLoading || !isAdmin) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="ao">
        <div className="ao-wrap">
          {/* ── Header ── */}
          <div className="ao-hd">
            <p className="ao-hd-sub">
              {total} total order{total !== 1 ? "s" : ""}
              {filterStatus ? ` · Filtered by ${S[filterStatus]?.label}` : ""}
            </p>

            <button
              className="ao-refresh"
              onClick={fetchOrders}
              disabled={loading}
            >
              <RefreshCw size={13} className={loading ? "spin" : ""} />
              Refresh
            </button>
          </div>

          {/* ── Toolbar ── */}
          <div className="ao-bar">
            <div className="ao-search">
              <Search size={14} className="ao-search-ic" />
              <input
                type="text"
                placeholder="Search order ID, name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <FilterDropdown value={filterStatus} onChange={setFilterStatus} />
          </div>

          {/* ── Content ── */}
          {loading ? (
            <div className="ao-loading">
              <Loader2 size={28} className="spin" style={{ opacity: 0.25 }} />
            </div>
          ) : error ? (
            <div className="ao-empty" style={{ color: "#dc2626" }}>
              <AlertCircle size={36} />
              <div className="ao-empty-title">{error}</div>
              <button
                className="ao-refresh"
                onClick={fetchOrders}
                style={{ marginTop: 4 }}
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="ao-empty">
              <Package size={44} style={{ opacity: 0.15 }} />
              <div className="ao-empty-title">No orders found</div>
              <div className="ao-empty-sub">
                {search
                  ? "Try a different query."
                  : "Orders will appear here once placed."}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="ao-tbl-wrap">
                <table className="ao-tbl">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th className="ao-hide-date">Date</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <OrderRow key={o._id} order={o} onUpdate={handleUpdate} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="ao-cards">
                {filtered.map((o, i) => (
                  <div key={o._id} style={{ animationDelay: `${i * 35}ms` }}>
                    <MobileCard order={o} onUpdate={handleUpdate} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && !loading && (
            <div className="ao-pag">
              <span className="ao-pag-info">
                Page {page} of {totalPages} · {total} orders
              </span>
              <div className="ao-pag-btns">
                <button
                  className="ao-pgbtn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <button
                  className="ao-pgbtn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
