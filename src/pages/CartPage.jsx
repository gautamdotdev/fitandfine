import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  MapPin,
  CheckCircle2,
  X,
} from "lucide-react";
import { useCart, useToasts } from "../lib/store.js";
import { useAuth } from "../context/ShopContext.jsx";
import { adminApi, couponApi, orderApi } from "../lib/api.js";
import { CONTACT_NAME, WHATSAPP_NUMBER } from "../lib/products.js";

/* ── Modal Shell ── */
function Modal({ open, onClose, children, maxWidth = "480px" }) {
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
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "0",
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
          maxWidth,
          backgroundColor: "var(--color-background)",
          borderRadius: "24px 24px 0 0",
          padding: "0",
          maxHeight: "92vh",
          overflowY: "auto",
          scrollbarWidth: "none",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "12px",
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
        {/* Close btn */}
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
        <div>{children}</div>
      </div>
    </div>
  );
}

function ProductDetailsPopup({ open, onClose, item }) {
  if (!item) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ textAlign: "center" }}>
        <Link
          to={`/product/${item.slug}`}
          onClick={onClose}
          style={{
            display: "block",
            width: "140px",
            margin: "24px auto 16px",
            aspectRatio: "3/4",
            overflow: "hidden",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <img
            src={item.image?.url || item.image}
            alt={item.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Link>
        <div style={{ padding: "12px 24px 15px" }}>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.5rem",
              marginBottom: "8px",
            }}
          >
            {item.name}
          </h3>
          <p
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--color-gold)",
              marginBottom: "24px",
            }}
          >
            ₹{item.price.toLocaleString("en-IN")}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              textAlign: "left",
              backgroundColor: "var(--color-surface)",
              padding: "20px",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
            }}
          >
            <div>
              <p
                className="label-caps"
                style={{ fontSize: "9px", color: "var(--color-muted-foreground)" }}
              >
                Selected Color
              </p>
              <p style={{ fontWeight: 600, marginTop: "4px" }}>{item.color}</p>
            </div>
            <div>
              <p
                className="label-caps"
                style={{ fontSize: "9px", color: "var(--color-muted-foreground)" }}
              >
                Selected Size
              </p>
              <p style={{ fontWeight: 600, marginTop: "4px" }}>US {item.size}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              marginTop: "32px",
              backgroundColor: "var(--color-foreground)",
              color: "var(--color-background)",
              padding: "16px",
              borderRadius: "2px",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}

function PriceLine({ label, value, free }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--color-muted-foreground)" }}>{label}</span>
      <span>
        {free
          ? "Free"
          : `${value < 0 ? "- " : ""}Rs ${Math.abs(value).toLocaleString("en-IN")}`}
      </span>
    </div>
  );
}

function CheckoutConfirmPopup({
  open,
  onClose,
  items,
  address,
  subtotal,
  shipping,
  discount,
  total,
  coupon,
  cod,
  setCod,
  loading,
  onConfirm,
}) {
  return (
    <Modal open={open} onClose={onClose} maxWidth="560px">
      <div style={{ padding: "24px" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem" }}>
          Confirm your order
        </h2>
        <p style={{ color: "var(--color-muted-foreground)", fontSize: 13 }}>
          Review your items, delivery address and payment option before WhatsApp opens.
        </p>

        <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "grid",
                gridTemplateColumns: "54px 1fr auto",
                gap: 12,
                alignItems: "center",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                padding: 10,
                background: "var(--color-surface)",
              }}
            >
              <img
                src={item.image?.url || item.image}
                alt={item.name}
                style={{ width: 54, height: 64, borderRadius: 8, objectFit: "cover" }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{item.name}</div>
                <div style={{ color: "var(--color-muted-foreground)", fontSize: 12 }}>
                  Size {item.size} · {item.color} · Qty {item.qty}
                </div>
              </div>
              <strong style={{ fontSize: 13 }}>
                Rs {(item.price * item.qty).toLocaleString("en-IN")}
              </strong>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: 14,
            fontSize: 13,
          }}
        >
          <div className="label-caps" style={{ fontSize: 10, marginBottom: 8 }}>
            Delivery Address
          </div>
          <div style={{ color: "var(--color-muted-foreground)", lineHeight: 1.5 }}>
            {address?.name} · {address?.phone}
            <br />
            {address?.line1}
            {address?.line2 ? `, ${address.line2}` : ""}, {address?.city},{" "}
            {address?.state} - {address?.pin}
          </div>
        </div>

        <label
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            padding: 14,
            cursor: "pointer",
          }}
        >
          <input checked={cod} type="checkbox" onChange={(e) => setCod(e.target.checked)} />
          <span style={{ fontWeight: 700 }}>Cash on delivery (COD)</span>
        </label>

        <div style={{ marginTop: 18, display: "grid", gap: 10, fontSize: 14 }}>
          <PriceLine label="Subtotal" value={subtotal} />
          <PriceLine label="Shipping" value={shipping} free={shipping === 0} />
          {discount > 0 && <PriceLine label={`Coupon ${coupon?.code || ""}`} value={-discount} />}
          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            <span>Total</span>
            <span>Rs {total.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 24,
            background: "var(--color-foreground)",
            color: "var(--color-background)",
            borderRadius: 999,
            padding: 16,
            fontWeight: 800,
          }}
        >
          {loading ? "Placing order..." : "Confirm order on WhatsApp"}
        </button>
      </div>
    </Modal>
  );
}

export default function CartPage() {
  const { items, remove, setQty, subtotal, count, clear } = useCart();
  const { user, loading: authLoading, updateUser } = useAuth();
  const push = useToasts((s) => s.push);
  const navigate = useNavigate();

  const total = subtotal();
  const itemCount = count();
  const [shippingSettings, setShippingSettings] = useState({
    charge: 120,
    freeAbove: 2999,
  });
  const shipping =
    total > Number(shippingSettings.freeAbove || 2999)
      ? 0
      : Number(shippingSettings.charge || 120);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const discount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(total + shipping - discount, 0);
  const [loading, setLoading] = useState(false);
  const [detailsItem, setDetailsItem] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cod, setCod] = useState(true);

  useEffect(() => {
    adminApi
      .getSiteSettings()
      .then((data) => {
        if (data.settings?.shipping) setShippingSettings(data.settings.shipping);
      })
      .catch(() => {});
  }, []);

  const addresses = user?.addresses || [];
  const defaultAddress = addresses.find((addr) => addr.default) || addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState("");

  useEffect(() => {
    if (defaultAddress?._id && !selectedAddressId) {
      setSelectedAddressId(defaultAddress._id);
    }
  }, [defaultAddress?._id]);

  const selectedAddress =
    addresses.find((addr) => addr._id === selectedAddressId) || defaultAddress;

  const formatAddress = (addr) =>
    addr
      ? [
        addr.name,
        addr.line1,
        addr.line2,
        `${addr.city || ""}, ${addr.state || ""} - ${addr.pin || ""}`.trim(),
        addr.phone,
      ]
        .filter(Boolean)
        .join(", ")
      : "";

  const markDefaultAddress = async () => {
    if (!selectedAddress?._id) return;
    await updateUser({
      addresses: addresses.map((addr) => ({
        ...addr,
        default: addr._id === selectedAddress._id,
      })),
    });
  };

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const data = await couponApi.validate({
        code: couponCode,
        subtotal: total,
      });
      setAppliedCoupon({
        code: data.coupon.code,
        discount: data.discount,
        type: data.coupon.type,
      });
      push({ type: "success", message: "Coupon applied." });
    } catch (err) {
      setAppliedCoupon(null);
      push({ type: "error", message: err.message });
    } finally {
      setCouponLoading(false);
    }
  }

  function openCheckout() {
    if (!user) {
      push({ type: "info", message: "Please sign in to complete your order." });
      navigate(`/auth?next=${encodeURIComponent("/cart")}`);
      return;
    }

    if (!selectedAddress) {
      push({
        type: "info",
        message:
          "Please add a delivery address from your profile before checkout.",
      });
      navigate("/profile");
      return;
    }

    setCheckoutOpen(true);
  }

  async function handleCheckout() {
    setLoading(true);
    try {
      const mappedItems = items.map((i) => ({
        product: i.productId,
        quantity: i.qty,
        price: i.price,
        size: i.size,
        color: i.color,
      }));

      const data = await orderApi.create({
        items: mappedItems,
        subtotal: total,
        shippingCost: shipping,
        address: selectedAddress,
        paymentInfo: {
          method: cod ? "cod" : "whatsapp_confirmation",
          cod,
        },
        couponCode: appliedCoupon?.code,
      });

      const lines = items
        .map(
          (i, n) =>
            `${n + 1}. ${i.name} (Size ${i.size}, ${i.color}) — ₹${i.price.toLocaleString("en-IN")} x${i.qty}`,
        )
        .join("\n");

      const breakdown = `Subtotal: Rs ${total.toLocaleString("en-IN")}\nShipping: ${shipping === 0 ? "FREE" : `Rs ${shipping.toLocaleString("en-IN")}`}${discount > 0 ? `\nCoupon (${appliedCoupon.code}): - Rs ${discount.toLocaleString("en-IN")}` : ""}\nTotal: Rs ${grandTotal.toLocaleString("en-IN")}\nPayment: ${cod ? "COD requested" : "Confirm on WhatsApp"}`;
      const text = `Hi ${CONTACT_NAME}, I'd like to order the following:\n${lines}\n\nDelivery address:\n${formatAddress(selectedAddress)}\n\n${breakdown}\n\nOrder details: ${data.orderLink}\nPlease confirm availability.`;
      const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;

      clear();

      window.open(waUrl, "_blank");
      navigate("/profile");
    } catch (err) {
      push({
        type: "error",
        message: err.message || "Failed to place order. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div
        className="page-transition"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "64px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            backgroundColor: "var(--color-surface)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <ShoppingBag
            size={32}
            style={{ color: "var(--color-muted-foreground)" }}
          />
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem" }}>
          Your bag is empty
        </h1>
        <p
          style={{
            marginTop: "12px",
            color: "var(--color-muted-foreground)",
            maxWidth: "320px",
            margin: "12px auto 0",
          }}
        >
          Looks like you haven't added anything yet. Explore our collections to
          find your next favorite piece.
        </p>
        <Link
          to="/collections"
          className="label-caps"
          style={{
            marginTop: "32px",
            display: "inline-block",
            backgroundColor: "var(--color-foreground)",
            color: "var(--color-background)",
            padding: "16px 32px",
            borderRadius: "50px",
            fontSize: "14px",
            textDecoration: "none",
            transition: "background-color 0.3s",
          }}
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <div
        className="page-transition"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0px 5px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 5vw, 2.5rem)",
              lineHeight: 1,
            }}
          >
            Carts{" "}
            <span style={{ fontSize: "0.48em", verticalAlign: "top" }}>
              {String(itemCount).padStart(2, "0")}
            </span>
          </h1>
        </div>

        <div
          style={{ marginTop: "32px", display: "grid", gap: "32px" }}
          className="cart-layout"
        >
          <div
            className={`cart-items-container ${items.length === 1 ? "single-item-layout" : ""}`}
            style={{ display: "flex", flexDirection: "column", gap: "18px" }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="cart-item"
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: "18px",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                }}
              >

                <Link
                  to={`/product/${item.slug}`}
                  className="cart-item-image-link"
                  style={{
                    width: "108px",
                    aspectRatio: "1",
                    borderRadius: "14px",
                    overflow: "hidden",
                    backgroundColor: "var(--color-muted)",
                    flexShrink: 0,
                    display: "block",
                  }}
                >
                  <img
                    src={item.image?.url || item.image}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Link>
                <div
                  className="cart-item-main"
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "8px",
                    minWidth: 0,
                  }}
                >
                  <div>
                    <div
                      className="cart-item-top"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <Link
                        to={`/product/${item.slug}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <h3
                          className="cart-item-title"
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: "1.15rem",
                            wordBreak: "break-word",
                          }}
                        >
                          {item.name}
                        </h3>
                      </Link>
                      <p style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                        ₹{(item.price * item.qty).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <p
                      className="cart-item-details-text"
                      style={{
                        fontSize: "13px",
                        color: "var(--color-muted-foreground)",
                        marginTop: "4px",
                      }}
                    >
                      Color: {item.color} • Size: US {item.size}
                    </p>
                  </div>
                  <div
                    className="cart-item-actions"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="cart-mobile-only"
                      onClick={() => setDetailsItem(item)}
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "var(--color-foreground)",
                        textDecoration: "underline",
                        textUnderlineOffset: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "4px",
                      }}
                    >
                      View product details
                    </button>

                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        border: "1px solid var(--color-border)",
                        borderRadius: "999px",
                        overflow: "hidden",
                        backgroundColor: "var(--color-background)",
                        width: "fit-content",
                      }}
                    >
                      <button
                        onClick={() => setQty(item.id, item.qty - 1)}
                        style={{ padding: "8px 10px", cursor: "pointer" }}
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        style={{
                          padding: "0 12px",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {item.qty}
                      </span>
                      <button
                        onClick={() => setQty(item.id, item.qty + 1)}
                        style={{ padding: "8px 10px", cursor: "pointer" }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      className="cart-mobile-delete"
                      onClick={() => {
                        remove(item.id);
                        push({ type: "info", message: "Item removed from bag" });
                      }}
                      aria-label="Remove item"
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        border: "1px solid var(--color-border)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--color-muted-foreground)",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="cart-summary"
            style={{ position: "sticky", top: "112px", alignSelf: "start" }}
          >
            <div
              className="cart-summary-card"
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                padding: "32px",
              }}
            >
              <h2
                className="label-caps"
                style={{ marginBottom: "24px", fontSize: "12px" }}
              >
                Summary
              </h2>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  fontSize: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-muted-foreground)" }}>
                    Subtotal
                  </span>
                  <span>₹{total.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-muted-foreground)" }}>
                    Shipping
                  </span>
                  <span>
                    {shipping === 0 ? (
                      <span style={{ color: "var(--color-gold)" }}>Free</span>
                    ) : (
                      `₹${shipping.toLocaleString("en-IN")}`
                    )}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 8,
                  }}
                >
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    style={{
                      minWidth: 0,
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      padding: "0 12px",
                      height: 42,
                      background: "var(--color-background)",
                    }}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={couponLoading}
                    style={{
                      border: "1px solid var(--color-border)",
                      borderRadius: 10,
                      padding: "0 14px",
                      fontWeight: 700,
                    }}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--color-muted-foreground)" }}>
                      Coupon {appliedCoupon.code}
                    </span>
                    <span style={{ color: "var(--color-gold)", display: "inline-flex", gap: 8 }}>
                      -₹{discount.toLocaleString("en-IN")}
                      <button
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponCode("");
                        }}
                        style={{
                          color: "#cc272e",
                          fontWeight: 800,
                          textDecoration: "underline",
                        }}
                      >
                        Cancel
                      </button>
                    </span>
                  </div>
                )}
                <div
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    marginTop: "8px",
                    paddingTop: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 600,
                    fontSize: "1.25rem",
                  }}
                >
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "24px",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <h3
                  className="label-caps"
                  style={{
                    marginBottom: "12px",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <MapPin size={14} /> Delivery Address
                </h3>
                {addresses.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed #cc272e",
                      borderRadius: "10px",
                      padding: "14px",
                      fontSize: "13px",
                      color: "#cc272e",
                    }}
                  >
                    Add an address in your profile before checkout.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "10px" }}>
                    {addresses.map((addr) => {
                      const selected = selectedAddress?._id === addr._id;
                      return (
                        <button
                          key={addr._id}
                          type="button"
                          onClick={() => setSelectedAddressId(addr._id)}
                          style={{
                            textAlign: "left",
                            border: `1.5px solid ${selected ? "var(--color-foreground)" : "var(--color-border)"}`,
                            background: selected
                              ? "var(--color-background)"
                              : "transparent",
                            borderRadius: "10px",
                            padding: "12px",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <strong style={{ fontSize: "13px" }}>
                                {addr.label || "Address"}
                              </strong>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "var(--color-muted-foreground)",
                                  marginTop: "4px",
                                }}
                              >
                                {addr.name} • {addr.phone}
                              </p>
                              <p
                                style={{
                                  fontSize: "12px",
                                  color: "var(--color-muted-foreground)",
                                  marginTop: "2px",
                                  lineHeight: 1.4,
                                }}
                              >
                                {addr.line1}
                                {addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}
                                , {addr.state} - {addr.pin}
                              </p>
                            </div>
                            {selected && (
                              <CheckCircle2
                                size={16}
                                style={{ color: "var(--color-foreground)" }}
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={openCheckout}
                disabled={loading}
                className="label-caps"
                style={{
                  width: "100%",
                  marginTop: "32px",
                  backgroundColor: "var(--color-foreground)",
                  color: "var(--color-background)",
                  padding: "16px",
                  borderRadius: "50px",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? (
                  "Processing..."
                ) : (
                  <>
                    <span>Checkout on WhatsApp</span> <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProductDetailsPopup
        open={detailsItem !== null}
        onClose={() => setDetailsItem(null)}
        item={detailsItem}
      />
      <CheckoutConfirmPopup
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        address={selectedAddress}
        subtotal={total}
        shipping={shipping}
        discount={discount}
        total={grandTotal}
        coupon={appliedCoupon}
        cod={cod}
        setCod={setCod}
        loading={loading}
        onConfirm={handleCheckout}
      />

      <style>{`
        .cart-layout { grid-template-columns: 1fr; }
        @media (min-width: 1024px) {
          .cart-layout { grid-template-columns: minmax(0, 1fr) 400px !important; }
        }
        @media (max-width: 767px) {
          .cart-summary { position: static !important; }
          .cart-summary-card { padding: 20px !important; }
        }
      `}</style>
    </>
  );
}
