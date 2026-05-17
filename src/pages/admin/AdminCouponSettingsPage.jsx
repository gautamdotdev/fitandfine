import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import { useToasts } from "../../lib/store";
import { Save } from "lucide-react";

const CSS = `
  .cp-wrap { max-width: 980px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .cp-sub { color: #888; font-size: 13px; margin: 0 0 18px; }
  .cp-card, .cp-list { background: #fff; border: 1px solid #e8e6e0; border-radius: 2px; padding: 18px; margin-bottom: 16px; }
  .cp-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; align-items: end; }
  .cp-field { display: grid; gap: 6px; }
  .cp-field label { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #aaa; font-weight: 800; }
  .cp-field input, .cp-field select { height: 42px; border: 1.5px solid #e8e6e0; border-radius: 10px; padding: 0 12px; font: inherit; background: #faf9f7; box-sizing: border-box; min-width: 0; }
  .cp-save { height: 42px; border: none; border-radius: 2px; background: #1a1a1a; color: #fff; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
  .cp-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 210px; gap: 12px; padding: 12px 0; border-top: 1px solid #f5f3ef; font-size: 13px; align-items: center; }
  .cp-row:first-child { border-top: none; color: #aaa; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; font-weight: 800; }
  .cp-actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
  .cp-mini { border: 1px solid #e8e6e0; background: #fff; color: #1a1a1a; border-radius: 8px; height: 34px; padding: 0 10px; font-weight: 800; cursor: pointer; }
  .cp-danger { border-color: #fecaca; background: #fef2f2; color: #dc2626; }
  .cp-muted { color: #888; font-size: 12px; margin-top: 10px; }
  @media (max-width: 980px) { .cp-grid { grid-template-columns: 1fr 1fr; } .cp-save { grid-column: 1 / -1; } .cp-row { grid-template-columns: 1fr; } .cp-actions { justify-content: flex-start; } }
`;

const emptyForm = {
  code: "",
  type: "percent",
  discount: 10,
  minOrder: 0,
  active: true,
};

export default function AdminCouponSettingsPage() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingCode, setEditingCode] = useState("");
  const push = useToasts((s) => s.push);

  const load = () => adminApi.coupons().then((data) => setCoupons(data.coupons || []));
  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      await adminApi.saveCoupon(form);
      setForm(emptyForm);
      setEditingCode("");
      await load();
      push({ type: "success", title: "Saved", message: "Coupon saved and ready for orders." });
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    }
  };

  const edit = (coupon) => {
    setEditingCode(coupon.code);
    setForm({
      code: coupon.code,
      type: coupon.type || "percent",
      discount: coupon.discount || 0,
      minOrder: coupon.minOrder || 0,
      active: coupon.active !== false,
    });
  };

  const reset = () => {
    setEditingCode("");
    setForm(emptyForm);
  };

  const cancel = async (code) => {
    try {
      await adminApi.cancelCoupon(code);
      await load();
      push({ type: "success", title: "Cancelled", message: "Coupon is now inactive." });
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    }
  };

  const activate = async (coupon) => {
    try {
      await adminApi.saveCoupon({
        code: coupon.code,
        type: coupon.type || "percent",
        discount: coupon.discount || 0,
        minOrder: coupon.minOrder || 0,
        active: true,
      });
      await load();
      push({ type: "success", title: "Activated", message: "Coupon is active again." });
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    }
  };

  const remove = async (code) => {
    try {
      await adminApi.deleteCoupon(code);
      if (editingCode === code) reset();
      await load();
      push({ type: "success", title: "Removed", message: "Coupon removed." });
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cp-wrap">
        <p className="cp-sub">Create or update coupon codes used by cart checkout and homepage popup.</p>
        <div className="cp-card">
          <div className="cp-grid">
            <Field label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} disabled={!!editingCode} />
            <label className="cp-field"><span>Type</span><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="percent">Percent</option><option value="fixed">Fixed amount</option></select></label>
            <Field label="Discount" type="number" value={form.discount} onChange={(v) => setForm({ ...form, discount: Number(v) })} />
            <Field label="Min order" type="number" value={form.minOrder} onChange={(v) => setForm({ ...form, minOrder: Number(v) })} />
            <label className="cp-field"><span>Status</span><select value={form.active ? "active" : "inactive"} onChange={(e) => setForm({ ...form, active: e.target.value === "active" })}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
            <button className="cp-save" onClick={save}><Save size={15} /> {editingCode ? "Update" : "Save"}</button>
          </div>
          {editingCode && (
            <div className="cp-muted">
              Editing {editingCode}. <button className="cp-mini" onClick={reset}>Create new</button>
            </div>
          )}
        </div>
        <div className="cp-list">
          <div className="cp-row"><div>Code</div><div>Discount</div><div>Min order</div><div>Status</div><div>Actions</div></div>
          {coupons.map((c) => (
            <div className="cp-row" key={c._id}>
              <div><strong>{c.code}</strong></div>
              <div>{c.type === "fixed" ? `Rs ${c.discount}` : `${c.discount}%`}</div>
              <div>Rs {(c.minOrder || 0).toLocaleString("en-IN")}</div>
              <div>{c.active ? "Active" : "Inactive"}</div>
              <div className="cp-actions">
                <button className="cp-mini" onClick={() => edit(c)}>Edit</button>
                {c.active ? (
                  <button className="cp-mini cp-danger" onClick={() => cancel(c.code)}>Deactivate</button>
                ) : (
                  <button className="cp-mini" onClick={() => activate(c)}>Activate</button>
                )}
                <button className="cp-mini cp-danger" onClick={() => remove(c.code)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return <label className="cp-field"><span>{label}</span><input disabled={disabled} type={type} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}
