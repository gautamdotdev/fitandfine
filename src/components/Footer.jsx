import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa6";
import { useToasts } from "../lib/store.js";
import { WHATSAPP_NUMBER } from "../lib/products.js";
import { useState } from "react";

function FooterCol({ title, links }) {
  return (
    <div>
      <p
        className="label-caps"
        style={{ marginBottom: "16px", color: "var(--color-gold)" }}
      >
        {title}
      </p>
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          fontSize: "14px",
          opacity: 0.8,
        }}
      >
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              style={{
                color: "inherit",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "var(--color-gold)")}
              onMouseLeave={(e) => (e.target.style.color = "")}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const push = useToasts((s) => s.push);
  const [email, setEmail] = useState("");

  return (
    <footer
      style={{
        backgroundColor: "oklch(0.18 0.012 60)",
        color: "oklch(0.88 0.01 70)",
        marginTop: "80px",
      }}
    >
      <div
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "10px 20px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "40px",
          }}
          className="footer-grid"
        >
          <div style={{ gridColumn: "span 2" }} className="footer-brand">
            <div
              style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem" }}
            >
              FIT & FINE<span style={{ color: "var(--color-gold)" }}>.</span>
            </div>
            <p
              style={{
                fontSize: "14px",
                marginTop: "12px",
                opacity: 0.7,
                maxWidth: "220px",
              }}
            >
              Crafted for the discerning man. Considered menswear, made to last.
            </p>
          </div>

          <FooterCol
            title="Shop"
            links={[
              { label: "T-Shirts", to: "/collections/t-shirts" },
              { label: "Shirts", to: "/collections/shirts" },
              { label: "Jeans", to: "/collections/jeans" },
              { label: "Trousers", to: "/collections/trousers" },
              { label: "New Arrivals", to: "/new-arrivals" },
            ]}
          />

          <FooterCol
            title="Company"
            links={[
              { label: "About", to: "/about" },
              { label: "Careers", to: "/about" },
              { label: "Press", to: "/about" },
              { label: "Sustainability", to: "/about" },
            ]}
          />

          <FooterCol
            title="Support"
            links={[
              { label: "Sizing Guide", to: "/contact" },
              { label: "Shipping Info", to: "/contact" },
              { label: "Returns", to: "/contact" },
              { label: "Contact Us", to: "/contact" },
            ]}
          />

          <div>
            <p
              className="label-caps"
              style={{ marginBottom: "16px", color: "var(--color-gold)" }}
            >
              Connect
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                {
                  Icon: FaInstagram,
                  href: "https://www.instagram.com/fit_andfine_co",
                },
                { Icon: FaWhatsapp, href: `https://wa.me/${WHATSAPP_NUMBER}` },
                { Icon: FaFacebookF, href: "#" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel="noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "border-color 0.2s",
                    color: "inherit",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.borderColor = "var(--color-gold)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.2)")
                  }
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div
          style={{
            marginTop: "56px",
            paddingTop: "40px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{ display: "grid", gap: "24px", alignItems: "center" }}
            className="newsletter-grid"
          >
            <div>
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.5rem",
                  color: "white",
                }}
              >
                Join the Inner Circle
              </h3>
              <p style={{ fontSize: "14px", opacity: 0.7, marginTop: "4px" }}>
                No spam. Just curated drops.
              </p>
            </div>
            <form
              style={{ display: "flex", gap: "8px" }}
              onSubmit={(e) => {
                e.preventDefault();
                if (email) {
                  push({
                    type: "success",
                    message: "Welcome to the Inner Circle.",
                  });
                  setEmail("");
                }
              }}
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="Email address"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  outline: "none",
                  color: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-gold)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.2)")
                }
              />
              <button
                style={{
                  backgroundColor: "var(--color-gold)",
                  color: "oklch(0.18 0.012 60)",
                  padding: "12px 24px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "opacity 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            marginTop: "40px",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            opacity: 0.6,
            fontSize: "12px",
          }}
          className="footer-bottom"
        >
          <p>© 2025 FIT & FINE. All rights reserved.</p>
          <div style={{ display: "flex", gap: "20px" }}>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
              Privacy Policy
            </a>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>
              Terms
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .footer-grid { grid-template-columns: repeat(5, 1fr) !important; }
          .footer-brand { grid-column: span 1 !important; }
          .newsletter-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .footer-bottom { flex-direction: row !important; justify-content: space-between; }
        }
      `}</style>
    </footer>
  );
}
