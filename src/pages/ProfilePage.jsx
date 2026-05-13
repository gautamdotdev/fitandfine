import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/ShopContext";
import UserOrders from "../components/UserOrders";
import { wishlistApi } from "../lib/api";

import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Edit2,
  Check,
  X,
  Plus,
  Truck,
  RotateCcw,
  ShieldCheck,
  Bell,
  Lock,
  Eye,
  EyeOff,
  CreditCard,
  Trash2,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

/* ── Static Data ── */
const USER = {
  name: "Arjun Mehta",
  email: "arjun.mehta@gmail.com",
  phone: "+91 98765 43210",
  joined: "March 2024",
  avatar: "AM",
  tier: "Gold Member",
  points: 2840,
  totalOrders: 12,
  totalSpent: 38600,
};

const ORDERS = [
  {
    id: "FF-2025-0892",
    date: "28 Apr 2025",
    status: "Delivered",
    items: [
      {
        name: "Linen Dress Shirt",
        size: "M",
        color: "Ivory",
        price: 3499,
        image:
          "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=120&q=80",
      },
      {
        name: "Slim Chino Trouser",
        size: "32",
        color: "Stone",
        price: 2999,
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=120&q=80",
      },
    ],
    total: 6498,
    tracking: "BD8923041IN",
  },
  {
    id: "FF-2025-0714",
    date: "02 Mar 2025",
    status: "Delivered",
    items: [
      {
        name: "Merino Crew Sweater",
        size: "L",
        color: "Navy",
        price: 4299,
        image:
          "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=120&q=80",
      },
    ],
    total: 4299,
    tracking: "BD7712039IN",
  },
  {
    id: "FF-2025-0601",
    date: "15 Jan 2025",
    status: "Delivered",
    items: [
      {
        name: "Oxford Formal Shirt",
        size: "M",
        color: "White",
        price: 2799,
        image:
          "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=120&q=80",
      },
      {
        name: "Stretch Denim Jeans",
        size: "32",
        color: "Indigo",
        price: 3199,
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=120&q=80",
      },
    ],
    total: 5998,
    tracking: "BD6601028IN",
  },
  {
    id: "FF-2025-1041",
    date: "05 May 2025",
    status: "In Transit",
    items: [
      {
        name: "Casual Linen T-Shirt",
        size: "M",
        color: "Sage",
        price: 1899,
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120&q=80",
      },
    ],
    total: 1899,
    tracking: "BD9101050IN",
  },
];

const WISHLIST = [
  {
    id: "w1",
    name: "Cashmere Turtleneck",
    category: "Sweaters",
    price: 6999,
    salePrice: null,
    image:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=240&q=80",
  },
  {
    id: "w2",
    name: "Tailored Blazer",
    category: "Jackets",
    price: 8499,
    salePrice: 6799,
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=240&q=80",
  },
  {
    id: "w3",
    name: "Premium Cargo Pants",
    category: "Trousers",
    price: 3799,
    salePrice: null,
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=240&q=80",
  },
  {
    id: "w4",
    name: "Slim Formal Shirt",
    category: "Shirts",
    price: 2499,
    salePrice: 1999,
    image:
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=240&q=80",
  },
];

const ADDRESSES = [
  {
    id: "a1",
    label: "Home",
    name: "Arjun Mehta",
    line1: "304, Shivalik Apartments",
    line2: "Navrangpura",
    city: "Ahmedabad",
    state: "Gujarat",
    pin: "380009",
    phone: "+91 98765 43210",
    default: true,
  },
  {
    id: "a2",
    label: "Office",
    name: "Arjun Mehta",
    line1: "B-12, Prahladnagar Corporate Road",
    line2: "GIFT City",
    city: "Gandhinagar",
    state: "Gujarat",
    pin: "382355",
    phone: "+91 98765 43210",
    default: false,
  },
];

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const map = {
    Delivered: { bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" },
    "In Transit": {
      bg: "color-mix(in oklch, var(--color-gold) 12%, transparent)",
      color: "var(--color-gold)",
      dot: "var(--color-gold)",
    },
    Processing: { bg: "#dbeafe", color: "#2563eb", dot: "#2563eb" },
    Cancelled: { bg: "#fee2e2", color: "#dc2626", dot: "#dc2626" },
  };
  const s = map[status] || map["Processing"];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 10px",
        borderRadius: "50px",
        backgroundColor: s.bg,
        color: s.color,
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.06em",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          backgroundColor: s.dot,
          flexShrink: 0,
        }}
      />
      {status.toUpperCase()}
    </span>
  );
}

/* ── Section Card ── */
function Card({ children, style = {} }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-background)",
        border: "1px solid var(--color-border)",
        borderRadius: "16px",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Stat Tile ── */
function StatTile({ label, value, sub }) {
  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--color-gold)";
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--color-muted-foreground)",
          marginBottom: "6px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.8rem",
          fontWeight: 600,
          lineHeight: 1,
          color: "var(--color-foreground)",
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-muted-foreground)",
            marginTop: "4px",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ── Nav Item ── */
function NavItem({ icon: Icon, label, active, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        borderRadius: "10px",
        border: "none",
        backgroundColor: active ? "var(--color-foreground)" : "transparent",
        color: active
          ? "var(--color-background)"
          : danger
            ? "#ef4444"
            : "var(--color-foreground)",
        fontSize: "13px",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!active)
          e.currentTarget.style.backgroundColor = "var(--color-surface)";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
      {label}
    </button>
  );
}

/* ── Orders Tab ── */
function OrdersTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem" }}>
          My Orders
        </h2>
      </div>
      <UserOrders />
    </div>
  );
}

/* ── Wishlist Tab ── */
function WishlistTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    wishlistApi
      .get()
      .then((data) => setItems(data.products || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id) => {
    await wishlistApi.remove(id);
    setItems((i) => i.filter((x) => x._id !== id));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem" }}>
          Wishlist
        </h2>
        <span
          style={{ fontSize: "11px", color: "var(--color-muted-foreground)" }}
        >
          {items.length} items saved
        </span>
      </div>
      <div
        style={{ display: "grid", gap: "16px" }}
        className="profile-wishlist-grid"
      >
        {items.map((item) => (
          <Card
            key={item._id}
            style={{ transition: "border-color 0.2s, box-shadow 0.2s" }}
          >
            <div style={{ display: "flex", gap: "0" }}>
              <div
                style={{ width: "100px", flexShrink: 0, position: "relative" }}
              >
                <img
                  src={item.images?.[0]?.url || item.images?.[0] || ""}
                  alt={item.name}
                  style={{ width: "100%", height: "130px", objectFit: "cover" }}
                />
                {item.salePrice && (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      backgroundColor: "var(--color-gold)",
                      color: "white",
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "50px",
                    }}
                  >
                    SALE
                  </div>
                )}
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      color: "var(--color-muted-foreground)",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: "4px",
                    }}
                  >
                    {item.category}
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: "var(--font-serif)",
                    }}
                  >
                    {item.name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      marginTop: "6px",
                    }}
                  >
                    <span style={{ fontSize: "15px", fontWeight: 700 }}>
                      ₹{(item.salePrice ?? item.price).toLocaleString("en-IN")}
                    </span>
                    {item.salePrice && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--color-muted-foreground)",
                          textDecoration: "line-through",
                        }}
                      >
                        ₹{item.price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <Link
                    to={`/product/${item.slug || item._id}`}
                    style={{
                      flex: 1,
                      height: "34px",
                      borderRadius: "8px",
                      backgroundColor: "var(--color-foreground)",
                      color: "var(--color-background)",
                      border: "none",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "opacity 0.2s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.85")
                    }
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    View Product
                  </Link>
                  <button
                    onClick={() => remove(item._id)}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fee2e2";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                    }}
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "var(--color-muted-foreground)" }}>
          Loading wishlist...
        </div>
      )}
      {error && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#ef4444" }}>
          {error}
        </div>
      )}
      {items.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Heart
            size={40}
            style={{ color: "var(--color-border)", margin: "0 auto 12px" }}
          />
          <p
            style={{
              fontSize: "15px",
              fontFamily: "var(--font-serif)",
              marginBottom: "6px",
            }}
          >
            Your wishlist is empty
          </p>
          <p
            style={{ fontSize: "13px", color: "var(--color-muted-foreground)" }}
          >
            Items you save will appear here
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Addresses Tab ── */
function AddressesTab({ user, updateUser }) {
  const emptyAddress = {
    label: "Home",
    name: user?.name || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pin: "",
    phone: user?.phone || "",
    default: false,
  };
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setAddresses(user?.addresses || []);
  }, [user?.addresses]);

  const persist = async (next) => {
    setSaving(true);
    try {
      const saved = await updateUser({ addresses: next });
      setAddresses(saved.addresses || []);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (addr = null) => {
    setEditing(addr?._id || "new");
    setForm(addr || { ...emptyAddress, default: addresses.length === 0 });
  };

  const saveAddress = (e) => {
    e.preventDefault();
    const clean = { ...form, default: Boolean(form.default) };
    const next =
      editing === "new"
        ? [...addresses, clean]
        : addresses.map((addr) => (addr._id === editing ? clean : addr));
    persist(clean.default ? next.map((addr) => ({ ...addr, default: addr === clean })) : next);
  };

  const setDefault = (id) =>
    persist(addresses.map((addr) => ({ ...addr, default: addr._id === id })));
  const remove = (id) => persist(addresses.filter((addr) => addr._id !== id));
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem" }}>
          Saved Addresses
        </h2>
        <button
          onClick={() => startEdit()}
          disabled={saving}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1.5px solid var(--color-border)",
            backgroundColor: "transparent",
            color: "var(--color-foreground)",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-foreground)";
            e.currentTarget.style.color = "var(--color-background)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--color-foreground)";
          }}
        >
          <Plus size={13} strokeWidth={2.5} /> Add Address
        </button>
      </div>
      {editing && (
        <Card style={{ marginBottom: "16px" }}>
          <form
            onSubmit={saveAddress}
            style={{
              padding: "20px",
              display: "grid",
              gap: "12px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {[
                ["label", "Label"],
                ["name", "Full name"],
                ["line1", "Address line 1"],
                ["line2", "Address line 2"],
                ["city", "City"],
                ["state", "State"],
                ["pin", "PIN code"],
                ["phone", "Phone"],
              ].map(([key, label]) => (
                <input
                  key={key}
                  value={form[key] || ""}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  placeholder={label}
                  required={["name", "line1", "city", "state", "pin", "phone"].includes(key)}
                  style={{
                    minWidth: 0,
                    height: "42px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    fontFamily: "inherit",
                  }}
                />
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={Boolean(form.default)}
                onChange={(e) => setForm((prev) => ({ ...prev, default: e.target.checked }))}
              />
              Set as default delivery address
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  height: "40px",
                  padding: "0 18px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "var(--color-foreground)",
                  color: "var(--color-background)",
                  fontWeight: 800,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Address"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                style={{
                  height: "40px",
                  padding: "0 18px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {addresses.map((addr) => (
          <Card
            key={addr._id}
            style={{
              transition: "border-color 0.2s",
              borderColor: addr.default
                ? "var(--color-gold)"
                : "var(--color-border)",
            }}
          >
            <div style={{ padding: "20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "3px 10px",
                      borderRadius: "50px",
                      backgroundColor: addr.default
                        ? "color-mix(in oklch, var(--color-gold) 12%, transparent)"
                        : "var(--color-surface)",
                      color: addr.default
                        ? "var(--color-gold)"
                        : "var(--color-muted-foreground)",
                      border: `1px solid ${addr.default ? "var(--color-gold)" : "var(--color-border)"}`,
                    }}
                  >
                    {addr.label}
                  </span>
                  {addr.default && (
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: "#16a34a",
                        backgroundColor: "#dcfce7",
                        padding: "2px 8px",
                        borderRadius: "50px",
                      }}
                    >
                      DEFAULT
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    onClick={() => startEdit(addr)}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "var(--color-foreground)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--color-surface)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Edit2 size={12} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => remove(addr._id)}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#ef4444",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fee2e2";
                      e.currentTarget.style.borderColor = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                    }}
                  >
                    <Trash2 size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                {addr.name}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--color-muted-foreground)",
                  lineHeight: 1.6,
                }}
              >
                <strong>Address line 1:</strong> {addr.line1}
                {addr.line2 && (
                  <>
                    <br />
                    <strong>Address line 2:</strong> {addr.line2}
                  </>
                )}
                <br />
                {addr.city}, {addr.state} — {addr.pin}
              </p>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-muted-foreground)",
                  marginTop: "6px",
                }}
              >
                {addr.phone}
              </p>
              {!addr.default && (
                <button
                  onClick={() => setDefault(addr._id)}
                  style={{
                    marginTop: "12px",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "var(--color-muted-foreground)",
                    textDecoration: "underline",
                    textUnderlineOffset: "3px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--color-foreground)")
                  }
                  onMouseLeave={(e) =>
                  (e.currentTarget.style.color =
                    "var(--color-muted-foreground)")
                  }
                >
                  Set as default
                </button>
              )}
            </div>
          </Card>
        ))}
        {addresses.length === 0 && (
          <Card>
            <div style={{ padding: "32px", textAlign: "center", color: "var(--color-muted-foreground)", fontSize: "13px" }}>
              No saved addresses yet.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── Settings Tab ── */
function SettingsTab({ user, updateUser }) {
  const [notifs, setNotifs] = useState(
    user?.preferences?.notifications || {
      orders: true,
      promos: true,
      newArrivals: false,
      restockAlerts: true,
    },
  );
  const [showPass, setShowPass] = useState(false);
  const [editEmail, setEditEmail] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setNotifs(
      user?.preferences?.notifications || {
        orders: true,
        promos: true,
        newArrivals: false,
        restockAlerts: true,
      },
    );
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateUser({ name, phone });
      setEditEmail(false);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (key) => {
    const next = { ...notifs, [key]: !notifs[key] };
    setNotifs(next);
    await updateUser({ preferences: { notifications: next } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.4rem" }}>
        Account Settings
      </h2>

      {/* Personal Info */}
      <Card>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-muted-foreground)",
            }}
          >
            Personal Information
          </p>
        </div>
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {/* Name */}
          <div>
            <label
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-muted-foreground)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Full Name
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  flex: 1,
                  height: "44px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: "var(--color-surface)",
                  color: "var(--color-foreground)",
                  fontSize: "14px",
                  fontWeight: 500,
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-gold)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
              <button
                onClick={saveProfile}
                disabled={saving}
                style={{
                  height: "44px",
                  padding: "0 16px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: "transparent",
                  color: "var(--color-foreground)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-foreground)";
                  e.currentTarget.style.color = "var(--color-background)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--color-foreground)";
                }}
              >
                {saving ? "Saving" : "Save"}
              </button>
            </div>
          </div>
          {/* Email */}
          <div>
            <label
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-muted-foreground)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Email
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!editEmail}
                style={{
                  flex: 1,
                  height: "44px",
                  padding: "0 14px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: editEmail
                    ? "var(--color-surface)"
                    : "color-mix(in oklch, var(--color-surface) 50%, transparent)",
                  color: "var(--color-foreground)",
                  fontSize: "14px",
                  fontWeight: 500,
                  outline: "none",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  if (editEmail)
                    e.target.style.borderColor = "var(--color-gold)";
                }}
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
              <button
                onClick={() => setEditEmail((e) => !e)}
                style={{
                  height: "44px",
                  padding: "0 16px",
                  borderRadius: "10px",
                  border: "1.5px solid var(--color-border)",
                  backgroundColor: editEmail
                    ? "var(--color-foreground)"
                    : "transparent",
                  color: editEmail
                    ? "var(--color-background)"
                    : "var(--color-foreground)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                }}
              >
                {editEmail ? "Locked" : "Edit"}
              </button>
            </div>
          </div>
          {/* Phone */}
          <div>
            <label
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-muted-foreground)",
                display: "block",
                marginBottom: "6px",
              }}
            >
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{
                width: "100%",
                height: "44px",
                padding: "0 14px",
                borderRadius: "10px",
                border: "1.5px solid var(--color-border)",
                backgroundColor: "var(--color-surface)",
                color: "var(--color-foreground)",
                fontSize: "14px",
                fontWeight: 500,
                outline: "none",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
                boxSizing: "border-box",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-gold)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-muted-foreground)",
            }}
          >
            Change Password
          </p>
        </div>
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {["Current password", "New password", "Confirm new password"].map(
            (label) => (
              <div key={label} style={{ position: "relative" }}>
                <label
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--color-muted-foreground)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    style={{
                      width: "100%",
                      height: "44px",
                      padding: "0 44px 0 14px",
                      borderRadius: "10px",
                      border: "1.5px solid var(--color-border)",
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-foreground)",
                      fontSize: "14px",
                      outline: "none",
                      fontFamily: "inherit",
                      transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "var(--color-gold)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "var(--color-border)")
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ),
          )}
          <button
            style={{
              alignSelf: "flex-start",
              height: "44px",
              padding: "0 24px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "var(--color-foreground)",
              color: "var(--color-background)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Update Password
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-muted-foreground)",
            }}
          >
            Notification Preferences
          </p>
        </div>
        <div style={{ padding: "8px 0" }}>
          {[
            {
              key: "orders",
              label: "Order updates & tracking",
              sub: "Shipping, delivery, and return status",
            },
            {
              key: "promos",
              label: "Promotions & offers",
              sub: "Sales, coupon codes, and special events",
            },
            {
              key: "newArrivals",
              label: "New arrivals",
              sub: "Be first to know about new collections",
            },
            {
              key: "restockAlerts",
              label: "Restock alerts",
              sub: "Get notified when saved items are back",
            },
          ].map(({ key, label, sub }) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 24px",
                transition: "background 0.15s",
                cursor: "pointer",
              }}
              onClick={() => toggle(key)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-surface)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <div>
                <p style={{ fontSize: "13px", fontWeight: 600 }}>{label}</p>
                <p
                  style={{
                    fontSize: "11px",
                    color: "var(--color-muted-foreground)",
                    marginTop: "2px",
                  }}
                >
                  {sub}
                </p>
              </div>
              {/* Toggle */}
              <div
                style={{
                  width: "44px",
                  height: "24px",
                  borderRadius: "12px",
                  backgroundColor: notifs[key]
                    ? "var(--color-foreground)"
                    : "var(--color-border)",
                  position: "relative",
                  transition: "background 0.25s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: notifs[key] ? "23px" : "3px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    backgroundColor: notifs[key]
                      ? "var(--color-background)"
                      : "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    transition: "left 0.25s cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card style={{ borderColor: "#fee2e2" }}>
        <div style={{ padding: "20px 24px" }}>
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#ef4444",
              marginBottom: "12px",
            }}
          >
            Danger Zone
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-muted-foreground)",
              marginBottom: "16px",
              lineHeight: 1.6,
            }}
          >
            Deleting your account is permanent. All your orders, wishlist, and
            preferences will be removed.
          </p>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "1.5px solid #ef4444",
              backgroundColor: "transparent",
              color: "#ef4444",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ef4444";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#ef4444";
            }}
          >
            Delete Account
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── Main Profile Page ── */
export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders");

  const displayUser = {
    name: user?.name || "Customer",
    email: user?.email || "",
    phone: user?.phone || "",
    joined: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
        })
      : "Recently",
    avatar: (user?.name || user?.email || "U")
      .split(/[ @.]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(""),
    tier: "Member",
    points: 0,
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const tabs = [
    { id: "orders", label: "My Orders", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const currentTab = tabs.find((t) => t.id === tab);

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px 20px 100px",
      }}
    >
      {/* Hero bar */}
      <div
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          marginBottom: "32px",
          position: "relative",
          backgroundColor: "var(--color-foreground)",
          padding: "32px",
        }}
      >
        {/* BG texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.035,
            backgroundImage: `repeating-linear-gradient(45deg, var(--color-background) 0, var(--color-background) 1px, transparent 1px, transparent 32px), repeating-linear-gradient(-45deg, var(--color-background) 0, var(--color-background) 1px, transparent 1px, transparent 32px)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            backgroundColor: "var(--color-gold)",
            opacity: 0.12,
            filter: "blur(50px)",
          }}
        />

        <div style={{ position: "relative" }}>
          {/* Top row: avatar + name + points */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {/* Avatar + name */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "var(--color-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: "white",
                  flexShrink: 0,
                  fontFamily: "var(--font-serif)",
                  boxShadow: "0 0 0 3px rgba(255,255,255,0.15)",
                }}
              >
                {displayUser.avatar}
              </div>
              <div style={{ minWidth: 0 }}>
                <h1
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "clamp(1.1rem, 4vw, 1.7rem)",
                    color: "var(--color-background)",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.15,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {displayUser.name}
                </h1>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: "5px",
                    fontSize: "9px",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    padding: "3px 10px",
                    borderRadius: "50px",
                    backgroundColor: "var(--color-gold)",
                    color: "white",
                  }}
                >
                  {displayUser.tier}
                </span>
              </div>
            </div>
            {/* Points badge — always top-right */}
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.15)",
                backgroundColor: "rgba(255,255,255,0.07)",
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              <p
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  color: "var(--color-gold)",
                  textTransform: "uppercase",
                }}
              >
                Points
              </p>
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.4rem",
                  color: "var(--color-background)",
                  lineHeight: 1.1,
                }}
              >
                {displayUser.points.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Bottom row: email + joined — horizontal, no wrap */}
          <div
            style={{
              display: "flex",
              gap: "0",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color:
                  "color-mix(in oklch, var(--color-background) 55%, transparent)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Mail size={11} />
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayUser.email}
              </span>
            </span>
            <span
              style={{
                fontSize: "11px",
                color:
                  "color-mix(in oklch, var(--color-background) 55%, transparent)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <Calendar size={11} /> Member since {displayUser.joined}
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: "grid", gap: "24px" }} className="profile-layout">
        {/* Sidebar nav — desktop */}
        <aside className="profile-sidebar">
          <Card
            style={{ position: "sticky", top: "80px", overflow: "visible" }}
          >
            <div style={{ padding: "8px" }}>
              {tabs.map((t) => (
                <NavItem
                  key={t.id}
                  icon={t.icon}
                  label={t.label}
                  active={tab === t.id}
                  onClick={() => setTab(t.id)}
                />
              ))}
              <div
                style={{
                  height: "1px",
                  backgroundColor: "var(--color-border)",
                  margin: "8px 0",
                }}
              />
              <NavItem icon={LogOut} label="Sign Out" onClick={handleLogout} danger />
            </div>
          </Card>
        </aside>

        {/* Mobile tab bar */}
        <div
          className="profile-mobile-tabs"
          style={{
            display: "none",
            overflowX: "auto",
            scrollbarWidth: "none",
            gap: "8px",
            paddingBottom: "4px",
          }}
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "9px 16px",
                  borderRadius: "50px",
                  flexShrink: 0,
                  border: `1.5px solid ${active ? "var(--color-foreground)" : "var(--color-border)"}`,
                  backgroundColor: active
                    ? "var(--color-foreground)"
                    : "transparent",
                  color: active
                    ? "var(--color-background)"
                    : "var(--color-foreground)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                <t.icon size={13} strokeWidth={active ? 2.5 : 1.8} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          key={tab}
          style={{ animation: "profileFadeIn 0.3s ease-out", minWidth: 0 }}
        >
          {tab === "orders" && <OrdersTab />}
          {tab === "wishlist" && <WishlistTab />}
          {tab === "addresses" && <AddressesTab user={user} updateUser={updateUser} />}
          {tab === "settings" && <SettingsTab user={user} updateUser={updateUser} />}
        </div>
      </div>

      <style>{`
        .profile-layout {
          grid-template-columns: 1fr;
        }
        .profile-sidebar { display: none; }
        .profile-mobile-tabs { display: flex !important; }
        .profile-stats { grid-template-columns: repeat(3, 1fr); }
        .profile-wishlist-grid { grid-template-columns: 1fr; }

        @media (min-width: 480px) {
          .profile-wishlist-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 768px) {
          .profile-stats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .profile-layout { grid-template-columns: 220px 1fr !important; }
          .profile-sidebar { display: block !important; }
          .profile-mobile-tabs { display: none !important; }
          .profile-wishlist-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @keyframes profileFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
