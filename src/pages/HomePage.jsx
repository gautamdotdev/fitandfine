import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { useShop } from "../context/ShopContext";
import {
  categories,
  HERO_IMAGE,
  EDITORIAL_IMAGE,
  STORY_IMAGE,
} from "../lib/products.js";
import { ProductCard } from "../components/ProductCard.jsx";
import { SkeletonBox, SkeletonProductCard } from "../components/Skeleton.jsx";
import { adminApi } from "../lib/api.js";

function HomePageSkeleton() {
  return (
    <div className="page-transition">
      {/* HERO skeleton */}
      <section
        style={{ display: "grid", minHeight: "88vh" }}
        className="hero-grid"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "32px 64px 64px 64px",
            gap: "24px",
          }}
          className="hero-content"
          data-order={heroTextOrder}
        >
          <SkeletonBox width="140px" height="12px" borderRadius="50px" />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <SkeletonBox width="80%" height="60px" borderRadius="6px" />
            <SkeletonBox width="70%" height="60px" borderRadius="6px" />
            <SkeletonBox width="60%" height="60px" borderRadius="6px" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SkeletonBox width="90%" height="16px" />
            <SkeletonBox width="75%" height="16px" />
          </div>
          <SkeletonBox width="200px" height="52px" borderRadius="50px" />
        </div>
        <div
          style={{ position: "relative", minHeight: "50vh" }}
          className="hero-image"
        >
          <SkeletonBox
            width="100%"
            height="100%"
            borderRadius="0"
            style={{ position: "absolute", inset: 0 }}
          />
        </div>
      </section>

      {/* FEATURED skeleton */}
      <section
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "48px 20px" }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "56px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <SkeletonBox width="80px" height="12px" />
          <SkeletonBox width="220px" height="40px" borderRadius="6px" />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "24px",
          }}
          className="featured-grid"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </section>

      {/* EDITORIAL skeleton */}
      <section
        style={{ display: "grid", marginTop: "80px" }}
        className="editorial-grid"
      >
        <SkeletonBox
          height="0"
          borderRadius="0"
          style={{ aspectRatio: "4/3", height: "auto" }}
          className="editorial-image"
        />
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 40px",
            gap: "20px",
          }}
          className="editorial-content"
        >
          <SkeletonBox width="60px" height="12px" />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <SkeletonBox width="80%" height="40px" borderRadius="6px" />
            <SkeletonBox width="60%" height="40px" borderRadius="6px" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SkeletonBox height="14px" />
            <SkeletonBox width="85%" height="14px" />
          </div>
          <SkeletonBox width="120px" height="14px" />
        </div>
      </section>

      {/* NEW ARRIVALS skeleton */}
      <section
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <SkeletonBox width="60px" height="12px" />
            <SkeletonBox width="180px" height="36px" borderRadius="6px" />
          </div>
          <SkeletonBox width="60px" height="12px" />
        </div>
        <div style={{ display: "flex", gap: "24px", overflow: "hidden" }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ minWidth: "260px" }}>
              <SkeletonProductCard />
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .hero-grid { grid-template-columns: 1fr; }
        .hero-content { padding: 48px 0px; order: 2; text-align: center; align-items: center; }
        .hero-image { order: 1; }
        .categories-grid { grid-template-columns: repeat(2, 1fr); }
        .featured-grid { grid-template-columns: repeat(2, 1fr); }
        .editorial-grid { grid-template-columns: 1fr; }
        .editorial-image { aspect-ratio: 4/3; }
        .editorial-content { padding: 48px 20px !important; text-align: center; align-items: center; }
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: repeat(2, 1fr) !important; min-height: 90vh !important; }
          .hero-content { order: 1 !important; padding: 80px 80px !important; }
          .hero-image { order: 2 !important; min-height: 100% !important; }
          .categories-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .featured-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .editorial-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .editorial-image { aspect-ratio: auto !important; }
          .editorial-content { padding: 80px 100px !important; }
        }
      `}</style>
    </div>
  );
}

export default function HomePage() {
  const { products, loading, fetchProducts } = useShop();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [settings, setSettings] = useState(null);
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    fetchProducts({ page, limit: 24, append: page > 1 }).then((data) => {
      if (data && data.products && data.products.length < 24) setHasMore(false);
      setInitialLoad(false);
    });
    // eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    adminApi
      .getSiteSettings()
      .then((data) => setSettings(data.settings))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const popup = settings?.offerPopup;
    if (!popup?.enabled || sessionStorage.getItem("fitandfineOfferSeen")) return;
    const timer = setTimeout(() => {
      setShowOffer(true);
      sessionStorage.setItem("fitandfineOfferSeen", "1");
    }, Math.max(Number(popup.delaySeconds || 3), 0) * 1000);
    return () => clearTimeout(timer);
  }, [settings]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 400 &&
        hasMore &&
        !loading
      ) {
        setPage((prev) => prev + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading]);

  if (initialLoad && loading) return <HomePageSkeleton />;

  const featured = products.filter((p) => p.isBestseller);
  const newArrivals = products.filter((p) => p.newArrival);
  const hero = settings?.hero || {};
  const popup = settings?.offerPopup || {};
  const heroTitle = hero.title || "Dress for\nthe life you\ndeserve.";
  const heroTextOrder = hero.layout === "text-right" ? 2 : 1;
  const heroImageOrder = hero.layout === "text-right" ? 1 : 2;

  return (
    <div className="page-transition">
      {/* HERO */}
      <section
        style={{ display: "grid", minHeight: "88vh" }}
        className="hero-grid"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "32px 64px 64px 64px",
          }}
          className="hero-content"
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "32px",
            }}
            className="label-caps hero-badge"
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--color-gold)",
              }}
              className="animate-pulse"
            ></span>
            <span
              style={{
                color: "var(--color-muted-foreground)",
                fontSize: "11px",
                letterSpacing: "0.18em",
              }}
            >
              {hero.eyebrow || "New Season - 2026"}
            </span>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(44px, 7vw, 80px)",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
            }}
          >
            {heroTitle.split("\n").map((line, index) => (
              <span key={index}>
                {line}
                {index < heroTitle.split("\n").length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p
            style={{
              marginTop: "32px",
              color: "var(--color-muted-foreground)",
            }}
            className="hero-description"
          >
            {hero.description ||
              "Curated menswear for the discerning gentleman. Timeless over trendy - pieces made to live with you, not the season."}
          </p>
          <div style={{ marginTop: "40px" }}>
            <Link
              to={hero.buttonLink || "/collections"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                backgroundColor: "var(--color-foreground)",
                color: "var(--color-background)",
                padding: "16px 32px",
                borderRadius: "50px",
                fontSize: "14px",
                textDecoration: "none",
                transition: "background-color 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-gold)";
                e.currentTarget.querySelector("svg").style.transform =
                  "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-foreground)";
                e.currentTarget.querySelector("svg").style.transform =
                  "translateX(0)";
              }}
            >
              {hero.buttonText || "Explore Collection"}
              <ArrowRight size={16} style={{ transition: "transform 0.3s" }} />
            </Link>
          </div>
        </div>
        <div
          style={{ position: "relative", minHeight: "50vh" }}
          className="hero-image"
          data-order={heroImageOrder}
        >
          <img
            src={hero.imageUrl || HERO_IMAGE}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </section>

      {showOffer && (
        <div className="offer-backdrop" onClick={() => setShowOffer(false)}>
          <div className="offer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="offer-close" onClick={() => setShowOffer(false)}>
              ×
            </button>
            <p
              className="label-caps"
              style={{ color: "var(--color-gold)", marginBottom: "10px" }}
            >
              Offer
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "2rem",
                lineHeight: 1.05,
              }}
            >
              {popup.title || "Sale is live"}
            </h2>
            <p
              style={{
                color: "var(--color-muted-foreground)",
                marginTop: "12px",
              }}
            >
              {popup.message || "Use this coupon code on your order today."}
            </p>
            <button
              className="offer-code"
              onClick={() => navigator.clipboard?.writeText(popup.couponCode || "")}
            >
              {popup.couponCode || "WELCOME10"} <span>Copy</span>
            </button>
            <Link
              className="offer-shop"
              to={popup.buttonLink || "/sale"}
              onClick={() => setShowOffer(false)}
            >
              {popup.buttonText || "Shop sale"} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* FEATURED */}
      <section
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "30px 5px" }}
      >
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <p
            className="label-caps"
            style={{ color: "var(--color-gold)", marginBottom: "12px" }}
          >
            Curated
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 5vw, 3rem)",
            }}
          >
            The Essentials
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "5px",
          }}
          className="featured-grid"
        >
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link
            to="/collections/t-shirts"
            className="label-caps"
            style={{
              display: "inline-block",
              borderBottom: "1px solid var(--color-foreground)",
              paddingBottom: "4px",
              textDecoration: "none",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "var(--color-gold)";
              e.target.style.borderColor = "var(--color-gold)";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "";
              e.target.style.borderColor = "var(--color-foreground)";
            }}
          >
            View All
          </Link>
        </div>
      </section>

      {/* EDITORIAL BANNER */}
      <section
        style={{ display: "grid", marginTop: "80px" }}
        className="editorial-grid"
      >
        <div
          style={{ position: "relative", aspectRatio: "4/3" }}
          className="editorial-image"
        >
          <img
            src={EDITORIAL_IMAGE}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 40px",
          }}
          className="editorial-content"
        >
          <p
            className="label-caps"
            style={{ color: "var(--color-gold)", marginBottom: "16px" }}
          >
            The Edit
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
              lineHeight: 1.15,
            }}
          >
            The Summer
            <br />
            Linen Edit
          </h2>
          <p
            style={{
              marginTop: "24px",
              color: "var(--color-muted-foreground)",
            }}
            className="editorial-description"
          >
            Lightweight. Breathable. Effortlessly sharp. Garment-washed linen in
            a quiet palette of stone, ivory and sage.
          </p>
          <Link
            to="/collections/shirts"
            className="label-caps editorial-link"
            style={{
              marginTop: "32px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid var(--color-foreground)",
              paddingBottom: "4px",
              textDecoration: "none",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--color-gold)";
              e.currentTarget.style.borderColor = "var(--color-gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "";
              e.currentTarget.style.borderColor = "var(--color-foreground)";
            }}
          >
            Shop Linen <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px 10px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div>
            <p
              className="label-caps"
              style={{ color: "var(--color-gold)", marginBottom: "8px" }}
            >
              Just In
            </p>
            <h2
              style={{ fontFamily: "var(--font-serif)", fontSize: "2.25rem" }}
            >
              New Arrivals
            </h2>
          </div>
          <Link
            to="/new-arrivals"
            className="label-caps view-all-link"
            style={{
              borderBottom: "1px solid var(--color-foreground)",
              paddingBottom: "4px",
              textDecoration: "none",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--color-gold)")}
            onMouseLeave={(e) => (e.target.style.color = "")}
          >
            View All
          </Link>
        </div>
        <div
          className="scrollbar-hide"
          style={{
            display: "flex",
            gap: "24px",
            overflowX: "auto",
          }}
        >
          {newArrivals.map((p) => (
            <div key={p.id} style={{ minWidth: "260px" }}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* BRAND STORY */}
      {/* <section
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "80px 20px",
          display: "grid",
          gap: "48px",
          alignItems: "center",
        }}
        className="story-grid"
      >
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(80px, 12vw, 160px)",
            lineHeight: 1,
            color: "var(--color-gold)",
            opacity: 0.9,
          }}
        >
          2010
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            color: "var(--color-muted-foreground)",
          }}
        >
          <p
            className="label-caps"
            style={{ color: "var(--color-foreground)" }}
          >
            Heritage
          </p>
          <p>
            FIT & FINE was founded on a quiet conviction: that menswear should
            outlast the season it was made for. From a small atelier in 2010, we
            set out to build a wardrobe of considered essentials — pieces that
            earn a permanent place in your life.
          </p>
          <p>
            Every garment is sourced from mills with generations of expertise.
            Supima cotton from the American South. Selvedge denim from Okayama.
            Linen, garment-washed in small batches.
          </p>
          <p>
            We believe in restraint. In refusing trend cycles. In the long, slow
            craft of dressing well.
          </p>
        </div>
      </section> */}

      {/* TESTIMONIALS */}
      {/* <section
        style={{ backgroundColor: "var(--color-surface)", padding: "80px 0" }}
      >
        <div
          style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 20px" }}
        >
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <p
              className="label-caps"
              style={{ color: "var(--color-gold)", marginBottom: "12px" }}
            >
              Words
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              }}
            >
              From the Inner Circle
            </h2>
          </div>
          <div
            style={{ display: "grid", gap: "24px" }}
            className="testimonials-grid"
          >
            {testimonials.map((t) => (
              <div
                key={t.name}
                style={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  padding: "32px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "2px",
                    color: "var(--color-gold)",
                    marginBottom: "16px",
                  }}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      style={{
                        fill: i < t.rating ? "var(--color-gold)" : "none",
                        opacity: i < t.rating ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
                <p style={{ fontSize: "14px", lineHeight: 1.7 }}>"{t.text}"</p>
                <div
                  style={{
                    marginTop: "24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      backgroundColor:
                        "color-mix(in oklch, var(--color-gold) 20%, transparent)",
                      color: "var(--color-gold)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    {t.initials}
                  </div>
                  <p style={{ fontSize: "14px", fontWeight: 500 }}>{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* STORY IMAGE */}
      <section
        style={{ position: "relative", height: "60vh", marginTop: "80px" }}
      >
        <img
          src={STORY_IMAGE}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        />
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            color: "white",
            padding: "0 24px",
          }}
        >
          <div>
            <p
              className="label-caps"
              style={{ color: "var(--color-gold)", marginBottom: "16px" }}
            >
              Our Promise
            </p>
            <h2
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "clamp(1.75rem, 5vw, 3.5rem)",
                maxWidth: "768px",
              }}
            >
              "Not the loudest in the room.
              <br />
              The most considered."
            </h2>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes skeleton-shimmer {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .skeleton-pulse { animation: skeleton-shimmer 1.6s ease-in-out infinite; }
        .hero-grid { grid-template-columns: 1fr; }
        .hero-content { padding: 48px 20px; order: 2; text-align: center; align-items: center; }
        .hero-image { order: 1; }
        .categories-grid { grid-template-columns: repeat(2, 1fr); }
        .featured-grid { grid-template-columns: repeat(2, 1fr); }
        .editorial-grid { grid-template-columns: 1fr; }
        .editorial-image { aspect-ratio: 4/3; }
        .editorial-content { padding: 48px 20px !important; text-align: center; align-items: center; }
        .hero-description, .editorial-description { max-width: 28rem; }
        .story-grid { grid-template-columns: 1fr; text-align: center; }
        .testimonials-grid { grid-template-columns: 1fr; }
        .view-all-link { display: none; }
        .hero-content[data-order="1"] { order: 1; }
        .hero-content[data-order="2"] { order: 2; }
        .hero-image[data-order="1"] { order: 1; }
        .hero-image[data-order="2"] { order: 2; }
        .offer-backdrop { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,.5); backdrop-filter: blur(6px); display: grid; place-items: center; padding: 18px; }
        .offer-modal { width: min(420px, 100%); background: var(--color-background); border: 1px solid var(--color-border); border-radius: 8px; padding: 28px; position: relative; box-shadow: 0 24px 70px rgba(0,0,0,.22); }
        .offer-close { position: absolute; top: 12px; right: 12px; width: 34px; height: 34px; border: 1px solid var(--color-border); border-radius: 50%; background: var(--color-surface); font-size: 20px; cursor: pointer; }
        .offer-code { width: 100%; margin-top: 20px; border: 1.5px dashed var(--color-gold); background: var(--color-surface); padding: 14px; border-radius: 8px; display: flex; justify-content: space-between; font-weight: 900; letter-spacing: .08em; }
        .offer-code span { color: var(--color-muted-foreground); font-size: 12px; letter-spacing: 0; }
        .offer-shop { margin-top: 16px; height: 46px; display: inline-flex; width: 100%; align-items: center; justify-content: center; gap: 8px; background: var(--color-foreground); color: var(--color-background); border-radius: 50px; text-decoration: none; font-weight: 800; }

        @media (max-width: 767px) {
          .hero-description, .editorial-description { max-width: 100%; }
        }

        @media (min-width: 640px) {
          .view-all-link { display: inline-block !important; }
          .hero-content { padding: 64px 40px; }
          .editorial-content { padding: 64px 40px !important; }
        }

        @media (min-width: 768px) {
          .testimonials-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .hero-content, .editorial-content { text-align: left; align-items: flex-start; }
        }

        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: repeat(2, 1fr) !important; min-height: 90vh !important; }
          .hero-content { padding: 80px 80px !important; }
          .hero-image { min-height: 100% !important; }
          .categories-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .featured-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .editorial-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .editorial-image { aspect-ratio: auto !important; }
          .editorial-content { padding: 80px 100px !important; }
          .story-grid { grid-template-columns: repeat(2, 1fr) !important; text-align: left; }
        }

        @media (min-width: 1280px) {
          .featured-grid { grid-template-columns: repeat(5, 1fr) !important; }
        }

        @media (min-width: 1440px) {
          .featured-grid { grid-template-columns: repeat(6, 1fr) !important; }
        }

        .category-card:hover .category-img { transform: scale(1.05); }
        .shop-now-label { opacity: 0; transition: opacity 0.3s; }
        .category-card:hover .shop-now-label { opacity: 1; }
      `}</style>
    </div>
  );
}
