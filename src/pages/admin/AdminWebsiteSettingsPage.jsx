import { useEffect, useState } from "react";
import { adminApi } from "../../lib/api";
import { useToasts } from "../../lib/store";
import { Save } from "lucide-react";

const CSS = `
  .as-wrap { max-width: 980px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .as-sub { color: #888; font-size: 13px; margin: 0 0 18px; }
  .as-card { background: #fff; border: 1px solid #e8e6e0; border-radius: 2px; padding: 20px; margin-bottom: 16px; }
  .as-title { font-size: 14px; font-weight: 900; margin-bottom: 16px; }
  .as-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .as-field { display: grid; gap: 6px; }
  .as-field.full { grid-column: 1 / -1; }
  .as-field label { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: #aaa; font-weight: 800; }
  .as-field input, .as-field textarea, .as-field select { width: 100%; border: 1.5px solid #e8e6e0; border-radius: 10px; padding: 12px; font: inherit; box-sizing: border-box; outline: none; background: #faf9f7; }
  .as-field textarea { min-height: 96px; resize: vertical; }
  .as-save { display: inline-flex; align-items: center; gap: 8px; height: 44px; padding: 0 18px; border: none; border-radius: 2px; background: #1a1a1a; color: #fff; font-weight: 900; cursor: pointer; }
  @media (max-width: 720px) { .as-grid { grid-template-columns: 1fr; } }
`;

const defaults = {
  hero: {},
  offerPopup: {},
};

export default function AdminWebsiteSettingsPage() {
  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const push = useToasts((s) => s.push);

  useEffect(() => {
    adminApi.getSiteSettings().then((data) => setForm(data.settings || defaults));
  }, []);

  const setNested = (section, key, value) =>
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));

  const save = async () => {
    setSaving(true);
    try {
      const data = await adminApi.updateSiteSettings({
        hero: form.hero,
        offerPopup: form.offerPopup,
      });
      setForm(data.settings);
      push({ type: "success", title: "Saved", message: "Website settings updated." });
    } catch (err) {
      push({ type: "error", title: "Error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="as-wrap">
        <p className="as-sub">Change homepage hero and the landing offer popup from database content.</p>
        <div className="as-card">
          <div className="as-title">Homepage First Section</div>
          <div className="as-grid">
            <Field label="Eyebrow" value={form.hero?.eyebrow} onChange={(v) => setNested("hero", "eyebrow", v)} />
            <Field label="Button text" value={form.hero?.buttonText} onChange={(v) => setNested("hero", "buttonText", v)} />
            <Field label="Button link" value={form.hero?.buttonLink} onChange={(v) => setNested("hero", "buttonLink", v)} />
            <label className="as-field"><span>Layout</span><select value={form.hero?.layout || "text-left"} onChange={(e) => setNested("hero", "layout", e.target.value)}><option value="text-left">Text left, image right</option><option value="text-right">Image left, text right</option></select></label>
            <Field full label="Title" textarea value={form.hero?.title} onChange={(v) => setNested("hero", "title", v)} />
            <Field full label="Description" textarea value={form.hero?.description} onChange={(v) => setNested("hero", "description", v)} />
            <Field full label="Image URL" value={form.hero?.imageUrl} onChange={(v) => setNested("hero", "imageUrl", v)} />
          </div>
        </div>
        <div className="as-card">
          <div className="as-title">Homepage Offer Popup</div>
          <div className="as-grid">
            <label className="as-field"><span>Status</span><select value={form.offerPopup?.enabled ? "on" : "off"} onChange={(e) => setNested("offerPopup", "enabled", e.target.value === "on")}><option value="on">Enabled</option><option value="off">Disabled</option></select></label>
            <Field label="Delay seconds" type="number" value={form.offerPopup?.delaySeconds} onChange={(v) => setNested("offerPopup", "delaySeconds", Number(v))} />
            <Field label="Title" value={form.offerPopup?.title} onChange={(v) => setNested("offerPopup", "title", v)} />
            <Field label="Coupon code" value={form.offerPopup?.couponCode} onChange={(v) => setNested("offerPopup", "couponCode", v.toUpperCase())} />
            <Field label="Button text" value={form.offerPopup?.buttonText} onChange={(v) => setNested("offerPopup", "buttonText", v)} />
            <Field label="Button link" value={form.offerPopup?.buttonLink} onChange={(v) => setNested("offerPopup", "buttonLink", v)} />
            <Field full label="Message" textarea value={form.offerPopup?.message} onChange={(v) => setNested("offerPopup", "message", v)} />
          </div>
        </div>
        <button className="as-save" onClick={save} disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save settings"}</button>
      </div>
    </>
  );
}

function Field({ label, value = "", onChange, textarea, full, type = "text" }) {
  return (
    <label className={`as-field${full ? " full" : ""}`}>
      <span>{label}</span>
      {textarea ? <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} /> : <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}
