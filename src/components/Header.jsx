import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Sun, Moon, ShoppingBag, Heart, Menu, X, ChevronDown, ChevronRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useCart, useTheme, useWishlist } from "../lib/store.js";
import { useShop, useAuth } from "../context/ShopContext.jsx";


const navLinks = [
  { to: "/", label: "Home" },
  {
    to: "/collections",
    label: "Collections",
    children: [
      { to: "/collections/t-shirts", label: "T-Shirts", desc: "Essential & graphic tees" },
      { to: "/collections/shirts", label: "Shirts", desc: "Casual to formal fits" },
      { to: "/collections/jeans", label: "Jeans", desc: "Slim, straight & relaxed" },
      { to: "/collections/combo", label: "Combo", desc: "Best value deals" },
    ],
  },
  // {
  //   to: "/shop",
  //   label: "Shop",
  //   children: [
  //     {
  //       to: "/shop/bestsellers",
  //       label: "Best Sellers",
  //       desc: "Most loved products",
  //     },
  //     {
  //       to: "/shop/trending",
  //       label: "Trending Now",
  //       desc: "Current streetwear picks",
  //     },
  //     {
  //       to: "/shop/premium",
  //       label: "Premium",
  //       desc: "Luxury crafted pieces",
  //     },
  //     {
  //       to: "/shop/summer-edit",
  //       label: "Summer Edit",
  //       desc: "Lightweight seasonal wear",
  //     },
  //   ],
  // },
  { to: "/new-arrivals", label: "New Arrivals" },
  { to: "/sale", label: "Sale" },
];

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { products } = useShop();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = useCart((s) => s.items.reduce((a, b) => a + b.qty, 0));
  const wishCount = useWishlist((s) => s.ids.length);
  const { theme, toggle, init } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [desktopDropdown, setDesktopDropdown] = useState(null);
  const collectionsTimer = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMobileDropdown(null);
    setDesktopDropdown(null);
  }, [location.pathname]);

  const results =
    query.trim().length > 0
      ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.category?.toLowerCase() || "").includes(query.toLowerCase())
        )
        .slice(0, 5)
      : [];

  const isCartOrWishlist =
    location.pathname.includes("/cart") ||
    location.pathname.includes("/wishlist");

  const handleDropdownEnter = (menu) => {
    clearTimeout(collectionsTimer.current);
    setDesktopDropdown(menu);
  };

  const handleDropdownLeave = () => {
    collectionsTimer.current = setTimeout(() => {
      setDesktopDropdown(null);
    }, 150);
  };

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          width: "100%",
          height: "64px",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease",
          transform: hidden && !mobileOpen ? "translateY(-100%)" : "translateY(0)",
          opacity: hidden && !mobileOpen ? 0 : 1,
          willChange: "transform",
        }}
      >
        {/* Background Layer */}
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
          {/* Logo */}
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
              textDecoration: "none",
              color: "var(--color-foreground)",
            }}
          >
            FIT & FINE
            <span style={{ color: "var(--color-gold)", marginLeft: "1px" }}>.</span>
          </Link>

          {/* Desktop Nav */}
          <div
            className="desktop-nav"
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "40px",
            }}
          >
            {navLinks.map((l) =>
              l.children ? (
                <div
                  key={l.to}
                  style={{ position: "relative" }}
                  onMouseEnter={() => handleDropdownEnter(l.to)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <button
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing:
                        desktopDropdown === l.to ? "0.12em" : "0.08em",
                      color:
                        l.label === "Sale"
                          ? "var(--color-gold)"
                          : location.pathname.startsWith(l.to) ||
                            desktopDropdown === l.to
                            ? "var(--color-foreground)"
                            : "color-mix(in oklch, var(--color-foreground) 60%, transparent)",
                      fontWeight: location.pathname.startsWith(l.to) ? 600 : 500,
                      transition: "all 0.3s",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: 0,
                    }}
                  >
                    {l.label}

                    <ChevronDown
                      size={10}
                      style={{
                        transform:
                          desktopDropdown === l.to
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.3s",
                        marginTop: "1px",
                      }}
                    />
                  </button>

                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 20px)",
                      left: "50%",
                      width: "480px",
                      backgroundColor: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                      overflow: "hidden",
                      opacity: desktopDropdown === l.to ? 1 : 0,
                      visibility:
                        desktopDropdown === l.to ? "visible" : "hidden",
                      transform:
                        desktopDropdown === l.to
                          ? "translateX(-50%) translateY(0)"
                          : "translateX(-50%) translateY(-8px)",
                      transition:
                        "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      pointerEvents:
                        desktopDropdown === l.to ? "auto" : "none",
                    }}
                  >
                    <div style={{ padding: "8px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "4px",
                        }}
                      >
                        {l.children.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 16px",
                              borderRadius: "8px",
                              textDecoration: "none",
                              transition: "background 0.2s",
                              backgroundColor:
                                location.pathname === child.to
                                  ? "color-mix(in oklch, var(--color-gold) 10%, transparent)"
                                  : "transparent",
                            }}
                            onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "color-mix(in oklch, var(--color-foreground) 5%, transparent)")
                            }
                            onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              location.pathname === child.to
                                ? "color-mix(in oklch, var(--color-gold) 10%, transparent)"
                                : "transparent")
                            }
                          >
                            <div>
                              <p
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.06em",
                                  color: "var(--color-foreground)",
                                  marginBottom: "2px",
                                }}
                              >
                                {child.label}
                              </p>

                              <p
                                style={{
                                  fontSize: "10px",
                                  color: "var(--color-muted-foreground)",
                                }}
                              >
                                {child.desc}
                              </p>
                            </div>

                            <ArrowUpRight
                              size={12}
                              style={{
                                color: "var(--color-muted-foreground)",
                                flexShrink: 0,
                              }}
                            />
                          </Link>
                        ))}
                      </div>

                      <div
                        style={{
                          margin: "8px 0 4px",
                          padding: "12px 16px",
                          borderTop: "1px solid var(--color-border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--color-muted-foreground)",
                          }}
                        >
                          Browse all collections
                        </span>

                        <Link
                          to={l.to}
                          style={{
                            fontSize: "10px",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "var(--color-gold)",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          View All <ArrowUpRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
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
                    transition: "all 0.3s",
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
              )
            )}

            {/* Auth */}
            {!user ? (
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
                      style={{ width: "100%", background: "none", border: "none", padding: "10px 18px", textAlign: "left", fontSize: "12px", color: "var(--color-foreground)", cursor: "pointer", borderBottom: "1px solid var(--color-border)" }}
                      onClick={() => { navigate("/profile"); setShowUserMenu(false); }}
                    >
                      Profile
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          style={{ width: "100%", background: "none", border: "none", padding: "10px 18px", textAlign: "left", fontSize: "12px", color: "var(--color-gold)", cursor: "pointer", borderBottom: "1px solid var(--color-border)", fontWeight: 600 }}
                          onClick={() => { navigate("/admin"); setShowUserMenu(false); }}
                        >
                          Admin Panel
                        </button>

                      </>
                    )}
                    <button
                      style={{ width: "100%", background: "none", border: "none", padding: "10px 18px", textAlign: "left", fontSize: "12px", color: "var(--color-destructive)", cursor: "pointer" }}
                      onClick={() => { logout(); setShowUserMenu(false); navigate("/"); }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "2px", marginLeft: "auto" }}>
            {!isCartOrWishlist && (
              <button
                onClick={() => setSearchOpen((s) => !s)}
                aria-label="Search"
                style={{ padding: "8px", transition: "all 0.3s", display: "flex", alignItems: "center" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-gold)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.transform = "scale(1)"; }}
              >
                <Search size={18} strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={toggle}
              aria-label="Theme"
              style={{ padding: "8px", transition: "all 0.3s", display: "flex", alignItems: "center" }}
              className="theme-toggle"
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-gold)"; e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.transform = "scale(1)"; }}
            >
              {theme === "light" ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              style={{ padding: "8px", transition: "all 0.3s", display: "flex", alignItems: "center", position: "relative" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-gold)"; e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <Heart size={18} strokeWidth={1.5} />
              {wishCount > 0 && (
                <span style={{ position: "absolute", top: "4px", right: "4px", backgroundColor: "var(--color-gold)", color: "white", fontSize: "8px", width: "14px", height: "14px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, animation: "zoomIn 0.5s" }}>
                  {wishCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              style={{ padding: "8px", transition: "all 0.3s", display: "flex", alignItems: "center", position: "relative" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-gold)"; e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.transform = "scale(1)"; }}
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span style={{ position: "absolute", top: "4px", right: "4px", backgroundColor: "var(--color-gold)", color: "white", fontSize: "8px", width: "14px", height: "14px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, animation: "zoomIn 0.5s" }}>
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="mobile-menu-btn"
              style={{ padding: "8px", marginLeft: "4px", display: "flex", alignItems: "center", transition: "all 0.3s" }}
              onClick={() => { setHidden(false); setMobileOpen(true); }}
              aria-label="Menu"
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-gold)"; e.currentTarget.style.transform = "scale(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = ""; e.currentTarget.style.transform = "scale(1)"; }}
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
                  backgroundColor: "color-mix(in oklch, var(--color-background) 95%, transparent)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "16px",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.15)",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <Search size={16} style={{ color: "var(--color-muted-foreground)" }} />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && query) { 
                        navigate(`/search?q=${encodeURIComponent(query)}`); 
                        setSearchOpen(false); 
                      }
                      if (e.key === "Escape") { setSearchOpen(false); setQuery(""); }
                    }}
                    placeholder="Search FIT & FINE..."
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: "14px", color: "var(--color-foreground)" }}
                  />
                  <button
                    onClick={() => { setSearchOpen(false); setQuery(""); }}
                    style={{ padding: "4px", borderRadius: "50%", transition: "background 0.2s", display: "flex" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-muted)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                  >
                    <X size={16} />
                  </button>
                </div>
                {query && (
                  <div
                    style={{
                      borderTop: "1px solid var(--color-border)",
                      padding: "24px",
                      background: "color-mix(in oklch, var(--color-surface) 30%, transparent)",
                    }}
                  >
                    <p className="label-caps" style={{ fontSize: "10px", color: "var(--color-muted-foreground)", marginBottom: "16px" }}>
                      Results
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      {results.length === 0 ? (
                        <p style={{ fontSize: "12px", color: "var(--color-muted-foreground)", fontStyle: "italic", gridColumn: "1/-1" }}>
                          No matches for "{query}"
                        </p>
                      ) : (
                        results.map((p) => (
                          <Link
                            key={p.id}
                            to={`/product/${p.slug || p._id || p.id}`}
                            onClick={() => setSearchOpen(false)}
                            style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}
                            className="search-result-item"
                          >
                            <div style={{ width: "48px", height: "64px", borderRadius: "6px", overflow: "hidden", backgroundColor: "var(--color-muted)", flexShrink: 0 }}>
                              <img src={p.images[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} />
                            </div>
                            <div style={{ overflow: "hidden" }}>
                              <p style={{ fontFamily: "var(--font-serif)", fontSize: "11px", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {p.name}
                              </p>
                              <p style={{ fontSize: "9px", color: "var(--color-muted-foreground)", marginTop: "2px" }}>
                                ₹{p.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    {results.length > 0 && (
                      <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--color-border)", textAlign: "center" }}>
                        <Link
                          to={`/search?q=${encodeURIComponent(query)}`}
                          onClick={() => setSearchOpen(false)}
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--color-gold)",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}
                        >
                          View all {products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).length} results
                        </Link>
                      </div>
                    )}
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

      {/* ─── MOBILE MENU ─────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 100,
          visibility: mobileOpen ? "visible" : "hidden",
          pointerEvents: mobileOpen ? "auto" : "none",
        }}
      >
        {/* Backdrop */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            opacity: mobileOpen ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            height: "100%",
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "var(--color-background)",
            transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Decorative accent bar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "3px",
              height: "100%",
              background: "linear-gradient(to bottom, var(--color-gold), transparent 60%)",
              opacity: 0.6,
            }}
          />

          {/* Top bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "64px",
              padding: "0 24px",
              borderBottom: "1px solid color-mix(in oklch, var(--color-border) 60%, transparent)",
              flexShrink: 0,
            }}
          >
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.1rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "baseline",
                textDecoration: "none",
                color: "var(--color-foreground)",
              }}
            >
              FIT & FINE
              <span style={{ color: "var(--color-gold)", marginLeft: "1px" }}>.</span>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--color-border)",
                background: "none",
                cursor: "pointer",
                transition: "background 0.2s",
                color: "var(--color-foreground)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-muted)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>

            {/* Nav Links */}
            <nav style={{ padding: "8px 0" }}>
              {navLinks.map((l, i) =>
                l.children ? (
                  /* Collections accordion */
                  <div key={l.to}>
                    <button
                      onClick={() =>
                        setMobileDropdown((prev) =>
                          prev === l.to ? null : l.to
                        )
                      }
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "16px 28px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        borderBottom: mobileDropdown === l.to
                          ? "none"
                          : "1px solid color-mix(in oklch, var(--color-border) 40%, transparent)",
                        transform: mobileOpen ? "translateX(0)" : "translateX(20px)",
                        opacity: mobileOpen ? 1 : 0,
                        transition: `transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms, opacity 0.6s ${i * 60}ms, background 0.2s`,
                      }}
                      onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "color-mix(in oklch, var(--color-foreground) 4%, transparent)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "")
                      }
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-serif)",
                          fontSize: "1.6rem",
                          fontWeight: 500,
                          color: location.pathname.startsWith("/collections")
                            ? "var(--color-gold)"
                            : "var(--color-foreground)",
                          lineHeight: 1.2,
                        }}
                      >
                        {l.label}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "var(--color-muted-foreground)",
                        }}
                      >
                        <span style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                          {mobileDropdown === l.to ? "Close" : "Explore"}
                        </span>
                        <ChevronDown
                          size={14}
                          style={{
                            transform: mobileDropdown === l.to ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.3s",
                          }}
                        />
                      </span>
                    </button>

                    {/* Accordion Children */}
                    <div
                      style={{
                        maxHeight: mobileDropdown === l.to ? "400px" : "0",
                        overflow: "hidden",
                        transition: "max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                        borderBottom: "1px solid color-mix(in oklch, var(--color-border) 40%, transparent)",
                        backgroundColor: "color-mix(in oklch, var(--color-foreground) 2%, transparent)",
                      }}
                    >
                      <div style={{ padding: "4px 0 12px" }}>
                        {l.children.map((child, ci) => (
                          <Link
                            key={child.to}
                            to={child.to}
                            onClick={() => setMobileOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "14px 28px 14px 36px",
                              textDecoration: "none",
                              borderLeft: location.pathname === child.to ? "2px solid var(--color-gold)" : "2px solid transparent",
                              transition: "background 0.2s, border-color 0.2s",
                              marginLeft: "4px",
                            }}
                            onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "color-mix(in oklch, var(--color-foreground) 4%, transparent)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor = "")
                            }
                          >
                            <div>
                              <p
                                style={{
                                  fontSize: "13px",
                                  fontWeight: location.pathname === child.to ? 700 : 500,
                                  color:
                                    location.pathname === child.to
                                      ? "var(--color-gold)"
                                      : "var(--color-foreground)",
                                  letterSpacing: "0.02em",
                                  marginBottom: "2px",
                                }}
                              >
                                {child.label}
                              </p>
                              <p
                                style={{
                                  fontSize: "10px",
                                  color: "var(--color-muted-foreground)",
                                }}
                              >
                                {child.desc}
                              </p>
                            </div>
                            <ChevronRight size={14} style={{ color: "var(--color-muted-foreground)" }} />
                          </Link>
                        ))}
                        <Link
                          to="/collections"
                          onClick={() => setMobileOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            margin: "8px 28px 0 36px",
                            padding: "8px 0",
                            fontSize: "10px",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "var(--color-gold)",
                            textDecoration: "none",
                            borderTop: "1px solid color-mix(in oklch, var(--color-border) 60%, transparent)",
                          }}
                        >
                          Shop All Collections <ArrowUpRight size={10} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 28px",
                      textDecoration: "none",
                      borderBottom: "1px solid color-mix(in oklch, var(--color-border) 40%, transparent)",
                      transform: mobileOpen ? "translateX(0)" : "translateX(20px)",
                      opacity: mobileOpen ? 1 : 0,
                      transition: `transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms, opacity 0.6s ${i * 60}ms, background 0.2s`,
                    }}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "color-mix(in oklch, var(--color-foreground) 4%, transparent)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "")
                    }
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.6rem",
                        fontWeight: 500,
                        color:
                          location.pathname === l.to
                            ? "var(--color-gold)"
                            : "var(--color-foreground)",
                        lineHeight: 1.2,
                      }}
                    >
                      {l.label}
                    </span>
                    {location.pathname === l.to && (
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-gold)",
                        }}
                      />
                    )}
                  </Link>
                )
              )}
            </nav>

            {/* Auth section */}
            <div
              style={{
                padding: "20px 28px",
                borderBottom: "1px solid color-mix(in oklch, var(--color-border) 40%, transparent)",
              }}
            >
              {!user ? (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    backgroundColor: "var(--color-gold)",
                    color: "white",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    textDecoration: "none",
                  }}
                >
                  Sign In to Your Account
                </Link>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <p style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-muted-foreground)", marginBottom: "8px" }}>
                    Account
                  </p>
                  <button
                    style={{ background: "none", border: "none", textAlign: "left", padding: "8px 0", fontSize: "14px", fontWeight: 500, color: "var(--color-foreground)", cursor: "pointer" }}
                    onClick={() => { setMobileOpen(false); navigate("/profile"); }}
                  >
                    {user?.name || user?.email?.split("@")[0]} — Profile
                  </button>
                  {isAdmin && (
                    <button
                      style={{ background: "none", border: "none", textAlign: "left", padding: "8px 0", fontSize: "14px", fontWeight: 600, color: "var(--color-gold)", cursor: "pointer" }}
                      onClick={() => { setMobileOpen(false); navigate("/admin"); }}
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    style={{ background: "none", border: "none", textAlign: "left", padding: "8px 0", fontSize: "13px", color: "var(--color-destructive)", cursor: "pointer" }}
                    onClick={() => { logout(); setMobileOpen(false); navigate("/"); }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Bottom: theme + social */}
            <div style={{ padding: "28px 28px 40px" }}>
              <button
                onClick={toggle}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--color-foreground)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "32px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--color-border)",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                {theme === "light" ? (
                  <><Moon size={16} strokeWidth={1.5} /> Switch to Dark Mode</>
                ) : (
                  <><Sun size={16} strokeWidth={1.5} /> Switch to Light Mode</>
                )}
              </button>

              <p
                style={{
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "var(--color-muted-foreground)",
                  marginBottom: "14px",
                }}
              >
                Follow Us
              </p>
              <div style={{ display: "flex", gap: "20px" }}>
                {["Instagram", "Pinterest", "Twitter"].map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--color-muted-foreground)",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "var(--color-foreground)")}
                    onMouseLeave={(e) => (e.target.style.color = "var(--color-muted-foreground)")}
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