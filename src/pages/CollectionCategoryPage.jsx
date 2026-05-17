/**
 * CollectionCategoryPage.jsx — single file, fully merged
 *
 * BUG FIX: ALL hooks now run BEFORE any early return.
 * Previously useMemo was after `if (initialLoad && loading) return` → crash.
 */

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ChevronRight,
  X,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { useShop } from "../context/ShopContext.jsx";
import { productApi } from "../lib/api.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { SkeletonProductCard } from "../components/Skeleton.jsx";

import { categories } from "../lib/products.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const PRICE_FALLBACK_MIN = 0;
const PRICE_FALLBACK_MAX = 10000;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "low", label: "Price: Low → High" },
  { value: "high", label: "Price: High → Low" },
  { value: "best", label: "Best Rated" },
];

const DEFAULT_FILTERS = {
  sizes: [],
  minPrice: PRICE_FALLBACK_MIN,
  maxPrice: PRICE_FALLBACK_MAX,
  fabric: "",
};

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

function FilterPanel({
  draft,
  setDraft,
  availableSizes,
  availableFabrics,
  minPriceBound,
  maxPriceBound,
}) {
  const toggleSize = (s) =>
    setDraft((d) => ({
      ...d,
      sizes: d.sizes.includes(s)
        ? d.sizes.filter((x) => x !== s)
        : [...d.sizes, s],
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
          {availableSizes.map((s) => (
            <SizeBtn
              key={s}
              size={s}
              active={draft.sizes.includes(s)}
              onClick={() => toggleSize(s)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Fabric">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            paddingBottom: "4px",
          }}
        >
          <button
            onClick={() => setDraft((d) => ({ ...d, fabric: "" }))}
            style={{
              padding: "6px 12px",
              borderRadius: "999px",
              border: `1.5px solid ${draft.fabric === "" ? "var(--color-foreground)" : "var(--color-border)"}`,
              backgroundColor:
                draft.fabric === "" ? "var(--color-foreground)" : "transparent",
              color:
                draft.fabric === ""
                  ? "var(--color-background)"
                  : "var(--color-foreground)",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Any
          </button>
          {availableFabrics.map((fabric) => (
            <button
              key={fabric}
              onClick={() => setDraft((d) => ({ ...d, fabric }))}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: `1.5px solid ${draft.fabric === fabric ? "var(--color-foreground)" : "var(--color-border)"}`,
                backgroundColor:
                  draft.fabric === fabric
                    ? "var(--color-foreground)"
                    : "transparent",
                color:
                  draft.fabric === fabric
                    ? "var(--color-background)"
                    : "var(--color-foreground)",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                fontFamily: "inherit",
              }}
            >
              {fabric}
            </button>
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
              ₹
              {Number(minPriceBound || PRICE_FALLBACK_MIN).toLocaleString(
                "en-IN",
              )}
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
              ₹
              {Number(maxPriceBound || PRICE_FALLBACK_MAX).toLocaleString(
                "en-IN",
              )}
            </span>
          </div>
          <RangeSlider
            min={minPriceBound || PRICE_FALLBACK_MIN}
            max={maxPriceBound || PRICE_FALLBACK_MAX}
            step={100}
            value={draft.maxPrice}
            onChange={(v) => setDraft((d) => ({ ...d, maxPrice: v }))}
          />
        </div>
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

function FilterSidebar({
  draft,
  setDraft,
  hasDraftChanges,
  onApply,
  onReset,
  availableSizes,
  availableFabrics,
  minPriceBound,
  maxPriceBound,
}) {
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
            draft.maxPrice < (maxPriceBound || PRICE_FALLBACK_MAX) ||
            !!draft.fabric) && (
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

        <FilterPanel
          draft={draft}
          setDraft={setDraft}
          availableSizes={availableSizes}
          availableFabrics={availableFabrics}
          minPriceBound={minPriceBound}
          maxPriceBound={maxPriceBound}
        />

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
  availableSizes,
  availableFabrics,
  minPriceBound,
  maxPriceBound,
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
              draft.maxPrice < (maxPriceBound || PRICE_FALLBACK_MAX) ||
              !!draft.fabric) && (
              <p
                style={{
                  fontSize: "11px",
                  color: "var(--color-muted-foreground)",
                  marginTop: "4px",
                }}
              >
                {draft.sizes.length +
                  (draft.maxPrice < (maxPriceBound || PRICE_FALLBACK_MAX)
                    ? 1
                    : 0) +
                  (draft.fabric ? 1 : 0)}{" "}
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
          <FilterPanel
            draft={draft}
            setDraft={setDraft}
            availableSizes={availableSizes}
            availableFabrics={availableFabrics}
            minPriceBound={minPriceBound}
            maxPriceBound={maxPriceBound}
          />
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CollectionCategoryPage() {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlFabric = (searchParams.get("fabric") || "").trim().toLowerCase();
  const urlSizes = (searchParams.get("sizes") || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const urlMaxPrice = Number(searchParams.get("maxPrice"));
  const urlSort = (searchParams.get("sort") || "").trim();
  const { products, loading, fetchProducts, nextCursor, hasMore, total } =
    useShop();

  // ── ALL HOOKS FIRST ──
  const [initialLoad, setInitialLoad] = useState(true);
  const [applied, setApplied] = useState(() => ({
    ...DEFAULT_FILTERS,
    fabric: urlFabric,
    sizes: urlSizes,
    maxPrice:
      Number.isFinite(urlMaxPrice) && urlMaxPrice > 0
        ? urlMaxPrice
        : PRICE_FALLBACK_MAX,
  }));
  const [draft, setDraft] = useState(() => ({
    ...DEFAULT_FILTERS,
    fabric: urlFabric,
    sizes: urlSizes,
    maxPrice:
      Number.isFinite(urlMaxPrice) && urlMaxPrice > 0
        ? urlMaxPrice
        : PRICE_FALLBACK_MAX,
  }));
  const [sort, setSort] = useState(
    SORT_OPTIONS.some((option) => option.value === urlSort)
      ? urlSort
      : "newest",
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    sizes: [],
    fabrics: [],
    minPrice: PRICE_FALLBACK_MIN,
    maxPrice: PRICE_FALLBACK_MAX,
  });

  const fetchingRef = useRef(false);

  useEffect(() => {
    productApi
      .getFilters({ category })
      .then((data) => {
        const backendFilters = data?.filters || {};
        const minPrice = Number(backendFilters.minPrice || PRICE_FALLBACK_MIN);
        const maxPrice = Number(backendFilters.maxPrice || PRICE_FALLBACK_MAX);
        setFilterOptions({
          sizes: Array.isArray(backendFilters.sizes)
            ? backendFilters.sizes
            : [],
          fabrics: Array.isArray(backendFilters.fabrics)
            ? backendFilters.fabrics
            : [],
          minPrice,
          maxPrice,
        });

        setApplied((prev) => ({
          ...prev,
          minPrice,
          maxPrice: Math.min(prev.maxPrice || maxPrice, maxPrice),
        }));
        setDraft((prev) => ({
          ...prev,
          minPrice,
          maxPrice: Math.min(prev.maxPrice || maxPrice, maxPrice),
        }));
      })
      .catch(() => {
        setFilterOptions({
          sizes: [],
          fabrics: [],
          minPrice: PRICE_FALLBACK_MIN,
          maxPrice: PRICE_FALLBACK_MAX,
        });
      });
  }, [category]);

  useEffect(() => {
    const parsedSort = SORT_OPTIONS.some((option) => option.value === urlSort)
      ? urlSort
      : "newest";
    const maxBound = filterOptions.maxPrice || PRICE_FALLBACK_MAX;
    const minBound = filterOptions.minPrice || PRICE_FALLBACK_MIN;
    const parsedMaxPrice =
      Number.isFinite(urlMaxPrice) && urlMaxPrice > 0
        ? Math.min(urlMaxPrice, maxBound)
        : maxBound;

    setSort(parsedSort);
    setApplied((prev) => ({
      ...prev,
      fabric: urlFabric,
      sizes: urlSizes,
      minPrice: minBound,
      maxPrice: parsedMaxPrice,
    }));
    setDraft((prev) => ({
      ...prev,
      fabric: urlFabric,
      sizes: urlSizes,
      minPrice: minBound,
      maxPrice: parsedMaxPrice,
    }));
  }, [
    urlFabric,
    urlSort,
    urlMaxPrice,
    filterOptions.maxPrice,
    filterOptions.minPrice,
    searchParams,
  ]);

  const fetchFiltered = useCallback(
    async ({ cursor = null, append = false } = {}) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        const filters = {
          category,
          fabric: applied.fabric,
          sizes: applied.sizes.length ? applied.sizes.join(",") : undefined,
          minPrice: applied.minPrice,
          maxPrice: applied.maxPrice,
          sort:
            sort === "low"
              ? "price"
              : sort === "high"
                ? "-price"
                : sort === "best"
                  ? "-rating"
                  : "-createdAt",
        };

        await fetchProducts({ cursor, filters, limit: 20, append });
      } finally {
        fetchingRef.current = false;
        setInitialLoad(false);
      }
    },
    [category, applied, sort, fetchProducts],
  );

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
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 600 &&
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
    return products.slice();
  }, [products]);

  const activeChips = useMemo(
    () => [
      ...(applied.fabric
        ? [
            {
              label: `Fabric: ${applied.fabric.charAt(0).toUpperCase()}${applied.fabric.slice(1)}`,
              clear: () => {
                const next = new URLSearchParams(searchParams);
                next.delete("fabric");
                setSearchParams(next, { replace: true });
              },
            },
          ]
        : []),
      ...applied.sizes.map((s) => ({
        label: `Size: ${s}`,
        clear: () => {
          const nextSizes = applied.sizes.filter((x) => x !== s);
          const next = new URLSearchParams(searchParams);
          if (nextSizes.length > 0) next.set("sizes", nextSizes.join(","));
          else next.delete("sizes");
          setSearchParams(next, { replace: true });
        },
      })),
      ...(applied.maxPrice < (filterOptions.maxPrice || PRICE_FALLBACK_MAX)
        ? [
            {
              label: `Under ₹${applied.maxPrice.toLocaleString("en-IN")}`,
              clear: () => {
                const next = new URLSearchParams(searchParams);
                next.delete("maxPrice");
                setSearchParams(next, { replace: true });
              },
            },
          ]
        : []),
    ],
    [applied, searchParams, setSearchParams, filterOptions.maxPrice],
  );

  const hasDraftChanges = JSON.stringify(draft) !== JSON.stringify(applied);

  // ── Handlers ──
  const categoryData = categories.find((c) => c.slug === category);
  const title =
    categoryData?.name ||
    (category
      ? category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ")
      : "");

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
  const writeFiltersToUrl = useCallback(
    (nextFilters, nextSort = sort) => {
      const maxBound = filterOptions.maxPrice || PRICE_FALLBACK_MAX;
      const params = new URLSearchParams(searchParams);

      if (nextFilters.fabric) params.set("fabric", nextFilters.fabric);
      else params.delete("fabric");

      if (nextFilters.sizes?.length) {
        params.set("sizes", nextFilters.sizes.join(","));
      } else {
        params.delete("sizes");
      }

      if (
        Number.isFinite(nextFilters.maxPrice) &&
        nextFilters.maxPrice > 0 &&
        nextFilters.maxPrice < maxBound
      ) {
        params.set("maxPrice", String(nextFilters.maxPrice));
      } else {
        params.delete("maxPrice");
      }

      if (nextSort && nextSort !== "newest") params.set("sort", nextSort);
      else params.delete("sort");

      setSearchParams(params, { replace: true });
    },
    [filterOptions.maxPrice, searchParams, setSearchParams, sort],
  );

  const applyFilters = () => {
    writeFiltersToUrl(draft, sort);
  };
  const applyDrawer = () => {
    writeFiltersToUrl(draft, sort);
    closeDrawer();
  };
  const resetDraft = () =>
    setDraft((prev) => ({
      ...DEFAULT_FILTERS,
      minPrice: filterOptions.minPrice || PRICE_FALLBACK_MIN,
      maxPrice: filterOptions.maxPrice || PRICE_FALLBACK_MAX,
    }));
  const resetAll = () => {
    setDraft((prev) => ({
      ...DEFAULT_FILTERS,
      minPrice: filterOptions.minPrice || PRICE_FALLBACK_MIN,
      maxPrice: filterOptions.maxPrice || PRICE_FALLBACK_MAX,
    }));
    setApplied((prev) => ({
      ...DEFAULT_FILTERS,
      minPrice: filterOptions.minPrice || PRICE_FALLBACK_MIN,
      maxPrice: filterOptions.maxPrice || PRICE_FALLBACK_MAX,
    }));
    const next = new URLSearchParams(searchParams);
    next.delete("fabric");
    next.delete("sizes");
    next.delete("maxPrice");
    next.delete("sort");
    setSearchParams(next, { replace: true });
  };

  // ── Render ──
  return (
    <div
      className="ccp-root"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0px 5px",
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
      <div style={{ marginTop: "28px", marginBottom: "10px" }}>
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
              onChange={(value) => {
                setSort(value);
                writeFiltersToUrl(draft, value);
              }}
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
          setDraft={setDraft}
          hasDraftChanges={hasDraftChanges}
          onApply={applyFilters}
          onReset={resetDraft}
          availableSizes={filterOptions.sizes}
          availableFabrics={filterOptions.fabrics}
          minPriceBound={filterOptions.minPrice}
          maxPriceBound={filterOptions.maxPrice}
        />

        <div>
          <div className="ccp-grid">
            {/* 3. Loading skeleton logic */}
            {initialLoad && loading ? (
              Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    border: "1.5px solid var(--color-border)",
                    backgroundColor: "var(--color-background)",
                  }}
                >
                  <SkeletonProductCard />
                </div>
              ))
            ) : (
              <>
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
                {loading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        border: "1.5px solid var(--color-border)",
                        backgroundColor: "var(--color-background)",
                      }}
                    >
                      <SkeletonProductCard />
                    </div>
                  ))}
              </>
            )}
          </div>

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</p>
              <p style={{ fontSize: "16px", fontFamily: "var(--font-serif)" }}>
                No products found
              </p>
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
                onClick={() =>
                  fetchFiltered({ cursor: nextCursor, append: true })
                }
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
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {loading ? "Loading..." : "Load More Products"}
              </button>
              <p
                style={{
                  marginTop: "20px",
                  fontSize: "12px",
                  color: "var(--color-muted-foreground)",
                  fontWeight: 500,
                }}
              >
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
        availableSizes={filterOptions.sizes}
        availableFabrics={filterOptions.fabrics}
        minPriceBound={filterOptions.minPrice}
        maxPriceBound={filterOptions.maxPrice}
      />

      <style>{`
        .ccp-layout { display: grid; grid-template-columns: 1fr; gap: 0; }
        .ccp-sidebar { display: none; }
        .ccp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; }
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
        @media (min-width: 1536px) {
          .ccp-grid { grid-template-columns: repeat(5, 1fr); }
        }
        @media (min-width: 1780px) {
          .ccp-grid { grid-template-columns: repeat(6, 1fr); }
        }

      `}</style>
    </div>
  );
}
