import { useState, useRef, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ChevronRight,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  MessageCircle,
  X,
  ZoomIn,
  Heart,
  Share2,
  Check,
} from "lucide-react";
import { whatsappProductUrl } from "../lib/products.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { useCart, useToasts, useWishlist } from "../lib/store.js";
import { useShop } from "../context/ShopContext.jsx";
import { productApi } from "../lib/api.js";

/* ── Star Rating Display ── */
function Stars({ rating, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", gap: "2px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          style={{
            fill: i < Math.round(rating) ? "var(--color-gold)" : "none",
            color:
              i < Math.round(rating)
                ? "var(--color-gold)"
                : "color-mix(in oklch, var(--color-foreground) 25%, transparent)",
          }}
        />
      ))}
    </span>
  );
}

/* ── Interactive Star Picker ── */
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <span style={{ display: "inline-flex", gap: "4px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i + 1)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i + 1)}
          style={{
            cursor: "pointer",
            background: "none",
            border: "none",
            padding: "2px",
            transition: "transform 0.15s",
            transform: hover > i || value > i ? "scale(1.15)" : "scale(1)",
          }}
        >
          <Star
            size={24}
            style={{
              fill: (hover || value) > i ? "var(--color-gold)" : "none",
              color:
                (hover || value) > i
                  ? "var(--color-gold)"
                  : "var(--color-border)",
              transition: "all 0.15s",
            }}
          />
        </button>
      ))}
    </span>
  );
}

/* ── Qty Stepper ── */
function QtyStepper({ value, onChange, min = 1, max = 10 }) {
  return (
    <div
      className="qty-stepper"
      style={{
        display: "inline-flex",
        alignItems: "center",
        border: "1.5px solid var(--color-border)",
        borderRadius: "10px",
        overflow: "hidden",
        height: "44px",
      }}
    >
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{
          width: "44px",
          height: "100%",
          fontSize: "18px",
          cursor: value > min ? "pointer" : "not-allowed",
          opacity: value <= min ? 0.35 : 1,
          background: "none",
          border: "none",
          color: "var(--color-foreground)",
          transition: "background 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          if (value > min)
            e.currentTarget.style.backgroundColor = "var(--color-surface)";
        }}
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        −
      </button>
      <span
        style={{
          minWidth: "40px",
          textAlign: "center",
          fontSize: "14px",
          fontWeight: 600,
          borderLeft: "1.5px solid var(--color-border)",
          borderRight: "1.5px solid var(--color-border)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        style={{
          width: "44px",
          height: "100%",
          fontSize: "18px",
          cursor: value < max ? "pointer" : "not-allowed",
          opacity: value >= max ? 0.35 : 1,
          background: "none",
          border: "none",
          color: "var(--color-foreground)",
          transition: "background 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          if (value < max)
            e.currentTarget.style.backgroundColor = "var(--color-surface)";
        }}
        onMouseLeave={(e) =>
          (e.currentTarget.style.backgroundColor = "transparent")
        }
      >
        +
      </button>
    </div>
  );
}

/* ── Accordion Item ── */
function AccordionItem({ title, children, open, onToggle }) {
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (bodyRef.current) setHeight(open ? bodyRef.current.scrollHeight : 0);
  }, [open, children]);

  return (
    <div style={{ borderBottom: "1px solid var(--color-border)" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-foreground)",
          fontFamily: "inherit",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
            backgroundColor: open ? "var(--color-foreground)" : "transparent",
            flexShrink: 0,
          }}
        >
          <ChevronDown
            size={11}
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.3s",
              color: open
                ? "var(--color-background)"
                : "var(--color-foreground)",
            }}
          />
        </div>
      </button>
      <div
        style={{
          overflow: "hidden",
          height: `${height}px`,
          transition: "height 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div ref={bodyRef} style={{ paddingBottom: "20px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

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
        zIndex: 300,
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
        <div style={{ padding: "12px 24px 32px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Image Zoom Lightbox ── */
function Lightbox({ src, alt, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        backgroundColor: "rgba(0,0,0,0.92)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s ease",
        cursor: "zoom-out",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          backgroundColor: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "white",
        }}
      >
        <X size={18} />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          objectFit: "contain",
          borderRadius: "8px",
          animation: "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)",
          cursor: "default",
        }}
      />
    </div>
  );
}

/* ── Trust Badge ── */
function TrustBadge({ icon: Icon, title, sub }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        padding: "16px 12px",
        borderRadius: "12px",
        border: "1px solid var(--color-border)",
        textAlign: "center",
        transition: "border-color 0.2s, background 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-gold)";
        e.currentTarget.style.backgroundColor =
          "color-mix(in oklch, var(--color-gold) 5%, transparent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor:
            "color-mix(in oklch, var(--color-gold) 12%, transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon
          size={16}
          style={{ color: "var(--color-gold)" }}
          strokeWidth={1.8}
        />
      </div>
      <div>
        <p
          style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em" }}
        >
          {title}
        </p>
        <p
          style={{
            fontSize: "10px",
            color: "var(--color-muted-foreground)",
            marginTop: "2px",
            lineHeight: 1.4,
          }}
        >
          {sub}
        </p>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { products, loading: shopLoading } = useShop();
  const product = products.find(p => p.slug === slug || p._id === slug);
  
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState("details");
  const [reviewModal, setReviewModal] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [unit, setUnit] = useState("cm");
  const [lightbox, setLightbox] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [wishlisted, setWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);

  const add = useCart((s) => s.add);
  const push = useToasts((s) => s.push);

  useEffect(() => {
    if (product) {
      setColor(product.colors?.[0]?.name || product.colors?.[0] || "");
    }
  }, [product]);

  if (shopLoading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;
  if (!product) return <Navigate to="/not-found" replace />;

  const price = product.salePrice ?? product.price;
  const discount = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : null;
  const related = products
    .filter(
      (p) => p._id !== product._id && (p.categorySlug === product.categorySlug || p.category === product.category),
    )
    .slice(0, 4);

  const handleAdd = () => {
    if (!size) {
      setError("Please select a size to continue");
      return;
    }
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price,
      size,
      color,
      qty,
    });
    setAddedAnim(true);
    push({ type: "success", message: "Added to cart" });
    setTimeout(() => setAddedAnim(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reviews = [
    {
      name: "Karthik R.",
      date: "12 Mar 2025",
      rating: 5,
      text: "Outstanding quality. The fabric weight is perfect and the cut is beautifully considered. Exactly what I wanted.",
      helpful: 24,
      verified: true,
    },
    {
      name: "Aditya P.",
      date: "28 Feb 2025",
      rating: 5,
      text: "Worth every rupee. Packaging arrived like a gift and the fit is true to size. Will order again.",
      helpful: 18,
      verified: true,
    },
    {
      name: "Devansh M.",
      date: "14 Feb 2025",
      rating: 4,
      text: "Lovely piece. Knocked off a star only because shipping took 6 days, but the product itself is faultless.",
      helpful: 11,
      verified: false,
    },
  ];
  const dist = [76, 14, 6, 3, 1];

  return (
    <div
      className="pdp-root page-transition"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "16px 20px 100px",
      }}
    >
      {/* Breadcrumb */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "11px",
          color: "var(--color-muted-foreground)",
          letterSpacing: "0.04em",
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            color: "inherit",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.target.style.color = "var(--color-foreground)")
          }
          onMouseLeave={(e) =>
            (e.target.style.color = "var(--color-muted-foreground)")
          }
        >
          Home
        </Link>
        <ChevronRight size={11} />
        <Link
          to={`/collections/${product.categorySlug || 't-shirts'}`}
          style={{
            textDecoration: "none",
            color: "inherit",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.target.style.color = "var(--color-foreground)")
          }
          onMouseLeave={(e) =>
            (e.target.style.color = "var(--color-muted-foreground)")
          }
        >
          {product.category}
        </Link>
        <ChevronRight size={11} />
        <span style={{ color: "var(--color-foreground)", fontWeight: 600 }}>
          {product.name}
        </span>
      </nav>

      {/* Main Grid */}
      <div
        style={{ marginTop: "24px", display: "grid", gap: "56px" }}
        className="pdp-grid"
      >
        {/* ── Gallery ── */}
        <div>
          {/* Main Image */}
          <div
            style={{
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "var(--color-muted)",
            }}
          >
            <div
              style={{
                aspectRatio: "4/5",
                overflow: "hidden",
                cursor: "zoom-in",
              }}
              onClick={() => setLightbox(true)}
            >
              <img
                src={product.images?.[imgIdx]?.url || product.images?.[imgIdx]}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.6s cubic-bezier(0.16,1,0.3,1)",
                }}
                className="pdp-main-img"
              />
            </div>
            {/* Zoom hint */}
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backgroundColor: "rgba(0,0,0,0.5)",
                color: "white",
                padding: "6px 12px",
                borderRadius: "50px",
                fontSize: "11px",
                fontWeight: 500,
                backdropFilter: "blur(8px)",
                pointerEvents: "none",
                opacity: 0.85,
              }}
            >
              <ZoomIn size={12} /> Zoom
            </div>
            {/* Discount badge */}
            {discount && (
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  backgroundColor: "var(--color-gold)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "50px",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                −{discount}%
              </div>
            )}
            {/* Wishlist */}
            <button
              onClick={() => setWishlisted((w) => !w)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
                transform: wishlisted ? "scale(1.15)" : "scale(1)",
              }}
            >
              <Heart
                size={16}
                style={{
                  fill: wishlisted ? "#e53e3e" : "none",
                  color: wishlisted ? "#e53e3e" : "#666",
                  transition: "all 0.2s",
                }}
              />
            </button>
          </div>

          {/* Thumbnails */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${product.images.length}, 1fr)`,
              gap: "10px",
              marginTop: "12px",
            }}
          >
            {product.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                style={{
                  aspectRatio: "1/1",
                  borderRadius: "10px",
                  overflow: "hidden",
                  border: `2px solid ${i === imgIdx ? "var(--color-foreground)" : "transparent"}`,
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  opacity: i === imgIdx ? 1 : 0.6,
                  transform: i === imgIdx ? "scale(1)" : "scale(0.97)",
                }}
                onMouseEnter={(e) => {
                  if (i !== imgIdx) {
                    e.currentTarget.style.opacity = "0.9";
                    e.currentTarget.style.transform = "scale(1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (i !== imgIdx) {
                    e.currentTarget.style.opacity = "0.6";
                    e.currentTarget.style.transform = "scale(0.97)";
                  }
                }}
              >
                <img
                  src={src?.url || src}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Product Info ── */}
        <div style={{ position: "sticky", top: "80px", alignSelf: "start" }}>
          {/* Category + Share */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-gold)",
              }}
            >
              {product.category}
            </span>
            <button
              onClick={handleShare}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-muted-foreground)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-foreground)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-muted-foreground)")
              }
            >
              {copied ? <Check size={13} /> : <Share2 size={13} />}
              {copied ? "Copied!" : "Share"}
            </button>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.75rem, 4vw, 2.4rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginTop: "8px",
            }}
          >
            {product.name}
          </h1>

          {/* Rating */}
          <a
            href="#reviews"
            style={{
              marginTop: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Stars rating={product.rating} />
            <span style={{ fontWeight: 600 }}>{product.rating}</span>
            <span style={{ color: "var(--color-muted-foreground)" }}>
              ({product.reviewCount} reviews)
            </span>
          </a>

          {/* Price */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2rem",
                fontWeight: 600,
              }}
            >
              ₹{price.toLocaleString("en-IN")}
            </span>
            {product.salePrice && (
              <>
                <span
                  style={{
                    fontSize: "15px",
                    color: "var(--color-muted-foreground)",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "var(--color-gold)",
                    backgroundColor:
                      "color-mix(in oklch, var(--color-gold) 10%, transparent)",
                    padding: "3px 8px",
                    borderRadius: "50px",
                  }}
                >
                  SAVE {discount}%
                </span>
              </>
            )}
          </div>
          <p
            style={{
              fontSize: "11px",
              color: "var(--color-muted-foreground)",
              marginTop: "4px",
            }}
          >
            Incl. of all taxes
          </p>

          {/* Description */}
          <p
            style={{
              marginTop: "16px",
              color: "var(--color-muted-foreground)",
              lineHeight: 1.7,
              fontSize: "14px",
              borderLeft: "2px solid var(--color-gold)",
              paddingLeft: "14px",
            }}
          >
            {product.description}
          </p>

          {/* Divider */}
          <div
            style={{
              height: "1px",
              backgroundColor: "var(--color-border)",
              margin: "24px 0",
            }}
          />

          {/* Size Selector */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Size{" "}
                {size && (
                  <span
                    style={{ color: "var(--color-gold)", marginLeft: "6px" }}
                  >
                    — {size}
                  </span>
                )}
              </span>
              <button
                onClick={() => setSizeGuide(true)}
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-muted-foreground)",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-foreground)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    "var(--color-muted-foreground)")
                }
              >
                Size Guide
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {product.sizes.map((s) => {
                const active = size === s;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setSize(s);
                      setError("");
                    }}
                    style={{
                      minWidth: "48px",
                      height: "44px",
                      padding: "0 14px",
                      borderRadius: "10px",
                      border: `1.5px solid ${active ? "var(--color-foreground)" : "var(--color-border)"}`,
                      backgroundColor: active
                        ? "var(--color-foreground)"
                        : "transparent",
                      color: active
                        ? "var(--color-background)"
                        : "var(--color-foreground)",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontFamily: "inherit",
                      transform: active ? "scale(1.04)" : "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.borderColor =
                          "var(--color-foreground)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        e.currentTarget.style.borderColor =
                          "var(--color-border)";
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            {error && (
              <p
                style={{
                  color: "var(--color-destructive)",
                  fontSize: "12px",
                  marginTop: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                ⚠ {error}
              </p>
            )}
          </div>

          {/* Color Selector */}
          <div style={{ marginTop: "24px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              Color —{" "}
              <span
                style={{
                  color: "var(--color-muted-foreground)",
                  textTransform: "none",
                  fontWeight: 500,
                  letterSpacing: "0",
                }}
              >
                {color}
              </span>
            </p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {product.colors.map((c) => {
                const isLight = ["#F5F5F0", "#FFFFF0", "#C8B99A"].includes(
                  c.hex,
                );
                const active = color === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    title={c.name}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      backgroundColor: c.hex,
                      border: isLight
                        ? "1.5px solid var(--color-border)"
                        : "1.5px solid transparent",
                      outline: active
                        ? "2.5px solid var(--color-foreground)"
                        : "2px solid transparent",
                      outlineOffset: "2px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      transform: active ? "scale(1.18)" : "scale(1)",
                      boxShadow: active ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!active)
                        e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Qty row — stepper always visible; Add to Cart + WhatsApp hidden on mobile (sticky bar handles them) */}
          <div
            style={{
              marginTop: "28px",
              display: "flex",
              gap: "12px",
              alignItems: "stretch",
              flexWrap: "wrap",
            }}
          >
            <QtyStepper value={qty} onChange={setQty} />
            <button
              className="pdp-desktop-action"
              onClick={handleAdd}
              style={{
                flex: 1,
                minWidth: "160px",
                height: "44px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: addedAnim
                  ? "var(--color-gold)"
                  : "var(--color-foreground)",
                color: "var(--color-background)",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!addedAnim) e.currentTarget.style.opacity = "0.88";
              }}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {addedAnim ? (
                <>
                  <Check size={15} strokeWidth={2.5} /> Added!
                </>
              ) : (
                "Add to Cart"
              )}
            </button>
          </div>

          {/* WhatsApp — hidden on mobile, sticky bar handles it */}
          <a
            className="pdp-desktop-action"
            href={whatsappProductUrl(
              product,
              size ?? product.sizes[0],
              color,
              qty,
            )}
            target="_blank"
            rel="noreferrer"
            style={{
              marginTop: "10px",
              width: "100%",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "var(--color-whatsapp)",
              color: "white",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <MessageCircle size={15} strokeWidth={2} /> Order via WhatsApp
          </a>

          {/* Trust Badges */}
          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
            }}
          >
            <TrustBadge
              icon={Truck}
              title="Free Delivery"
              sub="Orders over ₹2,999"
            />
            <TrustBadge
              icon={RotateCcw}
              title="30-Day Returns"
              sub="Hassle-free returns"
            />
            <TrustBadge
              icon={ShieldCheck}
              title="Authentic"
              sub="100% guaranteed"
            />
          </div>

          {/* Accordion */}
          <div
            style={{
              marginTop: "28px",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            {[
              {
                id: "details",
                title: "Product Details",
                content: (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    {[
                      ["Fabric", product.fabric],
                      ["Fit", "Contemporary Relaxed"],
                      ["Care", "Cold Machine Wash"],
                      ["Origin", "Made in India"],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          backgroundColor: "var(--color-surface)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "10px",
                            color: "var(--color-muted-foreground)",
                            marginBottom: "2px",
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                          }}
                        >
                          {k}
                        </p>
                        <p style={{ fontSize: "13px", fontWeight: 500 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                id: "fit",
                title: "Size & Fit",
                content: (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--color-muted-foreground)",
                      lineHeight: 1.7,
                    }}
                  >
                    Model is 6'1" wearing size M. Chest 38" / Waist 32". For a
                    relaxed fit, size up one. Refer to the size guide for full
                    measurements.
                  </p>
                ),
              },
              {
                id: "ship",
                title: "Shipping & Returns",
                content: (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--color-muted-foreground)",
                      lineHeight: 1.7,
                    }}
                  >
                    Standard delivery in 3–5 business days. Free shipping on
                    orders over ₹2,999. Easy returns within 30 days in original,
                    unworn condition with tags attached.
                  </p>
                ),
              },
            ].map((s) => (
              <AccordionItem
                key={s.id}
                title={s.title}
                open={openSection === s.id}
                onToggle={() =>
                  setOpenSection(openSection === s.id ? null : s.id)
                }
              >
                {s.content}
              </AccordionItem>
            ))}
          </div>
        </div>
      </div>

      {/* ── Related Products ── */}
      <section style={{ marginTop: "96px" }} className="pdp-related-section">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "32px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
            }}
          >
            You Might Also Like
          </h2>
          <Link
            to={`/collections/${product.categorySlug}`}
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              textDecoration: "none",
              color: "var(--color-muted-foreground)",
              borderBottom: "1px solid var(--color-border)",
              paddingBottom: "2px",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-foreground)";
              e.currentTarget.style.borderColor = "var(--color-foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--color-muted-foreground)";
              e.currentTarget.style.borderColor = "var(--color-border)";
            }}
          >
            View All →
          </Link>
        </div>
        <div
          style={{ display: "grid", gap: "24px" }}
          className="pdp-related-grid"
        >
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" style={{ marginTop: "96px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "40px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
            }}
          >
            Customer Reviews
          </h2>
          <button
            onClick={() => setReviewModal(true)}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1.5px solid var(--color-foreground)",
              background: "transparent",
              color: "var(--color-foreground)",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-foreground)";
              e.currentTarget.style.color = "var(--color-background)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-foreground)";
            }}
          >
            Write a Review
          </button>
        </div>

        <div
          style={{ display: "grid", gap: "48px" }}
          className="pdp-reviews-grid"
        >
          {/* Summary */}
          <div
            style={{
              padding: "28px",
              borderRadius: "16px",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-surface)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "4rem",
                  fontWeight: 600,
                  lineHeight: 1,
                }}
              >
                {product.rating}
              </span>
              <div>
                <Stars rating={product.rating} size={18} />
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--color-muted-foreground)",
                    marginTop: "4px",
                  }}
                >
                  {product.reviewCount} verified reviews
                </p>
              </div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {dist.map((pct, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "12px",
                  }}
                >
                  <span
                    style={{
                      width: "24px",
                      textAlign: "right",
                      fontWeight: 600,
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    {5 - i}★
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "6px",
                      backgroundColor: "var(--color-border)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        backgroundColor: "var(--color-gold)",
                        width: `${pct}%`,
                        borderRadius: "3px",
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: "32px",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review List */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {reviews.map((r, i) => (
              <div
                key={i}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "14px",
                  padding: "20px",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-gold)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <p style={{ fontWeight: 700, fontSize: "14px" }}>
                        {r.name}
                      </p>
                      {r.verified && (
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            color: "#16a34a",
                            backgroundColor: "#dcfce7",
                            padding: "2px 7px",
                            borderRadius: "50px",
                          }}
                        >
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <Stars rating={r.rating} size={12} />
                  </div>
                  <p
                    style={{
                      fontSize: "11px",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    {r.date}
                  </p>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    marginTop: "12px",
                    color: "var(--color-muted-foreground)",
                    lineHeight: 1.7,
                  }}
                >
                  {r.text}
                </p>
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <button
                    style={{
                      fontSize: "11px",
                      color: "var(--color-muted-foreground)",
                      background: "none",
                      border: "1px solid var(--color-border)",
                      borderRadius: "50px",
                      padding: "4px 12px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        "var(--color-foreground)";
                      e.currentTarget.style.color = "var(--color-foreground)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.color =
                        "var(--color-muted-foreground)";
                    }}
                  >
                    👍 Helpful · {r.helpful}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mobile Sticky Bar ── */}
      <div
        className="pdp-mobile-bar"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          padding: "12px 16px",
          backgroundColor: "var(--color-background)",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: "10px",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={handleAdd}
          style={{
            flex: 1,
            height: "48px",
            backgroundColor: addedAnim
              ? "var(--color-gold)"
              : "var(--color-foreground)",
            color: "var(--color-background)",
            borderRadius: "10px",
            border: "none",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "background-color 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
          }}
        >
          {addedAnim ? (
            <>
              <Check size={15} /> Added!
            </>
          ) : (
            "Add to Cart"
          )}
        </button>
        <a
          href={whatsappProductUrl(
            product,
            size ?? product.sizes[0],
            color,
            qty,
          )}
          target="_blank"
          rel="noreferrer"
          style={{
            flex: 1,
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            backgroundColor: "var(--color-whatsapp)",
            color: "white",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          <MessageCircle size={15} /> WhatsApp
        </a>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <Lightbox
          src={product.images[imgIdx]}
          alt={product.name}
          onClose={() => setLightbox(false)}
        />
      )}

      {/* ── Review Modal ── */}
      <Modal open={reviewModal} onClose={() => setReviewModal(false)}>
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.4rem",
            marginBottom: "20px",
            marginTop: "4px",
          }}
        >
          Write a Review
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            push({ type: "success", message: "Thank you for your review!" });
            setReviewModal(false);
          }}
          style={{ display: "flex", flexDirection: "column", gap: "14px" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Name
              </label>
              <input
                required
                placeholder="Your name"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "var(--color-foreground)",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-foreground)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Email
              </label>
              <input
                required
                type="email"
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1.5px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "13px",
                  color: "var(--color-foreground)",
                  fontFamily: "inherit",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-foreground)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Rating
            </label>
            <StarPicker value={reviewRating} onChange={setReviewRating} />
          </div>
          <div>
            <label
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Your Review
            </label>
            <textarea
              required
              placeholder="Tell others about your experience with this product..."
              rows={4}
              style={{
                width: "100%",
                background: "transparent",
                border: "1.5px solid var(--color-border)",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "13px",
                color: "var(--color-foreground)",
                fontFamily: "inherit",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: 1.6,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-foreground)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </div>
          <button
            style={{
              backgroundColor: "var(--color-foreground)",
              color: "var(--color-background)",
              padding: "14px",
              borderRadius: "10px",
              border: "none",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Submit Review
          </button>
        </form>
      </Modal>

      {/* ── Size Guide Modal ── */}
      <Modal
        open={sizeGuide}
        onClose={() => setSizeGuide(false)}
        maxWidth="640px"
      >
        <h3
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.4rem",
            marginBottom: "20px",
            marginTop: "4px",
          }}
        >
          Size Guide
        </h3>
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["cm", "in"].map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              style={{
                padding: "7px 20px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                border: `1.5px solid ${unit === u ? "var(--color-foreground)" : "var(--color-border)"}`,
                backgroundColor:
                  unit === u ? "var(--color-foreground)" : "transparent",
                color:
                  unit === u
                    ? "var(--color-background)"
                    : "var(--color-foreground)",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              {u === "cm" ? "Centimetres" : "Inches"}
            </button>
          ))}
        </div>
        <div
          style={{
            overflowX: "auto",
            borderRadius: "10px",
            border: "1px solid var(--color-border)",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              fontSize: "13px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "var(--color-surface)" }}>
                {["Size", "Chest", "Waist", "Hip", "Shoulder"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["XS", 86, 71, 89, 41],
                ["S", 91, 76, 94, 43],
                ["M", 96, 81, 99, 45],
                ["L", 101, 86, 104, 47],
                ["XL", 106, 91, 109, 49],
                ["XXL", 111, 96, 114, 51],
              ].map(([s, c, w, h, sh], i) => {
                const conv = (v) => (unit === "cm" ? v : Math.round(v / 2.54));
                const isSelected = size === s;
                return (
                  <tr
                    key={s}
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      backgroundColor: isSelected
                        ? "color-mix(in oklch, var(--color-gold) 8%, transparent)"
                        : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                      {s}
                      {isSelected && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "9px",
                            color: "var(--color-gold)",
                            fontWeight: 700,
                          }}
                        >
                          SELECTED
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px" }}>{conv(c)}</td>
                    <td style={{ padding: "12px 16px" }}>{conv(w)}</td>
                    <td style={{ padding: "12px 16px" }}>{conv(h)}</td>
                    <td style={{ padding: "12px 16px" }}>{conv(sh)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-muted-foreground)",
            marginTop: "14px",
            lineHeight: 1.6,
          }}
        >
          Measurements taken with garment laid flat. For best fit, compare
          against a garment you already own.
        </p>
      </Modal>

      <style>{`
        .pdp-root { }
        .pdp-grid { grid-template-columns: 1fr; }
        .pdp-related-grid { grid-template-columns: repeat(2, 1fr); }
        .pdp-reviews-grid { grid-template-columns: 1fr; }
        .pdp-mobile-bar { display: flex !important; }
        .pdp-main-img:hover { transform: scale(1.06); }

        /* Add to Cart btn + WhatsApp link hidden on mobile — sticky bar handles them */
        .pdp-desktop-action { display: none !important; }

        @media (min-width: 768px) {
          .pdp-related-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (min-width: 1024px) {
          .pdp-grid { grid-template-columns: 1.15fr 1fr !important; }
          .pdp-related-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .pdp-reviews-grid { grid-template-columns: 300px 1fr !important; }
          .pdp-mobile-bar { display: none !important; }

          /* Show Add to Cart + WhatsApp on desktop */
          .pdp-desktop-action { display: flex !important; }

          /* Related cards: constrain image so 4-col doesn't get giant tall cards */
          .pdp-related-section .pdp-related-grid > * [style*="aspect-ratio"] {
            aspect-ratio: 3/4 !important;
          }
          .pdp-related-section .pdp-related-grid > * img {
            max-height: 280px;
            object-fit: cover;
          }
          /* Cap the whole section width so 4 small cards don't stretch to 1400px */
          .pdp-related-section {
            max-width: 960px;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
