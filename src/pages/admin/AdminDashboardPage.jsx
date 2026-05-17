import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { adminApi } from "../../lib/api";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Plus,
  ChevronRight,
  BarChart3,
  Zap,
  Settings,
} from "lucide-react";

const DASH_STYLES = `
  .dash-page { font-family: 'DM Sans', sans-serif; max-width: 1400px; margin: 0 auto; padding: 12px 0 48px; }
  .dash-sub { font-size: 14px; color: #888; margin: 0 0 32px; }

  .dash-stats { 
    display: grid; 
    grid-template-columns: repeat(4, 1fr); 
    gap: 16px; 
    margin-bottom: 28px;
    width: 100%;
  }
  .dash-stat-card {
    background: #fff; border: 1px solid #e8e6e0;
    border-radius: 2px; padding: 20px 22px;
    transition: all 0.2s;
    cursor: default;
    min-width: 0; /* Prevent grid blowouts */
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
  .dash-table td { padding: 14px 16px; border-bottom: 1px solid #f5f3ef; min-width: 0; }
  .dash-table tr:last-child td { border-bottom: none; }
  .dash-table tr:hover td { background: #faf9f7; }
  .dash-table-container { 
    overflow-x: auto; 
    width: 100%; 
    -webkit-overflow-scrolling: touch; 
  }

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
  .dash-status-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 16px; }
  .dash-status-pill { border: 1px solid #f0ede6; background: #faf9f7; border-radius: 2px; padding: 12px; }
  .dash-order-row { display: grid; grid-template-columns: 1fr auto; gap: 12px; padding: 13px 16px; border-bottom: 1px solid #f5f3ef; }
  .dash-order-row:last-child { border-bottom: none; }

  @media (max-width: 1100px) {
    .dash-stats { grid-template-columns: repeat(2, 1fr); }
    .dash-grid-2 { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .dash-stats { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 480px) {
    .dash-stats { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .dash-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .dash-stat-value { font-size: 24px; }
  }

  @keyframes dash-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .dash-skeleton { pointer-events: none; }
`;

const STATS = [
  {
    label: "Total Products",
    value: (_p, data) => (data.stats?.products || 0).toLocaleString(),
    icon: Package,
    accent: "#6366f1",
    trend: "+4.2%",
    up: true,
    sub: "Last 7 days",
  },
  {
    label: "Total Revenue",
    value: (_p, data) =>
      "₹" + (data.stats?.revenue || 0).toLocaleString("en-IN"),
    icon: TrendingUp,
    accent: "#10b981",
    trend: "+12.5%",
    up: true,
    sub: "Last 7 days",
  },
  {
    label: "Total Orders",
    value: (_p, data) => (data.stats?.orders || 0).toLocaleString(),
    icon: ShoppingCart,
    accent: "#f59e0b",
    trend: "-1.4%",
    up: false,
    sub: "Last 7 days",
  },
  {
    label: "Customers",
    value: (_p, data) => (data.stats?.customers || 0).toLocaleString(),
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

function Skeleton({ w = "100%", h = "20px", r = "4px" }) {
  return (
    <div
      className="dash-skeleton"
      style={{
        width: w,
        height: h,
        borderRadius: r,
        background: "#f0ede6",
        animation: "dash-pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export default function AdminDashboardPage() {
  const { products, loading: productsLoading, fetchProducts } = useShop();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState({ stats: {}, lowStock: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch dashboard-specific stats
    adminApi
      .dashboard()
      .then((data) => {
        setDashboard(data || { stats: {}, lowStock: [] });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Dashboard API error:", err);
        setDashboard({ stats: {}, lowStock: [] });
        setLoading(false);
      });

    if (products.length === 0) {
      fetchProducts({ limit: 20, append: false });
    }
  }, [fetchProducts, products.length]);

  const lowStock = useMemo(
    () =>
      dashboard.lowStock?.length
        ? dashboard.lowStock
        : products.filter((p) => (p.stock ?? 0) <= 5).slice(0, 5),
    [dashboard.lowStock, products],
  );
  const recent = useMemo(
    () => dashboard.recentOrders || [],
    [dashboard.recentOrders],
  );
  const statuses = useMemo(() => dashboard.statusStats || [], [dashboard.statusStats]);

  const isDataLoading = loading || productsLoading;

  return (
    <>
      <style>{DASH_STYLES}</style>
      <div className="dash-page">
        <p className="dash-sub">
          Manage inventory, pricing and availability across your store
        </p>

        <div className="dash-stats">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div className="dash-stat-card" key={stat.label}>
                <div className="dash-stat-label">
                  <span>{stat.label}</span>
                  <span className="dash-stat-icon" style={{ color: stat.accent, background: `${stat.accent}14` }}>
                    <Icon size={16} />
                  </span>
                </div>
                <div className="dash-stat-value">
                  {isDataLoading ? <Skeleton w="80px" h="28px" /> : stat.value(products, dashboard)}
                </div>
                <div className="dash-stat-trend" style={{ color: stat.up ? "#10b981" : "#ef4444" }}>
                  {stat.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {stat.trend}
                  <span className="dash-stat-sub">{stat.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dash-grid-2">
          <section className="dash-card">
            <div className="dash-card-head">
              <div className="dash-card-title">Recent Orders</div>
              <Link className="dash-card-action" to="/admin/orders">
                View all <ChevronRight size={13} />
              </Link>
            </div>
            {recent.length === 0 ? (
              <div style={{ padding: 20, color: "#999", fontSize: 13 }}>No orders yet</div>
            ) : (
              recent.map((order) => (
                <div className="dash-order-row" key={order._id}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13 }}>#{order.orderId || order._id}</div>
                    <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                      {order.user?.name || "Customer"} · {order.items?.length || 0} item(s)
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900 }}>Rs {(order.total || 0).toLocaleString("en-IN")}</div>
                    <div style={{ color: "#888", fontSize: 12, textTransform: "capitalize" }}>{order.status}</div>
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="dash-card">
            <div className="dash-card-head">
              <div className="dash-card-title">Order Status</div>
              <BarChart3 size={16} color="#888" />
            </div>
            <div className="dash-status-grid">
              {statuses.length === 0 ? (
                <div style={{ color: "#999", fontSize: 13 }}>No status data</div>
              ) : (
                statuses.map((row) => (
                  <div className="dash-status-pill" key={row._id || "none"}>
                    <div className="dash-stat-label" style={{ marginBottom: 8 }}>{row._id || "unknown"}</div>
                    <div style={{ fontSize: 24, fontWeight: 900 }}>{row.count}</div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="dash-grid-2">
          <section className="dash-card">
            <div className="dash-card-head">
              <div className="dash-card-title">Recent Products</div>
              <Link className="dash-card-action" to="/admin/products">
                Manage <ChevronRight size={13} />
              </Link>
            </div>
            <div className="dash-table-container">
              <table className="dash-table">
                <thead>
                  <tr><th>Product</th><th>Stock</th><th>Price</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {products.slice(0, 7).map((product) => (
                    <tr key={product._id || product.id}>
                      <td style={{ fontWeight: 800, fontSize: 13 }}>{product.name}</td>
                      <td>{product.stock ?? 0}</td>
                      <td>Rs {(product.salePrice || product.price || 0).toLocaleString("en-IN")}</td>
                      <td><StatusBadge stock={product.stock ?? 0} salePrice={product.salePrice} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="dash-card">
            <div className="dash-card-head">
              <div className="dash-card-title">Low Stock</div>
              <AlertTriangle size={16} color="#f59e0b" />
            </div>
            {lowStock.length === 0 ? (
              <div style={{ padding: 16, color: "#999", fontSize: 13 }}>No low stock products</div>
            ) : (
              lowStock.map((product) => {
                const image = product.images?.[0]?.url || product.images?.[0];
                return (
                  <div className="dash-low-item" key={product._id || product.id}>
                    {image ? <img className="dash-low-img" src={image} alt="" /> : <div className="dash-low-img" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{product.name}</div>
                      <div style={{ color: "#888", fontSize: 12 }}>Stock: {product.stock ?? 0}</div>
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    </>
  );
}
