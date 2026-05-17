import { Link } from "react-router-dom";
import { categories } from "../lib/products.js";

export default function CollectionsIndexPage() {
  return (
    <div className="col-root page-transition">
      {/* ── Header ─────────────────────────────── */}
      <header className="col-header">
        <div className="col-header-inner">
          <span className="col-eyebrow">The Edit</span>
          <h1 className="col-title">Collections</h1>
          <p className="col-sub">
            Each piece chosen for timeless appeal and exceptional quality.
            Considered categories for a modern wardrobe.
          </p>
        </div>
        <div className="col-divider" />
      </header>

      {/* ── Grid ───────────────────────────────── */}
      <div className="col-grid">
        {categories.map((cat, i) => (
          <Link
            key={cat.slug}
            to={`/collections/${cat.slug}`}
            className={`col-card col-card-${(i % 5) + 1}`}
            style={{ "--i": i }}
          >
            {/* image */}
            <div className="col-img-wrap">
              <img src={cat.image} alt={cat.name} className="col-img" />
            </div>

            {/* dark vignette */}
            <div className="col-vignette" />

            {/* corner index */}
            <span className="col-index">{String(i + 1).padStart(2, "0")}</span>

            {/* content */}
            <div className="col-content">
              <span className="col-tag">Explore Collection</span>
              <h2 className="col-name">{cat.name}</h2>
              <div className="col-arrow">
                <svg width="20" height="10" viewBox="0 0 20 10" fill="none">
                  <path
                    d="M0 5H18M18 5L13 1M18 5L13 9"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* scan line on hover */}
            <div className="col-scan" />
          </Link>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');

        /* ── Root ── */
        .col-root {
          min-height: 100vh;
          padding: 0 0 100px;
          font-family: 'DM Mono', monospace;
        }

        /* ── Header ── */
        .col-header {
          text-align: center;
          padding: 10px 24px 0;
          max-width: 900px;
          margin: 0 auto;
        }
        .col-header-inner {
          animation: col-fade-up 0.9s cubic-bezier(.22,1,.36,1) both;
        }
        .col-eyebrow {
          display: inline-block;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--color-gold, #c9a84c);
          border: 1px solid rgba(201,168,76,0.35);
          padding: 6px 18px;
          margin-bottom: 28px;
        }
        .col-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(3.5rem, 8vw, 7rem);
          letter-spacing: -0.02em;
          line-height: 0.95;
          color: var(--color-foreground, #1a1a1a);
          margin: 0 0 28px;
        }
        .col-sub {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          line-height: 1.9;
          color: var(--color-muted-foreground, #888);
          max-width: 520px;
          margin: 0 auto;
        }
        .col-divider {
          width: 1px;
          height: 64px;
          background: linear-gradient(to bottom, rgba(201,168,76,0.5), transparent);
          margin: 40px auto 0;
        }

        /* ── Grid ── */
        .col-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3px;
          padding: 3px;
          max-width: 1600px;
          margin: 0 auto;
        }

        @media (min-width: 600px) {
          .col-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .col-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          /* hero card */
          .col-card-1 {
            grid-column: span 2;
            grid-row: span 1;
          }
          /* tall card */
          .col-card-4 {
            grid-row: span 2;
          }
        }

        /* ── Card ── */
        .col-card {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          display: block;
          text-decoration: none;
          background: var(--color-muted, #f5f5f5);
          cursor: pointer;
          animation: col-fade-up 0.8s cubic-bezier(.22,1,.36,1) both;
          animation-delay: calc(var(--i, 0) * 90ms + 200ms);
        }

        @media (min-width: 1024px) {
          .col-card-1 { aspect-ratio: 2 / 1; }
          .col-card-4 { aspect-ratio: 1 / 2; }
        }

        /* image */
        .col-img-wrap {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .col-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1.4s cubic-bezier(.25,.46,.45,.94),
                      filter 0.8s ease;
          filter: saturate(0.7) brightness(0.85);
          transform-origin: center;
        }
        .col-card:hover .col-img {
          transform: scale(1.08);
          filter: saturate(1) brightness(0.7);
        }

        /* vignette */
        .col-vignette {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(5,4,2,0.85) 0%, rgba(5,4,2,0.3) 45%, transparent 70%),
            linear-gradient(to right, rgba(5,4,2,0.3) 0%, transparent 40%);
          transition: opacity 0.5s;
        }
        .col-card:hover .col-vignette {
          opacity: 0.7;
        }

        /* corner index */
        .col-index {
          position: absolute;
          top: 20px;
          right: 20px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: rgba(201,168,76,0.6);
          transition: color 0.4s;
        }
        .col-card:hover .col-index {
          color: #c9a84c;
        }

        /* content */
        .col-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 28px;
        }
        .col-tag {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #c9a84c;
          margin-bottom: 10px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.45s 0.05s, transform 0.45s 0.05s;
        }
        .col-card:hover .col-tag {
          opacity: 1;
          transform: translateY(0);
        }
        .col-name {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(2rem, 3.5vw, 3rem);
          color: #f0e8d8;
          letter-spacing: -0.01em;
          line-height: 1;
          margin: 0 0 16px;
          transform: translateY(6px);
          transition: transform 0.5s cubic-bezier(.22,1,.36,1);
        }
        .col-card:hover .col-name {
          transform: translateY(0);
        }
        .col-arrow {
          color: #c9a84c;
          opacity: 0;
          transform: translateX(-10px);
          transition: opacity 0.4s 0.1s, transform 0.4s 0.1s;
          width: fit-content;
        }
        .col-card:hover .col-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* scan line */
        .col-scan {
          position: absolute;
          left: 0;
          right: 0;
          top: -100%;
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.4), transparent);
          transition: top 0s;
        }
        .col-card:hover .col-scan {
          animation: col-scan 0.6s ease-out forwards;
        }

        /* ── Keyframes ── */
        @keyframes col-fade-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes col-scan {
          from { top: -2px; }
          to   { top: 100%; }
        }
      `}</style>
    </div>
  );
}
