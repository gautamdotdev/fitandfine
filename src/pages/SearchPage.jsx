import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useShop } from "../context/ShopContext.jsx";
import { ProductCard } from "../components/ProductCard.jsx";

function SkeletonProductCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div className="sk" style={{ width: "100%", aspectRatio: "3/4", borderRadius: "8px" }} />
      <div className="sk" style={{ width: "65%", height: "14px", borderRadius: "4px" }} />
      <div className="sk" style={{ width: "45%", height: "14px", borderRadius: "4px" }} />
      <div className="sk" style={{ width: "30%", height: "14px", borderRadius: "4px" }} />
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { products, loading, fetchProducts } = useShop();
  const [searchInput, setSearchInput] = useState(query);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    fetchProducts({ limit: 100 });
  }, [fetchProducts]);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category?.toLowerCase() || "").includes(q) ||
        (p.description?.toLowerCase() || "").includes(q)
    );
  }, [products, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) setSearchParams({ q: searchInput.trim() });
    else setSearchParams({});
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const isInitialLoading = loading && products.length === 0;

  return (
    <div className="page-transition search-root">

      {/* Search Bar Section - Hidden because header handles it now */}
      <section className="search-hero" style={{ display: "none" }}>
        <p className="label-caps" style={{ color: "var(--color-gold)", fontSize: "10px", letterSpacing: "0.18em", marginBottom: "20px" }}>
          Explore FIT &amp; FINE
        </p>
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrap" style={{ borderColor: inputFocused ? "var(--color-foreground)" : "var(--color-border)" }}>
            <Search size={18} strokeWidth={1.5} className="search-icon" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Search products, categories, styles…"
              className="search-input"
              autoComplete="off"
            />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="search-clear" aria-label="Clear search">
                <X size={16} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Results Meta */}
      {query && !isInitialLoading && (
        <div className="results-meta">
          <p style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}>
            Results for{" "}
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--color-foreground)" }}>
              "{query}"
            </span>
          </p>
          <span className="results-count">
            {results.length} {results.length === 1 ? "product" : "products"}
          </span>
        </div>
      )}

      {/* Skeleton while loading */}
      {isInitialLoading && (
        <div className="search-grid">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonProductCard key={i} />)}
        </div>
      )}

      {/* Results Grid */}
      {!isInitialLoading && results.length > 0 && (
        <div className="search-grid">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {query && results.length === 0 && !loading && (
        <div className="state-center">
          <div className="state-icon">
            <Search size={32} strokeWidth={1} style={{ color: "var(--color-muted-foreground)" }} />
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
            No results found
          </h2>
          <p style={{ color: "var(--color-muted-foreground)", maxWidth: "380px", margin: "0 auto 32px", fontSize: "14px", lineHeight: 1.7 }}>
            Nothing matched "{query}". Try a broader term like "shirt" or "blue".
          </p>
          <button onClick={clearSearch} className="clear-btn">
            Clear Search
          </button>
        </div>
      )}

      {/* Initial / No Query State */}
      {!query && !isInitialLoading && (
        <div className="state-center">
          <div className="state-icon">
            <Search size={32} strokeWidth={1} style={{ color: "var(--color-gold)", opacity: 0.6 }} />
          </div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 4vw, 2rem)", marginBottom: "12px", letterSpacing: "-0.01em" }}>
            What are you looking for?
          </h2>
          <p style={{ color: "var(--color-muted-foreground)", fontSize: "14px", lineHeight: 1.7, maxWidth: "340px", margin: "0 auto" }}>
            Discover considered essentials — shirts, trousers, outerwear, and more.
          </p>
          {/* Quick suggestions */}
          <div className="suggestions">
            {["Shirts", "Trousers", "Linen", "Jackets", "Essentials"].map((s) => (
              <button
                key={s}
                className="suggestion-pill"
                onClick={() => {
                  setSearchInput(s);
                  setSearchParams({ q: s });
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .search-root {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0px 5px;
        }

        /* Hero */
        .search-hero {
          padding: 0px 0 28px;
          max-width: 640px;
        }
        .search-heading {
          font-size: clamp(1.75rem, 5vw, 3rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin-bottom: 28px;
        }

        /* Search form */
        .search-form { width: 100%; }
        .search-input-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1.5px solid var(--color-border);
          border-radius: 12px;
          padding: 0 16px;
          background: var(--color-surface);
          transition: border-color 0.2s;
        }
        .search-icon { color: var(--color-muted-foreground); flex-shrink: 0; }
        .search-input {
          flex: 1;
          padding: 16px 0;
          font-size: 15px;
          background: transparent;
          border: none;
          outline: none;
          color: var(--color-foreground);
          min-width: 0;
        }
        .search-input::placeholder { color: var(--color-muted-foreground); }
        .search-clear {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-muted-foreground);
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s;
          flex-shrink: 0;
        }
        .search-clear:hover { color: var(--color-foreground); }

        /* Results meta bar */
        .results-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          border-bottom: 1px solid var(--color-border);
          margin-bottom: 5px;
        }
        .results-count {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--color-gold);
          background: color-mix(in oklch, var(--color-gold) 10%, transparent);
          padding: 4px 12px;
          border-radius: 50px;
        }

        /* Grid */
        .search-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5px;
        }
        @media (min-width: 640px) {
          .search-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; }
        }
        @media (min-width: 1024px) {
          .search-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; }
        }

        /* States */
        .state-center {
          text-align: center;
          padding: 80px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .state-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          background: var(--color-surface);
        }

        /* Suggestion pills */
        .suggestions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin-top: 28px;
        }
        .suggestion-pill {
          padding: 8px 20px;
          border-radius: 50px;
          border: 1px solid var(--color-border);
          background: transparent;
          font-size: 13px;
          color: var(--color-foreground);
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.03em;
        }
        .suggestion-pill:hover {
          border-color: var(--color-gold);
          color: var(--color-gold);
          background: color-mix(in oklch, var(--color-gold) 8%, transparent);
        }

        /* Clear button */
        .clear-btn {
          padding: 12px 28px;
          border-radius: 50px;
          border: 1.5px solid var(--color-foreground);
          background: transparent;
          font-size: 13px;
          letter-spacing: 0.06em;
          cursor: pointer;
          color: var(--color-foreground);
          transition: all 0.2s;
        }
        .clear-btn:hover {
          background: var(--color-foreground);
          color: var(--color-background);
        }

        /* Skeleton */
        @keyframes sk-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        .sk {
          background: var(--color-border);
          animation: sk-pulse 1.6s ease-in-out infinite;
        }

        /* Mobile tweaks */
        @media (max-width: 768px) {
          .mobile-hide { display: none !important; }
          .search-root { padding-top: 10px; }
          .search-hero { padding: 5px 0 24px; }
          .search-input { font-size: 16px; }
          .state-center { padding: 40px 0; }
        }
      `}</style>
    </div>
  );
}