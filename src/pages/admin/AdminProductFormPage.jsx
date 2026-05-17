import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShop, useAuth } from "../../context/ShopContext";
import { productApi } from "../../lib/api";
import { useToasts } from "../../lib/store";
import { getPalette } from "colorthief";
import namer from "color-namer";
import {
  Save,
  Loader2,
  Plus,
  X,
  Trash2,
  ImagePlus,
  CheckCircle2,
  Tag,
  Star,
  Info,
  ChevronDown,
  Palette,
  AlertCircle,
  Pipette,
} from "lucide-react";

/* ─── Styles ─── */
const FORM_STYLES = `
  .apf-wrap { max-width: 1080px; font-family: 'DM Sans', sans-serif; }
  .apf-progress-header {
    position: sticky; top: 0; z-index: 40; background: #f5f4f0;
    border-bottom: 1px solid #e8e6e0; height: 60px; display: flex;
    flex-direction: column; justify-content: center; margin: 0 0 32px;
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  }
  @media (max-width: 900px) { .apf-progress-header { height: 64px; margin-bottom: 24px; } }
  .apf-form { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }
  .apf-section { background: #fff; border: 1px solid #e8e6e0; border-radius: 2px; padding: 24px; margin-bottom: 0; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
  .apf-label { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #999; margin-bottom: 8px; }
  .apf-input { width: 100%; padding: 13px 15px; border-radius: 11px; border: 1.5px solid #e8e6e0; background: #faf9f7; font-size: 14px; box-sizing: border-box; transition: border-color 0.2s, box-shadow 0.2s; outline: none; color: #1a1a1a; font-family: 'DM Sans', sans-serif; }
  .apf-input:focus { border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
  .apf-input::placeholder { color: #bbb; }
  .apf-textarea { resize: vertical; min-height: 120px; }
  .apf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .apf-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
  .apf-left { display: grid; gap: 24px; }
  .apf-right { display: grid; gap: 24px; position: sticky; top: 24px; }
  .apf-img-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }

  /* ── thumb ── */
  .apf-img-thumb {
    position: relative; aspect-ratio: 3/4; border-radius: 12px; overflow: hidden;
    border: 1px solid #e8e6e0; background: #faf9f7;
    cursor: pointer; user-select: none; -webkit-user-select: none;
  }
  /* brightness flash on double-tap/double-click */
  .apf-img-thumb.dbl-flash { animation: thumbFlash 0.32s ease forwards; }
  @keyframes thumbFlash {
    0%   { filter: brightness(1); }
    45%  { filter: brightness(1.4); }
    100% { filter: brightness(1); }
  }

  /* delete — ALWAYS visible, top-right */
  .apf-img-del {
    position: absolute; top: 6px; right: 6px;
    background: rgba(0,0,0,0.55); color: #fff; border: none;
    border-radius: 50%; width: 26px; height: 26px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.2s; z-index: 2;
  }
  .apf-img-del:hover { background: rgba(239,68,68,0.9); }

  /* colors button — ALWAYS visible, bottom-right */
  .apf-img-extract-btn {
    position: absolute; bottom: 6px; right: 6px;
    background: rgba(201,168,76,0.92); color: #fff; border: none;
    border-radius: 20px; padding: 4px 8px;
    display: flex; align-items: center; gap: 4px;
    font-size: 10px; font-weight: 700; cursor: pointer;
    transition: background 0.2s; font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.04em; white-space: nowrap;
    backdrop-filter: blur(4px); z-index: 2;
  }
  .apf-img-extract-btn:hover:not(:disabled) { background: rgba(170,130,30,0.98); }
  .apf-img-extract-btn.extracting { background: rgba(0,0,0,0.65); cursor: not-allowed; }

  /* "DOUBLE TAP" hint — shows on hover */
  .apf-dbl-hint {
    position: absolute; top: 6px; left: 6px;
    background: rgba(0,0,0,0.48); color: #fff;
    font-size: 8px; font-weight: 700; letter-spacing: 0.07em;
    padding: 3px 7px; border-radius: 20px;
    pointer-events: none; z-index: 2;
    opacity: 0; transition: opacity 0.22s;
  }
  .apf-img-thumb:hover .apf-dbl-hint { opacity: 1; }

  .apf-custom-select { position: relative; width: 100%; }
  .apf-select-trigger { width: 100%; padding: 13px 15px; border-radius: 11px; border: 1.5px solid #e8e6e0; background: #faf9f7; font-size: 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; color: #1a1a1a; }
  .apf-select-trigger:hover { border-color: #1a1a1a; }
  .apf-select-trigger.active { border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(0,0,0,0.06); }
  .apf-select-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: #fff; border: 1px solid #e8e6e0; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); z-index: 50; overflow: hidden; animation: selectIn 0.2s ease; }
  @keyframes selectIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  .apf-select-option { padding: 12px 16px; font-size: 14px; cursor: pointer; transition: background 0.2s; color: #444; }
  .apf-select-option:hover { background: #faf9f7; }
  .apf-select-option.selected { background: #faf9f7; color: #c9a84c; font-weight: 700; }
  .apf-error-msg { font-size: 11px; color: #ef4444; font-weight: 600; margin-top: 6px; display: flex; align-items: center; gap: 4px; }
  .apf-input.error { border-color: #ef4444 !important; background: #fffafb; }
  .apf-drop-zone { aspect-ratio: 3/4; border-radius: 12px; border: 2px dashed #e8e6e0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: all 0.2s; color: #bbb; background: #faf9f7; }
  .apf-drop-zone:hover, .apf-drop-zone.drag-over { border-color: #1a1a1a; background: #fff; color: #1a1a1a; }
  .size-btn { padding: 8px 14px; border-radius: 9px; border: 1.5px solid; cursor: pointer; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; transition: all 0.18s; font-family: 'DM Sans', sans-serif; }
  .apf-check-row { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; padding: 14px; border-radius: 12px; border: 1.5px solid #e8e6e0; background: #fff; transition: all 0.2s; }
  .apf-check-row:hover { border-color: #1a1a1a; background: #faf9f7; }
  .apf-check-row.active { border-color: #1a1a1a; background: #faf9f7; }
  .apf-submit-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; background: #1a1a1a; color: #fff; padding: 16px; border-radius: 2px; font-weight: 800; cursor: pointer; border: none; font-size: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); transition: transform 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; }
  .apf-submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(0,0,0,0.18); background: #000; }
  .apf-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .apf-cancel-btn { width: 100%; padding: 14px; border-radius: 2px; border: 1.5px solid #e8e6e0; background: #fff; font-weight: 600; cursor: pointer; font-size: 14px; color: #444; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
  .apf-cancel-btn:hover { border-color: #1a1a1a; color: #1a1a1a; background: #faf9f7; }
  .apf-color-row { display: flex; gap: 10px; align-items: center; padding: 10px; border-radius: 10px; border: 1.5px solid #e8e6e0; background: #faf9f7; }
  @media (max-width: 820px) {
    .apf-form { grid-template-columns: 1fr; }
    .apf-right { position: static; }
    .apf-grid-3 { grid-template-columns: 1fr 1fr; }
    .apf-img-grid { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 520px) {
    .apf-wrap { padding: 5px 0px 0px; }
    .apf-grid-2 { grid-template-columns: 1fr; }
    .apf-grid-3 { grid-template-columns: 1fr 1fr; }
    .apf-section { padding: 10px; }
    .apf-img-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

const CATEGORIES = [
  "T-Shirts",
  "Shirts",
  "Jeans",
  "Combo",
  "Trousers",
  "Knitwear",
  "Outerwear",
  "Cargo",
];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"];

/* ══════════════════════════════════════════
   LAB PIPELINE
══════════════════════════════════════════ */
const toLinear = (c) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
};

const rgbToLab = (r, g, b) => {
  const lr = toLinear(r),
    lg = toLinear(g),
    lb = toLinear(b);
  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) / 0.95047;
  const y = (lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175) / 1.0;
  const z = (lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
};

const deltaE = ([L1, a1, b1], [L2, a2, b2]) =>
  Math.sqrt((L1 - L2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);

const isNoiseColor = (r, g, b) => {
  const [L, a, bv] = rgbToLab(r, g, b);
  const chroma = Math.sqrt(a * a + bv * bv);
  if (L > 88 && chroma < 16) return true;
  if (L < 10) return true;
  if (chroma < 7 && L > 15 && L < 88) return true;
  if (L > 38 && L < 82 && a > 4 && a < 24 && bv > 5 && bv < 30 && chroma < 38)
    return true;
  return false;
};

const DEDUP_THRESHOLD = 22;

/* Accepts File OR URL string */
const extractColorsFromImage = (source) =>
  new Promise((resolve) => {
    const isFile = source instanceof File;
    const blobUrl = isFile ? URL.createObjectURL(source) : null;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = async () => {
      try {
        const scale = Math.min(1, 320 / img.naturalWidth);
        const W = Math.round(img.naturalWidth * scale);
        const H = Math.round(img.naturalHeight * scale);
        const canvas = document.createElement("canvas");
        const x0 = Math.round(W * 0.2),
          y0 = Math.round(H * 0.18);
        const cW = Math.round(W * 0.6),
          cH = Math.round(H * 0.68);
        canvas.width = cW;
        canvas.height = cH;
        canvas.getContext("2d").drawImage(img, x0, y0, cW, cH, 0, 0, cW, cH);

        const cropped = new Image();
        await new Promise((res) => {
          cropped.onload = res;
          cropped.src = canvas.toDataURL("image/jpeg", 0.92);
        });

        let rawPalette = [];
        try {
          rawPalette = (await getPalette(cropped, { colorCount: 12 })) || [];
        } catch {
          try {
            rawPalette = (await getPalette(img, { colorCount: 12 })) || [];
          } catch {
            /**/
          }
        }

        if (!rawPalette.length) {
          resolve([]);
          return;
        }

        const normalized = rawPalette
          .map((item) => {
            if (Array.isArray(item))
              return { r: item[0], g: item[1], b: item[2] };
            if (item && typeof item.r === "number") return item;
            if (item && typeof item.hex === "function") {
              const h = item.hex().replace("#", "");
              return {
                r: parseInt(h.slice(0, 2), 16),
                g: parseInt(h.slice(2, 4), 16),
                b: parseInt(h.slice(4, 6), 16),
              };
            }
            return null;
          })
          .filter(Boolean);

        const withLab = normalized.map((c) => ({
          ...c,
          lab: rgbToLab(c.r, c.g, c.b),
        }));
        let candidates = withLab.filter(
          ({ r, g, b }) => !isNoiseColor(r, g, b),
        );
        if (candidates.length < 2)
          candidates = withLab.filter(({ lab: [L, a, bv] }) => {
            const ch = Math.sqrt(a * a + bv * bv);
            return !(L > 94 && ch < 6) && !(L < 5);
          });

        const unique = [];
        for (const c of candidates) {
          if (!unique.some((u) => deltaE(u.lab, c.lab) < DEDUP_THRESHOLD))
            unique.push(c);
          if (unique.length >= 4) break;
        }

        const result = unique.map(({ r, g, b }) => {
          const hex =
            "#" +
            [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
          const ntc = namer(hex).ntc[0]?.name || "";
          const basic = namer(hex).basic[0]?.name || "";
          const name =
            ntc &&
            ntc.toLowerCase() !== "black" &&
            ntc.toLowerCase() !== "white"
              ? ntc
              : basic || ntc;
          return { name, hex };
        });
        resolve(result);
      } catch (err) {
        console.error("Color extraction failed:", err);
        resolve([]);
      } finally {
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      }
    };

    img.onerror = () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      resolve([]);
    };
    img.src = isFile ? blobUrl : source;
  });

/* ─── Section header ─── */
function SectionHead({ title, sub }) {
  return (
    <div
      style={{
        marginBottom: 22,
        paddingBottom: 16,
        borderBottom: "1px solid #f5f3ef",
      }}
    >
      <h3
        style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#1a1a1a" }}
      >
        {title}
      </h3>
      {sub && (
        <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>{sub}</p>
      )}
    </div>
  );
}

/* ─── ImageThumb — double-click / double-tap triggers color extraction ─── */
function ImageThumb({
  img,
  index,
  extractingIndex,
  onExtract,
  onDelete,
  isFirst,
}) {
  const tapTimerRef = useRef(null);
  const [flashing, setFlashing] = useState(false);

  const doExtract = (e) => {
    if (extractingIndex !== null) return;
    setFlashing(true);
    setTimeout(() => setFlashing(false), 380);
    onExtract(e, index);
  };

  /* desktop double-click */
  const handleDoubleClick = (e) => {
    if (e.target.closest("button")) return;
    doExtract(e);
  };

  /* mobile double-tap (300 ms window) */
  const handleTouchEnd = (e) => {
    if (e.target.closest("button")) return;
    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
      doExtract(e);
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapTimerRef.current = null;
      }, 300);
    }
  };

  const isExtracting = extractingIndex === index;

  return (
    <div
      className={`apf-img-thumb${flashing ? " dbl-flash" : ""}`}
      onDoubleClick={handleDoubleClick}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={img.url || img}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          pointerEvents: "none",
        }}
      />

      {/* hover hint */}
      <span className="apf-dbl-hint">DOUBLE TAP</span>

      {/* delete — always visible */}
      <button
        type="button"
        className="apf-img-del"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(index);
        }}
        title="Remove image"
      >
        <Trash2 size={12} />
      </button>

      {/* colors — always visible */}
      <button
        type="button"
        className={`apf-img-extract-btn${isExtracting ? " extracting" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onExtract(e, index);
        }}
        disabled={extractingIndex !== null}
        title="Detect colors from this image"
      >
        {isExtracting ? (
          <>
            <Loader2
              size={10}
              style={{ animation: "spin 1s linear infinite" }}
            />{" "}
            Detecting…
          </>
        ) : (
          <>
            <Pipette size={10} /> Colors
          </>
        )}
      </button>

      {/* MAIN badge */}
      {isFirst && (
        <span
          style={{
            position: "absolute",
            bottom: 6,
            left: 6,
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            fontSize: 8,
            padding: "2px 7px",
            borderRadius: 20,
            fontWeight: 700,
            letterSpacing: "0.05em",
            pointerEvents: "none",
          }}
        >
          MAIN
        </span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { saveProduct } = useShop();
  const pushToast = useToasts((s) => s.push);

  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isExtractingColors, setIsExtractingColors] = useState(false);
  const [extractingIndex, setExtractingIndex] = useState(null);

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    salePrice: "",
    category: "",
    fabric: "",
    sizes: [],
    colors: [],
    stock: 0,
    published: true,
    newArrival: true,
    isBestseller: false,
    images: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [previews, setPreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await productApi.getAdminOne(id);
        const product = data.product || data.data || data;
        if (product) {
          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price || "",
            salePrice: product.salePrice || "",
            category: product.category || "",
            fabric: product.fabric || "",
            sizes: product.sizes || [],
            colors: product.colors || [],
            stock: product.stock || 0,
            published: product.published ?? true,
            newArrival: product.newArrival ?? true,
            isBestseller: product.isBestseller ?? false,
            images: [],
          });
          setPreviews(product.images || []);
        }
      } catch {
        pushToast({
          title: "Error",
          message: "Could not load product details.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  useEffect(() => {
    const handle = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target))
        setIsCategoryOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (!isAdmin) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "DM Sans, sans-serif", fontSize: "2rem" }}>
          Access Denied
        </h2>
        <p style={{ color: "#888", marginTop: 10 }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const set = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const toggleSize = (size) =>
    setFormData((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));

  const addColor = () =>
    setFormData((prev) => ({
      ...prev,
      colors: [
        ...prev.colors,
        { name: `Color ${prev.colors.length + 1}`, hex: "#000000" },
      ],
    }));

  const removeColor = (i) =>
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, idx) => idx !== i),
    }));

  const updateColor = (i, field, val) =>
    setFormData((prev) => {
      const cols = [...prev.colors];
      cols[i] = { ...cols[i], [field]: val };
      if (field === "name" && val.trim() === "")
        cols[i].name = `Color ${i + 1}`;
      return { ...prev, colors: cols };
    });

  /* Auto-extract when first image uploaded and no colors yet */
  const handleAutoColorExtraction = async (file) => {
    setIsExtractingColors(true);
    try {
      const detected = await extractColorsFromImage(file);
      if (detected.length > 0) {
        setFormData((prev) => ({
          ...prev,
          colors: [...prev.colors, ...detected].slice(0, 6),
        }));
        pushToast({
          title: "Colors Detected",
          message: `Extracted ${detected.length} garment color${detected.length > 1 ? "s" : ""}.`,
          type: "success",
        });
      } else {
        pushToast({
          title: "No Colors Found",
          message: "Could not detect garment colors. Add manually.",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtractingColors(false);
    }
  };

  /* Per-image extract — called by button click AND double-tap/click */
  const handleExtractFromPreview = async (e, index) => {
    e.stopPropagation();
    if (extractingIndex !== null) return;
    const preview = previews[index];
    const source = preview.isNew ? preview.file : preview.url || preview;
    setExtractingIndex(index);
    try {
      const detected = await extractColorsFromImage(source);
      if (detected.length > 0) {
        setFormData((prev) => ({
          ...prev,
          colors: [...prev.colors, ...detected].slice(0, 6),
        }));
        pushToast({
          title: "Colors Detected",
          message: `Extracted ${detected.length} color${detected.length > 1 ? "s" : ""} from image ${index + 1}.`,
          type: "success",
        });
      } else {
        pushToast({
          title: "No Colors Found",
          message: "Could not detect colors from this image.",
          type: "error",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExtractingIndex(null);
    }
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
    if (arr.length > 0 && formData.colors.length === 0)
      handleAutoColorExtraction(arr[0]);
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

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name = "Product name is required";
    if (!formData.description.trim()) e.description = "Description is required";
    if (!formData.category) e.category = "Please select a category";
    if (!formData.price || formData.price <= 0)
      e.price = "Valid price is required";
    if (formData.stock < 0) e.stock = "Stock cannot be negative";
    if (
      formData.salePrice &&
      Number(formData.salePrice) >= Number(formData.price)
    )
      e.salePrice = "Sale price must be lower than regular price";
    if (formData.sizes.length === 0) e.sizes = "Select at least one size";
    if (previews.length === 0)
      e.images = "At least one product image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateForm()) {
      pushToast({
        title: "Validation Error",
        message: "Please check the highlighted fields.",
        type: "error",
      });
      const firstError = Object.keys(errors)[0];
      const el = document.getElementsByName(firstError)[0];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
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
      data.append("published", formData.published);
      data.append("newArrival", formData.newArrival);
      data.append("isBestseller", formData.isBestseller);
      data.append("sizes", JSON.stringify(formData.sizes));
      data.append("colors", JSON.stringify(formData.colors));
      data.append(
        "existingImages",
        JSON.stringify(previews.filter((p) => !p.isNew)),
      );
      formData.images.forEach((file) => data.append("images", file));
      saveProduct(id, data, { name: formData.name });
      navigate("/admin/products");
    } catch (error) {
      pushToast({ title: "Error", message: error.message, type: "error" });
    }
  };

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
        {/* Progress header */}
        <div className="apf-progress-header">
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#999",
              marginBottom: 6,
            }}
          >
            {id ? "Editing product" : "New product"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                flex: 1,
                height: 4,
                borderRadius: 99,
                background: "#e8e6e0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: progress === 100 ? "#10b981" : "#1a1a1a",
                  borderRadius: 99,
                  transition: "width 0.4s",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#888",
                whiteSpace: "nowrap",
              }}
            >
              {progress}% complete
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="apf-form">
          {/* ── LEFT ── */}
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
                    className={`apf-input ${errors.name ? "error" : ""}`}
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      set("name", e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                    }}
                    placeholder="e.g. Classic Oxford Shirt"
                  />
                  {errors.name && (
                    <div className="apf-error-msg">
                      <AlertCircle size={12} /> {errors.name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="apf-label">Description *</label>
                  <textarea
                    className={`apf-input apf-textarea ${errors.description ? "error" : ""}`}
                    name="description"
                    value={formData.description}
                    onChange={(e) => {
                      set("description", e.target.value);
                      if (errors.description)
                        setErrors((p) => ({ ...p, description: "" }));
                    }}
                    placeholder="Describe the product, its fit, quality and feel…"
                  />
                  {errors.description && (
                    <div className="apf-error-msg">
                      <AlertCircle size={12} /> {errors.description}
                    </div>
                  )}
                </div>
                <div className="apf-grid-2">
                  <div>
                    <label className="apf-label">Category *</label>
                    <div className="apf-custom-select" ref={categoryRef}>
                      <div
                        className={`apf-select-trigger ${isCategoryOpen ? "active" : ""} ${errors.category ? "error" : ""}`}
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                      >
                        <span
                          style={{
                            color: formData.category ? "inherit" : "#999",
                          }}
                        >
                          {formData.category || "Select Category"}
                        </span>
                        <ChevronDown
                          size={16}
                          style={{
                            transition: "transform 0.2s",
                            transform: isCategoryOpen
                              ? "rotate(180deg)"
                              : "none",
                          }}
                        />
                      </div>
                      {isCategoryOpen && (
                        <div className="apf-select-dropdown">
                          {CATEGORIES.map((c) => (
                            <div
                              key={c}
                              className={`apf-select-option ${formData.category === c ? "selected" : ""}`}
                              onClick={() => {
                                set("category", c);
                                setIsCategoryOpen(false);
                                if (errors.category)
                                  setErrors((p) => ({ ...p, category: "" }));
                              }}
                            >
                              {c}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.category && (
                      <div className="apf-error-msg">
                        <AlertCircle size={12} /> {errors.category}
                      </div>
                    )}
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

            {/* Pricing */}
            <div className="apf-section">
              <SectionHead
                title="Pricing & Inventory"
                sub="Set prices and track stock levels"
              />
              <div className="apf-grid-3">
                <div>
                  <label className="apf-label">Regular Price (₹) *</label>
                  <input
                    className={`apf-input ${errors.price ? "error" : ""}`}
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => {
                      set("price", e.target.value);
                      if (errors.price) setErrors((p) => ({ ...p, price: "" }));
                    }}
                    placeholder="0"
                  />
                  {errors.price && (
                    <div className="apf-error-msg">
                      <AlertCircle size={12} /> {errors.price}
                    </div>
                  )}
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
                  <label className="apf-label">Stock Qty *</label>
                  <input
                    className={`apf-input ${errors.stock ? "error" : ""}`}
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => {
                      set("stock", e.target.value);
                      if (errors.stock) setErrors((p) => ({ ...p, stock: "" }));
                    }}
                  />
                  {errors.stock && (
                    <div className="apf-error-msg">
                      <AlertCircle size={12} /> {errors.stock}
                    </div>
                  )}
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
                  <Info size={14} /> Discount:{" "}
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
                        onClick={() => {
                          toggleSize(size);
                          if (errors.sizes)
                            setErrors((p) => ({ ...p, sizes: "" }));
                        }}
                        className="size-btn"
                        style={{
                          borderColor: active
                            ? "#1a1a1a"
                            : errors.sizes
                              ? "#ef4444"
                              : "#e8e6e0",
                          background: active ? "#1a1a1a" : "transparent",
                          color: active ? "#fff" : "#1a1a1a",
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
                {errors.sizes && (
                  <div className="apf-error-msg">
                    <AlertCircle size={12} /> {errors.sizes}
                  </div>
                )}
                {formData.sizes.length > 0 && (
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 11,
                      color: "#888",
                      fontWeight: 500,
                    }}
                  >
                    {formData.sizes.length} size
                    {formData.sizes.length > 1 ? "s" : ""} selected:{" "}
                    {formData.sizes.join(", ")}
                  </div>
                )}
              </div>

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
                      color: "#c9a84c",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 8,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#faf9f7")
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
                        color: "#999",
                        textAlign: "center",
                        padding: "16px 0",
                        fontStyle: "italic",
                      }}
                    >
                      Upload an image — colors auto-detected.
                    </div>
                  )}
                  {formData.colors.map((color, i) => (
                    <div key={i} className="apf-color-row">
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: color.hex,
                          border: "1.5px solid #e8e6e0",
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
                          border: "1.5px solid #e8e6e0",
                          background: "#fff",
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
                          border: "1.5px solid #e8e6e0",
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

          {/* ── RIGHT ── */}
          <div className="apf-right">
            <div className="apf-section">
              <SectionHead
                title="Product Images"
                sub={`${previews.length} image${previews.length !== 1 ? "s" : ""} · double-tap to detect colors`}
              />
              <div className="apf-img-grid">
                {previews.map((img, i) => (
                  <ImageThumb
                    key={i}
                    img={img}
                    index={i}
                    extractingIndex={extractingIndex}
                    onExtract={handleExtractFromPreview}
                    onDelete={removePreview}
                    isFirst={i === 0}
                  />
                ))}

                {/* Upload drop zone */}
                <label
                  className={`apf-drop-zone${isDragOver ? " drag-over" : ""}${errors.images ? " error" : ""}`}
                  style={
                    errors.images
                      ? { borderColor: "#ef4444", background: "#fffafb" }
                      : {}
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    handleDrop(e);
                    if (errors.images) setErrors((p) => ({ ...p, images: "" }));
                  }}
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
                    onChange={(e) => {
                      handleImageChange(e);
                      if (errors.images)
                        setErrors((p) => ({ ...p, images: "" }));
                    }}
                    accept="image/*"
                  />
                </label>
              </div>

              {errors.images && (
                <div
                  className="apf-error-msg"
                  style={{ justifyContent: "center" }}
                >
                  <AlertCircle size={12} /> {errors.images}
                </div>
              )}

              {isExtractingColors && (
                <div
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    background: "#faf9f7",
                    borderRadius: 12,
                    border: "1px dashed #e8e6e0",
                    marginTop: 12,
                  }}
                >
                  <Loader2
                    size={18}
                    style={{
                      color: "#999",
                      marginBottom: 8,
                      display: "inline-block",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#999" }}>
                    Analysing garment colors…
                  </p>
                </div>
              )}

              {formData.colors.length > 0 && !isExtractingColors && (
                <div style={{ marginTop: 24 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Palette size={14} style={{ color: "#999" }} />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#999",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Detected Palette
                    </span>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: 12,
                    }}
                  >
                    {formData.colors.map((c, i) => (
                      <div
                        key={c.hex + i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 10px",
                          background: "#faf9f7",
                          borderRadius: 12,
                          border: "1.2px solid #e8e6e0",
                        }}
                      >
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: c.hex,
                            border: "1px solid rgba(0,0,0,0.1)",
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "#1a1a1a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {c.name}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 500,
                              color: "#888",
                              fontFamily: "monospace",
                            }}
                          >
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
                  color: "#888",
                  textAlign: "center",
                  lineHeight: 1.6,
                  marginTop: 12,
                }}
              >
                Recommended: 2+ images · First image used as cover
              </p>
            </div>

            {/* Status */}
            <div className="apf-section">
              <SectionHead
                title="Product Status"
                sub="Tags & visibility settings"
              />
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  {
                    key: "published",
                    icon: <CheckCircle2 size={14} color="#059669" />,
                    label: "Publish now",
                    sub: "Uncheck to save as unpublished for later.",
                  },
                  {
                    key: "newArrival",
                    icon: <Tag size={14} color="#b45309" />,
                    label: "New Arrival",
                    sub: "Shown in New Arrivals section",
                  },
                  {
                    key: "isBestseller",
                    icon: <Star size={14} color="#f59e0b" fill="#f59e0b" />,
                    label: "Bestseller",
                    sub: "Highlighted in featured sections",
                  },
                ].map(({ key, icon, label, sub }) => (
                  <label
                    key={key}
                    className={`apf-check-row${formData[key] ? " active" : ""}`}
                    onClick={() => set(key, !formData[key])}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        border: `2px solid ${formData[key] ? "#1a1a1a" : "#e8e6e0"}`,
                        background: formData[key] ? "#1a1a1a" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.18s",
                      }}
                    >
                      {formData[key] && <CheckCircle2 size={13} color="#fff" />}
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
                        {icon} {label}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#888", marginTop: 3 }}
                      >
                        {sub}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "grid", gap: 10, marginBottom: "10px" }}>
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
                    <Save size={18} />{" "}
                    {id
                      ? "Save Changes"
                      : formData.published
                        ? "Publish Product"
                        : "Save For Later"}
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
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
