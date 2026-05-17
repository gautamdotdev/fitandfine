import { Link } from "react-router-dom";
import { Globe, Truck, Tag, ChevronRight } from "lucide-react";

const CSS = `
  .set-wrap { max-width: 980px; margin: 0 auto; font-family: 'DM Sans', sans-serif; }
  .set-sub { color: #888; font-size: 13px; margin: 0 0 18px; }
  .set-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .set-card { background: #fff; border: 1px solid #e8e6e0; border-radius: 2px; padding: 18px; text-decoration: none; color: #1a1a1a; display: grid; gap: 16px; transition: box-shadow .2s, transform .2s; }
  .set-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.07); transform: translateY(-1px); }
  .set-icon { width: 38px; height: 38px; border-radius: 10px; background: #faf9f7; border: 1px solid #f0ede6; display: flex; align-items: center; justify-content: center; }
  .set-title { font-size: 14px; font-weight: 900; }
  .set-copy { color: #888; font-size: 12px; line-height: 1.5; min-height: 36px; }
  .set-foot { display: flex; align-items: center; justify-content: space-between; font-size: 12px; font-weight: 800; color: #666; }
  @media (max-width: 820px) { .set-grid { grid-template-columns: 1fr; } }
`;

const options = [
  {
    to: "/admin/settings/website",
    icon: Globe,
    title: "Website settings",
    copy: "Homepage hero content, layout and offer popup.",
  },
  {
    to: "/admin/settings/shipping",
    icon: Truck,
    title: "Shipping settings",
    copy: "Change shipping charge and free-shipping threshold.",
  },
  {
    to: "/admin/settings/coupons",
    icon: Tag,
    title: "Coupon settings",
    copy: "Create, view and cancel coupon codes.",
  },
];

export default function AdminSettingsPage() {
  return (
    <>
      <style>{CSS}</style>
      <div className="set-wrap">
        <p className="set-sub">Choose a settings area to manage.</p>
        <div className="set-grid">
          {options.map((item) => {
            const Icon = item.icon;
            return (
              <Link className="set-card" to={item.to} key={item.to}>
                <span className="set-icon">
                  <Icon size={18} />
                </span>
                <div>
                  <div className="set-title">{item.title}</div>
                  <div className="set-copy">{item.copy}</div>
                </div>
                <div className="set-foot">
                  Open <ChevronRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
