import React, { useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Edit2,
  AlertTriangle,
  Plus,
  ChevronRight,
  BarChart3,
} from "lucide-react";

const DASH_STYLES = `
  .dash-page { font-family: 'DM Sans', sans-serif; max-width: 1400px; margin: 0 auto; padding: 12px 0 48px; }
  .dash-heading { font-size: 28px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.02em; color: #1a1a1a; }
  .dash-sub { font-size: 14px; color: #888; margin: 0 0 32px; }

  .dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .dash-stat-card {
    background: #fff; border: 1px solid #e8e6e0;
    border-radius: 2px; padding: 20px 22px;
    transition: box-shadow 0.2s, transform 0.2s;
    cursor: default;
  }
  .dash-stat-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .dash-stat-label {
    font-size: 11px; font-weight: 600; letter-spacing: 0.08em;
    text-transform: uppercase; color: #999; margin-bottom: 12px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .dash-stat-icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }
  .dash-stat-value { font-size: 30px; font-weight: 800; line-height: 1; letter-spacing: -1px; margin-bottom: 8px; }
  .dash-stat-trend { font-size: 11.5px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
  .dash-stat-sub { font-size: 11px; color: #aaa; margin-left: auto; }

  .dash-grid-2 { display: grid; grid-template-columns: 1fr 340px; gap: 20px; margin-bottom: 20px; }
  
  .dash-card {
    background: #fff; border: 1px solid #e8e6e0;
    border-radius: 2px; overflow: hidden;
  }
  .dash-card-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 20px 16px; border-bottom: 1px solid #f0ede6;
  }
  .dash-card-title { font-size: 14px; font-weight: 700; }
  .dash-card-action {
    font-size: 12px; font-weight: 600; color: #7c3aed;
    text-decoration: none; padding: 5px 10px; border-radius: 7px;
    transition: background 0.15s; display: flex; align-items: center; gap: 4px;
  }
  .dash-card-action:hover { background: #f3f0ff; }

  /* Recent products table */
  .dash-table { width: 100%; border-collapse: collapse; }
  .dash-table th {
    padding: 10px 16px; text-align: left;
    font-size: 10.5px; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; color: #bbb;
    background: #faf9f7; border-bottom: 1px solid #f0ede6;
  }
  .dash-table td { padding: 14px 16px; border-bottom: 1px solid #f5f3ef; }
  .dash-table tr:last-child td { border-bottom: none; }
  .dash-table tr:hover td { background: #faf9f7; }

  /* Status dots */
  .status-dot { display: inline-flex; align-items: center; gap: 5px; }
  .status-dot::before {
    content: ''; width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  }

  /* Quick actions */
  .dash-quick { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 16px; }
  .dash-qa-btn {
    display: flex; flex-direction: column; gap: 6px;
    padding: 14px; border-radius: 2px;
    border: 1.5px solid #e8e6e0; background: #faf9f7;
    cursor: pointer; transition: all 0.15s; text-align: left;
    text-decoration: none; color: inherit;
  }
  .dash-qa-btn:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .dash-qa-icon { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; }
  .dash-qa-label { font-size: 12.5px; font-weight: 700; }
  .dash-qa-sub { font-size: 11px; color: #aaa; }

  /* Low stock list */
  .dash-low-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-bottom: 1px solid #f5f3ef;
  }
  .dash-low-item:last-child { border-bottom: none; }
  .dash-low-img { width: 38px; height: 46px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: #f0ede6; }

  @media (max-width: 1100px) {
    .dash-stats { grid-template-columns: repeat(2, 1fr); }
    .dash-grid-2 { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .dash-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .dash-stat-value { font-size: 24px; }
  }
`;

const STATS = [
  {
    label: "Total Products",
    value: (p) => p.length.toLocaleString(),
    icon: Package,
    accent: "#6366f1",
    trend: "+4.2%",
    up: true,
    sub: "Last 7 days",
  },
  {
    label: "Total Revenue",
    value: (p) =>
      "₹" + p.reduce((s, x) => s + (x.price || 0), 0).toLocaleString("en-IN"),
    icon: TrendingUp,
    accent: "#10b981",
    trend: "+12.5%",
    up: true,
    sub: "Last 7 days",
  },
  {
    label: "Total Orders",
    value: () => "142",
    icon: ShoppingCart,
    accent: "#f59e0b",
    trend: "-1.4%",
    up: false,
    sub: "Last 7 days",
  },
  {
    label: "Customers",
    value: () => "3,240",
    icon: Users,
    accent: "#8b5cf6",
    trend: "+2.1%",
    up: true,
    sub: "Last 7 days",
  },
];

function StatusBadge({ stock, salePrice }) {
  if (stock === 0)
    return (
      <span
        className="status-dot status-out"
        style={{ fontSize: 12, fontWeight: 600, color: "#d97706" }}
      >
        Out of Stock
      </span>
    );
  if (stock <= 5)
    return (
      <span
        className="status-dot status-inactive"
        style={{ fontSize: 12, fontWeight: 600, color: "#ef4444" }}
      >
        Low Stock
      </span>
    );
  if (salePrice)
    return (
      <span
        className="status-dot status-published"
        style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}
      >
        On Sale
      </span>
    );
  return (
    <span
      className="status-dot status-published"
      style={{ fontSize: 12, fontWeight: 600, color: "#10b981" }}
    >
      Published
    </span>
  );
}

export default function AdminDashboardPage() {
  const { products } = useShop();
  const navigate = useNavigate();

  const lowStock = useMemo(
    () => products.filter((p) => p.stock <= 5).slice(0, 5),
    [products],
  );
  const recent = useMemo(() => [...products].slice(0, 7), [products]);

  return (
    <>
      <style>{DASH_STYLES}</style>
      <div className="dash-page">
        <p className="dash-sub">
          Manage inventory, pricing and availability across your store
        </p>

        {/* Stats */}
        <div className="dash-stats">
          {STATS.map((s) => (
            <div className="dash-stat-card" key={s.label}>
              <div className="dash-stat-label">
                <span>{s.label}</span>
                <div
                  className="dash-stat-icon"
                  style={{ background: s.accent + "18" }}
                >
                  <s.icon size={14} color={s.accent} />
                </div>
              </div>
              <div className="dash-stat-value">{s.value(products)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  className="dash-stat-trend"
                  style={{ color: s.up ? "#10b981" : "#ef4444" }}
                >
                  {s.up ? (
                    <ArrowUpRight size={13} />
                  ) : (
                    <ArrowDownRight size={13} />
                  )}
                  {s.trend}
                </span>
                <span className="dash-stat-sub">{s.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="dash-grid-2">
          {/* Recent products */}
          <div className="dash-card">
            <div className="dash-card-head">
              <span className="dash-card-title">Recent Products</span>
              <Link to="/admin/products" className="dash-card-action">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr
                      key={p._id}
                      style={{ cursor: "pointer" }}
                      onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                    >
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <img
                            src={p.images?.[0]?.url || p.images?.[0] || ""}
                            alt={p.name}
                            style={{
                              width: 34,
                              height: 42,
                              objectFit: "cover",
                              borderRadius: 7,
                              background: "#f0ede6",
                              flexShrink: 0,
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                lineHeight: 1.3,
                              }}
                            >
                              {p.name}
                            </div>
                            <div style={{ fontSize: 11, color: "#bbb" }}>
                              {p.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>
                          ₹{p.price?.toLocaleString("en-IN")}
                        </div>
                        {p.salePrice && (
                          <div style={{ fontSize: 11, color: "#b45309" }}>
                            ₹{p.salePrice?.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 13, fontWeight: 600 }}>
                        {p.stock ?? "—"}
                      </td>
                      <td>
                        <StatusBadge stock={p.stock} salePrice={p.salePrice} />
                      </td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: "40px",
                          color: "#bbb",
                          fontSize: 13,
                        }}
                      >
                        No products yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Quick Actions */}
            <div className="dash-card">
              <div className="dash-card-head">
                <span className="dash-card-title">Quick Actions</span>
              </div>
              <div className="dash-quick">
                {[
                  {
                    icon: Plus,
                    bg: "#1a1a1a",
                    color: "#fff",
                    label: "Add Product",
                    sub: "New listing",
                    to: "/admin/products/add",
                  },
                  {
                    icon: ShoppingCart,
                    bg: "#6366f118",
                    color: "#6366f1",
                    label: "Orders",
                    sub: "Manage orders",
                    to: "/admin/orders",
                  },
                  {
                    icon: Users,
                    bg: "#10b98118",
                    color: "#10b981",
                    label: "Customers",
                    sub: "View all",
                    to: "/admin/customers",
                  },
                  {
                    icon: BarChart3,
                    bg: "#f59e0b18",
                    color: "#f59e0b",
                    label: "Analytics",
                    sub: "See insights",
                    to: "/admin/analytics",
                  },
                ].map((a) => (
                  <Link key={a.label} to={a.to} className="dash-qa-btn">
                    <div className="dash-qa-icon" style={{ background: a.bg }}>
                      <a.icon size={15} color={a.color} />
                    </div>
                    <div className="dash-qa-label">{a.label}</div>
                    <div className="dash-qa-sub">{a.sub}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Low stock */}
            <div className="dash-card">
              <div className="dash-card-head">
                <span
                  className="dash-card-title"
                  style={{ display: "flex", alignItems: "center", gap: 7 }}
                >
                  <AlertTriangle size={14} color="#f59e0b" /> Low Stock
                </span>
                <Link to="/admin/products" className="dash-card-action">
                  See all
                </Link>
              </div>
              {lowStock.length === 0 ? (
                <div
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    fontSize: 13,
                    color: "#bbb",
                  }}
                >
                  All products well-stocked ✓
                </div>
              ) : (
                lowStock.map((p) => (
                  <div className="dash-low-item" key={p._id}>
                    <img
                      className="dash-low-img"
                      src={p.images?.[0]?.url || p.images?.[0] || ""}
                      alt={p.name}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: 11, color: "#bbb" }}>
                        {p.category}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "3px 9px",
                        borderRadius: 20,
                        flexShrink: 0,
                        background: p.stock === 0 ? "#fef2f2" : "#fff7ed",
                        color: p.stock === 0 ? "#ef4444" : "#d97706",
                        border: `1px solid ${p.stock === 0 ? "#fecaca" : "#fed7aa"}`,
                      }}
                    >
                      {p.stock} left
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
