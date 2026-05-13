import React, { useState } from "react";
import { useAuth } from "../../context/ShopContext";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Tag,
  X,
  Store,
  Zap,
  LogOut,
  Plus,
  Globe,
} from "lucide-react";
import { AdminHeader } from "./AdminHeader.jsx";

const SIDEBAR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  .adm-shell {
    display: flex;
    min-height: 100vh;
    background: #f5f4f0;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
  }

  /* ── Sidebar ── */
  .adm-sidebar {
    width: 240px;
    background: #fff;
    border-right: 1px solid #e8e6e0;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  .adm-sidebar.closed { transform: translateX(-100%); }

  .adm-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 10px 10px;
    border-bottom: 1px solid #f0ede6;
  }
  .adm-logo-icon {
    width: 32px; height: 32px;
    background: #1a1a1a;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .adm-logo-text { font-size: 15px; font-weight: 700; letter-spacing: -0.3px; }
  .adm-logo-sub { font-size: 10px; color: #999; font-weight: 500; }

  .adm-close-btn {
    display: none;
    width: 32px; height: 32px; border-radius: 8px;
    background: #f5f4f0; border: none;
    align-items: center; justify-content: center;
    cursor: pointer; color: #666;
    margin-left: auto;
    margin-top: 12px;
    margin-bottom: 8px;
    margin-right: 8px;
    padding: 0;
  }

  .adm-nav { padding: 16px 12px; flex: 1; overflow-y: auto; }
  .adm-nav-label {
    font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: #aaa;
    padding: 0 8px; margin: 16px 0 6px;
  }
  .adm-nav-label:first-child { margin-top: 0; }

  .adm-nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 2px;
    font-size: 13.5px; font-weight: 500;
    color: #666; text-decoration: none;
    transition: all 0.15s; margin-bottom: 2px;
    position: relative;
  }
  .adm-nav-link:hover { background: #f5f4f0; color: #1a1a1a; }
  .adm-nav-link.active {
    background: #1a1a1a; color: #fff;
    font-weight: 600;
  }
  .adm-nav-link.active svg { opacity: 1; }
  .adm-nav-badge {
    margin-left: auto;
    background: #ef4444; color: #fff;
    font-size: 10px; font-weight: 700;
    padding: 1px 6px; border-radius: 99px;
    min-width: 18px; text-align: center;
  }
  .adm-nav-link.active .adm-nav-badge { background: rgba(255,255,255,0.25); }

  .adm-sidebar-footer {
    padding: 12px;
    border-top: 1px solid #f0ede6;
  }
  .adm-user-row {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; border-radius: 2px;
    cursor: pointer; transition: background 0.15s;
  }
  .adm-user-row:hover { background: #f5f4f0; }
  .adm-user-name { font-size: 13px; font-weight: 600; line-height: 1.2; }
  .adm-user-role { font-size: 11px; color: #999; }

  /* ── Main ── */
  .adm-main {
    margin-left: 240px;
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  /* ── Topbar ── */
  .adm-topbar {
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #e8e6e0;
    display: flex; align-items: center;
    padding: 0 24px; gap: 12px;
    position: sticky; top: 0; z-index: 50;
  }
  .adm-search-bar {
    flex: 1; max-width: 360px;
    display: flex; align-items: center; gap: 8px;
    background: #f5f4f0; border-radius: 10px;
    padding: 8px 14px; border: 1.5px solid transparent;
    transition: all 0.2s; cursor: text;
  }
  .adm-search-bar:focus-within {
    background: #fff; border-color: #1a1a1a;
  }
  .adm-search-bar input {
    background: none; border: none; outline: none;
    font-size: 13px; color: #1a1a1a; width: 100%;
    font-family: 'DM Sans', sans-serif;
  }
  .adm-search-bar input::placeholder { color: #aaa; }
  .adm-topbar-left { display: flex; align-items: center; gap: 12px; }
  .adm-topbar-right { display: flex; align-items: center; gap: 8px; margin-left: auto; }
  .adm-icon-btn {
    width: 36px; height: 36px; border-radius: 10px;
    border: 1.5px solid #e8e6e0; background: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; position: relative; color: #666;
  }
  .adm-icon-btn:hover { background: #f5f4f0; border-color: #ccc; color: #1a1a1a; }
  .adm-notif-dot {
    position: absolute; top: 5px; right: 5px;
    width: 7px; height: 7px; background: #ef4444;
    border-radius: 50%; border: 1.5px solid #fff;
  }

  /* ── Page content ── */
  .adm-content { flex: 1; padding: 28px 28px 60px; }

  /* ── Overlay for mobile ── */
  .adm-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    z-index: 99; backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }

  /* ── Mobile hamburger ── */
  .adm-menu-btn {
    display: none;
    padding: 8px;
    background: none; border: none;
    align-items: center; justify-content: center;
    cursor: pointer; color: #1a1a1a;
  }

  @media (max-width: 900px) {
    .adm-sidebar { 
      left: auto;
      right: 0;
      transform: translateX(100%); 
      width: 100%; 
      border-left: 1px solid #e8e6e0;
      border-right: none;
    }
    .adm-sidebar.open { transform: translateX(0); }
    .adm-main { margin-left: 0; }
    .adm-menu-btn { display: flex; order: 2; }
    .adm-close-btn { display: flex; }
    .adm-content { padding: 10px 10px 40px; }
    .adm-topbar { padding: 0 16px; height: 64px; }
  }

  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
`;

const NAV = [
  {
    label: "MAIN",
    items: [
      { to: "/admin", icon: LayoutDashboard, text: "Home", end: true },
      { to: "/admin/orders", icon: ShoppingCart, text: "Orders" }, //badge: "5"
      { to: "/admin/products", icon: Package, text: "Products", end: true },
      { to: "/admin/products/add", icon: Plus, text: "Add Product" },
      { to: "/admin/customers", icon: Users, text: "Customers" },
    ],
  },
  {
    label: "SALES CHANNELS",
    items: [
      { to: "/admin/analytics", icon: BarChart3, text: "Analytics" },
      { to: "/admin/marketing", icon: Zap, text: "Marketing" },
      { to: "/admin/discounts", icon: Tag, text: "Discounts" },
    ],
  },
  {
    label: "SETTINGS",
    items: [{ to: "/admin/settings", icon: Settings, text: "Settings" }],
  },
  {
    items: [{ to: "/", icon: Globe, text: "Website" }],
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <style>{SIDEBAR_STYLES}</style>
      <div className="adm-shell">
        {/* Overlay */}
        {sidebarOpen && (
          <div className="adm-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}

        <aside className={`adm-sidebar${sidebarOpen ? " open" : ""}`}>
          <div
            className="adm-logo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 10px 10px",
              borderBottom: "1px solid #f0ede6",
            }}
          >
            <div className="adm-logo-icon">
              <Store size={16} color="#fff" />
            </div>
            <div>
              <div
                className="adm-logo-text"
                style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}
              >
                FIT & FINE<span style={{ color: "var(--color-gold)" }}>.</span>
              </div>
            </div>
            <button
              className="adm-close-btn"
              onClick={() => setSidebarOpen(false)}
              style={{ marginLeft: "auto" }}
            >
              <X size={18} />
            </button>
          </div>

          <nav className="adm-nav">
            {NAV.map((section) => (
              <div key={section.label}>
                <div className="adm-nav-label">{section.label}</div>
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `adm-nav-link${isActive ? " active" : ""}`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon size={16} />
                    {item.text}
                    {item.badge && (
                      <span className="adm-nav-badge">{item.badge}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div className="adm-sidebar-footer">
            <SidebarUserRow onClick={() => navigate("/admin/settings")} />
          </div>
        </aside>

        {/* Main */}
        <div className="adm-main">
          {/* Topbar */}
          <AdminHeader setSidebarOpen={setSidebarOpen} />

          {/* Page */}
          <main className="adm-content">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

// Sidebar user row component (must be outside main component)

function SidebarUserRow() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  if (loading) return null;
  if (!user) return null;

  const handleLogout = (e) => {
    e.stopPropagation();
    logout();
    navigate("/");
  };

  return (
    <div className="adm-user-row">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="adm-user-name">
          {user.name || user.username || user.email}
        </div>
      </div>
      <button
        style={{
          background: "none",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: "pointer",
        }}
        title="Logout"
        onClick={handleLogout}
      >
        <LogOut size={14} style={{ color: "#7e1212", flexShrink: 0 }} />
      </button>
    </div>
  );
}
