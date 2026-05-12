import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart, useToasts, useWishlist } from "../lib/store.js";
import { useState } from "react";

export function ProductCard({ product, badge }) {
  const wished = useWishlist(
    (s) => s.ids.includes(product.id) || s.ids.includes(product._id),
  );
  const toggleWish = useWishlist((s) => s.toggle);
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);
  const onSale = !!product.salePrice;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="product-card full-width-card"
      style={{
        position: "relative",
        borderRadius: "0",
        border: "1.5px solid var(--color-border)",
        backgroundColor: "var(--color-background)",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link
        to={`/product/${product.slug || product._id || product.id}`}
        style={{
          display: "block",
          textDecoration: "none",
          color: "inherit",
          marginBottom: 0,
          lineHeight: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "3/4",
            overflow: "hidden",
            borderRadius: "0",
            backgroundColor: "var(--color-muted)",
            marginBottom: 0,
            paddingBottom: 0,
            lineHeight: 0,
            verticalAlign: "top",
          }}
        >
          <img
            src={
              product.images?.[0]?.url ||
              product.images?.[0] ||
              "https://via.placeholder.com/400x500?text=No+Image"
            }
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "all 0.7s",
              opacity: hovered ? 0 : 1,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
          />
          <img
            src={
              product.images?.[1]?.url ||
              product.images?.[0]?.url ||
              product.images?.[1] ||
              product.images?.[0] ||
              "https://via.placeholder.com/400x500?text=No+Image"
            }
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "all 0.7s",
              opacity: hovered ? 1 : 0,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            loading="lazy"
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: hovered ? "rgba(0,0,0,0.04)" : "transparent",
              transition: "background 0.5s",
            }}
          />

          {(badge || product.newArrival) && (
            <span
              className="label-caps"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "rgba(24,23,20,0.88)",
                backdropFilter: "blur(4px)",
                color: "var(--color-background)",
                padding: "5px 9px",
                borderRadius: "4px",
                fontSize: "9px",
                fontWeight: 700,
                zIndex: 10,
              }}
            >
              {badge ?? "New"}
            </span>
          )}

          {onSale && (
            <span
              className="label-caps"
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
                backgroundColor: "var(--color-gold)",
                color: "white",
                padding: "5px 9px",
                borderRadius: "4px",
                fontSize: "9px",
                fontWeight: 700,
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              Sale
            </span>
          )}
        </div>
      </Link>

      {/* Wishlist */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWish(product.id || product._id);
          push({
            type: "success",
            message: wished ? "Removed from wishlist" : "Added to wishlist",
          });
        }}
        aria-label="Wishlist"
        className={`product-card-wishlist ${wished ? "is-wished" : ""}`}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.4s",
          zIndex: 30,
          cursor: "pointer",
          backgroundColor: wished
            ? "var(--color-destructive)"
            : "rgba(255,255,255,0.95)",
          color: wished ? "white" : "var(--color-foreground)",
          transform: wished ? "scale(1.1)" : "scale(1)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
        }}
      >
        <Heart
          size={14}
          style={{ fill: wished ? "white" : "none" }}
          strokeWidth={2}
        />
      </button>

      {/* Info */}
      <div style={{ padding: "14px 14px 16px", marginTop: 0, lineHeight: 1.2 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              className="label-caps"
              style={{
                fontSize: "9px",
                color: "var(--color-gold)",
                fontWeight: 700,
                letterSpacing: "0.18em",
              }}
            >
              {product.category}
            </p>
            <Link
              to={`/product/${product.slug || product._id || product.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "0.95rem",
                  marginTop: "5px",
                  transition: "color 0.3s",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.color = "var(--color-gold)")
                }
                onMouseLeave={(e) => (e.target.style.color = "")}
              >
                {product.name}
              </h3>
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              flexShrink: 0,
            }}
          >
            {onSale ? (
              <>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "var(--color-gold)",
                  }}
                >
                  ₹{product.salePrice.toLocaleString("en-IN")}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--color-muted-foreground)",
                    textDecoration: "line-through",
                    opacity: 0.6,
                  }}
                >
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
              </>
            ) : (
              <span style={{ fontWeight: 700, fontSize: "13px" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

        <p
          style={{
            fontSize: "10px",
            color: "var(--color-muted-foreground)",
            marginTop: "4px",
            opacity: 0.7,
            fontStyle: "italic",
          }}
        >
          {product.fabric}
        </p>
      </div>

      <style>{`
        .product-card-wishlist {
          opacity: 1;
        }
        .product-card-wishlist.is-wished {
          background-color: var(--color-destructive) !important;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
