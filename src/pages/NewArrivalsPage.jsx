import { products } from "../lib/products.js";
import { ProductCard } from "../components/ProductCard.jsx";

export default function NewArrivalsPage() {
  const items = products.filter((p) => p.isNew);
  return (
    <div
      className="page-transition"
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "40px 40px 80px",
      }}
    >
      <p className="label-caps" style={{ color: "var(--color-gold)" }}>
        Just Landed
      </p>
      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
          marginTop: "8px",
        }}
      >
        New Arrivals
      </h1>
      <p
        style={{
          color: "var(--color-muted-foreground)",
          marginTop: "12px",
          maxWidth: "32rem",
        }}
      >
        The newest considered additions to the collection.
      </p>
      <div
        style={{ marginTop: "48px", display: "grid", gap: "24px" }}
        className="arrivals-grid"
      >
        {items.map((p) => (
          <ProductCard key={p.id} product={p} badge="New" />
        ))}
      </div>
      <style>{`
        .arrivals-grid { grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 1024px) {
          .arrivals-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
