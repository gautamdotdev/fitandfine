import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import { useToasts } from "../../lib/store";
import { Save } from "lucide-react";

const CSS = `
  .ship-wrap { max-width: 720px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .ship-sub { color: #888; font-size: 13px; margin: 0 0 18px; }
  .ship-card { background: #fff; border: 1px solid #e8e6e0; border-radius: 2px; padding: 20px; }
  .ship-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .ship-field { display: grid; gap: 6px; }
  .ship-field label { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #aaa; font-weight: 800; }
  .ship-field input { height: 44px; border: 1.5px solid #e8e6e0; border-radius: 10px; padding: 0 12px; font: inherit; background: #faf9f7; box-sizing: border-box; outline: none; }
  .ship-save { margin-top: 18px; height: 44px; padding: 0 18px; border: none; border-radius: 2px; background: #1a1a1a; color: #fff; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
  @media (max-width: 680px) { .ship-grid { grid-template-columns: 1fr; } }
`;

export default function AdminShippingSettingsPage() {
  const [shipping, setShipping] = useState({ charge: 120, freeAbove: 2999 });
  const [saving, setSaving] = useState(false);
  const push = useToasts((s) => s.push);

  useEffect(() => {
    adminApi.getSiteSettings().then((data) => {
      if (data.settings?.shipping) setShipping(data.settings.shipping);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const data = await adminApi.updateSiteSettings({ shipping });
      setShipping(data.settings.shipping);
      push({ type: "success", title: "Saved", message: "Shipping settings updated." });
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ship-wrap">
        <p className="ship-sub">These values are used on cart checkout and order total calculation.</p>
        <div className="ship-card">
          <div className="ship-grid">
            <label className="ship-field">
              <span>Shipping charge</span>
              <input
                type="number"
                min="0"
                value={shipping.charge || 0}
                onChange={(e) => setShipping({ ...shipping, charge: Number(e.target.value) })}
              />
            </label>
            <label className="ship-field">
              <span>Free shipping above</span>
              <input
                type="number"
                min="0"
                value={shipping.freeAbove || 0}
                onChange={(e) => setShipping({ ...shipping, freeAbove: Number(e.target.value) })}
              />
            </label>
          </div>
          <button className="ship-save" onClick={save} disabled={saving}>
            <Save size={15} /> {saving ? "Saving..." : "Save shipping"}
          </button>
        </div>
      </div>
    </>
  );
}
