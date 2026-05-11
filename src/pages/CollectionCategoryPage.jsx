/**
 * CollectionCategoryPage.jsx — single file, fully merged
 *
 * BUG FIX: ALL hooks now run BEFORE any early return.
 * Previously useMemo was after `if (initialLoad && loading) return` → crash.
 */

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  X,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { useShop } from "../context/ShopContext.jsx";
import { ProductCard } from "../components/ProductCard.jsx";
import { useToasts } from "../lib/store.js";
import { categories } from "../lib/products.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const ALL_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "28",
  "30",
  "32",
  "34",
  "36",
];

const COLORS = [
  { name: "White", hex: "#F5F5F0" },
  { name: "Black", hex: "#1A1A1A" },
  { name: "Navy", hex: "#1B2A4A" },
  { name: "Ecru", hex: "#C8B99A" },
  { name: "Sage", hex: "#7D9B76" },
  { name: "Indigo", hex: "#3D4F7C" },
  { name: "Charcoal", hex: "#4A4A4A" },
  { name: "Camel", hex: "#C19A6B" },
  { name: "Ivory", hex: "#FFFFF0" },
  { name: "Stone", hex: "#928E85" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "low", label: "Price: Low → High" },
  { value: "high", label: "Price: High → Low" },
  { value: "best", label: "Best Rated" },
];

const DEFAULT_FILTERS = { sizes: [], colors: [], maxPrice: 10000 };

// ─── SizeBtn ─────────────────────────────────────────────────────────────────

function SizeBtn({ size, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        minWidth: "40px",
        height: "40px",
        padding: "0 10px",
        borderRadius: "8px",
        border: `1.5px solid ${active || hov ? "var(--color-foreground)" : "var(--color-border)"}`,
        backgroundColor: active ? "var(--color-foreground)" : "transparent",
        color: active ? "var(--color-background)" : "var(--color-foreground)",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.04em",
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "inherit",
      }}
    >
      {size}
    </button>
  );
}

// ─── ColorSwatch ─────────────────────────────────────────────────────────────

function ColorSwatch({ color, active, onClick }) {
  const [hov, setHov] = useState(false);
  const isLight = ["White", "Ivory", "Ecru"].includes(color.name);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={color.name}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: color.hex,
        border: active
          ? "2.5px solid var(--color-foreground)"
          : isLight
            ? "1.5px solid var(--color-border)"
            : "2px solid transparent",
        outline: active
          ? "2px solid var(--color-background)"
          : hov
            ? "2px solid var(--color-border)"
            : "none",
        outlineOffset: "1px",
        cursor: "pointer",
        transition: "all 0.2s",
        transform: hov || active ? "scale(1.12)" : "scale(1)",
        boxShadow: active ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
      }}
    />
  );
}

// ─── RangeSlider ─────────────────────────────────────────────────────────────

function RangeSlider({ min, max, step, value, onChange }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position: "relative", padding: "8px 0" }}>
      <div
        style={{
          position: "relative",
          height: "4px",
          borderRadius: "2px",
          backgroundColor: "var(--color-border)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            width: `${pct}%`,
            height: "100%",
            borderRadius: "2px",
            backgroundColor: "var(--color-foreground)",
            transition: "width 0.1s",
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "20px",
          opacity: 0,
          cursor: "pointer",
          margin: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: `${pct}%`,
          transform: "translate(-50%, -50%)",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          backgroundColor: "var(--color-foreground)",
          border: "2px solid var(--color-background)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          pointerEvents: "none",
          transition: "left 0.1s",
        }}
      />
    </div>
  );
}

// ─── CustomSelect ─────────────────────────────────────────────────────────────

function CustomSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={(e) =>
          (e.currentTarget.style.borderColor = "var(--color-foreground)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.borderColor = "var(--color-border)")
        }
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "9px 14px",
          border: "1.5px solid var(--color-border)",
          borderRadius: "10px",
          backgroundColor: "var(--color-background)",
          color: "var(--color-foreground)",
          fontSize: "12px",
          fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
          fontFamily: "inherit",
          transition: "border-color 0.2s",
        }}
      >
        <ArrowUpDown size={13} strokeWidth={1.8} />
        {current?.label}
        <ChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "180px",
            backgroundColor: "var(--color-background)",
            border: "1.5px solid var(--color-border)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
            zIndex: 40,
            animation: "fadeInUp 0.15s ease-out",
          }}
        >
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              onMouseEnter={(e) => {
                if (o.value !== value)
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface)";
              }}
              onMouseLeave={(e) => {
                if (o.value !== value)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 16px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: o.value === value ? 600 : 400,
                color:
                  o.value === value
                    ? "var(--color-foreground)"
                    : "color-mix(in oklch, var(--color-foreground) 70%, transparent)",
                backgroundColor:
                  o.value === value ? "var(--color-surface)" : "transparent",
                cursor: "pointer",
                transition: "background 0.15s",
                border: "none",
                fontFamily: "inherit",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── FilterSection Accordion ──────────────────────────────────────────────────

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      style={{
        borderBottom: "1px solid var(--color-border)",
        paddingBottom: open ? "20px" : "0",
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "16px 0",
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
        <ChevronDown
          size={14}
          strokeWidth={2}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.25s",
          }}
        />
      </button>
      <div
        style={{
          overflow: "hidden",
          maxHeight: open ? "400px" : "0",
          transition: "max-height 0.3s ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── FilterPanel ──────────────────────────────────────────────────────────────

function FilterPanel({ draft, setDraft }) {
  const toggleSize = (s) =>
    setDraft((d) => ({
      ...d,
      sizes: d.sizes.includes(s)
        ? d.sizes.filter((x) => x !== s)
        : [...d.sizes, s],
    }));

  const toggleColor = (c) =>
    setDraft((d) => ({
      ...d,
      colors: d.colors.includes(c)
        ? d.colors.filter((x) => x !== c)
        : [...d.colors, c],
    }));

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <FilterSection title="Size">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            paddingBottom: "4px",
          }}
        >
          {ALL_SIZES.map((s) => (
            <SizeBtn
              key={s}
              size={s}
              active={draft.sizes.includes(s)}
              onClick={() => toggleSize(s)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <div style={{ paddingBottom: "4px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-muted-foreground)",
              }}
            >
              ₹500
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--color-foreground)",
                fontFamily: "var(--font-serif)",
              }}
            >
              ₹{draft.maxPrice.toLocaleString("en-IN")}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "var(--color-muted-foreground)",
              }}
            >
              ₹10,000
            </span>
          </div>
          <RangeSlider
            min={500}
            max={10000}
            step={100}
            value={draft.maxPrice}
            onChange={(v) => setDraft((d) => ({ ...d, maxPrice: v }))}
          />
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            paddingBottom: "4px",
          }}
        >
          {COLORS.map((c) => (
            <ColorSwatch
              key={c.name}
              color={c}
              active={draft.colors.includes(c.name)}
              onClick={() => toggleColor(c.name)}
            />
          ))}
        </div>
        {draft.colors.length > 0 && (
          <div
            style={{
              marginTop: "10px",
              fontSize: "11px",
              color: "var(--color-muted-foreground)",
            }}
          >
            {draft.colors.join(", ")}
          </div>
        )}
      </FilterSection>
    </div>
  );
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

function FilterChip({ label, onClear }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClear}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 12px 5px 14px",
        borderRadius: "50px",
        border: `1.5px solid ${hov ? "var(--color-foreground)" : "var(--color-border)"}`,
        backgroundColor: hov ? "var(--color-surface)" : "transparent",
        fontSize: "11px",
        fontWeight: 500,
        color: "var(--color-foreground)",
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
      <X size={11} strokeWidth={2.5} style={{ opacity: 0.6 }} />
    </button>
  );
}

// ─── FilterSidebar (desktop) ──────────────────────────────────────────────────

function FilterSidebar({ draft, setDraft, hasDraftChanges, onApply, onReset }) {
  return (
    <aside className="ccp-sidebar">
      <div
        style={{
          position: "sticky",
          top: "80px",
          backgroundColor: "var(--color-background)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "4px",
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
            Filters
          </span>
          {(draft.sizes.length > 0 ||
            draft.colors.length > 0 ||
            draft.maxPrice < 10000) && (
            <button
              onClick={onReset}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-foreground)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-muted-foreground)")
              }
              style={{
                fontSize: "11px",
                color: "var(--color-muted-foreground)",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                fontFamily: "inherit",
                padding: 0,
                transition: "color 0.2s",
              }}
            >
              Reset
            </button>
          )}
        </div>

        <FilterPanel draft={draft} setDraft={setDraft} />

        <div style={{ paddingTop: "20px" }}>
          <button
            onClick={onApply}
            disabled={!hasDraftChanges}
            onMouseEnter={(e) => {
              if (hasDraftChanges) e.currentTarget.style.opacity = "0.85";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: hasDraftChanges
                ? "var(--color-foreground)"
                : "var(--color-border)",
              color: hasDraftChanges
                ? "var(--color-background)"
                : "var(--color-muted-foreground)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: hasDraftChanges ? "pointer" : "not-allowed",
              transition: "all 0.25s",
              fontFamily: "inherit",
            }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── FilterDrawer (mobile) ────────────────────────────────────────────────────

function FilterDrawer({
  open,
  visible,
  draft,
  setDraft,
  filteredCount,
  onClose,
  onApply,
  onReset,
}) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200 }}>
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "92vh",
          backgroundColor: "var(--color-background)",
          borderRadius: "20px 20px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingTop: "12px",
            paddingBottom: "4px",
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

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px 16px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.3rem",
                lineHeight: 1,
              }}
            >
              Filters
            </h3>
            {(draft.sizes.length > 0 ||
              draft.colors.length > 0 ||
              draft.maxPrice < 10000) && (
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--color-muted-foreground)",
                  marginTop: "4px",
                }}
              >
                {draft.sizes.length +
                  draft.colors.length +
                  (draft.maxPrice < 10000 ? 1 : 0)}{" "}
                selected
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={onReset}
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "var(--color-muted-foreground)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Reset
            </button>
            <button
              onClick={onClose}
              style={{
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
              }}
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 20px",
            scrollbarWidth: "none",
          }}
        >
          <FilterPanel draft={draft} setDraft={setDraft} />
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 20px",
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "var(--color-background)",
            display: "flex",
            gap: "10px",
          }}
        >
          <button
            onClick={onClose}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-foreground)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "var(--color-border)")
            }
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "12px",
              border: "1.5px solid var(--color-border)",
              backgroundColor: "transparent",
              color: "var(--color-foreground)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            style={{
              flex: 2,
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "var(--color-foreground)",
              color: "var(--color-background)",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.2s",
            }}
          >
            View {filteredCount} Results
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Components ──────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div
        style={{
          aspectRatio: "3/4",
          width: "100%",
          borderRadius: "12px",
          backgroundColor: "var(--color-surface)",
          animation: "pulse 1.5s infinite ease-in-out",
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div
          style={{
            height: "16px",
            width: "60%",
            borderRadius: "4px",
            backgroundColor: "var(--color-surface)",
            animation: "pulse 1.5s infinite ease-in-out",
          }}
        />
        <div
          style={{
            height: "14px",
            width: "40%",
            borderRadius: "4px",
            backgroundColor: "var(--color-surface)",
            animation: "pulse 1.5s infinite ease-in-out",
          }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CollectionCategoryPage() {
  const { category } = useParams();
  const { products, loading, fetchProducts, nextCursor, hasMore, total } = useShop();
  
  // ── ALL HOOKS FIRST ──
  const [initialLoad, setInitialLoad] = useState(true);
  const [applied, setApplied] = useState(DEFAULT_FILTERS);
  const [draft, setDraft] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("newest");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  const fetchingRef = useRef(false);
  const debounceTimerRef = useRef(null);

  // 1. Debounced filter apply for price
  const debouncedSetApplied = useCallback((newFilters) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setApplied(newFilters);
    }, 300);
  }, []);

  const fetchFiltered = useCallback(async ({ cursor = null, append = false } = {}) => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    
    try {
      const filters = { 
        category, 
        minPrice: 0, 
        maxPrice: applied.maxPrice,
        sort: sort === "low" ? "price" : sort === "high" ? "-price" : sort === "best" ? "-rating" : "-createdAt"
      };
      
      await fetchProducts({ cursor, filters, limit: 20, append });
    } finally {
      fetchingRef.current = false;
      setInitialLoad(false);
    }
  }, [category, applied, sort, fetchProducts]);

  // Reset and fetch on category/filter change
  useEffect(() => {
    setInitialLoad(true);
    fetchFiltered({ cursor: null, append: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, applied, sort]);

  // 2. Cursor-aware Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 600 &&
        hasMore &&
        !loading &&
        !fetchingRef.current
      ) {
        fetchFiltered({ cursor: nextCursor, append: true });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, nextCursor, fetchFiltered]);

  const filtered = useMemo(() => {
    let r = products.slice();
    if (applied.sizes.length)
      r = r.filter((p) => p.sizes?.some((s) => applied.sizes.includes(s)));
    if (applied.colors.length)
      r = r.filter((p) =>
        p.colors?.some((c) => applied.colors.includes(c.name)),
      );
    return r;
  }, [products, applied]);

  const activeChips = useMemo(
    () => [
      ...applied.sizes.map((s) => ({
        label: `Size: ${s}`,
        clear: () =>
          setApplied((a) => ({ ...a, sizes: a.sizes.filter((x) => x !== s) })),
      })),
      ...applied.colors.map((c) => ({
        label: c,
        clear: () =>
          setApplied((a) => ({
            ...a,
            colors: a.colors.filter((x) => x !== c),
          })),
      })),
      ...(applied.maxPrice < 10000
        ? [
            {
              label: `Under ₹${applied.maxPrice.toLocaleString("en-IN")}`,
              clear: () => setApplied((a) => ({ ...a, maxPrice: 10000 })),
            },
          ]
        : []),
    ],
    [applied],
  );

  const hasDraftChanges = JSON.stringify(draft) !== JSON.stringify(applied);

  // ── Handlers ──
  const categoryData = categories.find(c => c.slug === category);
  const title = products[0]?.category ?? categoryData?.name ?? (category ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ") : "");

  const openDrawer = () => {
    setDraft({ ...applied });
    setDrawerOpen(true);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setDrawerVisible(true)),
    );
  };
  const closeDrawer = () => {
    setDrawerVisible(false);
    setTimeout(() => setDrawerOpen(false), 380);
  };
  const applyFilters = () => setApplied({ ...draft });
  const applyDrawer = () => {
    setApplied({ ...draft });
    closeDrawer();
  };
  const resetDraft = () => setDraft(DEFAULT_FILTERS);
  const resetAll = () => {
    setDraft(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
  };

  // ── Render ──
  return (
    <div
      className="ccp-root"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px 20px 100px",
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
        >
          Home
        </Link>
        <ChevronRight size={11} />
        <Link
          to="/collections"
          style={{
            textDecoration: "none",
            color: "inherit",
            transition: "color 0.2s",
          }}
        >
          Collections
        </Link>
        <ChevronRight size={11} />
        <span style={{ color: "var(--color-foreground)", fontWeight: 600 }}>
          {title}
        </span>
      </nav>

      {/* Page Header */}
      <div style={{ marginTop: "28px", marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: "10px",
          }}
        >
          {title}
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <p
            style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}
          >
            <span style={{ fontWeight: 600, color: "var(--color-foreground)" }}>
              {filtered.length}
            </span>{" "}
            products
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={openDrawer}
              className="ccp-filter-btn"
              style={{
                display: "none",
                alignItems: "center",
                gap: "7px",
                padding: "9px 16px",
                borderRadius: "10px",
                border: "1.5px solid var(--color-border)",
                backgroundColor:
                  activeChips.length > 0
                    ? "var(--color-foreground)"
                    : "transparent",
                color:
                  activeChips.length > 0
                    ? "var(--color-background)"
                    : "var(--color-foreground)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              <SlidersHorizontal size={14} strokeWidth={2} />
              Filters {activeChips.length > 0 && `(${activeChips.length})`}
            </button>
            <CustomSelect
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "24px",
            alignItems: "center",
          }}
        >
          {activeChips.map((c, i) => (
            <FilterChip key={i} label={c.label} onClear={c.clear} />
          ))}
          <button
            onClick={resetAll}
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--color-muted-foreground)",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 8px",
              fontFamily: "inherit",
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Main Layout */}
      <div className="ccp-layout">
        <FilterSidebar
          draft={draft}
          setDraft={(update) => {
            setDraft((prev) => {
              const next = typeof update === "function" ? update(prev) : update;
              if (next.maxPrice !== prev.maxPrice) {
                debouncedSetApplied(next);
              }
              return next;
            });
          }}
          hasDraftChanges={hasDraftChanges}
          onApply={applyFilters}
          onReset={resetDraft}
        />

        <div>
          <div className="ccp-grid">
            {/* 3. Loading skeleton logic */}
            {initialLoad && loading ? (
              Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              <>
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
                {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
              </>
            )}
          </div>

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</p>
              <p style={{ fontSize: "16px", fontFamily: "var(--font-serif)" }}>No products found</p>
              <button
                onClick={resetAll}
                style={{
                  marginTop: "24px",
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "1.5px solid var(--color-foreground)",
                  background: "transparent",
                  color: "var(--color-foreground)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

          {hasMore && filtered.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "64px" }}>
              <button
                onClick={() => fetchFiltered({ cursor: nextCursor, append: true })}
                disabled={loading}
                style={{
                  padding: "14px 48px",
                  borderRadius: "14px",
                  border: "none",
                  backgroundColor: "var(--color-foreground)",
                  color: "var(--color-background)",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  opacity: loading ? 0.6 : 1,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { if (!loading) e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {loading ? "Loading..." : "Load More Products"}
              </button>
              <p style={{ marginTop: "20px", fontSize: "12px", color: "var(--color-muted-foreground)", fontWeight: 500 }}>
                Showing {filtered.length} of {total} products
              </p>
            </div>
          )}
        </div>
      </div>

      <FilterDrawer
        open={drawerOpen}
        visible={drawerVisible}
        draft={draft}
        setDraft={setDraft}
        filteredCount={filtered.length}
        onClose={closeDrawer}
        onApply={applyDrawer}
        onReset={resetDraft}
      />

      <style>{`
        .ccp-layout { display: grid; grid-template-columns: 1fr; gap: 0; }
        .ccp-sidebar { display: none; }
        .ccp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .ccp-filter-btn { display: flex !important; }
        @media (min-width: 1024px) {
          .ccp-layout { grid-template-columns: 260px 1fr; gap: 48px; }
          .ccp-sidebar { display: block !important; }
          .ccp-filter-btn { display: none !important; }
          .ccp-grid { grid-template-columns: repeat(3, 1fr); gap: 28px; }
        }
        @media (min-width: 1280px) {
          .ccp-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

