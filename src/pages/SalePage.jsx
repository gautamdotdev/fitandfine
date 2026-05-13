import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useShop } from "../context/ShopContext.jsx";
import { ProductCard } from "../components/ProductCard.jsx";
import { PageSkeleton } from "../components/Skeleton.jsx";

export default function SalePage() {
  const { products, loading, fetchProducts } = useShop();

  useEffect(() => {
    // Fetch all products to filter them on the client side,
    // consistent with how NewArrivalsPage works in this codebase.
    fetchProducts({ limit: 100 });
  }, [fetchProducts]);

  if (loading && products.length === 0) return <PageSkeleton />;


  const items = products.filter((p) => p.salePrice);

  return (
    <div
      className="page-transition"
      style={{ maxWidth: "1400px", margin: "0 auto", padding: "0px 5px" }}
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
        <span style={{ color: "var(--color-foreground)", fontWeight: 600 }}>
          Sale
        </span>
      </nav>

      {/* Header */}
      <div style={{ marginTop: "28px", marginBottom: "10px" }}>
        <p
          className="label-caps"
          style={{
            color: "var(--color-gold)",
            fontSize: "10px",
            letterSpacing: "0.12em",
          }}
        >
          Limited Time Offers
        </p>
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
              {items.length}
            </span>{" "}
            products on sale
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="sale-grid">
        {items.map((p) => {
          const discount = Math.round((1 - p.salePrice / p.price) * 100);
          return (
            <ProductCard key={p.id} product={p} badge={`${discount}% OFF`} />
          );
        })}
      </div>

      {items.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>🏷️</p>
          <p
            style={{
              fontSize: "16px",
              fontFamily: "var(--font-serif)",
              marginBottom: "8px",
            }}
          >
            No active sales
          </p>
          <p
            style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}
          >
            Check back later for exclusive deals.
          </p>
        </div>
      )}

      <style>{`
        .sale-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; }
        @media (min-width: 480px) { .sale-grid { gap: 24px; } }
        @media (min-width: 768px) { .sale-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
        @media (min-width: 1280px) { .sale-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; } }
        @media (min-width: 1440px) { .sale-grid { grid-template-columns: repeat(5, 1fr); gap: 28px; } }
        @media (min-width: 1600px) { .sale-grid { grid-template-columns: repeat(6, 1fr); gap: 28px; } }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-gold);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
