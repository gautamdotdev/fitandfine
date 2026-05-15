import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { orderApi } from "../lib/api";
import {
  Package,
  Loader2,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Settings2,
  ArrowLeft,
  Search,
} from "lucide-react";

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

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

const formatPaymentMethod = (method) =>
  ({
    cash: "Cash",
    upi: "UPI",
    card: "Card",
    bank_transfer: "Bank transfer",
    other: "Other",
  })[method] ||
  method ||
  "Payment";

function AddressBlock({ address }) {
  if (!address) {
    return (
      <p
        style={{
          fontSize: 14,
          color: "var(--color-muted-foreground)",
          marginTop: 4,
          lineHeight: 1.5,
        }}
      >
        Contacted via WhatsApp for address details.
      </p>
    );
  }
  if (typeof address === "string") {
    return (
      <p
        style={{
          fontSize: 14,
          color: "var(--color-muted-foreground)",
          marginTop: 4,
          lineHeight: 1.5,
        }}
      >
        {address}
      </p>
    );
  }
  return (
    <div
      style={{
        fontSize: 14,
        color: "var(--color-muted-foreground)",
        marginTop: 4,
        lineHeight: 1.6,
      }}
    >
      {address.label && (
        <p style={{ fontWeight: 700, color: "var(--color-foreground)" }}>
          {address.label}
        </p>
      )}
      {address.name && <p>{address.name}</p>}
      {address.line1 && (
        <p>
          <strong>Address line 1:</strong> {address.line1}
        </p>
      )}
      {address.line2 && (
        <p>
          <strong>Address line 2:</strong> {address.line2}
        </p>
      )}
      <p>
        {address.city}, {address.state} - {address.pin}
      </p>
      {address.phone && <p>{address.phone}</p>}
    </div>
  );
}

const STYLES = `
  .ot-wrap { max-width: 800px; margin: 0 auto; min-height: 80vh; }
  .ot-card { border: 1px solid var(--color-border); border-radius: 5px; overflow: hidden; background: var(--color-background); box-shadow: 0 12px 48px rgba(0,0,0,0.06); }
  .ot-header { padding: 32px; border-bottom: 1px solid var(--color-border); text-align: center; background: var(--color-surface); }
  .ot-body { padding: 40px; }
  .ot-progress { display: flex; align-items: center; gap: 0; margin: 40px 0; }
  .ot-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
  .ot-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--color-border); border: 3px solid var(--color-border); transition: all 0.3s; z-index: 1; }
  .ot-dot.active { background: #10b981; border-color: #10b981; }
  .ot-dot.current { background: #fff; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.2); width: 16px; height: 16px; }
  .ot-line { position: absolute; top: 7px; left: 50%; right: -50%; height: 2px; background: var(--color-border); z-index: 0; }
  .ot-line.done { background: #10b981; }
  .ot-label { font-size: 11px; font-weight: 700; color: var(--color-muted-foreground); margin-top: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
  .ot-label.active { color: var(--color-foreground); }
  .ot-items { display: flex; flex-direction: column; gap: 16px; margin-top: 32px; }
  .ot-item { display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 5px; border: 1px solid var(--color-border); }
  .ot-item-img { width: 64px; height: 80px; border-radius: 10px; object-fit: cover; }
  .ot-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 32px; padding-top: 32px; border-top: 1px solid var(--color-border); }
  .ot-info-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-muted-foreground); margin-bottom: 8px; }
  .ot-search { display: flex; gap: 10px; margin-top: 24px; }
  .ot-search input { flex: 1; min-width: 0; height: 48px; padding: 0 16px; border-radius: 12px; border: 1.5px solid var(--color-border); background: var(--color-background); color: var(--color-foreground); font-family: inherit; font-size: 14px; outline: none; }
  .ot-search button { height: 48px; padding: 0 20px; border: none; border-radius: 12px; background: var(--color-foreground); color: var(--color-background); font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
  @media (max-width: 640px) {
    .ot-wrap { padding: 5px 5px; }
    .ot-body { padding: 15px; }
    .ot-info-grid { grid-template-columns: 1fr; }
    .ot-label { font-size: 9px; }
  }
`;

export default function OrderTrackingPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [lookupId, setLookupId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(uuid));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uuid) {
      setLoading(false);
      setOrder(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    orderApi
      .track(uuid)
      .then((res) => {
        // Normalize response: API might return { order } or the order object directly
        const o = res && (res.order || res);
        if (!o || (typeof o === "object" && !o._id && !o.orderId)) {
          setOrder(null);
          setError("Order not found");
          return;
        }
        // Ensure items array exists to avoid runtime errors
        if (!Array.isArray(o.items)) o.items = [];
        setOrder(o);
      })
      .catch((err) => {
        setOrder(null);
        setError(err?.message || "Failed to load order");
      })
      .finally(() => setLoading(false));
  }, [uuid]);

  const submitLookup = (e) => {
    e.preventDefault();
    const next = lookupId.trim();
    if (next) navigate(`/order/${encodeURIComponent(next)}`);
  };

  if (!uuid) {
    return (
      <div className="ot-wrap">
        <style>{STYLES}</style>
        <div className="ot-card">
          <div className="ot-header">
            <Package
              size={38}
              style={{ margin: "0 auto 16px", opacity: 0.35 }}
            />
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.2rem",
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              Track Your Order
            </h1>
            <p style={{ color: "var(--color-muted-foreground)", fontSize: 14 }}>
              Enter your order ID to view the latest order details.
            </p>
            <form className="ot-search" onSubmit={submitLookup}>
              <input
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                placeholder="Example: ORD-MABC123-XY789"
                autoFocus
              />
              <button type="submit">
                <Search size={16} /> Track
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Show spinner while loading or when we have a uuid but no order yet
  if (loading || (!loading && !order && uuid && !error)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <Loader2 className="animate-spin" size={40} style={{ opacity: 0.2 }} />
        <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ot-wrap" style={{ textAlign: "center" }}>
        <style>{STYLES}</style>
        <div className="ot-card" style={{ padding: 64 }}>
          <AlertCircle
            size={48}
            color="#ef4444"
            style={{ margin: "0 auto 24px" }}
          />
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "2rem",
              marginBottom: 12,
            }}
          >
            Link Expired
          </h2>
          <p
            style={{ color: "var(--color-muted-foreground)", marginBottom: 32 }}
          >
            {error}
          </p>
          <Link
            to="/"
            className="btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <ArrowLeft size={16} /> Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS[order.status] || STATUS.pending;
  const StatusIcon = cfg.icon;
  const currentIdx = STEPS.indexOf(order.status);
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <style>{STYLES}</style>
      <div className="ot-wrap">
        <div className="ot-card">
          <div className="ot-header">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  background: cfg.bg,
                  color: cfg.color,
                  padding: "8px 16px",
                  borderRadius: 40,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                <StatusIcon size={14} />
                {cfg.label}
              </div>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2.5rem",
                fontWeight: 800,
                marginBottom: 4,
              }}
            >
              Order Tracker
            </h1>
            <p style={{ color: "var(--color-muted-foreground)", fontSize: 14 }}>
              Order #{order.orderId || order._id.slice(-8).toUpperCase()} ·
              Placed on {date}
            </p>
          </div>

          <div className="ot-body">
            {/* Progress Stepper */}
            {order.status !== "cancelled" && (
              <div className="ot-progress">
                {STEPS.map((step, i) => {
                  const done = i < currentIdx;
                  const current = i === currentIdx;
                  return (
                    <div key={step} className="ot-step">
                      {i < STEPS.length - 1 && (
                        <div className={`ot-line ${done ? "done" : ""}`} />
                      )}
                      <div
                        className={`ot-dot ${done ? "active" : ""} ${current ? "current" : ""}`}
                      />
                      <span
                        className={`ot-label ${done || current ? "active" : ""}`}
                      >
                        {STATUS[step].label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Order Details */}
            <div style={{ marginTop: 48 }}>
              <h3 className="ot-info-title">Items Ordered</h3>
              <div className="ot-items">
                {order.items.map((item, i) => (
                  <div key={i} className="ot-item">
                    <img
                      src={
                        item.product?.images?.[0]?.url ||
                        item.product?.images?.[0] ||
                        "https://via.placeholder.com/80"
                      }
                      className="ot-item-img"
                      alt={item.product?.name}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>
                        {item.product?.name || "Product"}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--color-muted-foreground)",
                          marginTop: 2,
                        }}
                      >
                        Size: {item.size} | Color: {item.color} | Qty:{" "}
                        {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800 }}>
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Grid */}
            <div className="ot-info-grid">
              <div>
                <h3 className="ot-info-title">Delivery Details</h3>
                <p style={{ fontSize: 15, fontWeight: 600 }}>
                  {order.user?.name}
                </p>
                <AddressBlock address={order.address} />
              </div>
              <div style={{ textAlign: "right" }}>
                <h3 className="ot-info-title">Order Summary</h3>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 16,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-muted-foreground)",
                        fontSize: 13,
                      }}
                    >
                      Subtotal:
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      ₹
                      {(
                        order.subtotal ||
                        order.total - (order.shippingCost || 0)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 16,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-muted-foreground)",
                        fontSize: 13,
                      }}
                    >
                      Shipping:
                    </span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {order.shippingCost === 0
                        ? "FREE"
                        : `₹${(order.shippingCost || (order.total > 2999 ? 0 : 250)).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 16,
                      borderTop: "1px solid var(--color-border)",
                      paddingTop: 12,
                      marginTop: 4,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-foreground)",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      Total Paid:
                    </span>
                    <span style={{ fontWeight: 900, fontSize: 18 }}>
                      ₹{(order.paidAmount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 16,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-muted-foreground)",
                        fontSize: 13,
                      }}
                    >
                      Payment:
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        textTransform: "capitalize",
                      }}
                    >
                      {order.paymentStatus || "unpaid"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {order.payments?.length > 0 && (
              <div
                style={{
                  marginTop: 28,
                  paddingTop: 24,
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <h3 className="ot-info-title">Payment History</h3>
                {order.payments.map((payment, index) => (
                  <div
                    key={payment._id || index}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      fontSize: 13,
                      padding: "8px 0",
                    }}
                  >
                    <span>
                      {formatPaymentMethod(payment.method)} ·{" "}
                      {new Date(payment.paidAt).toLocaleDateString("en-IN")}
                    </span>
                    <strong>₹{payment.amount?.toLocaleString("en-IN")}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 40,
            color: "var(--color-muted-foreground)",
            fontSize: 13,
          }}
        >
          <p>Need help with your order? Contact us on WhatsApp.</p>
        </div>
      </div>
    </>
  );
}
