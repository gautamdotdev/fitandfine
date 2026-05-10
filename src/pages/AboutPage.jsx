import { Award, Leaf, Scissors } from "lucide-react";
import { STORY_IMAGE } from "../lib/products.js";

function Pillar({ Icon, title, body }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "56px",
          height: "56px",
          margin: "0 auto",
          borderRadius: "50%",
          backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={22} style={{ color: "var(--color-gold)" }} />
      </div>
      <h3
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.5rem",
          marginTop: "20px",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "var(--color-muted-foreground)",
          marginTop: "12px",
        }}
      >
        {body}
      </p>
    </div>
  );
}

export default function AboutPage() {
  const timeline = [
    { year: "2010", note: "Founded in a small Mumbai atelier" },
    { year: "2014", note: "Expanded to a full menswear collection" },
    { year: "2018", note: "Launched online — direct to gentlemen" },
    { year: "2023", note: "Crossed 10,000 customers worldwide" },
  ];
  const team = [
    {
      name: "Rajan Mehta",
      role: "Founder & Creative Director",
      initials: "RM",
    },
    { name: "Anand Iyer", role: "Head of Design", initials: "AI" },
    { name: "Sara Bhatia", role: "Head of Atelier", initials: "SB" },
  ];

  return (
    <div className="page-transition">
      {/* Header */}
      <section
        style={{
          maxWidth: "768px",
          margin: "0 auto",
          padding: "40px 24px 48px",
          textAlign: "center",
        }}
      >
        <p
          className="label-caps"
          style={{ color: "var(--color-gold)", marginBottom: "16px" }}
        >
          About
        </p>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(3rem, 7vw, 4.5rem)",
            lineHeight: 1.15,
          }}
        >
          Our Story
        </h1>
        <p
          style={{ marginTop: "24px", color: "var(--color-muted-foreground)" }}
        >
          FIT & FINE was built on the belief that the most stylish wardrobe is
          the most considered one. Fewer pieces. Better made. Worn for years,
          not seasons.
        </p>
      </section>

      {/* Hero Image */}
      <section style={{ position: "relative", height: "55vh" }}>
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
      </section>

      {/* Timeline */}
      <section
        style={{ maxWidth: "896px", margin: "0 auto", padding: "80px 24px" }}
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.875rem",
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          Our Journey
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {timeline.map((t, i) => (
            <div
              key={t.year}
              style={{
                display: "flex",
                gap: "32px",
                alignItems: "baseline",
                borderBottom:
                  i < timeline.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
                paddingBottom: "32px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "2.25rem",
                  color: "var(--color-gold)",
                  width: "96px",
                  flexShrink: 0,
                }}
              >
                {t.year}
              </span>
              <p style={{ color: "var(--color-muted-foreground)", flex: 1 }}>
                {t.note}
              </p>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--color-muted-foreground)",
                }}
              >
                0{i + 1}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Three Pillars */}
      <section
        style={{ backgroundColor: "var(--color-surface)", padding: "80px 0" }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.875rem",
              textAlign: "center",
              marginBottom: "56px",
            }}
          >
            Three Pillars
          </h2>
          <div
            style={{ display: "grid", gap: "32px" }}
            className="pillars-grid"
          >
            <Pillar
              Icon={Award}
              title="Quality"
              body="Mills with generations of expertise. Fabrics that earn their place in your wardrobe."
            />
            <Pillar
              Icon={Leaf}
              title="Sustainability"
              body="Small-batch production. Considered materials. A garment made well is the most sustainable choice."
            />
            <Pillar
              Icon={Scissors}
              title="Heritage"
              body="Tailoring rooted in tradition. Cuts refined over decades of practice."
            />
          </div>
        </div>
      </section>

      {/* Quote */}
      <section
        style={{
          maxWidth: "896px",
          margin: "0 auto",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            lineHeight: 1.5,
          }}
        >
          "We make clothes for the man who chooses presence over performance —
          quietly, confidently, and for a long time."
        </p>
        <p
          className="label-caps"
          style={{ color: "var(--color-gold)", marginTop: "24px" }}
        >
          — Rajan Mehta, Founder
        </p>
      </section>

      {/* Team */}
      <section
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px 96px" }}
      >
        <h2
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.875rem",
            textAlign: "center",
            marginBottom: "48px",
          }}
        >
          The People
        </h2>
        <div style={{ display: "grid", gap: "24px" }} className="team-grid">
          {team.map((m) => (
            <div
              key={m.name}
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                padding: "32px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto",
                  borderRadius: "50%",
                  backgroundColor:
                    "color-mix(in oklch, var(--color-gold) 20%, transparent)",
                  color: "var(--color-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.25rem",
                }}
              >
                {m.initials}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.25rem",
                  marginTop: "20px",
                }}
              >
                {m.name}
              </p>
              <p
                className="label-caps"
                style={{
                  color: "var(--color-muted-foreground)",
                  marginTop: "8px",
                  fontSize: "10px",
                }}
              >
                {m.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .pillars-grid { grid-template-columns: 1fr; }
        .team-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) {
          .pillars-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .team-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
