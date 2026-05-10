import { useState } from "react";
import { MessageCircle, MapPin, Clock, Mail, Phone } from "lucide-react";
import { useToasts } from "../lib/store.js";

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <span
        className="label-caps"
        style={{ display: "block", marginBottom: "8px" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Info({ Icon, title, lines }) {
  return (
    <div
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "8px",
        padding: "20px",
        display: "flex",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          flexShrink: 0,
          backgroundColor: "var(--color-background)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={16} style={{ color: "var(--color-gold)" }} />
      </div>
      <div>
        <p className="label-caps">{title}</p>
        {lines.map((l) => (
          <p
            key={l}
            style={{
              fontSize: "14px",
              color: "var(--color-muted-foreground)",
              marginTop: "4px",
            }}
          >
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  background: "transparent",
  border: "1px solid var(--color-border)",
  borderRadius: "6px",
  padding: "10px 14px",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
  color: "var(--color-foreground)",
  fontFamily: "var(--font-sans)",
};

export default function ContactPage() {
  const push = useToasts((s) => s.push);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "General",
    message: "",
  });

  return (
    <div
      className="page-transition"
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "32px 20px 80px",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: "576px", margin: "0 auto" }}>
        <p className="label-caps" style={{ color: "var(--color-gold)" }}>
          Contact
        </p>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.5rem, 5vw, 3rem)",
            marginTop: "12px",
          }}
        >
          Get in Touch
        </h1>
        <p
          style={{ color: "var(--color-muted-foreground)", marginTop: "16px" }}
        >
          Questions about a piece, your order, or sizing — we'd love to help.
        </p>
      </div>

      <div
        style={{ marginTop: "56px", display: "grid", gap: "40px" }}
        className="contact-grid"
      >
        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            push({
              type: "success",
              message: "Message sent! We'll reply within 24 hours.",
            });
            setForm({ name: "", email: "", subject: "General", message: "" });
          }}
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{ display: "grid", gap: "16px" }}
            className="form-name-email"
          >
            <Field label="Name">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-foreground)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-foreground)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-border)")
                }
              />
            </Field>
          </div>
          <Field label="Subject">
            <select
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-foreground)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            >
              <option>General</option>
              <option>Order Inquiry</option>
              <option>Sizing Help</option>
              <option>Returns</option>
              <option>Wholesale</option>
            </select>
          </Field>
          <Field label="Message">
            <textarea
              required
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{ ...inputStyle, resize: "vertical" }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-foreground)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-border)")
              }
            />
          </Field>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <button
              style={{
                backgroundColor: "var(--color-foreground)",
                color: "var(--color-background)",
                padding: "12px 32px",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              className="label-caps"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--color-gold)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  "var(--color-foreground)")
              }
            >
              Send Message
            </button>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                color: "var(--color-whatsapp)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.textDecoration = "underline")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.textDecoration = "none")
              }
            >
              <MessageCircle size={16} /> Or chat with us directly →
            </a>
          </div>
        </form>

        {/* Sidebar */}
        <aside
          style={{ display: "flex", flexDirection: "column", gap: "24px" }}
        >
          <Info
            Icon={MapPin}
            title="Atelier"
            lines={["12 Heritage Lane", "Bandra West, Mumbai", "400050"]}
          />
          <Info
            Icon={Clock}
            title="Hours"
            lines={["Mon–Sat: 11:00 – 20:00", "Sunday: by appointment"]}
          />
          <Info Icon={Mail} title="Email" lines={["hello@FIT & FINE.com"]} />
          <Info Icon={Phone} title="Phone" lines={["+91 98765 43210"]} />
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            className="label-caps"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "var(--color-whatsapp)",
              color: "white",
              padding: "12px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "12px",
            }}
          >
            <MessageCircle size={16} /> WhatsApp Us
          </a>
          <div
            style={{
              aspectRatio: "4/3",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid var(--color-border)",
            }}
          >
            <iframe
              title="Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=72.82%2C19.05%2C72.84%2C19.07&layer=mapnik"
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </aside>
      </div>

      <style>{`
        .contact-grid { grid-template-columns: 1fr; }
        .form-name-email { grid-template-columns: 1fr; }
        @media (min-width: 640px) {
          .form-name-email { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 1024px) {
          .contact-grid { grid-template-columns: 1fr 360px !important; }
        }
      `}</style>
    </div>
  );
}
