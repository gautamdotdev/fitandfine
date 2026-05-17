import { useState, useEffect } from "react";
import { orderApi } from "../lib/api";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Settings2,
  Copy,
} from "lucide-react";

/* ── Status config ── */
const STATUS = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.12)",
    icon: Settings2,
  },
  shipped: {
    label: "Shipped",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    icon: XCircle,
  },
};

const STYLES = `
  .uo-wrap { display: flex; flex-direction: column; gap: 16px; }
  .uo-empty { text-align: center; padding: 64px 24px; }
  .uo-card { border: 1px solid var(--color-border); border-radius: 2px; overflow: hidden; background: var(--color-background); transition: box-shadow 0.2s; }
  .uo-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.07); }
  .uo-card-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; gap: 12px; cursor: pointer; user-select: none; flex-wrap: wrap; }
    .uo-card-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .uo-order-id { font-size: 13px; font-weight: 700; letter-spacing: 0.04em; color: var(--color-foreground); }
    .uo-copy-btn { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 999px; border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-muted-foreground); font-size: 10px; font-weight: 700; letter-spacing: 0.04em; cursor: pointer; transition: all 0.15s; }
    .uo-copy-btn:hover { color: var(--color-foreground); border-color: var(--color-gold); background: color-mix(in oklch, var(--color-gold) 10%, var(--color-surface)); }
  .uo-date { font-size: 12px; color: var(--color-muted-foreground); }
  .uo-total { font-size: 14px; font-weight: 700; color: var(--color-foreground); }
  .uo-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 20px; white-space: nowrap; }
  .uo-card-body { border-top: 1px solid var(--color-border); padding: 20px 22px; display: flex; flex-direction: column; gap: 14px; }
  .uo-item { display: flex; align-items: center; gap: 14px; }
  .uo-item-img { width: 64px; height: 72px; border-radius: 10px; object-fit: cover; background: var(--color-surface); flex-shrink: 0; }
  .uo-item-img-fallback { width: 64px; height: 72px; border-radius: 10px; background: var(--color-surface); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .uo-item-info { flex: 1; min-width: 0; }
  .uo-item-name { font-size: 14px; font-weight: 600; color: var(--color-foreground); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .uo-item-sub { font-size: 12px; color: var(--color-muted-foreground); }
  .uo-item-price { font-size: 14px; font-weight: 700; color: var(--color-foreground); flex-shrink: 0; }
  .uo-progress { display: flex; align-items: center; gap: 0; margin-top: 4px; }
  .uo-progress-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
  .uo-progress-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--color-border); border: 2px solid var(--color-border); transition: all 0.3s; }
  .uo-progress-dot.active { background: #10b981; border-color: #10b981; }
  .uo-progress-dot.current { background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.25); width: 12px; height: 12px; }
  .uo-progress-line { position: absolute; top: 5px; left: 50%; right: -50%; height: 2px; background: var(--color-border); z-index: 0; }
  .uo-progress-line.done { background: #10b981; }
  .uo-progress-label { font-size: 9px; color: var(--color-muted-foreground); margin-top: 5px; text-align: center; letter-spacing: 0.04em; }
  .uo-progress-label.active { color: var(--color-foreground); font-weight: 600; }
  .uo-chevron-btn { background: none; border: none; cursor: pointer; color: var(--color-muted-foreground); display: flex; align-items: center; padding: 4px; border-radius: 8px; transition: background 0.15s; }
  .uo-chevron-btn:hover { background: var(--color-surface); }
  @media (max-width: 480px) {
    .uo-card-header { padding: 14px 16px; }
    .uo-card-body { padding: 16px; }
    .uo-item-img, .uo-item-img-fallback { width: 52px; height: 60px; }
  }
`;

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

function OrderProgress({ status }) {
  if (status === "cancelled") return null;
  const currentIdx = STEPS.indexOf(status);
  return (
    <div className="uo-progress">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const current = i === currentIdx;
        const cfg = STATUS[step];
        return (
          <div key={step} className="uo-progress-step">
            {i < STEPS.length - 1 && (
              <div className={`uo-progress-line ${done ? "done" : ""}`} />
            )}
            <div
              className={`uo-progress-dot ${done ? "active" : ""} ${current ? "current" : ""}`}
            />
            <span
              className={`uo-progress-label ${done || current ? "active" : ""}`}
            >
              {cfg.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const cfg = STATUS[order.status] || STATUS.pending;
  const StatusIcon = cfg.icon;
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const displayOrderId = order.orderId || order._id.slice(-8).toUpperCase();
  const coupon =
    order.couponDetails ||
    (typeof order.coupon === "object" ? order.coupon : null) ||
    (typeof order.coupon === "string"
      ? { code: order.coupon, discount: order.discount }
      : null);

  const handleCopyOrderId = async (event) => {
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(displayOrderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="uo-card">
      <div className="uo-card-header" onClick={() => setOpen((v) => !v)}>
        <div className="uo-card-meta">
          <span className="uo-order-id">#{displayOrderId}</span>
          <button
            type="button"
            className="uo-copy-btn"
            onClick={handleCopyOrderId}
            aria-label={`Copy order ID ${displayOrderId}`}
            title="Copy order ID"
          >
            <Copy size={11} />
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="uo-date">{date}</span>
          <span
            className="uo-badge"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            <StatusIcon size={11} />
            {cfg.label}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="uo-total">
            ₹{order.total?.toLocaleString("en-IN")}
          </span>
          <button className="uo-chevron-btn">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="uo-card-body">
          {/* Progress tracker */}
          <OrderProgress status={order.status} />

          {/* Items */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 8,
            }}
          >
            {order.items.map((item, i) => {
              const product = item.product;
              const img =
                product?.images?.[0]?.url ||
                product?.images?.[0] ||
                (typeof product === "string" ? null : null);
              return (
                <div key={i} className="uo-item">
                  {img ? (
                    <img
                      src={img}
                      alt={product?.name || "Product"}
                      className="uo-item-img"
                    />
                  ) : (
                    <div className="uo-item-img-fallback">
                      <ShoppingBag
                        size={22}
                        style={{ color: "var(--color-muted-foreground)" }}
                      />
                    </div>
                  )}
                  <div className="uo-item-info">
                    <div className="uo-item-name">
                      {product?.name || "Product"}
                    </div>
                    <div className="uo-item-sub">
                      Qty: {item.quantity || item.qty || 1}
                      {item.size ? ` · Size: ${item.size}` : ""}
                      {item.color ? ` · Color: ${item.color}` : ""}
                    </div>
                  </div>
                  <div className="uo-item-price">
                    ₹
                    {(
                      (item.price || product?.price || 0) *
                      (item.quantity || item.qty || 1)
                    ).toLocaleString("en-IN")}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: 12,
              display: "grid",
              gap: 6,
              fontSize: 13,
            }}
          >
            {coupon?.code && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-muted-foreground)" }}>
                  Coupon {coupon.code}
                </span>
                <strong>
                  -₹{(order.discount || coupon.discount || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--color-muted-foreground)" }}>
                Order total
              </span>
              <strong>₹{order.total?.toLocaleString("en-IN")}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */
export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    orderApi
      .getMyOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{STYLES}</style>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "64px 0",
          }}
        >
          <Loader2 size={32} className="spin" style={{ opacity: 0.4 }} />
        </div>
      ) : error ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "48px 0",
            color: "#ef4444",
          }}
        >
          <AlertCircle size={32} />
          <p style={{ fontSize: 14 }}>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="uo-empty">
          <Package size={48} style={{ opacity: 0.25, marginBottom: 16 }} />
          <p
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: "var(--color-foreground)",
            }}
          >
            No orders yet
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--color-muted-foreground)",
              marginTop: 6,
            }}
          >
            Your orders will appear here after checkout.
          </p>
        </div>
      ) : (
        <div className="uo-wrap">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </>
  );
}
