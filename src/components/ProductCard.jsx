import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart, useToasts, useWishlist } from "../lib/store.js";
import { useState } from "react";

export function ProductCard({ product, badge }) {
  const wished = useWishlist((s) => s.ids.includes(product.id));
  const toggleWish = useWishlist((s) => s.toggle);
  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);
  const onSale = !!product.salePrice;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="product-card-container"
      style={{
        position: "relative",
        transition: "transform 0.5s",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={`/product/${product.slug}`}
        style={{ display: "block", textDecoration: "none", color: "inherit" }}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "3/4",
            overflow: "hidden",
            borderRadius: "12px",
            backgroundColor: "var(--color-muted)",
            boxShadow: hovered
              ? "0 20px 40px rgba(0,0,0,0.15)"
              : "0 2px 8px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.5s",
          }}
        >
          <img
            src={product.images[0]}
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
            src={product.images[1] || product.images[0]}
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
              backgroundColor: hovered ? "rgba(0,0,0,0.05)" : "transparent",
              transition: "background 0.5s",
            }}
          />

          {(badge || product.isNew) && (
            <span
              className="label-caps"
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                backgroundColor: "rgba(24,23,20,0.9)",
                backdropFilter: "blur(4px)",
                color: "var(--color-background)",
                padding: "6px 10px",
                borderRadius: "50px",
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
                bottom: "12px",
                left: "12px",
                backgroundColor: "var(--color-gold)",
                color: "white",
                padding: "6px 10px",
                borderRadius: "50px",
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

      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWish(product.id);
          push({
            type: "success",
            message: wished ? "Removed from wishlist" : "Added to wishlist",
          });
        }}
        aria-label="Wishlist"
        className={`product-card-wishlist ${wished ? "is-wished" : ""}`}
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.5s",
          zIndex: 30,
          cursor: "pointer",
          backgroundColor: wished
            ? "var(--color-destructive)"
            : "rgba(255,255,255,0.95)",
          color: wished ? "white" : "var(--color-foreground)",
          transform: wished ? "scale(1.1)" : "scale(1)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Heart
          size={15}
          style={{ fill: wished ? "white" : "none" }}
          strokeWidth={2}
        />
      </button>

      <div style={{ paddingTop: "20px", paddingBottom: "8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "8px",
          }}
        >
          <div>
            <p
              className="label-caps"
              style={{
                fontSize: "10px",
                color: "var(--color-gold)",
                fontWeight: 700,
                letterSpacing: "0.18em",
              }}
            >
              {product.category}
            </p>

            <Link
              to={`/product/${product.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1rem",
                  marginTop: "6px",
                  transition: "color 0.3s",
                  cursor: "pointer",
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
            }}
          >
            {onSale ? (
              <>
                <span style={{ fontWeight: 700, color: "var(--color-gold)" }}>
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
              <span style={{ fontWeight: 700 }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

        <p
          style={{
            fontSize: "11px",
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
          transform: translateY(0);
          background-color: rgba(255,255,255,0.95);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .product-card-wishlist.is-wished {
          background-color: var(--color-destructive) !important;
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
