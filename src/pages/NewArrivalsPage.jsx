import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useShop } from "../context/ShopContext.jsx";
import { ProductCard } from "../components/ProductCard.jsx";
import { PageSkeleton } from "../components/Skeleton.jsx";


export default function NewArrivalsPage() {
  const { products, loading, fetchProducts } = useShop();
  useEffect(() => {
    fetchProducts({ filters: { newArrival: true } });
    // eslint-disable-next-line
  }, []);
  if (loading) return <PageSkeleton />;
  const items = products;

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
          onMouseEnter={(e) => {
            e.target.style.color = "var(--color-foreground)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "var(--color-muted-foreground)";
          }}
        >
          Home
        </Link>
        <ChevronRight size={11} />
        <span style={{ color: "var(--color-foreground)", fontWeight: 600 }}>
          New Arrivals
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
          Just Landed
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
            products
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="na-grid">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} badge="New" />
        ))}
      </div>

      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>📦</p>
          <p
            style={{
              fontSize: "16px",
              fontFamily: "var(--font-serif)",
              marginBottom: "8px",
            }}
          >
            Nothing new yet
          </p>
          <p
            style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}
          >
            Check back soon.
          </p>
        </div>
      )}

      <style>{`
          .na-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5px; }
          @media (min-width: 480px) { .na-grid { gap: 24px; } }
          @media (min-width: 768px) { .na-grid { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
          @media (min-width: 1280px) { .na-grid { grid-template-columns: repeat(4, 1fr); gap: 28px; } }
        `}</style>
    </div>
  );
}
