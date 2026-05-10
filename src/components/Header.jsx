import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Sun, Moon, ShoppingBag, Heart, Menu, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
// Helper to get user from localStorage
function getUser() {
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}
import { useCart, useTheme, useWishlist } from "../lib/store.js";
import { products } from "../lib/products.js";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  // --- AUTH STATE ---
  const [user, setUser] = useState(() => getUser());
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // Listen for login/logout changes (from other tabs or after login)
  useEffect(() => {
    const sync = () => setUser(getUser());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  // On mount, update user state (in case login just happened)
  useEffect(() => {
    setUser(getUser());
  }, []);
  const cartCount = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const { theme, toggle, init } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lastScrollY = useRef(0);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);

      if (currentY > lastScrollY.current && currentY > 80) {
        // scrolling down + past 80px → hide
        setHidden(true);
      } else {
        // scrolling up → show
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const results =
    query.trim().length > 0
      ? products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(query.toLowerCase()) ||
              p.category.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 5)
      : [];

  const isCartOrWishlist =
    location.pathname.includes("/cart") ||
    location.pathname.includes("/wishlist");

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          height: "64px",
          transition:
            "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
          transform:
            hidden && !mobileOpen ? "translateY(-100%)" : "translateY(0)",
          opacity: hidden && !mobileOpen ? 0 : 1,
          willChange: "transform",
        }}
      >
        {/* Dynamic Background Layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1,
            transition: "all 0.5s",
            backgroundColor: mobileOpen
              ? "var(--color-background)"
              : scrolled
                ? "color-mix(in oklch, var(--color-background) 90%, transparent)"
                : "var(--color-background)",
            ...(scrolled && !mobileOpen
              ? {
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  borderBottom: "1px solid var(--color-border)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }
              : {}),
          }}
        />

        <div
          className="header-inner"
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 20px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          {/* Logo — left */}
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.25rem",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "baseline",
              zIndex: 50,
              flexShrink: 0,
            }}
          >
            FIT & FINE
            <span style={{ color: "var(--color-gold)", marginLeft: "1px" }}>
              .
            </span>
          </Link>
          {/* Desktop Nav — absolute center */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "40px",
            }}
            className="desktop-nav"
          >
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color:
                    location.pathname === l.to
                      ? "var(--color-foreground)"
                      : "color-mix(in oklch, var(--color-foreground) 60%, transparent)",
                  fontWeight: location.pathname === l.to ? 600 : 500,
                  transition: "all 0.5s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = "var(--color-foreground)";
                  e.target.style.letterSpacing = "0.12em";
                }}
                onMouseLeave={(e) => {
                  e.target.style.color =
                    location.pathname === l.to
                      ? "var(--color-foreground)"
                      : "color-mix(in oklch, var(--color-foreground) 60%, transparent)";
                  e.target.style.letterSpacing = "0.08em";
                }}
              >
                {l.label}
              </Link>
            ))}
            {/* Auth links/menu */}
            {!user ? (
              <>
                <Link
                  to="/auth"
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-gold)",
                    fontWeight: 600,
                    marginLeft: "18px",
                    textDecoration: "none",
                  }}
                >
                  Sign In
                </Link>
              </>
            ) : (
              <div style={{ position: "relative", marginLeft: "18px" }}>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-foreground)",
                    fontWeight: 600,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowUserMenu((v) => !v)}
                  onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
                >
                  {user?.name?.split(" ")[0] || user?.email?.split("@")[0]} ▼
                </button>
                {showUserMenu && (
                  <div
                    style={{
                      position: "absolute",
                      top: "120%",
                      right: 0,
                      background: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      minWidth: "140px",
                      zIndex: 100,
                    }}
                  >
                    <button
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "10px 18px",
                        textAlign: "left",
                        fontSize: "12px",
                        color: "var(--color-foreground)",
                        cursor: "pointer",
                        borderBottom: "1px solid var(--color-border)",
                      }}
                      onClick={() => {
                        navigate("/profile");
                        setShowUserMenu(false);
                      }}
                    >
                      Profile
                    </button>
                    <button
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        padding: "10px 18px",
                        textAlign: "left",
                        fontSize: "12px",
                        color: "var(--color-destructive)",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("refreshToken");
                        localStorage.removeItem("user");
                        setUser(null);
                        setShowUserMenu(false);
                        navigate("/");
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions — right */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2px",
              marginLeft: "auto",
            }}
          >
            {!isCartOrWishlist && (
              <button
                onClick={() => setSearchOpen((s) => !s)}
                aria-label="Search"
                style={{
                  padding: "8px",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--color-gold)";
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={toggle}
              aria-label="Theme"
              style={{
                padding: "8px",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
              }}
              className="theme-toggle"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-gold)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {theme === "light" ? (
                <Moon size={18} strokeWidth={1.5} />
              ) : (
                <Sun size={18} strokeWidth={1.5} />
              )}
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              style={{
                padding: "8px",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-gold)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Heart size={18} strokeWidth={1.5} />
              {wishCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    backgroundColor: "var(--color-gold)",
                    color: "white",
                    fontSize: "8px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    animation: "zoomIn 0.5s",
                  }}
                >
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              style={{
                padding: "8px",
                transition: "all 0.3s",
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-gold)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    backgroundColor: "var(--color-gold)",
                    color: "white",
                    fontSize: "8px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    animation: "zoomIn 0.5s",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="mobile-menu-btn"
              style={{
                padding: "8px",
                marginLeft: "4px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.3s",
              }}
              onClick={() => {
                setHidden(false);
                setMobileOpen(true);
              }}
              aria-label="Menu"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-gold)";
                e.currentTarget.style.transform = "scale(1.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
          {/* Search Overlay */}
          {searchOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: "calc(100% - 12px)",
                maxWidth: "500px",
                marginTop: "12px",
                zIndex: 60,
                animation: "fadeInUp 0.3s ease-out",
              }}
            >
              <div
                style={{
                  backgroundColor:
                    "color-mix(in oklch, var(--color-background) 95%, transparent)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <Search
                    size={16}
                    style={{ color: "var(--color-muted-foreground)" }}
                  />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && query) {
                        navigate("/collections/t-shirts");
                        setSearchOpen(false);
                      }
                      if (e.key === "Escape") {
                        setSearchOpen(false);
                        setQuery("");
                      }
                    }}
                    placeholder="Search FIT & FINE..."
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      fontSize: "14px",
                      color: "var(--color-foreground)",
                    }}
                  />
                  <button
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    style={{
                      padding: "4px",
                      borderRadius: "50%",
                      transition: "background 0.2s",
                      display: "flex",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "var(--color-muted)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "")
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
                {query && (
                  <div
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      padding: "24px",
                      background:
                        "color-mix(in oklch, var(--color-surface) 30%, transparent)",
                    }}
                  >
                    <p
                      className="label-caps"
                      style={{
                        fontSize: "10px",
                        color: "var(--color-muted-foreground)",
                        marginBottom: "16px",
                      }}
                    >
                      Results
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      {results.length === 0 ? (
                        <p
                          style={{
                            fontSize: "12px",
                            color: "var(--color-muted-foreground)",
                            fontStyle: "italic",
                            gridColumn: "1/-1",
                          }}
                        >
                          No matches for "{query}"
                        </p>
                      ) : (
                        results.map((p) => (
                          <Link
                            key={p.id}
                            to={`/product/${p.slug}`}
                            onClick={() => setSearchOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              textDecoration: "none",
                            }}
                            className="search-result-item"
                          >
                            <div
                              style={{
                                width: "48px",
                                height: "64px",
                                borderRadius: "6px",
                                overflow: "hidden",
                                backgroundColor: "var(--color-muted)",
                                flexShrink: 0,
                              }}
                            >
                              <img
                                src={p.images[0]}
                                alt={p.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  transition: "transform 0.5s",
                                }}
                              />
                            </div>
                            <div style={{ overflow: "hidden" }}>
                              <p
                                style={{
                                  fontFamily: "var(--font-serif)",
                                  fontSize: "11px",
                                  lineHeight: 1.2,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.name}
                              </p>
                              <p
                                style={{
                                  fontSize: "9px",
                                  color: "var(--color-muted-foreground)",
                                  marginTop: "2px",
                                }}
                              >
                                ₹{p.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <style>{`
        @media (min-width: 1024px) {
          .mobile-menu-btn { display: none !important; }
          .header-inner { display: flex !important; }
        }
        @media (max-width: 1023px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 639px) {
          .theme-toggle { display: none !important; }
        }
      `}</style>
      </header>

      {/* Mobile Menu Overlay — sibling to header, escapes transform stacking context */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          visibility: mobileOpen ? "visible" : "hidden",
          pointerEvents: mobileOpen ? "auto" : "none",
          transition: "all 0.5s",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
            opacity: mobileOpen ? 1 : 0,
            transition: "opacity 0.5s",
          }}
          onClick={() => setMobileOpen(false)}
        />
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: "100%",
            maxWidth: "none",
            backgroundColor: "var(--color-background)",
            boxShadow: "-20px 0 60px rgba(0,0,0,0.1)",
            transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "64px",
              padding: "0 32px",
              borderBottom:
                "1px solid color-mix(in oklch, var(--color-foreground) 8%, transparent)",
            }}
          >
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.25rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "baseline",
              }}
            >
              FIT & FINE
              <span style={{ color: "var(--color-gold)", marginLeft: "1px" }}>
                .
              </span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                padding: "8px",
                borderRadius: "50%",
                transition: "background 0.2s",
                display: "flex",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-muted)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
            >
              <X size={24} strokeWidth={1.2} />
            </button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "15px 32px",
                gap: "20px",
              }}
            >
              {navLinks.map((l, i) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "3.2rem",
                    lineHeight: 1.1,
                    color: "var(--color-foreground)",
                    textDecoration: "none",
                    transform: mobileOpen
                      ? "translateX(0)"
                      : "translateX(30px)",
                    opacity: mobileOpen ? 1 : 0,
                    transition: `color 0.3s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 70}ms, opacity 0.7s ${i * 70}ms`,
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.color = "var(--color-gold)")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.color = "var(--color-foreground)")
                  }
                >
                  {l.label}
                </Link>
              ))}
              {/* Auth links/menu for mobile */}
              {!user ? (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "2.2rem",
                    color: "var(--color-gold)",
                    textDecoration: "none",
                    marginTop: "18px",
                  }}
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <button
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "2.2rem",
                      color: "var(--color-foreground)",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      marginTop: "18px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setMobileOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </button>
                  <button
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "2.2rem",
                      color: "var(--color-destructive)",
                      background: "none",
                      border: "none",
                      textAlign: "left",
                      marginTop: "8px",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      localStorage.removeItem("accessToken");
                      localStorage.removeItem("refreshToken");
                      localStorage.removeItem("user");
                      setUser(null);
                      setMobileOpen(false);
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>

            <div
              style={{
                padding: "48px 32px",
                borderTop:
                  "1px solid color-mix(in oklch, var(--color-foreground) 8%, transparent)",
                transform: mobileOpen ? "translateY(0)" : "translateY(30px)",
                opacity: mobileOpen ? 1 : 0,
                transition:
                  "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s",
                backgroundColor:
                  "color-mix(in oklch, var(--color-surface) 30%, transparent)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  marginBottom: "40px",
                }}
              >
                <button
                  onClick={toggle}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "15px",
                    fontWeight: 500,
                  }}
                >
                  {theme === "light" ? (
                    <>
                      <Moon size={20} strokeWidth={1.5} /> Dark Mode
                    </>
                  ) : (
                    <>
                      <Sun size={20} strokeWidth={1.5} /> Light Mode
                    </>
                  )}
                </button>
              </div>
              <p
                className="label-caps"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                  color: "var(--color-muted-foreground)",
                  marginBottom: "16px",
                  opacity: 0.8,
                }}
              >
                CONNECT WITH US
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "24px",
                  color: "var(--color-muted-foreground)",
                }}
              >
                {["Instagram", "Twitter", "Pinterest"].map((s) => (
                  <span
                    key={s}
                    style={{
                      cursor: "pointer",
                      transition: "color 0.2s",
                      fontSize: "15px",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--color-foreground)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--color-muted-foreground)")
                    }
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
