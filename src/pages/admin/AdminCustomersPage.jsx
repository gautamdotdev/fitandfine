import { useEffect, useMemo, useState } from "react";
import { adminApi } from "../../lib/api";
import { Loader2, Search, Users } from "lucide-react";

const CSS = `
  .ac-wrap { max-width: 1420px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .ac-sub { color: #888; font-size: 13px; margin: 0 0 18px; }
  .ac-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 16px; }
  .ac-stat, .ac-table-wrap, .ac-empty { background: #fff; border: 1px solid #e8e6e0; border-radius: 2px; }
  .ac-stat { padding: 18px; }
  .ac-label { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #aaa; font-weight: 800; }
  .ac-value { font-size: 28px; font-weight: 900; margin-top: 8px; }
  .ac-search { position: relative; margin-bottom: 16px; }
  .ac-search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #999; }
  .ac-search input { width: 100%; height: 42px; border: 1.5px solid #e8e6e0; border-radius: 10px; background: #fff; padding: 0 12px 0 38px; font: inherit; box-sizing: border-box; outline: none; }
  .ac-table { width: 100%; border-collapse: collapse; }
  .ac-table th { background: #faf9f7; padding: 13px 14px; text-align: left; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #bbb; }
  .ac-table td { padding: 14px; border-top: 1px solid #f5f3ef; vertical-align: top; }
  .ac-main { font-weight: 800; font-size: 13px; }
  .ac-muted { color: #888; font-size: 12px; margin-top: 4px; }
  .ac-empty { min-height: 220px; display: grid; place-items: center; color: #999; }
  .spin { animation: acSpin .8s linear infinite; }
  @keyframes acSpin { to { transform: rotate(360deg); } }
  @media (max-width: 760px) {
    .ac-stats { grid-template-columns: 1fr; }
    .ac-table-wrap { overflow-x: auto; }
    .ac-table { min-width: 720px; }
  }
`;

export default function AdminCustomersPage() {
  const [data, setData] = useState({ customers: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminApi
      .customers()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const customers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data.customers || [];
    return (data.customers || []).filter((c) =>
      [c.name, c.email, c.phone].filter(Boolean).some((v) => v.toLowerCase().includes(q)),
    );
  }, [data.customers, search]);

  return (
    <>
      <style>{CSS}</style>
      <div className="ac-wrap">
        <p className="ac-sub">Customer list, order count and lifetime value from backend orders</p>
        <div className="ac-stats">
          <div className="ac-stat"><div className="ac-label">Customers</div><div className="ac-value">{data.stats?.totalCustomers || 0}</div></div>
          <div className="ac-stat"><div className="ac-label">With orders</div><div className="ac-value">{data.stats?.withOrders || 0}</div></div>
          <div className="ac-stat"><div className="ac-label">Customer value</div><div className="ac-value">Rs {(data.stats?.totalCustomerValue || 0).toLocaleString("en-IN")}</div></div>
        </div>
        <div className="ac-search"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers" /></div>
        {loading ? <div className="ac-empty"><Loader2 className="spin" /></div> : (
          <div className="ac-table-wrap">
            <table className="ac-table">
              <thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Spent</th><th>Joined</th></tr></thead>
              <tbody>{customers.map((c) => (
                <tr key={c._id}>
                  <td><div className="ac-main">{c.name || "Customer"}</div><div className="ac-muted">{c.email}</div></td>
                  <td>{c.phone || c.addresses?.[0]?.phone || "-"}</td>
                  <td>{c.orderCount}</td>
                  <td>Rs {(c.totalSpent || 0).toLocaleString("en-IN")}</td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : "-"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
