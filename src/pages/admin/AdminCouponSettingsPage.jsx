import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import { useToasts } from "../../lib/store";
import { Save, Trash2, X } from "lucide-react";

const CSS = `
  .cp-wrap { max-width: 980px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .cp-sub { color: #888; font-size: 13px; margin: 0 0 18px; }
  .cp-card, .cp-list { background: #fff; border: 1px solid #e8e6e0; border-radius: 2px; padding: 18px; margin-bottom: 16px; }
  .cp-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; align-items: end; }
  .cp-field { display: grid; gap: 6px; }
  .cp-field label { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #aaa; font-weight: 800; }
  .cp-field input, .cp-field select { height: 42px; border: 1.5px solid #e8e6e0; border-radius: 10px; padding: 0 12px; font: inherit; background: #faf9f7; box-sizing: border-box; min-width: 0; width: 100%; }
  .cp-save { height: 42px; border: none; border-radius: 2px; background: #1a1a1a; color: #fff; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; }
  .cp-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 210px; gap: 12px; padding: 12px 0; border-top: 1px solid #f5f3ef; font-size: 13px; align-items: center; }
  .cp-row:first-child { border-top: none; color: #aaa; font-size: 10px; letter-spacing: .1em; text-transform: uppercase; font-weight: 800; }
  .cp-cell-label { display: none; }
  .cp-actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
  .cp-mini { border: 1px solid #e8e6e0; background: #fff; color: #1a1a1a; border-radius: 8px; height: 34px; padding: 0 10px; font-weight: 800; cursor: pointer; }
  .cp-danger { border-color: #fecaca; background: #fef2f2; color: #dc2626; }
  .cp-muted { color: #888; font-size: 12px; margin-top: 10px; }
  .cp-modal-bg { position: fixed; inset: 0; z-index: 1000; display: flex; align-items: flex-end; justify-content: center; background: rgba(0,0,0,.55); backdrop-filter: blur(6px); padding: 0; }
  .cp-modal { width: 100%; max-width: 500px; max-height: 92vh; overflow-y: auto; background: #fff; border-radius: 24px 24px 0 0; padding: 20px 10px; box-shadow: 0 -8px 40px rgba(0,0,0,.15); animation: cpModalIn .28s cubic-bezier(.16,1,.3,1); }
  .cp-handle { width: 36px; height: 4px; border-radius: 99px; background: #e8e6e0; margin: 0 auto 18px; }
  .cp-modal-inner { padding: 0 14px 14px; }
  .cp-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
  .cp-modal-title { font-size: 18px; font-weight: 900; margin: 0; }
  .cp-modal-copy { color: #888; font-size: 13px; line-height: 1.5; margin-top: 4px; }
  .cp-close { width: 32px; height: 32px; border-radius: 50%; border: 1px solid #e8e6e0; background: #faf9f7; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
  .cp-modal-grid { display: grid; gap: 12px; }
  .cp-modal-actions { display: flex; gap: 10px; margin-top: 18px; }
  .cp-modal-actions button { flex: 1; height: 44px; border-radius: 2px; font-weight: 900; cursor: pointer; }
  .cp-secondary { border: 1.5px solid #e8e6e0; background: #fff; color: #1a1a1a; }
  .cp-primary { border: none; background: #1a1a1a; color: #fff; }
  .cp-delete { border: none; background: #dc2626; color: #fff; }
  @keyframes cpModalIn { from { transform: translateY(100%); } to { transform: translateY(0); } }

  @media (max-width: 768px) {
    .cp-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
    .cp-grid .cp-save { grid-column: 1 / -1; }
    .cp-list { padding: 12px; }
    .cp-row { grid-template-columns: 1fr; gap: 4px; padding: 14px 0; }
    .cp-row.cp-head { display: none; }
    .cp-row { border: 1px solid #f0ede8; border-radius: 10px; margin-bottom: 10px; padding: 12px; }
    .cp-cell-label { display: inline; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: #aaa; font-weight: 800; margin-right: 6px; }
    .cp-actions { justify-content: flex-start; margin-top: 8px; }
  }

  @media (max-width: 420px) {
    .cp-card { padding: 14px; }
    .cp-grid { grid-template-columns: 1fr; }
    .cp-mini { flex: 1; text-align: center; }
  }
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
  const [actionModal, setActionModal] = useState(null);
  const push = useToasts((s) => s.push);

  const load = () =>
    adminApi.coupons().then((data) => setCoupons(data.coupons || []));
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      await adminApi.saveCoupon(form);
      setForm(emptyForm);
      await load();
      push({
        type: "success",
        title: "Saved",
        message: "Coupon saved and ready for orders.",
      });
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    }
  };

  const edit = (coupon) => {
    setActionModal({
      mode: "edit",
      coupon,
      form: {
        code: coupon.code,
        type: coupon.type || "percent",
        discount: coupon.discount || 0,
        minOrder: coupon.minOrder || 0,
        active: coupon.active !== false,
      },
    });
  };

  const cancel = async (code) => {
    try {
      await adminApi.cancelCoupon(code);
      await load();
      push({
        type: "success",
        title: "Cancelled",
        message: "Coupon is now inactive.",
      });
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
      push({
        type: "success",
        title: "Activated",
        message: "Coupon is active again.",
      });
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    }
  };

  const remove = async (code) => {
    try {
      await adminApi.deleteCoupon(code);
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
        {actionModal && (
          <CouponActionModal
            action={actionModal}
            setAction={setActionModal}
            onClose={() => setActionModal(null)}
            onSave={async (payload) => {
              try {
                await adminApi.saveCoupon(payload);
                await load();
                setActionModal(null);
                push({
                  type: "success",
                  title: "Saved",
                  message: "Coupon updated.",
                });
              } catch (err) {
                push({ type: "error", title: "Error", message: err.message });
              }
            }}
            onDeactivate={async (coupon) => {
              await cancel(coupon.code);
              setActionModal(null);
            }}
            onActivate={async (coupon) => {
              await activate(coupon);
              setActionModal(null);
            }}
            onRemove={async (coupon) => {
              await remove(coupon.code);
              setActionModal(null);
            }}
          />
        )}
        <p className="cp-sub">
          Create or update coupon codes used by cart checkout and homepage
          popup.
        </p>
        <div className="cp-card">
          <div className="cp-grid">
            <Field
              label="Code"
              value={form.code}
              onChange={(v) => setForm({ ...form, code: v.toUpperCase() })}
            />
            <label className="cp-field">
              <span>Type</span>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </label>
            <Field
              label="Discount"
              type="number"
              value={form.discount}
              onChange={(v) => setForm({ ...form, discount: Number(v) })}
            />
            <Field
              label="Min order"
              type="number"
              value={form.minOrder}
              onChange={(v) => setForm({ ...form, minOrder: Number(v) })}
            />
            <label className="cp-field">
              <span>Status</span>
              <select
                value={form.active ? "active" : "inactive"}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.value === "active" })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <button className="cp-save" onClick={save}>
              <Save size={15} /> Save
            </button>
          </div>
        </div>
        <div className="cp-list">
          <div className="cp-row cp-head">
            <div>Code</div>
            <div>Discount</div>
            <div>Min order</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          {coupons.map((c) => (
            <div className="cp-row" key={c._id}>
              <div>
                <span className="cp-cell-label">Code: </span>
                <strong className="cp-cell-value">{c.code}</strong>
              </div>
              <div>
                <span className="cp-cell-label">Discount: </span>
                <span className="cp-cell-value">
                  {c.type === "fixed" ? `Rs ${c.discount}` : `${c.discount}%`}
                </span>
              </div>
              <div>
                <span className="cp-cell-label">Min order: </span>
                <span className="cp-cell-value">
                  Rs {(c.minOrder || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="cp-cell-label">Status: </span>
                <span className="cp-cell-value">
                  {c.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="cp-actions">
                <button className="cp-mini" onClick={() => edit(c)}>
                  Edit
                </button>
                {c.active ? (
                  <button
                    className="cp-mini cp-danger"
                    onClick={() =>
                      setActionModal({ mode: "deactivate", coupon: c })
                    }
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className="cp-mini"
                    onClick={() =>
                      setActionModal({ mode: "activate", coupon: c })
                    }
                  >
                    Activate
                  </button>
                )}
                <button
                  className="cp-mini cp-danger"
                  onClick={() => setActionModal({ mode: "remove", coupon: c })}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CouponActionModal({
  action,
  setAction,
  onClose,
  onSave,
  onDeactivate,
  onActivate,
  onRemove,
}) {
  const coupon = action.coupon;
  const form = action.form || {};
  const title =
    action.mode === "edit"
      ? `Edit ${coupon.code}`
      : action.mode === "remove"
        ? `Remove ${coupon.code}?`
        : action.mode === "activate"
          ? `Activate ${coupon.code}?`
          : `Deactivate ${coupon.code}?`;

  const setModalForm = (next) =>
    setAction((prev) => ({ ...prev, form: { ...prev.form, ...next } }));

  return (
    <div className="cp-modal-bg" onClick={onClose}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cp-handle" />
        <div className="cp-modal-inner">
          <div className="cp-modal-head">
            <div>
              <h2 className="cp-modal-title">{title}</h2>
              <p className="cp-modal-copy">
                {action.mode === "edit"
                  ? "Update how this coupon is applied to website orders."
                  : action.mode === "remove"
                    ? "This permanently removes the coupon from admin."
                    : action.mode === "activate"
                      ? "Active coupons can be used by customers during checkout."
                      : "Inactive coupons stay saved but cannot be used on orders."}
              </p>
            </div>
            <button className="cp-close" onClick={onClose}>
              <X size={15} />
            </button>
          </div>

          {action.mode === "edit" ? (
            <>
              <div className="cp-modal-grid">
                <Field
                  label="Code"
                  value={form.code}
                  disabled
                  onChange={() => {}}
                />
                <label className="cp-field">
                  <span>Type</span>
                  <select
                    value={form.type || "percent"}
                    onChange={(e) => setModalForm({ type: e.target.value })}
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </label>
                <Field
                  label="Discount"
                  type="number"
                  value={form.discount}
                  onChange={(v) => setModalForm({ discount: Number(v) })}
                />
                <Field
                  label="Min order"
                  type="number"
                  value={form.minOrder}
                  onChange={(v) => setModalForm({ minOrder: Number(v) })}
                />
                <label className="cp-field">
                  <span>Status</span>
                  <select
                    value={form.active ? "active" : "inactive"}
                    onChange={(e) =>
                      setModalForm({ active: e.target.value === "active" })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>
              <div className="cp-modal-actions">
                <button className="cp-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button className="cp-primary" onClick={() => onSave(form)}>
                  Save
                </button>
              </div>
            </>
          ) : (
            <div className="cp-modal-actions">
              <button className="cp-secondary" onClick={onClose}>
                Cancel
              </button>
              {action.mode === "remove" && (
                <button className="cp-delete" onClick={() => onRemove(coupon)}>
                  <Trash2 size={14} /> Remove
                </button>
              )}
              {action.mode === "deactivate" && (
                <button
                  className="cp-delete"
                  onClick={() => onDeactivate(coupon)}
                >
                  Deactivate
                </button>
              )}
              {action.mode === "activate" && (
                <button
                  className="cp-primary"
                  onClick={() => onActivate(coupon)}
                >
                  Activate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false }) {
  return (
    <label className="cp-field">
      <span>{label}</span>
      <input
        disabled={disabled}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
