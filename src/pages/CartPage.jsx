import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useCart, useToasts } from "../lib/store.js";
import { useShop, useAuth } from "../context/ShopContext.jsx";

import { useNavigate } from "react-router-dom";
import { orderApi } from "../lib/api.js";
import { CONTACT_NAME, WHATSAPP_NUMBER } from "../lib/products.js";


export default function CartPage() {
  const { items, remove, setQty, subtotal, count } = useCart();
  const { user } = useAuth();
  const push = useToasts((s) => s.push);
  const navigate = useNavigate();

  const total = subtotal();
  const itemCount = count();
  const shipping = total > 2999 ? 0 : 250;
  const grandTotal = total + shipping;
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!user) {
      push({ type: "info", message: "Please sign in to complete your order." });
      navigate("/auth#login");
      return;
    }

    setLoading(true);
    try {
      const mappedItems = items.map(i => ({
        product: i.productId,
        quantity: i.qty,
        price: i.price,
        size: i.size,
        color: i.color
      }));

      const data = await orderApi.create({
        items: mappedItems,
        total: grandTotal,
      });

      // Build WhatsApp message with order link
      const lines = items
        .map(
          (i, n) =>
            `${n + 1}. ${i.name} (Size ${i.size}, ${i.color}) — ₹${i.price.toLocaleString("en-IN")} x${i.qty}`,
        )
        .join("\n");
      const text = `Hi ${CONTACT_NAME}, I'd like to order the following:\n${lines}\nTotal: ₹${grandTotal.toLocaleString("en-IN")}\nOrder details: ${data.orderLink}\nPlease confirm availability.`;
      const waUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;
      
      // Clear cart
      const { clear } = useCart.getState();
      clear();
      
      window.open(waUrl, "_blank");
      navigate("/profile"); // Redirect to orders page
    } catch (err) {
      push({ type: "error", message: err.message });
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
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = "var(--color-gold)")
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = "var(--color-foreground)")
          }
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div
      className="page-transition"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px 20px 80px",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2rem, 5vw, 2.5rem)",
        }}
      >
        Shopping Bag ({itemCount})
      </h1>

      <div
        style={{ marginTop: "40px", display: "grid", gap: "48px" }}
        className="cart-layout"
      >
        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                gap: "20px",
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "32px",
              }}
            >
              <Link
                to={`/product/${item.slug}`}
                style={{
                  width: "120px",
                  aspectRatio: "3/4",
                  borderRadius: "8px",
                  overflow: "hidden",
                  backgroundColor: "var(--color-muted)",
                  flexShrink: 0,
                }}
              >
                <img
                  src={item.image?.url || item.image}
                  alt={item.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Link>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <h3
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "1.25rem",
                        }}
                      >
                        {item.name}
                      </h3>
                    </Link>
                    <p style={{ fontWeight: 600 }}>
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--color-muted-foreground)",
                      marginTop: "4px",
                    }}
                  >
                    Size: {item.size} | Color: {item.color}
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                    }}
                  >
                    <button
                      onClick={() => setQty(item.id, item.qty - 1)}
                      style={{ padding: "6px 10px", cursor: "pointer" }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ padding: "0 12px", fontSize: "14px" }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => setQty(item.id, item.qty + 1)}
                      style={{ padding: "6px 10px", cursor: "pointer" }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      remove(item.id);
                      push({ type: "info", message: "Item removed from bag" });
                    }}
                    style={{
                      color: "var(--color-muted-foreground)",
                      transition: "color 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--color-destructive)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color =
                        "var(--color-muted-foreground)")
                    }
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Order info */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "20px",
                display: "flex",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <Truck size={24} style={{ color: "var(--color-gold)" }} />
              <div>
                <p className="label-caps" style={{ fontSize: "10px" }}>
                  Free Delivery
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-muted-foreground)",
                    marginTop: "2px",
                  }}
                >
                  On orders over ₹2,999. Usually arrives in 3-5 days.
                </p>
              </div>
            </div>
            <div
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "20px",
                display: "flex",
                gap: "16px",
                alignItems: "center",
              }}
            >
              <ShieldCheck size={24} style={{ color: "var(--color-gold)" }} />
              <div>
                <p className="label-caps" style={{ fontSize: "10px" }}>
                  Secure Checkout
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-muted-foreground)",
                    marginTop: "2px",
                  }}
                >
                  Your orders are processed safely via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={{ position: "sticky", top: "112px", alignSelf: "start" }}>
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "12px",
              padding: "32px",
            }}
          >
            <h2 className="label-caps" style={{ marginBottom: "24px" }}>
              Order Summary
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
              {shipping > 0 && (
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--color-gold)",
                    backgroundColor:
                      "color-mix(in oklch, var(--color-gold) 10%, transparent)",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  Add ₹{(3000 - total).toLocaleString("en-IN")} more for free
                  delivery.
                </p>
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

            <button
              onClick={handleCheckout}
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
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-gold)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-foreground)")
              }
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <span>Checkout on WhatsApp</span> <ArrowRight size={16} />
                </>
              )}
            </button>

            <p
              style={{
                marginTop: "20px",
                fontSize: "12px",
                color: "var(--color-muted-foreground)",
                textAlign: "center",
              }}
            >
              All taxes included. Order confirmation will be sent to your
              WhatsApp.
            </p>
          </div>

          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link
              to="/collections"
              style={{
                fontSize: "14px",
                color: "inherit",
                textDecoration: "underline",
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .cart-layout { grid-template-columns: 1fr; }
        @media (min-width: 1024px) {
          .cart-layout { grid-template-columns: 1fr 400px !important; }
        }
      `}</style>
    </div>
  );
}
