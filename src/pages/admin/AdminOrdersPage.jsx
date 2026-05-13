import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/ShopContext";
import { orderApi } from "../../lib/api";
import { useToasts } from "../../lib/store";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from "lucide-react";

const STATUSES = {
  pending: { label: "Pending", color: "#d97706", bg: "#fffbeb", icon: Clock },
  confirmed: { label: "Confirmed", color: "#2563eb", bg: "#eff6ff", icon: CheckCircle2 },
  processing: { label: "Processing", color: "#7c3aed", bg: "#f5f3ff", icon: Clock },
  shipped: { label: "Shipped", color: "#0891b2", bg: "#ecfeff", icon: Truck },
  delivered: { label: "Delivered", color: "#059669", bg: "#ecfdf5", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fef2f2", icon: XCircle },
};

const METHODS = [
  ["cash", "Cash"],
  ["upi", "UPI"],
  ["card", "Card"],
  ["bank_transfer", "Bank transfer"],
  ["other", "Other"],
];

const CSS = `
  .ao-wrap { max-width: 1420px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .ao-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; flex-wrap: wrap; }
  .ao-sub { color: #888; font-size: 13px; margin: 0; }
  .ao-refresh { display: inline-flex; align-items: center; gap: 8px; border: 1.5px solid #e8e6e0; background: #fff; border-radius: 10px; height: 40px; padding: 0 14px; cursor: pointer; font-weight: 700; color: #1a1a1a; transition: all 0.2s; }
  .ao-refresh:hover { border-color: #1a1a1a; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .ao-bar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
  .ao-search { flex: 1; min-width: 240px; position: relative; }
  .ao-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; }
  .ao-search input, .ao-select { width: 100%; height: 42px; border: 1.5px solid #e8e6e0; border-radius: 10px; background: #fff; color: #1a1a1a; padding: 0 12px 0 38px; font: inherit; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
  .ao-search input:focus, .ao-select:focus { border-color: #1a1a1a; }
  .ao-select { width: 180px; padding-left: 12px; font-weight: 600; cursor: pointer; }
  .ao-table-wrap { border: 1px solid #e8e6e0; background: #fff; border-radius: 2px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
  .ao-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .ao-table th { background: #faf9f7; padding: 13px 14px; text-align: left; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #bbb; border-bottom: 1px solid #e8e6e0; font-weight: 700; }
  .ao-table td { padding: 14px; border-bottom: 1px solid #f5f3ef; vertical-align: top; }
  .ao-row { transition: background 0.12s; cursor: pointer; }
  .ao-row:hover td { background: #faf9f7; }
  .ao-id { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 800; word-break: break-word; color: #1a1a1a; }
  .ao-main { font-weight: 800; font-size: 13px; color: #1a1a1a; }
  .ao-muted { font-size: 12px; color: #888; margin-top: 4px; line-height: 1.45; }
  .ao-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  .ao-pay { display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border-radius: 8px; background: #faf9f7; font-size: 12px; font-weight: 800; text-transform: capitalize; color: #444; border: 1px solid #e8e6e0; }
  .ao-actions { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .ao-status { height: 36px; border: 1.5px solid #e8e6e0; border-radius: 9px; background: #fff; padding: 0 8px; font: inherit; font-size: 12px; font-weight: 700; outline: none; cursor: pointer; }
  .ao-status:focus { border-color: #1a1a1a; }
  .ao-icon-btn, .ao-pay-btn { height: 36px; border: 1.5px solid #e8e6e0; border-radius: 9px; background: #fff; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; justify-content: center; padding: 0 10px; font-weight: 800; font-size: 12px; transition: all 0.2s; color: #444; }
  .ao-icon-btn:hover, .ao-pay-btn:hover { border-color: #1a1a1a; background: #faf9f7; color: #1a1a1a; }
  .ao-detail {  padding: 18px; display: grid; grid-template-columns: 1.2fr .9fr; gap: 18px; border-bottom: 1px solid #e8e6e0; }
  .ao-panel { background: #fff; border: 1px solid #e8e6e0; border-radius: 5px; padding: 14px; }
  .ao-panel h3 { font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: #bbb; margin: 0 0 12px; font-weight: 700; }
  .ao-item { display: grid; grid-template-columns: 48px 1fr auto; gap: 12px; align-items: center; padding: 10px 0; border-top: 1px solid #f5f3ef; }
  .ao-item:first-of-type { border-top: none; padding-top: 0; }
  .ao-img { width: 48px; height: 58px; object-fit: cover; border-radius: 8px; background: #f0ede6; }
  .ao-mobile { display: none; }
  .ao-card { border: 1px solid #e8e6e0; background: #fff; border-radius: 2px; padding: 14px; display: grid; gap: 12px; transition: box-shadow 0.2s; }
  .ao-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  .ao-empty, .ao-loading { min-height: 240px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; text-align: center; color: #999; border: 1px solid #e8e6e0; background: #fff; border-radius: 12px; font-size: 14px; }
  .ao-pag { display: flex; justify-content: center; align-items: center; margin-top: 24px; gap: 12px; color: #888; font-size: 13px; }
  .ao-pag button { height: 38px; border: 1.5px solid #e8e6e0; background: #fff; border-radius: 10px; padding: 0 18px; cursor: pointer; font-weight: 600; transition: all 0.2s; color: #444; }
  .ao-pag button:hover:not(:disabled) { border-color: #1a1a1a; color: #1a1a1a; }
  .ao-pag button:disabled { opacity: 0.4; cursor: not-allowed; }
  @keyframes aoSpin { to { transform: rotate(360deg); } }
  .spin { animation: aoSpin .8s linear infinite; }
  .ao-modal-bg { position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,.45); backdrop-filter: blur(6px); display: grid; place-items: center; padding: 18px; animation: aoFadeIn 0.2s ease; }
  @keyframes aoFadeIn { from { opacity: 0 } to { opacity: 1 } }
  .ao-modal { width: min(440px, 100%); background: #fff; border-radius: 20px; padding: 28px; box-shadow: 0 24px 64px rgba(0,0,0,.18); animation: aoModalIn 0.25s cubic-bezier(0.16,1,0.3,1); }
  @keyframes aoModalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  .ao-form { display: grid; gap: 16px; margin-top: 20px; }
  .ao-form input, .ao-form select, .ao-form textarea { width: 100%; height: 44px; border: 1.5px solid #e8e6e0; border-radius: 10px; padding: 0 14px; font: inherit; background: #faf9f7; color: #1a1a1a; box-sizing: border-box; outline: none; transition: border-color 0.2s; }
  .ao-form input:focus, .ao-form select:focus, .ao-form textarea:focus { border-color: #1a1a1a; }
  .ao-form textarea { height: 80px; padding-top: 12px; resize: vertical; }
  .ao-submit { height: 48px; border: none; border-radius: 2px; background: #1a1a1a; color: #fff; font-weight: 800; cursor: pointer; transition: all 0.2s; margin-top: 8px; }
  .ao-submit:hover:not(:disabled) { background: #000; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
  .ao-submit:disabled { opacity: 0.6; cursor: not-allowed; }
  @media (max-width: 980px) {
    .ao-table-wrap { display: none; }
    .ao-mobile { display: grid; gap: 12px; }
    .ao-detail { grid-template-columns: 1fr; padding: 12px 0 0; border: none; margin-bottom:10px }
    .ao-select { width: 100%; }
  }
`;

const formatMethod = (method) => METHODS.find(([value]) => value === method)?.[1] || method || "Payment";

function formatAddress(address) {
  if (!address) return "No address saved";
  if (typeof address === "string") return address;
  return (
    <div>
      {address.label && <div className="ao-main">{address.label}</div>}
      {address.name && <div>{address.name}</div>}
      {address.line1 && <div><strong>Address line 1:</strong> {address.line1}</div>}
      {address.line2 && <div><strong>Address line 2:</strong> {address.line2}</div>}
      <div>{address.city}, {address.state} - {address.pin}</div>
      {address.phone && <div>{address.phone}</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUSES[status] || STATUSES.pending;
  const Icon = cfg.icon;
  return <span className="ao-badge" style={{ color: cfg.color, background: cfg.bg }}><Icon size={13} />{cfg.label}</span>;
}

function PaymentModal({ order, mode, onClose, onSaved }) {
  const [amount, setAmount] = useState(
    Math.max((order?.total || 0) - (order?.paidAmount || 0), 0),
  );
  const [method, setMethod] = useState("cash");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);
  const push = useToasts((s) => s.push);

  useEffect(() => {
    if (order) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [order]);

  if (!order && !visible) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payment = { amount: Number(amount), method, paidAt, note };
      const data =
        mode === "deliver"
          ? await orderApi.updateStatus(order._id, "delivered", payment)
          : await orderApi.addPayment(order._id, payment);
      push({
        type: "success",
        title: "Saved",
        message:
          mode === "deliver"
            ? "Order delivered and paid."
            : "Payment recorded.",
      });
      onSaved(data.order);
      onClose();
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "440px",
          backgroundColor: "var(--color-background)",
          borderRadius: "24px 24px 0 0",
          padding: "20px 10px",
          maxHeight: "92vh",
          overflowY: "auto",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "var(--color-border)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
              {mode === "deliver"
                ? "Confirm Delivery Payment"
                : "Record Payment"}
            </h2>
            <p className="ao-muted" style={{ margin: "4px 0 0" }}>
              Order #{order.orderId} · Due ₹
              {Math.max(
                (order.total || 0) - (order.paidAmount || 0),
                0,
              ).toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "20px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--color-foreground)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-foreground)";
              e.currentTarget.style.color = "var(--color-background)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-surface)";
              e.currentTarget.style.color = "var(--color-foreground)";
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>

        <form className="ao-form" onSubmit={submit}>
          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Amount Received
              </label>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount received"
                required
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Payment Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                style={{ width: "100%" }}
              >
                {METHODS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Payment Date
              </label>
              <input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                required
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "#999",
                  marginBottom: "6px",
                  display: "block",
                }}
              >
                Note (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                style={{ width: "100%", boxSizing: "border-box" }}
              />
            </div>
          </div>
          <button
            className="ao-submit"
            disabled={saving}
            style={{ marginTop: "24px", width: "100%" }}
          >
            {saving
              ? "Saving..."
              : mode === "deliver"
                ? "Mark Delivered & Paid"
                : "Save Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ order, open, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true)),
      );
    } else {
      setVisible(false);
      const t = setTimeout(() => {
        document.body.style.overflow = "";
      }, 300);
      return () => clearTimeout(t);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open && !visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(6px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "var(--color-background)",
          borderRadius: "24px 24px 0 0",
          maxHeight: "92vh",
          overflowY: "auto",
          scrollbarWidth: "none",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          padding: "0px 10px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: "20px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: "var(--color-border)",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
              Order Details
            </h2>
            <p className="ao-muted" style={{ margin: "4px 0 0" }}>
              #{order.orderId || order._id}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "20px",
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--color-foreground)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-foreground)";
              e.currentTarget.style.color = "var(--color-background)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-surface)";
              e.currentTarget.style.color = "var(--color-foreground)";
            }}
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
        <OrderDetails order={order} />
      </div>
    </div>
  );
}

function OrderDetails({ order }) {
  return (
    <div className="ao-detail">
      <div className="ao-panel">
        <h3>Items Ordered</h3>
        {order.items?.map((item, index) => {
          const image = item.product?.images?.[0]?.url || item.product?.images?.[0];
          return (
            <div className="ao-item" key={item._id || index}>
              {image ? <img className="ao-img" src={image} alt={item.product?.name || "Product"} /> : <div className="ao-img" />}
              <div>
                <div className="ao-main">{item.product?.name || "Product"}</div>
                <div className="ao-muted">Product ID: {item.product?.productId || item.product?._id || "-"} · Size {item.size || "-"} · Color {item.color || "-"}</div>
                <div className="ao-muted">Qty {item.quantity} × ₹{item.price?.toLocaleString("en-IN")}</div>
              </div>
              <strong>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</strong>
            </div>
          );
        })}
      </div>
      <div className="ao-panel">
        <h3>Customer And Payment</h3>
        <div className="ao-main">{order.user?.name || "Customer"}</div>
        <div className="ao-muted">{order.user?.email || "-"}</div>
        <div className="ao-muted">{order.user?.phone || "-"}</div>
        <div className="ao-muted" style={{ marginTop: 12, display: "flex", gap: 8 }}>
          <MapPin size={14} /> <span>{formatAddress(order.address)}</span>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="ao-main">Paid ₹{(order.paidAmount || 0).toLocaleString("en-IN")} of ₹{order.total?.toLocaleString("en-IN")}</div>
          <div className="ao-muted">Payment status: {order.paymentStatus || "unpaid"}</div>
          {order.payments?.length > 0 && order.payments.map((payment, index) => (
            <div className="ao-muted" key={payment._id || index}>
              {formatMethod(payment.method)} · ₹{payment.amount?.toLocaleString("en-IN")} · {new Date(payment.paidAt).toLocaleDateString("en-IN")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderRow({ order, onStatus, onPayment, onOpen }) {
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <tr className="ao-row">
      <td>
        <div className="ao-id">#{order.orderId || order._id}</div>
      </td>
      <td>
        <div className="ao-main">{order.user?.name || "Customer"}</div>
        <div className="ao-muted">{order.user?.email || "-"}</div>
        <div className="ao-muted">{order.user?.phone || "-"}</div>
      </td>
      <td>
        <div className="ao-main">{date}</div>
        <div className="ao-muted">{order.items?.length || 0} item(s)</div>
      </td>
      <td>
        <div className="ao-main">₹{order.total?.toLocaleString("en-IN")}</div>
        <div className="ao-muted">
          Paid ₹{(order.paidAmount || 0).toLocaleString("en-IN")}
        </div>
      </td>
      <td>
        <StatusBadge status={order.status} />
        <div style={{ marginTop: 8 }}>
          <span className="ao-pay">
            <CreditCard size={12} />
            {order.paymentStatus || "unpaid"}
          </span>
        </div>
      </td>
      <td>
        <div className="ao-actions">
          <select
            className="ao-status"
            value={order.status}
            onChange={(e) => onStatus(order, e.target.value)}
          >
            {Object.entries(STATUSES).map(([value, cfg]) => (
              <option key={value} value={value}>
                {cfg.label}
              </option>
            ))}
          </select>
          <button
            className="ao-pay-btn"
            onClick={() => onPayment(order, "payment")}
          >
            <CreditCard size={14} />
            Payment
          </button>
          <button className="ao-icon-btn" onClick={() => onOpen(order)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function MobileOrder({ order, onStatus, onPayment, onOpen }) {
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return (
    <div className="ao-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div>
          <div className="ao-id">#{order.orderId || order._id}</div>
          <div className="ao-muted">{date}</div>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div>
        <div className="ao-main">{order.user?.name || "Customer"}</div>
        <div className="ao-muted">{order.user?.email || "-"}</div>
        <div className="ao-muted">{order.user?.phone || "-"}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>₹{order.total?.toLocaleString("en-IN")}</strong>
        <span className="ao-pay">{order.paymentStatus || "unpaid"}</span>
      </div>
      <div className="ao-actions">
        <select
          className="ao-status"
          value={order.status}
          onChange={(e) => onStatus(order, e.target.value)}
        >
          {Object.entries(STATUSES).map(([value, cfg]) => (
            <option key={value} value={value}>
              {cfg.label}
            </option>
          ))}
        </select>
        <button
          className="ao-pay-btn"
          onClick={() => onPayment(order, "payment")}
        >
          <CreditCard size={14} />
          Payment
        </button>
        <button className="ao-icon-btn" onClick={() => onOpen(order)}>
          Details
        </button>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const push = useToasts((s) => s.push);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [paymentMode, setPaymentMode] = useState("payment");
  const [detailTarget, setDetailTarget] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/");
  }, [isAdmin, authLoading, navigate]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orderApi.getAllOrders({
        status: filterStatus,
        page,
        limit: 15,
      });
      setOrders(data.orders || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page]);

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [fetchOrders, isAdmin]);

  const upsertOrder = (updated) =>
    setOrders((prev) =>
      prev.map((order) => (order._id === updated._id ? updated : order)),
    );

  const changeStatus = async (order, status) => {
    if (status === order.status) return;
    if (status === "delivered" && order.paymentStatus !== "paid") {
      setPaymentTarget(order);
      setPaymentMode("deliver");
      return;
    }
    try {
      const data = await orderApi.updateStatus(order._id, status);
      upsertOrder(data.order);
      push({
        type: "success",
        title: "Status updated",
        message: `Order marked ${status}.`,
      });
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    }
  };

  const openPayment = (order, mode) => {
    setPaymentTarget(order);
    setPaymentMode(mode);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) =>
      [
        order._id,
        order.orderId,
        order.user?.name,
        order.user?.email,
        order.user?.phone,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q)),
    );
  }, [orders, search]);

  if (authLoading || !isAdmin) return null;

  return (
    <>
      <style>{CSS}</style>
      <div className="ao-wrap">
        {paymentTarget && (
          <PaymentModal
            order={paymentTarget}
            mode={paymentMode}
            onClose={() => setPaymentTarget(null)}
            onSaved={upsertOrder}
          />
        )}
        {detailTarget && (
          <DetailModal
            order={detailTarget}
            open={!!detailTarget}
            onClose={() => setDetailTarget(null)}
          />
        )}
        <div className="ao-top">
          <p className="ao-sub">
            {total} total order{total !== 1 ? "s" : ""}
          </p>
          <button
            className="ao-refresh"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </button>
        </div>
        <div className="ao-bar">
          <div className="ao-search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, customer, email or mobile"
            />
          </div>
          <select
            className="ao-select"
            value={filterStatus}
            onChange={(e) => {
              setPage(1);
              setFilterStatus(e.target.value);
            }}
          >
            <option value="">All statuses</option>
            {Object.entries(STATUSES).map(([value, cfg]) => (
              <option key={value} value={value}>
                {cfg.label}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <div className="ao-loading">
            <Loader2 className="spin" size={30} />
          </div>
        ) : error ? (
          <div className="ao-empty">
            <AlertCircle size={34} />
            <div>{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ao-empty">
            <Package size={34} />
            <div>No orders found</div>
          </div>
        ) : (
          <>
            <div className="ao-table-wrap">
              <table className="ao-table">
                <thead>
                  <tr>
                    <th style={{ width: "18%" }}>Order ID</th>
                    <th style={{ width: "22%" }}>Customer</th>
                    <th style={{ width: "14%" }}>Date</th>
                    <th style={{ width: "14%" }}>Total</th>
                    <th style={{ width: "15%" }}>Status</th>
                    <th style={{ width: "17%" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <OrderRow
                      key={order._id}
                      order={order}
                      onStatus={changeStatus}
                      onPayment={openPayment}
                      onOpen={setDetailTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            <div className="ao-mobile">
              {filtered.map((order) => (
                <MobileOrder
                  key={order._id}
                  order={order}
                  onStatus={changeStatus}
                  onPayment={openPayment}
                  onOpen={setDetailTarget}
                />
              ))}
            </div>
          </>
        )}
        {totalPages > 1 && !loading && (
          <div className="ao-pag">
            <span>Page {page} of {totalPages}</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={14} /> Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next <ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
