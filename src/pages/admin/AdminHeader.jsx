import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Menu } from "lucide-react";

const HEADER_STYLES = `
  .adm-topbar {
    height: 60px;
    background: #fff;
    border-bottom: 1px solid #e8e6e0;
    display: flex;
    align-items: center;
    padding: 0 24px;
    gap: 12px;
    position: sticky;
    top: 0;
    z-index: 50;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    will-change: transform;
  }
  .adm-topbar.adm-topbar--hidden {
    transform: translateY(-100%);
    box-shadow: none;
  }
  .adm-topbar.adm-topbar--visible {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
  .adm-topbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .adm-topbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }
  .adm-menu-btn {
    display: none;
    padding: 8px;
    background: none;
    border: none;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #1a1a1a;
    border-radius: 8px;
    transition: background 0.15s;
  }
  .adm-menu-btn:hover { background: #f5f4f0; }

  .adm-topbar-notif-btn {
    width: 36px; height: 36px; border-radius: 10px;
    border: 1.5px solid #e8e6e0; background: #fff;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; position: relative; color: #666;
  }
  .adm-topbar-notif-btn:hover { background: #f5f4f0; color: #1a1a1a; }
  .adm-notif-dot {
    position: absolute; top: 5px; right: 5px;
    width: 7px; height: 7px; background: #ef4444;
    border-radius: 50%; border: 1.5px solid #fff;
  }

  @media (max-width: 900px) {
    .adm-menu-btn { display: flex; }
    .adm-topbar { padding: 0 5px; height: 64px; }
    .adm-topbar-logo-text { font-size: 1.2rem !important; }
  }
`;

const SCROLL_THRESHOLD = 8; // px — ignore tiny jitter

export function AdminHeader({ setSidebarOpen }) {
  const navigate = useNavigate();
  const lastScrollY = useRef(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      const diff = current - lastScrollY.current;

      if (Math.abs(diff) < SCROLL_THRESHOLD) return; // ignore micro-scroll

      if (diff > 0 && current > 60) {
        // scrolling DOWN past header height → hide
        setVisible(false);
      } else {
        // scrolling UP → show
        setVisible(true);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{HEADER_STYLES}</style>
      <header
        className={`adm-topbar ${visible ? "adm-topbar--visible" : "adm-topbar--hidden"}`}
      >
        <div className="adm-topbar-left">
          <div
            className="adm-topbar-logo-text"
            style={{
              fontFamily: "var(--font-serif, 'Georgia', serif)",
              fontSize: "1.4rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "baseline",
              letterSpacing: "-0.02em",
              userSelect: "none",
            }}
            onClick={() => navigate("/admin")}
          >
            FIT & FINE
            <span style={{ color: "var(--color-gold, #c9a84c)" }}>.</span>
          </div>
        </div>

        <div className="adm-topbar-right">
          <button
            className="adm-topbar-notif-btn"
            style={{ display: "flex" }}
            aria-label="Notifications"
          >
            <Bell size={16} strokeWidth={1.8} />
            <span className="adm-notif-dot" />
          </button>

          <button
            className="adm-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Menu"
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </header>
    </>
  );
}
