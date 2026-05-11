import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShop, useAuth } from "../context/ShopContext";

import { productApi } from "../lib/api";
import { useToasts } from "../lib/store";
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Upload,
  Trash2,
  ImagePlus,
  CheckCircle2,
  Tag,
  Star,
  Info,
  ChevronDown,
  Palette,
} from "lucide-react";
import { getPalette } from "colorthief";
import namer from "color-namer";

/* ─── Responsive Styles ─── */
const FORM_STYLES = `
  .apf-wrap { max-width: 1080px; margin: 0 auto; padding: 40px 24px 80px; }
  .apf-form { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }
  .apf-section { background: var(--color-background); border: 1px solid var(--color-border); border-radius: 18px; padding: 24px; margin-bottom: 0; }
  .apf-label { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-muted-foreground); margin-bottom: 8px; }
  .apf-input { width: 100%; padding: 13px 15px; border-radius: 11px; border: 1.5px solid var(--color-border); background: var(--color-surface); font-size: 14px; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; outline: none; }
  .apf-input:focus { border-color: var(--color-foreground); box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
  .apf-input::placeholder { color: var(--color-muted-foreground); }
  .apf-textarea { resize: vertical; min-height: 120px; }
  .apf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .apf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
  .apf-left { display: grid; gap: 24px; }
  .apf-right { display: grid; gap: 24px; position: sticky; top: 24px; }
  .apf-img-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
  .apf-img-thumb { position: relative; aspect-ratio: 3/4; border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border); }
  .apf-img-del { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.55); color: #fff; border: none; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity 0.2s; }
  .apf-img-thumb:hover .apf-img-del { opacity: 1; }
  .apf-drop-zone { aspect-ratio: 3/4; border-radius: 12px; border: 2px dashed var(--color-border); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; color: var(--color-muted-foreground); }
  .apf-drop-zone:hover, .apf-drop-zone.drag-over { border-color: var(--color-foreground); background: var(--color-surface); color: var(--color-foreground); }
  .size-btn { padding: 8px 14px; border-radius: 9px; border: 1.5px solid; cursor: pointer; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; transition: all 0.18s; }
  .apf-check-row { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; border-radius: 12px; border: 1.5px solid var(--color-border); transition: border-color 0.2s, background 0.2s; }
  .apf-check-row:hover { border-color: var(--color-foreground); background: var(--color-surface); }
  .apf-check-row.active { border-color: var(--color-foreground); background: var(--color-surface); }
  .apf-submit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: var(--color-foreground); color: var(--color-background); padding: 16px; border-radius: 14px; font-weight: 800; cursor: pointer; border: none; font-size: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); transition: transform 0.2s, box-shadow 0.2s; }
  .apf-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(0,0,0,0.18); }
  .apf-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .apf-cancel-btn { width: 100%; padding: 14px; border-radius: 14px; border: 1.5px solid var(--color-border); background: transparent; font-weight: 600; cursor: pointer; font-size: 14px; color: var(--color-foreground); transition: border-color 0.2s, background 0.2s; }
  .apf-cancel-btn:hover { border-color: var(--color-foreground); background: var(--color-surface); }
  .apf-color-row { display: flex; gap: 10px; align-items: center; padding: 10px; border-radius: 10px; border: 1.5px solid var(--color-border); background: var(--color-surface); }

  @media (max-width: 820px) {
    .apf-form { grid-template-columns: 1fr; }
    .apf-right { position: static; }
    .apf-grid-3 { grid-template-columns: 1fr 1fr; }
    .apf-img-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 520px) {
    .apf-wrap { padding: 24px 14px 100px; }
    .apf-grid-2 { grid-template-columns: 1fr; }
    .apf-grid-3 { grid-template-columns: 1fr 1fr; }
    .apf-section { padding: 18px; }
    .apf-img-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

const CATEGORIES = [
  "T-Shirts",
  "Shirts",
  "Jeans",
  "Trousers",
  "Knitwear",
  "Outerwear",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];

/* ─── Section header ─── */
function SectionHead({ title, sub }) {
  return (
    <div
      style={{
        marginBottom: 22,
        paddingBottom: 16,
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h3>
      {sub && (
        <p
          style={{
            fontSize: 12,
            color: "var(--color-muted-foreground)",
            margin: "4px 0 0",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { products, fetchProducts, saveProduct } = useShop();
  const refreshProducts = () => fetchProducts();

  const pushToast = useToasts((s) => s.push);
  const [loading, setLoading] = useState(false);
  const dropRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);

  const extractColorsFromImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        try {
          // ColorThief 3.3.1 returns an array of Color objects
          const palette = (await getPalette(img, { colorCount: 6 })) || [];

          const unique = [];
          const seenNames = new Set();

          for (const item of palette) {
            let hex;

            if (item && typeof item.hex === 'function') {
              hex = item.hex();
            } else if (Array.isArray(item)) {
              const [r, g, b] = item;
              hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
            }

            if (!hex) continue;

            const names = namer(hex).ntc;
            const name = names[0].name;

            if (!seenNames.has(name)) {
              unique.push({ name, hex });
              seenNames.add(name);
            }
            if (unique.length >= 4) break;
          }

          resolve(unique);
        } catch (error) {
          console.error("Color extraction failed:", error);
          resolve([]);
        } finally {
          if (img.src.startsWith('blob:')) {
            URL.revokeObjectURL(img.src);
          }
        }
      };
      img.onerror = () => {
        if (img.src.startsWith('blob:')) {
          URL.revokeObjectURL(img.src);
        }
        resolve([]);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: "T-Shirts",
    fabric: "",
    sizes: [],
    colors: [],
    stock: 0,
    newArrival: true,
    isBestseller: false,
    images: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [previews, setPreviews] = useState([]);

  /* ── Prefill on edit ── */
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // 1. Try to find in context first
        let product = products.find((p) => p._id === id || p.id === id);

        // 2. If not in context (e.g. on refresh), fetch from API
        if (!product) {
          product = await productApi.getOne(id);
        }

        if (product) {
          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            salePrice: product.salePrice || "",
            category: product.category || "T-Shirts",
            fabric: product.fabric || "",
            sizes: product.sizes || [],
            colors: product.colors || [],
            stock: product.stock || 0,
            newArrival: product.newArrival ?? true,
            isBestseller: product.isBestseller ?? false,
            images: [],
          });
          setPreviews(product.images || []);
        }
      } catch (error) {
        pushToast({ title: "Error", message: "Could not load product details.", type: "error" });
        console.error("Load product error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id, products, pushToast]);

  if (!isAdmin) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "2rem" }}>
          Access Denied
        </h2>
        <p style={{ color: "var(--color-muted-foreground)", marginTop: 10 }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  /* ── Helpers ── */
  const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const toggleSize = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  // Add color with auto-generated name if missing
  const addColor = () =>
    setFormData((prev) => {
      // Try to generate a name if possible
      const hex = "#000000";
      let name = "";
      // Optionally, generate a name from hex (simple fallback)
      if (prev.colors.some((c) => c.hex === hex)) {
        name = `Color ${prev.colors.length + 1}`;
      }
      return {
        ...prev,
        colors: [...prev.colors, { name, hex }],
      };
    });
  const removeColor = (i) =>
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== i),
    }));
  // Require color name or auto-generate if empty
  const updateColor = (i, field, val) => {
    setFormData((prev) => {
      const newColors = [...prev.colors];
      // Create a fresh object for the specific color being updated
      const updatedColor = { ...newColors[i], [field]: val };

      if (field === "name" && val.trim() === "") {
        updatedColor.name = `Color ${i + 1}`;
      }

      newColors[i] = updatedColor;
      return { ...prev, colors: newColors };
    });
  };

  const processFiles = (files) => {
    const arr = Array.from(files);
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...arr] }));
    const newPreviews = arr.map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
      file,
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);

    // Automatic Color Extraction from the FIRST image
    if (arr.length > 0 && formData.colors.length === 0) {
      handleAutoColorExtraction(arr[0]);
    }
  };

  const handleAutoColorExtraction = async (file) => {
    setIsExtractingColors(true);
    try {
      const detected = await extractColorsFromImage(file);
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, ...detected].slice(0, 6) // Keep it reasonable
      }));
      pushToast({
        title: "Colors Detected",
        message: `Extracted ${detected.length} colors from image.`,
        type: "success"
      });
    } catch (err) {
      console.error("Color extraction error:", err);
    } finally {
      setIsExtractingColors(false);
    }
  };

  const handleImageChange = (e) => processFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const removePreview = (index) => {
    const target = previews[index];
    if (target.isNew)
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((f) => f !== target.file),
      }));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("salePrice", formData.salePrice);
      data.append("category", formData.category);
      data.append("fabric", formData.fabric);
      data.append("stock", formData.stock);
      data.append("newArrival", formData.newArrival);
      data.append("isBestseller", formData.isBestseller);
      data.append("sizes", JSON.stringify(formData.sizes));
      data.append("colors", JSON.stringify(formData.colors));
      const existingImages = previews.filter(p => !p.isNew);
      data.append("existingImages", JSON.stringify(existingImages));

      formData.images.forEach((file) => data.append("images", file));

      // Fire and forget
      saveProduct(id, data, { name: formData.name });

      // Navigate immediately
      navigate("/admin");
    } catch (error) {
      pushToast({ title: "Error", message: error.message, type: "error" });
    } finally {
      // We don't set loading false here because we've navigated away
    }
  };

  /* ─── Progress bar indicator ─── */
  const filledFields = [
    formData.name,
    formData.description,
    formData.price,
    formData.category,
    formData.sizes.length > 0,
    previews.length > 0,
  ].filter(Boolean).length;
  const progress = Math.round((filledFields / 6) * 100);

  return (
    <>
      <style>{FORM_STYLES}</style>
      <div className="apf-wrap">
        {/* ── Back ── */}
        <button
          onClick={() => navigate("/admin")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--color-muted-foreground)",
            marginBottom: 24,
            fontSize: 14,
            fontWeight: 600,
            padding: 0,
            transition: "color 0.18s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--color-foreground)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--color-muted-foreground)")
          }
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* ── Page header ── */}
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-muted-foreground)",
              marginBottom: 6,
            }}
          >
            {id ? "Editing product" : "New product"}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif, Georgia)",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 900,
              margin: "0 0 12px",
            }}
          >
            {id ? "Edit Product" : "Add New Product"}
          </h1>
          {/* progress bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                flex: 1,
                height: 4,
                borderRadius: 99,
                background: "var(--color-border)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background:
                    progress === 100 ? "#10b981" : "var(--color-foreground)",
                  borderRadius: 99,
                  transition: "width 0.4s",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-muted-foreground)",
                whiteSpace: "nowrap",
              }}
            >
              {progress}% complete
            </span>
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="apf-form">
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="apf-left">
            {/* Basic Info */}
            <div className="apf-section">
              <SectionHead
                title="Basic Information"
                sub="Name, description, category and material"
              />
              <div style={{ display: "grid", gap: 18 }}>
                <div>
                  <label className="apf-label">Product Name *</label>
                  <input
                    className="apf-input"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Classic Oxford Shirt"
                  />
                </div>

                <div>
                  <label className="apf-label">Description *</label>
                  <textarea
                    className="apf-input apf-textarea"
                    required
                    value={formData.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Describe the product, its fit, quality and feel…"
                  />
                </div>

                <div className="apf-grid-2">
                  <div>
                    <label className="apf-label">Category</label>
                    <div style={{ position: "relative" }}>
                      <select
                        className="apf-input"
                        value={formData.category}
                        onChange={(e) => set("category", e.target.value)}
                        style={{ appearance: "none", paddingRight: 36 }}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={15}
                        style={{
                          position: "absolute",
                          right: 14,
                          top: "50%",
                          transform: "translateY(-50%)",
                          pointerEvents: "none",
                          color: "var(--color-muted-foreground)",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="apf-label">Fabric / Material</label>
                    <input
                      className="apf-input"
                      type="text"
                      value={formData.fabric}
                      onChange={(e) => set("fabric", e.target.value)}
                      placeholder="e.g. 100% Supima Cotton"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="apf-section">
              <SectionHead
                title="Pricing & Inventory"
                sub="Set prices and track stock levels"
              />
              <div className="apf-grid-3">
                <div>
                  <label className="apf-label">Regular Price (₹) *</label>
                  <input
                    className="apf-input"
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="apf-label">Sale Price (₹)</label>
                  <input
                    className="apf-input"
                    type="number"
                    min="0"
                    value={formData.salePrice}
                    onChange={(e) => set("salePrice", e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="apf-label">Stock Qty</label>
                  <input
                    className="apf-input"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => set("stock", e.target.value)}
                  />
                </div>
              </div>
              {formData.salePrice && formData.price && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#fef9ec",
                    border: "1px solid #fde68a",
                    fontSize: 12,
                    color: "#92400e",
                    fontWeight: 600,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <Info size={14} />
                  Discount:{" "}
                  {Math.round((1 - formData.salePrice / formData.price) * 100)}%
                  off
                </div>
              )}
            </div>

            {/* Variants */}
            <div className="apf-section">
              <SectionHead
                title="Variants"
                sub="Available sizes and color options"
              />

              {/* Sizes */}
              <div style={{ marginBottom: 28 }}>
                <label className="apf-label" style={{ marginBottom: 12 }}>
                  Available Sizes
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SIZES.map((size) => {
                    const active = formData.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className="size-btn"
                        style={{
                          borderColor: active
                            ? "var(--color-foreground)"
                            : "var(--color-border)",
                          background: active
                            ? "var(--color-foreground)"
                            : "transparent",
                          color: active
                            ? "var(--color-background)"
                            : "var(--color-foreground)",
                        }}
                      >
                        {active && (
                          <CheckCircle2
                            size={10}
                            style={{
                              display: "inline",
                              marginRight: 4,
                              verticalAlign: "middle",
                            }}
                          />
                        )}
                        {size}
                      </button>
                    );
                  })}
                </div>
                {formData.sizes.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 11,
                      color: "var(--color-muted-foreground)",
                      fontWeight: 500,
                    }}
                  >
                    {formData.sizes.length} size
                    {formData.sizes.length > 1 ? "s" : ""} selected:{" "}
                    {formData.sizes.join(", ")}
                  </div>
                )}
              </div>

              {/* Colors */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <label className="apf-label" style={{ margin: 0 }}>
                    Color Options
                  </label>
                  <button
                    type="button"
                    onClick={addColor}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--color-gold, #b45309)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 8,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--color-surface)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "none")
                    }
                  >
                    <Plus size={14} /> Add Color
                  </button>
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {formData.colors.length === 0 && (
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--color-muted-foreground)",
                        textAlign: "center",
                        padding: "16px 0",
                        fontStyle: "italic",
                      }}
                    >
                      No colors added yet.
                    </div>
                  )}
                  {formData.colors.map((color, i) => (
                    <div key={i} className="apf-color-row">
                      {/* Color swatch preview */}
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: color.hex,
                          border: "1.5px solid var(--color-border)",
                          flexShrink: 0,
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Color Name (e.g. Sage)"
                        value={color.name}
                        onChange={(e) => updateColor(i, "name", e.target.value)}
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1.5px solid var(--color-border)",
                          background: "var(--color-background)",
                          fontSize: 13,
                          outline: "none",
                        }}
                      />
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(i, "hex", e.target.value)}
                        style={{
                          width: 36,
                          height: 36,
                          padding: 2,
                          borderRadius: 8,
                          border: "1.5px solid var(--color-border)",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeColor(i)}
                        style={{
                          padding: 6,
                          color: "#ef4444",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          borderRadius: 6,
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#fef2f2")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "none")
                        }
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="apf-right">
            {/* Images */}
            <div className="apf-section">
              <SectionHead
                title="Product Images"
                sub={`${previews.length} image${previews.length !== 1 ? "s" : ""} uploaded`}
              />

              <div className="apf-img-grid">
                {previews.map((img, i) => (
                  <div key={i} className="apf-img-thumb">
                    <img
                      src={img.url || img}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                    <button
                      type="button"
                      className="apf-img-del"
                      onClick={() => removePreview(i)}
                    >
                      <Trash2 size={12} />
                    </button>
                    {i === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: 5,
                          left: 5,
                          background: "rgba(0,0,0,0.65)",
                          color: "#fff",
                          fontSize: 8,
                          padding: "2px 7px",
                          borderRadius: 20,
                          fontWeight: 700,
                          letterSpacing: "0.05em",
                        }}
                      >
                        MAIN
                      </span>
                    )}
                  </div>
                ))}

                {/* Drop zone */}
                <label
                  className={`apf-drop-zone${isDragOver ? " drag-over" : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                >
                  <ImagePlus size={22} />
                  <span style={{ fontSize: 11, fontWeight: 700 }}>Upload</span>
                  <span
                    style={{
                      fontSize: 10,
                      textAlign: "center",
                      lineHeight: 1.4,
                    }}
                  >
                    or drag & drop
                  </span>
                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </label>
              </div>

              {/* ── Detected Colors Preview ── */}
              {isExtractingColors && (
                <div style={{
                  padding: "16px",
                  textAlign: "center",
                  background: "var(--color-surface)",
                  borderRadius: 12,
                  border: "1px dashed var(--color-border)",
                  marginTop: 12
                }}>
                  <Loader2 size={18} className="animate-spin" style={{ color: "var(--color-muted-foreground)", marginBottom: 8, display: "inline-block" }} />
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--color-muted-foreground)" }}>Extracting colors...</p>
                </div>
              )}

              {formData.colors.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Palette size={14} style={{ color: "var(--color-muted-foreground)" }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Detected Palette
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {formData.colors.map((c, i) => (
                      <div key={c.hex + i} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        background: "var(--color-surface)",
                        borderRadius: 12,
                        border: "1.2px solid var(--color-border)"
                      }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: c.hex,
                          border: "1px solid rgba(0,0,0,0.1)",
                          flexShrink: 0
                        }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: 10, fontWeight: 500, color: "var(--color-muted-foreground)", fontFamily: "monospace" }}>
                            {c.hex.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-muted-foreground)",
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                Recommended: 2+ images · First image used as cover
              </p>
            </div>

            {/* Product Status */}
            <div className="apf-section">
              <SectionHead
                title="Product Status"
                sub="Tags & visibility settings"
              />

              <div style={{ display: "grid", gap: 10 }}>
                <label
                  className={`apf-check-row${formData.newArrival ? " active" : ""}`}
                  onClick={() => set("newArrival", !formData.newArrival)}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: `2px solid ${formData.newArrival ? "var(--color-foreground)" : "var(--color-border)"}`,
                      background: formData.newArrival
                        ? "var(--color-foreground)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.18s",
                    }}
                  >
                    {formData.newArrival && (
                      <CheckCircle2 size={13} color="var(--color-background)" />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      <Tag size={14} color="#b45309" /> New Arrival
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-muted-foreground)",
                        marginTop: 3,
                      }}
                    >
                      Shown in New Arrivals section
                    </div>
                  </div>
                </label>

                <label
                  className={`apf-check-row${formData.isBestseller ? " active" : ""}`}
                  onClick={() => set("isBestseller", !formData.isBestseller)}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: `2px solid ${formData.isBestseller ? "var(--color-foreground)" : "var(--color-border)"}`,
                      background: formData.isBestseller
                        ? "var(--color-foreground)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.18s",
                    }}
                  >
                    {formData.isBestseller && (
                      <CheckCircle2 size={13} color="var(--color-background)" />
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />{" "}
                      Bestseller
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-muted-foreground)",
                        marginTop: 3,
                      }}
                    >
                      Highlighted in featured sections
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "grid", gap: 10 }}>
              <button
                type="submit"
                disabled={loading}
                className="apf-submit-btn"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={18} /> {id ? "Save Changes" : "Publish Product"}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="apf-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
