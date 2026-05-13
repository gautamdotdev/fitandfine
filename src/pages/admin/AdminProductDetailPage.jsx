import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { productApi } from "../../lib/api";
import { useToasts } from "../../lib/store";
import {
    Edit2, Trash2, ArrowLeft, Star, Truck, RotateCcw,
    ShieldCheck, ChevronDown, ZoomIn, X, AlertTriangle,
    Package,
} from "lucide-react";

const STYLES = `
  .apdp-page {
    font-family: 'DM Sans', sans-serif;
    max-width: 1400px;
    margin: 0 auto;
    padding: 12px 0 80px;
  }

  /* Action bar */
  .apdp-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .apdp-back-btn {
    display: flex; align-items: center; gap: 7px;
    background: none; border: 1.5px solid #e8e6e0;
    border-radius: 2px; padding: 9px 16px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif;
    color: #444; transition: all 0.15s;
  }
  .apdp-back-btn:hover { border-color: #1a1a1a; color: #1a1a1a; }

  .apdp-edit-btn {
    display: flex; align-items: center; gap: 7px;
    background: #7c3aed; color: #fff;
    padding: 10px 20px; border-radius: 2px;
    font-weight: 700; cursor: pointer; border: none;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s; box-shadow: 0 4px 12px rgba(124,58,237,0.3);
  }
  .apdp-edit-btn:hover { background: #6d28d9; transform: translateY(-1px); }

  .apdp-delete-btn {
    display: flex; align-items: center; gap: 7px;
    background: transparent; color: #ef4444;
    padding: 10px 20px; border-radius: 2px;
    font-weight: 700; cursor: pointer;
    border: 1.5px solid #fecaca;
    font-size: 13.5px; font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
  }
  .apdp-delete-btn:hover { background: #fef2f2; border-color: #ef4444; }

  /* Product grid */
  .apdp-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 48px;
    margin-top: 16px;
  }
  @media (min-width: 1024px) {
    .apdp-grid { grid-template-columns: 1.15fr 1fr; }
  }

  /* Gallery */
  .apdp-main-img { transition: transform 0.6s cubic-bezier(0.16,1,0.3,1); }
  .apdp-main-img:hover { transform: scale(1.04); }

  /* Thumbnails */
  .apdp-thumbs {
    display: flex; gap: 10px; overflow-x: auto;
    padding-bottom: 8px; scrollbar-width: none;
    width: 100%; box-sizing: border-box;
    margin-top: 12px;
  }
  .apdp-thumbs::-webkit-scrollbar { display: none; }

  /* Info panel */
  .apdp-info { min-width: 0; }
  @media (min-width: 1024px) {
    .apdp-info { position: sticky; top: 80px; align-self: start; }
  }

  /* Size badges (read-only) */
  .apdp-size-badge {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 48px; height: 40px; padding: 0 14px;
    border-radius: 10px; border: 1.5px solid #e8e6e0;
    font-size: 13px; font-weight: 600;
    background: #faf9f7; color: #1a1a1a;
  }

  /* Color swatch (read-only) */
  .apdp-color-swatch {
    width: 32px; height: 32px; border-radius: 50%;
    border: 1.5px solid #e8e6e0;
    display: inline-flex; align-items: center; justify-content: center;
  }

  /* Trust badge */
  .apdp-trust-badge {
    display: flex; flex-direction: column;
    align-items: center; gap: 8px;
    padding: 14px 10px; border-radius: 12px;
    border: 1px solid #e8e6e0; text-align: center;
  }

  /* Accordion */
  .apdp-accordion-btn {
    width: 100%; display: flex; align-items: center;
    justify-content: space-between;
    padding: 18px 0; background: none; border: none;
    cursor: pointer; color: #1a1a1a; font-family: 'DM Sans', sans-serif;
    border-bottom: 1px solid #e8e6e0;
  }

  /* Confirm Modal */
  .apdp-backdrop {
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,0.45); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: apdpFadeIn 0.2s ease;
  }
  .apdp-modal {
    background: #fff; border-radius: 20px;
    padding: 28px; width: 100%; max-width: 400px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.18);
    animation: apdpModalIn 0.25s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes apdpFadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes apdpModalIn {
    from { opacity: 0; transform: scale(0.92) translateY(16px) }
    to { opacity: 1; transform: scale(1) translateY(0) }
  }
  @keyframes apdpSpin { to { transform: rotate(360deg) } }

  /* Mobile Bar */
  .apdp-mobile-bar {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 100;
    padding: 12px 16px;
    background: #fff;
    border-top: 1px solid #e8e6e0;
    gap: 10px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
  }

  @media (max-width: 1024px) {
    .apdp-mobile-bar { display: flex; }
    .apdp-action-bar { display: none; }
  }

  /* Lightbox */
  .apdp-lightbox {
    position: fixed; inset: 0; z-index: 400;
    background: rgba(0,0,0,0.92);
    display: flex; align-items: center; justify-content: center;
    animation: apdpFadeIn 0.2s ease; cursor: zoom-out;
  }
`;

/* ── Stars ── */
function Stars({ rating, size = 13 }) {
    return (
        <span style={{ display: "inline-flex", gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    style={{
                        fill: i < Math.round(rating) ? "#c9a84c" : "none",
                        color: i < Math.round(rating) ? "#c9a84c" : "#d0cdc6",
                    }}
                />
            ))}
        </span>
    );
}

/* ── Trust Badge ── */
function TrustBadge({ icon: Icon, title, sub }) {
    return (
        <div className="apdp-trust-badge">
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fdf8ec", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} style={{ color: "#c9a84c" }} strokeWidth={1.8} />
            </div>
            <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{title}</p>
                <p style={{ fontSize: 10, color: "#888", marginTop: 2, lineHeight: 1.4 }}>{sub}</p>
            </div>
        </div>
    );
}

/* ── Accordion ── */
function AccordionItem({ title, children, open, onToggle }) {
    const bodyRef = useRef(null);
    const [height, setHeight] = useState(0);
    useEffect(() => {
        if (bodyRef.current) setHeight(open ? bodyRef.current.scrollHeight : 0);
    }, [open, children]);
    return (
        <div>
            <button className="apdp-accordion-btn" onClick={onToggle}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</span>
                <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: "1px solid #e8e6e0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: open ? "#1a1a1a" : "transparent",
                    transition: "all 0.3s", flexShrink: 0,
                }}>
                    <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s", color: open ? "#fff" : "#1a1a1a" }} />
                </div>
            </button>
            <div style={{ overflow: "hidden", height: `${height}px`, transition: "height 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
                <div ref={bodyRef} style={{ paddingBottom: 20 }}>{children}</div>
            </div>
        </div>
    );
}

/* ── Confirm Delete Modal ── */
function ConfirmModal({ product, loading, onConfirm, onCancel }) {
    if (!product) return null;
    return (
        <div className="apdp-backdrop" onClick={onCancel}>
            <div className="apdp-modal" onClick={(e) => e.stopPropagation()}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "#fef2f2", border: "1.5px solid #fecaca", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <Trash2 size={20} color="#ef4444" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Delete Product?</h3>
                <p style={{ fontSize: 13, color: "#888", marginBottom: 20, lineHeight: 1.6 }}>
                    "<strong>{product.name}</strong>" will be permanently removed from your catalog. This cannot be undone.
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        style={{ flex: 1, padding: 11, borderRadius: 10, border: "1.5px solid #e8e6e0", background: "transparent", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        style={{ flex: 1.4, padding: 11, borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: loading ? 0.7 : 1 }}
                    >
                        {loading
                            ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "apdpSpin 0.7s linear infinite" }} />Deleting…</>
                            : <><Trash2 size={13} />Delete</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function AdminProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products } = useShop();
    const pushToast = useToasts((s) => s.push);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgIdx, setImgIdx] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [openSection, setOpenSection] = useState("details");
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const thumbnailRefs = useRef([]);

    useEffect(() => {
        const cached = products.find((p) => p._id === id || p.id === id);
        if (cached) {
            setProduct(cached);
            setLoading(false);
            return;
        }
        const fetch = async () => {
            try {
                const data = await productApi.getOne(id);
                setProduct(data.product || data.data || data);
            } catch (err) {
                pushToast({ title: "Error", message: "Product not found.", type: "error" });
                navigate("/admin/products");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id, products]);

    useEffect(() => {
        if (thumbnailRefs.current[imgIdx]) {
            thumbnailRefs.current[imgIdx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, [imgIdx]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await productApi.delete(id);
            pushToast({ title: "Deleted", message: "Product removed.", type: "success" });
            navigate("/admin/products");
        } catch (err) {
            pushToast({ title: "Error", message: err.message, type: "error" });
        } finally {
            setDeleting(false);
            setShowConfirm(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "80px 0", textAlign: "center", fontFamily: "'DM Sans', sans-serif", color: "#aaa" }}>
                <Package size={32} style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} />
                Loading product…
            </div>
        );
    }

    if (!product) return null;

    const price = product.salePrice ?? product.price;
    const discount = product.salePrice
        ? Math.round((1 - product.salePrice / product.price) * 100)
        : null;

    const images = product.images || [];

    return (
        <>
            <style>{STYLES}</style>

            <ConfirmModal
                product={showConfirm ? product : null}
                loading={deleting}
                onConfirm={handleDelete}
                onCancel={() => !deleting && setShowConfirm(false)}
            />

            {/* Lightbox */}
            {lightbox && (
                <div className="apdp-lightbox" onClick={() => setLightbox(false)}>
                    <button
                        onClick={() => setLightbox(false)}
                        style={{ position: "absolute", top: 20, right: 20, width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
                    >
                        <X size={18} />
                    </button>
                    <img
                        src={images[imgIdx]?.url || images[imgIdx]}
                        alt={product.name}
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain", cursor: "default", borderRadius: 8 }}
                    />
                </div>
            )}

            <div className="apdp-page">
                {/* ── Action Bar ── */}
                <div className="apdp-action-bar">
                    <button className="apdp-back-btn" onClick={() => navigate("/admin/products")}>
                        <ArrowLeft size={16} /> Back to Products
                    </button>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <button className="apdp-delete-btn" onClick={() => setShowConfirm(true)}>
                            <Trash2 size={15} /> Delete Product
                        </button>
                        <button className="apdp-edit-btn" onClick={() => navigate(`/admin/products/edit/${id}`)}>
                            <Edit2 size={15} /> Edit Product
                        </button>
                    </div>
                </div>

                {/* ── Product Grid ── */}
                <div className="apdp-grid">

                    {/* ── Gallery ── */}
                    <div style={{ minWidth: 0 }}>
                        <div style={{ position: "relative", borderRadius: 0, overflow: "hidden", background: "#f5f3ef" }}>
                            <div style={{ aspectRatio: "4/5", overflow: "hidden", cursor: "zoom-in" }} onClick={() => setLightbox(true)}>
                                <img
                                    className="apdp-main-img"
                                    src={images[imgIdx]?.url || images[imgIdx] || ""}
                                    alt={product.name}
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>
                            {/* Zoom hint */}
                            <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.5)", color: "white", padding: "6px 12px", borderRadius: 50, fontSize: 11, fontWeight: 500, backdropFilter: "blur(8px)", pointerEvents: "none" }}>
                                <ZoomIn size={12} /> Zoom
                            </div>
                            {/* Discount badge */}
                            {discount && (
                                <div style={{ position: "absolute", top: 16, left: 16, background: "#c9a84c", color: "white", padding: "4px 10px", borderRadius: 50, fontSize: 11, fontWeight: 700 }}>
                                    −{discount}%
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="apdp-thumbs">
                                {images.map((src, i) => (
                                    <button
                                        key={i}
                                        ref={(el) => (thumbnailRefs.current[i] = el)}
                                        onClick={() => setImgIdx(i)}
                                        style={{
                                            width: 72, height: 72, flexShrink: 0,
                                            overflow: "hidden", padding: 0, cursor: "pointer",
                                            border: `1.5px solid ${i === imgIdx ? "#1a1a1a" : "#e8e6e0"}`,
                                            borderRadius: 8,
                                            opacity: i === imgIdx ? 1 : 0.6,
                                            transition: "all 0.2s",
                                            background: "none",
                                        }}
                                    >
                                        <img src={src?.url || src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Info Panel ── */}
                    <div className="apdp-info">

                        {/* Category */}
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#c9a84c" }}>
                            {product.category}
                        </span>

                        {/* Name */}
                        <h1 style={{ fontFamily: "'DM Serif Display', 'Georgia', serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 400, margin: "8px 0 0", lineHeight: 1.25, color: "#1a1a1a" }}>
                            {product.name}
                        </h1>

                        {/* Rating */}
                        {product.rating && (
                            <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                                <Stars rating={product.rating} />
                                <span style={{ fontWeight: 600 }}>{product.rating}</span>
                                <span style={{ color: "#888" }}>({product.reviewCount || 0} reviews)</span>
                            </div>
                        )}

                        {/* Price */}
                        <div style={{ marginTop: 20, display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                            <span style={{ fontFamily: "'DM Serif Display', 'Georgia', serif", fontSize: "2rem", fontWeight: 600, color: "#1a1a1a" }}>
                                ₹{price?.toLocaleString("en-IN")}
                            </span>
                            {product.salePrice && (
                                <>
                                    <span style={{ fontSize: 15, color: "#aaa", textDecoration: "line-through" }}>
                                        ₹{product.price?.toLocaleString("en-IN")}
                                    </span>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: "#c9a84c", background: "#fdf8ec", padding: "3px 8px", borderRadius: 50, letterSpacing: "0.06em" }}>
                                        SAVE {discount}%
                                    </span>
                                </>
                            )}
                        </div>
                        <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>Incl. of all taxes</p>

                        {/* Stock indicator */}
                        <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 14px", borderRadius: 20, background: product.stock === 0 ? "#fef2f2" : product.stock <= 5 ? "#fff7ed" : "#ecfdf5", border: `1px solid ${product.stock === 0 ? "#fecaca" : product.stock <= 5 ? "#fed7aa" : "#a7f3d0"}` }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: product.stock === 0 ? "#ef4444" : product.stock <= 5 ? "#f59e0b" : "#10b981", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, fontWeight: 700, color: product.stock === 0 ? "#dc2626" : product.stock <= 5 ? "#d97706" : "#059669" }}>
                                {product.stock === 0 ? "Out of Stock" : `${product.stock?.toLocaleString()} units in stock`}
                            </span>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <p style={{ marginTop: 20, color: "#666", lineHeight: 1.7, fontSize: 13.5, borderLeft: "2px solid #c9a84c", paddingLeft: 14 }}>
                                {product.description}
                            </p>
                        )}

                        {/* Divider */}
                        <div style={{ height: 1, background: "#e8e6e0", margin: "24px 0" }} />

                        {/* Sizes (read-only) */}
                        {product.sizes?.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, color: "#1a1a1a" }}>
                                    Available Sizes
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                    {product.sizes.map((s) => (
                                        <span key={s} className="apdp-size-badge">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Colors (read-only) */}
                        {Array.isArray(product.colors) && product.colors.length > 0 && (
                            <div style={{ marginBottom: 20 }}>
                                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, color: "#1a1a1a" }}>
                                    Available Colors
                                </p>
                                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                                    {product.colors.map((c) => (
                                        <div key={c._id || c.hex || c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.hex, border: "1.5px solid #e8e6e0" }} title={c.name} />
                                            {c.name && <span style={{ fontSize: 9, color: "#888", fontWeight: 600 }}>{c.name}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Accordion */}
                        <div style={{ borderTop: "1px solid #e8e6e0" }}>
                            {[
                                {
                                    id: "details",
                                    title: "Product Details",
                                    content: (
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                            {[
                                                ["Fabric", product.fabric],
                                                ["Fit", "Contemporary Relaxed"],
                                                ["Care", "Cold Machine Wash"],
                                                ["Origin", "Made in India"],
                                                ["SKU", `#${product.productId || product._id?.slice(-7)?.toUpperCase()}`],
                                                ["Category", product.category],
                                            ].filter(([, v]) => v).map(([k, v]) => (
                                                <div key={k} style={{ padding: "10px 12px", borderRadius: 8, background: "#faf9f7" }}>
                                                    <p style={{ fontSize: 10, color: "#aaa", marginBottom: 2, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{k}</p>
                                                    <p style={{ fontSize: 13, fontWeight: 500 }}>{v}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ),
                                },
                                {
                                    id: "fit",
                                    title: "Size & Fit",
                                    content: (
                                        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>
                                            Model is 6'1" wearing size M. Chest 38" / Waist 32". For a relaxed fit, size up one. Refer to the size guide for full measurements.
                                        </p>
                                    ),
                                },
                                {
                                    id: "ship",
                                    title: "Shipping & Returns",
                                    content: (
                                        <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>
                                            Standard delivery in 3–5 business days. Free shipping on orders over ₹2,999. Easy returns within 30 days in original, unworn condition with tags attached.
                                        </p>
                                    ),
                                },
                            ].map((s) => (
                                <AccordionItem
                                    key={s.id}
                                    title={s.title}
                                    open={openSection === s.id}
                                    onToggle={() => setOpenSection(openSection === s.id ? null : s.id)}
                                >
                                    {s.content}
                                </AccordionItem>
                            ))}
                        </div>

                        {/* Admin meta */}
                        <div style={{ marginTop: 28, padding: "16px 18px", background: "#faf9f7", borderRadius: 2, border: "1px solid #e8e6e0" }}>
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#aaa", marginBottom: 10 }}>Admin Info</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                                <div>
                                    <span style={{ color: "#aaa" }}>Product ID</span>
                                    <p style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 11, color: "#444", marginTop: 2 }}>#{product.productId || product._id?.slice(-7)?.toUpperCase()}</p>
                                </div>
                                <div>
                                    <span style={{ color: "#aaa" }}>Created</span>
                                    <p style={{ fontWeight: 600, marginTop: 2 }}>
                                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                                    </p>
                                </div>
                                <div>
                                    <span style={{ color: "#aaa" }}>Stock</span>
                                    <p style={{ fontWeight: 700, marginTop: 2, color: product.stock === 0 ? "#ef4444" : "#1a1a1a" }}>{product.stock ?? "—"} units</p>
                                </div>
                                <div>
                                    <span style={{ color: "#aaa" }}>Slug</span>
                                    <p style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 11, color: "#444", marginTop: 2 }}>{product.slug || "—"}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── Mobile Action Bar ── */}
                <div className="apdp-mobile-bar">
                    <button
                        className="apdp-delete-btn"
                        style={{ flex: 1, justifyContent: 'center', height: '48px' }}
                        onClick={() => setShowConfirm(true)}
                    >
                        <Trash2 size={16} /> Delete
                    </button>
                    <button
                        className="apdp-edit-btn"
                        style={{ flex: 1.2, justifyContent: 'center', height: '48px' }}
                        onClick={() => navigate(`/admin/products/edit/${id}`)}
                    >
                        <Edit2 size={16} /> Edit Product
                    </button>
                </div>
            </div>
        </>
    );
}
